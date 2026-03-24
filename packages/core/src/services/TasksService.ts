import type {
  TaskExecutionsRepository,
  TaskExceptionsRepository,
  TasksRepository,
} from "../database/repositories/TasksRepository.js";
import type {
  InsertTask,
  InsertTaskException,
  Task,
  TaskExecution,
} from "../schemas/tasks.js";
import { RRule } from "rrule";
import {
  calculateDueDate,
  isDueRuleRelative,
  parseDueRuleToFixed,
} from "../utils/dueRuleParser.js";
import BaseService from "./BaseService.js";

type RecurrentScope = "all" | "current" | "following";

export default class TasksService extends BaseService<
  Task,
  InsertTask,
  TasksRepository
> {
  private taskExecutionsRepository: TaskExecutionsRepository;
  private taskExceptionsRepository: TaskExceptionsRepository;

  public constructor(
    tasksRepository: TasksRepository,
    taskExecutionsRepository: TaskExecutionsRepository,
    taskExceptionsRepository: TaskExceptionsRepository,
  ) {
    super(tasksRepository);
    this.taskExecutionsRepository = taskExecutionsRepository;
    this.taskExceptionsRepository = taskExceptionsRepository;
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

  private prepareTaskData(data: InsertTask): InsertTask {
    const isRecurrent = this.isRecurrent(data);
    const processedDueRule =
      data.due_rule !== undefined
        ? isRecurrent
          ? data.due_rule
          : this.processDueRuleForUnique(data.due_rule)
        : null;

    const beginDate =
      isRecurrent && !data.begin_date ? new Date() : (data.begin_date ?? null);

    return {
      ...data,
      due_rule: processedDueRule,
      begin_date: beginDate,
    };
  }

  public async create(data: InsertTask): Promise<string> {
    const preparedData = this.prepareTaskData(data);
    this.validateRecurrentDueRule(preparedData.due_rule);
    return await super.create(preparedData);
  }

  public async update(
    id: string,
    data: Partial<InsertTask>,
    occurrenceDate?: Date,
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

    const processedData = { ...data };

    if (data.due_rule !== undefined) {
      processedData.due_rule = willBeRecurrent
        ? data.due_rule
        : this.processDueRuleForUnique(data.due_rule);
    }

    if (
      isUpdatingToRecurrent &&
      (data.begin_date === undefined || data.begin_date === null)
    ) {
      processedData.begin_date = new Date();
    }

    return await this.repository.update(id, processedData);
  }

  private async createTaskException(
    taskId: string,
    occurrenceDate: Date | undefined,
    overrides: Partial<InsertTask>,
  ): Promise<void> {
    if (!occurrenceDate) {
      throw new Error("occurrenceDate is required for current scope update");
    }

    await this.taskExceptionsRepository.upsert(taskId, occurrenceDate, {
      reschedule_due: null,
      override_body: overrides.body ?? null,
      override_location: overrides.location ?? null,
      override_type: overrides.type ?? null,
      override_objective: overrides.objective ?? null,
    });
  }

  private async updateFollowingOccurrences(
    id: string,
    updates: Partial<InsertTask>,
    occurrenceDate: Date | undefined,
  ): Promise<void> {
    const existingTask = await this.repository.getById(id, []);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    if (!occurrenceDate) {
      throw new Error("Ocurrence date is necessary");
    }

    const newTaskData: InsertTask = {
      name: updates.name ?? existingTask.name,
      body: updates.body ?? existingTask.body,
      location: updates.location ?? existingTask.location,
      due_rule: updates.due_rule ?? existingTask.due_rule,
      type: updates.type ?? existingTask.type,
      objective: updates.objective ?? existingTask.objective,
      recurrency: existingTask.recurrency,
      begin_date: occurrenceDate,
      section_id: existingTask.section_id,
    };

    await super.create(newTaskData);

    if (occurrenceDate) {
      const dayBeforeOccurrence = new Date(occurrenceDate);
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
    occurrenceDate?: Date,
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
    occurrenceDate: Date | undefined,
  ): Promise<void> {
    if (!occurrenceDate) {
      throw new Error("occurrenceDate is required for current scope delete");
    }

    const existingId = await this.taskExceptionsRepository.upsert(
      taskId,
      occurrenceDate,
      {
        reschedule_due: null,
        override_body: null,
        override_location: null,
        override_type: null,
        override_objective: null,
      },
    );

    await this.taskExceptionsRepository.update(existingId, {
      is_deleted: true,
    } as never);
  }

  private async deleteFollowingOccurrences(
    id: string,
    occurrenceDate: Date | undefined,
  ): Promise<void> {
    if (!occurrenceDate) {
      throw new Error("occurrenceDate is required for following scope delete");
    }

    const dayBeforeOccurrence = new Date(occurrenceDate);
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
    ocurrence_date: Date,
    instant: boolean = true,
  ): Promise<string> {
    const task = await this.repository.getById(id_task, []);
    if (!task) {
      throw new Error("Task not found");
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
    ocurrence_date: Date,
  ): Promise<TaskExecution[]> {
    return await this.taskExecutionsRepository.find([
      { column: "task_id", operator: "=", value: task_id },
      { column: "ocurrence_date", operator: "=", value: ocurrence_date },
    ]);
  }

  public async updateExecution(
    execution_id: string,
    data: Partial<TaskExecution>,
  ): Promise<void> {
    return await this.taskExecutionsRepository.update(execution_id, data);
  }

  public async deleteExecution(execution_id: string): Promise<void> {
    return await this.taskExecutionsRepository.delete(execution_id);
  }
}
