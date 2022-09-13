import { Task } from "./tasks";
import { EventEmitter } from "events";

/**
 * A simple task queue for sequential processing.
 */
export class TaskQueue<T extends Task = Task> extends EventEmitter {
  static readonly BEFORE_ALL = "before-all";
  static readonly BEFORE_EACH = "before-each";
  static readonly AFTER_EACH = "after-each";
  static readonly AFTER_ALL = "after-all";

  static readonly TASK_ENQUEUED = "task-enqueued";
  static readonly TASK_ERROR = "task-error";

  /**
   * A list of tasks that have yet to be processed.
   * @private
   */
  private readonly backlog: T[] = [];

  /**
   * Returns the number of remaining tasks.
   */
  get length(): number {
    return this.backlog.length;
  }

  /**
   * Enqueues a task for later processing.
   * @param task
   * @see {@link process}
   */
  enqueue(task: T): void {
    this.backlog.push(task);
    this.emit(TaskQueue.TASK_ENQUEUED, task);
  }

  /**
   * Runs all tasks in the queue and yields them upon completion.
   */
  async *process(): AsyncIterableIterator<T> {
    let task: T;
    this.emit(TaskQueue.BEFORE_ALL);
    while (this.backlog.length) {
      [task] = this.backlog.splice(0, 1);
      this.emit(TaskQueue.BEFORE_EACH, task);
      try {
        await task.run();
        yield task;
      } catch (e) {
        this.emit(TaskQueue.TASK_ERROR, task, e);
        if (task.stopOnError === true) {
          break;
        }
      } finally {
        this.emit(TaskQueue.AFTER_EACH, task);
      }
    }
    this.emit(TaskQueue.AFTER_ALL);
  }
}
