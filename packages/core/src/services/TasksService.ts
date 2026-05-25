import type {
  TaskExecutionsRepository,
  TaskExceptionsRepository,
  TasksRepository,
} from "../database/repositories/TasksRepository.js";
import type SectionsRepository from "../database/repositories/SectionsRepository.js";
import type {
  InsertTask,
  Task,
  TaskExecution,
  TaskException,
  TaskWithProgress,
  TaskInRange,
  TaskOccurrenceDetail,
  TaskWithListInfo,
} from "../schemas/tasks.js";
import { RRule } from "rrule";
import {
  calculateDueDate,
  isDueRuleRelative,
  parseDueRuleToFixed,
} from "../utils/dueRuleParser.js";
import BaseService from "./BaseService.js";
import type { QueryCriteria } from "../database/repositories/BaseRepository.js";
import { insertTaskSchema } from "../schemas/tasks.js";
import { validate } from "../utils/zodValidator.js";

type RecurrentScope = "all" | "current" | "following";

export default class TasksService extends BaseService<
  Task,
  InsertTask,
  TasksRepository
> {
  private taskExecutionsRepository: TaskExecutionsRepository;
  private taskExceptionsRepository: TaskExceptionsRepository;
  private sectionsRepository: SectionsRepository;

  public constructor(
    tasksRepository: TasksRepository,
    taskExecutionsRepository: TaskExecutionsRepository,
    taskExceptionsRepository: TaskExceptionsRepository,
    sectionsRepository: SectionsRepository,
  ) {
    super(tasksRepository);
    this.taskExecutionsRepository = taskExecutionsRepository;
    this.taskExceptionsRepository = taskExceptionsRepository;
    this.sectionsRepository = sectionsRepository;
  }

  public isRecurrent(task: Partial<InsertTask>): boolean {
    return task.recurrency !== null && task.recurrency !== undefined;
  }

  public calculateDueDate(dueRule: string, baseDate: Date = new Date()): Date {
    return calculateDueDate(dueRule, baseDate);
  }

  private processDueRuleForUnique(
    dueRule: string | null | undefined,
  ): string | null {
    if (!dueRule) return null;

    if (isDueRuleRelative(dueRule)) {
      const fixedDate = parseDueRuleToFixed(dueRule);
      return fixedDate.toISOString().replace("T", " ").replace("Z", "");
    }

    return dueRule;
  }

  private validateRecurrentDueRule(dueRule: string | null | undefined): void {
    if (!dueRule) return;

    if (!isDueRuleRelative(dueRule)) {
      throw new Error(
        "Recurrent tasks cannot have fixed due_rule. Use a relative format like '+3d 13:00:00'",
      );
    }
  }

  private ensureDtstart(rruleString: string, startTime?: string | null): string {
    if (startTime) {
      const [datePart, timePart] = startTime.split(" ");
      const dtstartDate = (datePart || "").replace(/-/g, "");
      const dtstartTime = (timePart || "000000").replace(/:/g, "");
      const dtstart = `${dtstartDate}T${dtstartTime}Z`;
      const rrulePart = rruleString
        .replace(/^DTSTART[:=][^\n]*\nRRULE[:=]/, "")
        .replace(/^DTSTART[:=][^\n]*\n/, "");
      return `DTSTART:${dtstart}\nRRULE:${rrulePart}`;
    }
    if (rruleString.includes("DTSTART=") || rruleString.includes("DTSTART:")) {
      return rruleString;
    }
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const dtstart = `${year}${month}${day}T000000Z`;
    return `DTSTART:${dtstart}\nRRULE:${rruleString}`;
  }

  private prepareTaskData(data: InsertTask): Omit<InsertTask, "start_time"> {
    const isRecurrent = this.isRecurrent(data);
    if (isRecurrent && data.due_rule)
      this.validateRecurrentDueRule(data.due_rule);
    const processedDueRule =
      data.due_rule !== undefined
        ? isRecurrent
          ? data.due_rule
          : this.processDueRuleForUnique(data.due_rule)
        : null;

    let recurrency = data.recurrency ?? null;
    if (recurrency) {
      recurrency = this.ensureDtstart(recurrency, data.start_time);
    }

    const { start_time, ...rest } = data;
    return {
      ...rest,
      recurrency,
      due_rule: processedDueRule,
    };
  }

  public async create(data: InsertTask): Promise<string> {
    const validatedData = validate(insertTaskSchema, data);
    const sectionExists = await this.sectionsRepository.findById(validatedData.section_id);
    if (!sectionExists) {
      throw new Error("Section not found");
    }
    const preparedData = this.prepareTaskData(validatedData);
    return await this.repository.create(preparedData);
  }

  public async getById(id: string, columns: (keyof Task)[] = []) {
    const task = await this.repository.getById(id, columns);
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  }

  public async update(
    id: string,
    data: Partial<InsertTask>,
    occurrenceDate?: string,
    scope?: RecurrentScope,
  ): Promise<void> {
    const existingTask = await this.repository.getById(id, []);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    if (!scope || !this.isRecurrent(existingTask) || scope == "all") {
      await this.performSimpleUpdate(id, data, existingTask);
      return;
    }

    if (scope === "current") {
      await this.createTaskException(id, occurrenceDate, data);
      return;
    }

    if (scope === "following") {
      await this.updateFollowingOccurrences(id, data, occurrenceDate);
      return;
    }
  }

  private async performSimpleUpdate(
    id: string,
    data: Partial<InsertTask>,
    existingTask: Task,
  ): Promise<void> {
    const isUpdatingToRecurrent =
      data.recurrency !== undefined && data.recurrency !== null;
    const willBeRecurrent =
      isUpdatingToRecurrent ||
      (data.recurrency === undefined && this.isRecurrent(existingTask));

    if (willBeRecurrent) {
      const newDueRule =
        data.due_rule !== undefined ? data.due_rule : existingTask.due_rule;
      this.validateRecurrentDueRule(newDueRule);
    }

    const processedData: Partial<Task> = { ...data };

    if (data.due_rule !== undefined) {
      processedData.due_rule = willBeRecurrent
        ? data.due_rule
        : this.processDueRuleForUnique(data.due_rule);
    }

    if (data.recurrency) {
      processedData.recurrency = this.ensureDtstart(data.recurrency, data.start_time);
    } else if (data.start_time !== undefined && existingTask.recurrency) {
      processedData.recurrency = this.ensureDtstart(existingTask.recurrency, data.start_time);
    }

    delete (processedData as Record<string, unknown>).start_time;

    return await this.repository.update(id, processedData);
  }

  private async createTaskException(
    taskId: string,
    occurrenceDate: string | undefined,
    overrides: Partial<InsertTask>,
  ): Promise<void> {
    if (!occurrenceDate) {
      throw new Error("occurrenceDate is required for current scope update");
    }

    const existingException = await this.taskExceptionsRepository.findByTaskAndOccurrence(
      taskId,
      occurrenceDate,
    );

    await this.taskExceptionsRepository.upsert(taskId, occurrenceDate, {
      rescheduled_due: existingException?.rescheduled_due ?? null,
      override_name: overrides.name ?? existingException?.override_name ?? null,
      override_body: overrides.body ?? existingException?.override_body ?? null,
      override_location: overrides.location ?? existingException?.override_location ?? null,
      override_type: overrides.type ?? existingException?.override_type ?? null,
      override_objective: overrides.objective ?? existingException?.override_objective ?? null,
    });
  }

  private async updateFollowingOccurrences(
    id: string,
    updates: Partial<InsertTask>,
    occurrenceDate: string | undefined,
  ): Promise<void> {
    const existingTask = await this.repository.getById(id, []);
    if (!existingTask) {
      throw new Error("Task not found");
    }
    if (!occurrenceDate || !existingTask.recurrency) {
      throw new Error("Ocurrence date is necessary");
    }
    const occurrenceDateObj = new Date(occurrenceDate + "T00:00:00");
    const rrule = RRule.fromString(existingTask.recurrency);
    const newRrule = new RRule({
      ...rrule.options,
      dtstart: occurrenceDateObj,
    });
    const newTaskData: InsertTask = {
      name: updates.name ?? existingTask.name,
      body: updates.body ?? existingTask.body,
      location: updates.location ?? existingTask.location,
      due_rule: updates.due_rule ?? existingTask.due_rule,
      type: updates.type ?? existingTask.type,
      objective: updates.objective ?? existingTask.objective,
      recurrency: newRrule.toString(),
      start_time: null,
      section_id: existingTask.section_id,
    };
    const { start_time, ...taskDataForDb } = newTaskData;
    await this.repository.create(taskDataForDb);
    if (occurrenceDate) {
      const dayBeforeOccurrence = new Date(occurrenceDateObj);
      dayBeforeOccurrence.setDate(dayBeforeOccurrence.getDate() - 1);
      dayBeforeOccurrence.setHours(23, 59, 59, 999);
      const updatedRRule = this.addUntilToRRule(
        existingTask.recurrency,
        dayBeforeOccurrence,
      );
      await this.repository.update(id, { recurrency: updatedRRule } as never);
    }
  }

  private addUntilToRRule(rruleString: string | null, untilDate: Date): string {
    if (!rruleString) {
      throw new Error("Cannot add UNTIL to null RRule");
    }

    const rule = RRule.fromString(rruleString);
    const newRule = new RRule({
      ...rule.options,
      until: untilDate,
    });

    return newRule.toString();
  }

  public async delete(
    id: string,
    occurrenceDate?: string,
    scope?: RecurrentScope,
  ): Promise<void> {
    const existingTask = await this.repository.getById(id, []);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    if (!scope || !this.isRecurrent(existingTask) || scope === "all") {
      return await super.delete(id);
    }

    if (scope === "current") {
      await this.createTaskExceptionForDelete(id, occurrenceDate);
      return;
    }

    if (scope === "following") {
      await this.deleteFollowingOccurrences(id, occurrenceDate);
      return;
    }
  }

  private async createTaskExceptionForDelete(
    taskId: string,
    occurrenceDate: string | undefined,
  ): Promise<void> {
    if (!occurrenceDate) {
      throw new Error("occurrenceDate is required for current scope delete");
    }

    const existingId = await this.taskExceptionsRepository.upsert(
      taskId,
      occurrenceDate,
      {
        rescheduled_due: null,
        override_name: null,
        override_body: null,
        override_location: null,
        override_type: null,
        override_objective: null,
      },
    );

    await this.taskExceptionsRepository.update(existingId, {
      is_deleted: 1,
    } as never);
  }

  private async deleteFollowingOccurrences(
    id: string,
    occurrenceDate: string | undefined,
  ): Promise<void> {
    if (!occurrenceDate) {
      throw new Error("occurrenceDate is required for following scope delete");
    }

    const occurrenceDateObj = new Date(occurrenceDate + "T00:00:00");
    const dayBeforeOccurrence = new Date(occurrenceDateObj);
    dayBeforeOccurrence.setDate(dayBeforeOccurrence.getDate() - 1);
    dayBeforeOccurrence.setHours(23, 59, 59, 999);

    const existingTask = await this.repository.getById(id, []);
    if (!existingTask || !existingTask.recurrency) {
      throw new Error("Task not found or not recurrent");
    }

    const updatedRRule = this.addUntilToRRule(
      existingTask.recurrency,
      dayBeforeOccurrence,
    );
    await this.repository.update(id, { recurrency: updatedRRule } as never);
  }

  public async startExecution(
    id_task: string,
    ocurrence_date: string | null = null,
    instant: boolean = true,
  ): Promise<string> {
    const task = await this.repository.getById(id_task, []);
    if (!task) {
      throw new Error("Task not found");
    }

    if (this.isRecurrent(task) && !ocurrence_date) {
      throw new Error("An occurrence date is necessary for recurrent tasks");
    }

    const executionData = {
      task_id: id_task,
      ocurrence_date,
      start_time: new Date(),
      end_time: instant ? new Date() : null,
    };

    return await this.taskExecutionsRepository.create(executionData);
  }

  public async stopExecution(execution_id: string): Promise<void> {
    await this.taskExecutionsRepository.update(execution_id, {
      end_time: new Date(),
    });
  }

  public async getExecutionsByTaskAndDate(
    task_id: string,
    ocurrence_date: string | null = null,
  ): Promise<TaskExecution[]> {
    const task = await this.getById(task_id, []);
    if (!task) throw new Error("Task not found");
    
    if (this.isRecurrent(task)) {
      if (!ocurrence_date) throw new Error("An occurrence date is necessary");
      return await this.taskExecutionsRepository.findByTaskAndOccurrence(
        task_id,
        ocurrence_date,
      );
    }
    
    return await this.taskExecutionsRepository.findByTaskWithoutOccurrence(task_id);
  }

  public async updateExecution(
    execution_id: string,
    data: Partial<TaskExecution>,
  ): Promise<void> {
    const existingExecution =
      await this.taskExecutionsRepository.getById(execution_id);
    if (!existingExecution) {
      throw new Error("Execution not found");
    }

    const startTime = data.start_time
      ? new Date(data.start_time)
      : existingExecution.start_time
        ? new Date(existingExecution.start_time)
        : null;
    const endTime = data.end_time ? new Date(data.end_time) : null;

    if (startTime && endTime && endTime < startTime) {
      throw new Error("end_time must be greater than or equal to start_time");
    }

    return await this.taskExecutionsRepository.update(execution_id, data);
  }

  public async deleteExecution(execution_id: string): Promise<void> {
    return await this.taskExecutionsRepository.delete(execution_id);
  }

  public async getTasksBySection(
    sectionId: string,
    onlyCompleted?: boolean,
    searchTerm?: string,
    includeBody?: boolean,
  ): Promise<TaskWithProgress[]> {
    const tasks = searchTerm
      ? await this.repository.searchBySection(sectionId, searchTerm)
      : await this.repository.findBySection(sectionId);
    const results: TaskWithProgress[] = [];
    const filterClause = (progress: number, objective: number) => {
      if (onlyCompleted === undefined) return true;
      return onlyCompleted ? progress >= objective : progress < objective;
    };
    const shouldIncludeBody = includeBody !== false;

    for (const task of tasks) {
      if (this.isRecurrent(task)) {
        const occurrences = this.getAllOccurrences(task);
        const [allExceptions, allExecutions] = await Promise.all([
          this.taskExceptionsRepository.findByTask(task.id),
          this.taskExecutionsRepository.findByTaskAndOccurrences(
            task.id,
            occurrences,
          ),
        ]);
        const exceptionsByDate = new Map(
          allExceptions.map((e) => [e.ocurrence_date, e]),
        );
        const executionsByDate = new Map<string, TaskExecution[]>();
        for (const date of occurrences) {
          executionsByDate.set(date, []);
        }
        for (const exec of allExecutions) {
          const date = exec.ocurrence_date ?? "";
          executionsByDate.get(date)?.push(exec);
        }

        for (const occurrenceDate of occurrences) {
          const exception = exceptionsByDate.get(occurrenceDate) ?? null;
          if (exception?.is_deleted) continue;

          const executions = executionsByDate.get(occurrenceDate) ?? [];
          const progress = this.calculateProgressFromExecutions(
            task.type,
            executions,
          );
          if (
            filterClause(
              progress,
              exception?.override_objective ?? task.objective,
            )
          ) {
            const dueDate =
              exception?.rescheduled_due
                ? new Date(exception.rescheduled_due + "T00:00:00")
                : this.calculateDueDateForOccurrence(task.due_rule, occurrenceDate);
            results.push({
              id: task.id,
              name: exception?.override_name ?? task.name,
              body: shouldIncludeBody
                ? (exception?.override_body ?? task.body ?? null)
                : null,
              due_date: dueDate,
              type: exception?.override_type ?? task.type,
              objective: exception?.override_objective ?? task.objective,
              progress,
              occurrence_date: occurrenceDate,
            });
          }
        }
      } else {
        const progress = await this.calculateProgress(task, null);
        if (filterClause(progress, task.objective)) {
          results.push({
            id: task.id,
            name: task.name,
            body: shouldIncludeBody ? (task.body ?? null) : null,
            due_date: task.due_rule ? new Date(task.due_rule) : null,
            type: task.type,
            objective: task.objective,
            progress,
            occurrence_date: null,
          });
        }
      }
    }

    return results;
  }

  public async getTasksByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<TaskInRange[]> {
    const allTasks = await this.repository.getAll();
    const results: TaskInRange[] = [];

    for (const task of allTasks) {
      if (this.isRecurrent(task)) {
        const occurrences = this.getOccurrencesInRange(
          task,
          startDate,
          endDate,
        );
        for (const occurrenceDate of occurrences) {
          const exception = await this.getExceptionForOccurrence(
            task.id,
            occurrenceDate,
          );
          if (exception?.is_deleted) continue;

          const progress = await this.calculateProgress(task, occurrenceDate);
          const isComplete =
            progress >= (exception?.override_objective ?? task.objective);
          results.push({
            id: task.id,
            name: exception?.override_name ?? task.name,
            is_complete: isComplete,
            occurrence_date: occurrenceDate,
          });
        }
      } else {
        const progress = await this.calculateProgress(task, null);
        const isComplete = progress >= task.objective;
        results.push({
          id: task.id,
          name: task.name,
          is_complete: isComplete,
          occurrence_date: null,
        });
      }
    }

    return results;
  }

  public async getTaskOccurrence(
    taskId: string,
    occurrenceDate?: string | null,
  ): Promise<TaskOccurrenceDetail> {
    const task = await this.repository.getById(taskId, []);
    if (!task) {
      throw new Error("Task not found");
    }
    if (this.isRecurrent(task) && !occurrenceDate) {
      throw new Error(
        "You need to specify a ocurrence date for recurrent task",
      );
    }
    occurrenceDate = this.isRecurrent(task) ? occurrenceDate : null;

    let exception: TaskException | null = null;
    if (occurrenceDate) {
      exception = await this.getExceptionForOccurrence(taskId, occurrenceDate);
      if (exception?.is_deleted) {
        throw new Error("Occurrence has been deleted");
      }
    }

    const progress = await this.calculateProgress(task, occurrenceDate ?? null);

    const dueDate = occurrenceDate
      ? this.calculateDueDateForOccurrence(task.due_rule, occurrenceDate)
      : task.due_rule
        ? new Date(task.due_rule)
        : null;

    const result: TaskOccurrenceDetail = {
      id: task.id,
      occurrence_date: occurrenceDate ?? null,
      name: exception?.override_name ?? task.name,
      location: exception?.override_location ?? task.location,
      body: exception?.override_body ?? task.body,
      due_date: exception?.rescheduled_due
        ? new Date(exception.rescheduled_due + "T00:00:00")
        : dueDate,
      type: exception?.override_type ?? task.type,
      objective: exception?.override_objective ?? task.objective,
      progress,
    };

    return result;
  }

  private calculateDueDateForOccurrence(
    dueRule: string | null,
    occurrenceDate: string,
  ): Date | null {
    if (!dueRule) return null;
    const occurrenceDateObj = new Date(occurrenceDate + "T00:00:00");
    return calculateDueDate(dueRule, occurrenceDateObj);
  }

  private async calculateProgress(
    task: Task,
    occurrenceDate: string | null,
  ): Promise<number> {
    const executions = occurrenceDate
      ? await this.getExecutionsByTaskAndDate(task.id, occurrenceDate)
      : await this.getExecutionsForTaskWithoutOccurrence(task.id);

    return this.calculateProgressFromExecutions(task.type, executions);
  }

  private calculateProgressFromExecutions(
    taskType: string,
    executions: TaskExecution[],
  ): number {
    if (taskType === "by time") {
      let totalTimeMs = 0;
      for (const exec of executions) {
        if (exec.end_time) {
          totalTimeMs +=
            new Date(exec.end_time).getTime() -
            new Date(exec.start_time).getTime();
        }
      }
      return totalTimeMs / 1000;
    }

    if (taskType === "by executions") {
      const completedExecutions = executions.filter((e) => e.end_time !== null);
      return completedExecutions.length;
    }

    return 0;
  }

  private async getExecutionsForTaskWithoutOccurrence(
    taskId: string,
  ): Promise<TaskExecution[]> {
    return await this.taskExecutionsRepository.findByTaskWithoutOccurrence(
      taskId,
    );
  }

  private async getExceptionForOccurrence(
    taskId: string,
    occurrenceDate: string,
  ): Promise<TaskException | null> {
    return await this.taskExceptionsRepository.findByTaskAndOccurrence(
      taskId,
      occurrenceDate,
    );
  }

  private getAllOccurrences(task: Task): string[] {
    if (!task.recurrency) return [];
    const rule = RRule.fromString(task.recurrency);
    return rule.between(new Date("2000-01-01"), new Date(), true).map((date) => {
      const normalized = new Date(date);
      normalized.setUTCHours(0, 0, 0, 0);
      return normalized.toISOString().split("T")[0] ?? "";
    });
  }

  private getOccurrencesInRange(
    task: Task,
    startDate: Date,
    endDate: Date,
  ): string[] {
    if (!task.recurrency) return [];
    const rule = RRule.fromString(task.recurrency);
    return rule.between(startDate, endDate, true).map((date) => {
      const normalized = new Date(date);
      normalized.setUTCHours(0, 0, 0, 0);
      return normalized.toISOString().split("T")[0] ?? "";
    });
  }

  public async searchTasksWithListInfo(
    searchTerm: string,
  ): Promise<TaskWithListInfo[]> {
    return await this.repository.searchWithListInfo(searchTerm);
  }

  public async startMultipleExecutions(
    tasks: { taskId: string; occurrenceDate: string | null }[],
  ): Promise<{ taskId: string; executionId: string; occurrenceDate: string | null }[]> {
    const results: { taskId: string; executionId: string; occurrenceDate: string | null }[] = [];
    const startTime = new Date();

    for (const { taskId, occurrenceDate } of tasks) {
      const task = await this.repository.getById(taskId, []);
      if (!task) continue;

      const isRecurrentTask = this.isRecurrent(task);

      if (isRecurrentTask && !occurrenceDate) {
        throw new Error(`Occurrence date is required for recurrent task: ${taskId}`);
      }

      const executionData = {
        task_id: taskId,
        ocurrence_date: isRecurrentTask ? occurrenceDate : null,
        start_time: startTime,
        end_time: null,
      };

      const executionId = await this.taskExecutionsRepository.create(executionData);
      results.push({ taskId, executionId, occurrenceDate: isRecurrentTask ? occurrenceDate : null });
    }

    return results;
  }

  public async stopMultipleExecutions(
    executionIds: string[],
  ): Promise<void> {
    const endTime = new Date();

    for (const executionId of executionIds) {
      await this.taskExecutionsRepository.update(executionId, {
        end_time: endTime,
      });
    }
  }

  public async getRunningExecutions(): Promise<(TaskExecution & { taskName: string; taskType: string; taskObjective: number })[]> {
    return await this.taskExecutionsRepository.findRunningWithTaskInfo();
  }

  public async getIncompleteOccurrenceDates(taskId: string): Promise<string[]> {
    const task = await this.repository.getById(taskId, []);
    if (!task || !this.isRecurrent(task)) return [];

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const today = new Date();

    const occurrenceDates = this.getOccurrencesInRange(
      task,
      ninetyDaysAgo,
      today,
    );

    const incompleteDates: string[] = [];
    for (const date of occurrenceDates) {
      const exception = await this.getExceptionForOccurrence(taskId, date);
      if (exception?.is_deleted) continue;

      const progress = await this.calculateProgress(task, date);
      if (progress < task.objective) {
        incompleteDates.push(date);
      }
    }

    return incompleteDates;
  }
}
