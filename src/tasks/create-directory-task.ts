import { mkdir } from "fs/promises";
import { Task } from "./task";

/**
 * A task that recursively creates a path.
 */
export class CreateDirectoryTask implements Task {
  constructor(readonly path: string) {}

  async run(): Promise<void> {
    await mkdir(this.path, {
      recursive: true,
    });
  }
}
