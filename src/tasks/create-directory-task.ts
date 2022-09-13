import { mkdir } from "fs/promises";
import { Task } from "./task";

export class CreateDirectoryTask implements Task {
  constructor(readonly path: string) {}

  async run(): Promise<void> {
    await mkdir(this.path, {
      recursive: true,
    });
  }
}
