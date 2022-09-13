export interface Task {
  memento?: unknown;

  readonly stopOnError?: boolean;

  run(): Promise<void>;
}
