import { Task } from "./task";
import { rm } from "fs/promises";

export class CleanupTask implements Task {
  readonly stopOnError = true;

  constructor(readonly path: string) {}

  async run(): Promise<void> {
    await rm(this.path, {
      force: true,
      recursive: true,
    });
  }
}
