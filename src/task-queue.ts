import { Task } from "./tasks";

/**
 * A simple task queue for sequential processing.
 */
export class TaskQueue<T extends Task = Task> {
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
  }

  /**
   * Runs all tasks in the queue and yields them upon completion.
   */
  async *process(): AsyncIterableIterator<T> {
    let task: T;
    while (this.backlog.length) {
      [task] = this.backlog.splice(0, 1);
      await task.run();
      yield task;
    }
  }
}
