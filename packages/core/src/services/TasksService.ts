import type {
  TaskExecutionsRepository,
  TaskExceptionsRepository,
  TasksRepository,
} from "../database/repositories/TasksRepository.js";
import type { InsertTask, Task, TaskExecution } from "../schemas/tasks.js";
import {
  calculateDueDate,
  isDueRuleRelative,
  parseDueRuleToFixed,
} from "../utils/dueRuleParser.js";
import BaseService from "./BaseService.js";

type deleteMethods = "all" | "following" | "current";

export default class TasksService extends BaseService<
  Task,
  InsertTask,
  TasksRepository
> {
  private taskExecutionsRepository: TaskExecutionsRepository;

  public constructor(
    tasksRepository: TasksRepository,
    taskExecutionsRepository: TaskExecutionsRepository,
  ) {
    super(tasksRepository);
    this.taskExecutionsRepository = taskExecutionsRepository;
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

  public async update(id: string, data: Partial<InsertTask>): Promise<void> {
    const existingTask = await this.repository.getById(id, []);
    if (!existingTask) {
      throw new Error("Task not found");
    }

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
