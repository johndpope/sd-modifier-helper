/**
 * This is a generic outline of a task that can be processed by the {@link TaskQueue}.
 */
export interface Task {
  /**
   * A memento object that can store arbitrary data.
   */
  memento?: unknown;

  /**
   * Iff true and if {@link run}'s Promise throws a rejection,
   * this signals that the process should stop.
   */
  readonly stopOnError?: boolean;

  /**
   * Performs the task described by this process in an asynchronous manner.
   */
  run(): Promise<void>;
}
