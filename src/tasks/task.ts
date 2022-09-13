export interface Task {
  memento?: unknown;

  run(): Promise<void>;
}
