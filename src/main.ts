import { StableDiffusion } from "./stable-diffusion";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { Dirent } from "fs";
import { join } from "path";
import sharp from "sharp";

const inputPath = join(__dirname, "..", "inputs");
const inputExpr = /^([A-Za-z ]+)\.png$/i;
const modifiersPath = join(__dirname, "..", "modifiers.json");
const instance = new StableDiffusion();

(async () => {
  const modifiers = await readModifiers();
  const inputs = await readInputs();

  console.log(`Loaded ${Object.keys(modifiers).length} entries`);
  for (const [category, styles] of Object.entries(modifiers)) {
    console.log(`Working on category: ${category}`);
    for (const style of styles) {
      const folder = join(__dirname, "..", "outputs", category, style);
      await mkdir(folder, { recursive: true });

      console.log(`Working on style: ${style}`);
      for (const input of inputs) {
        const name = nameToPrompt(input.name);
        const prompt = `${name}, ${style}`;
        console.log(`  -> "${prompt}" (from "${input.name}")`);
        const examples = await instance.generate(prompt, {
          initialImagePath: join(__dirname, "..", "inputs", input.name),
          promptStrength: 0.8,
          faceCorrection: false,
          upscale: false,
          steps: 50,
          seed: 42,
          fullPrecision: false,
          outputs: 2,
          turbo: true,
          mode: "gpu",
          width: 512,
          height: 512,
          guidance: 7.5,
        });
        const promises = examples.map((example, index) => {
          const full = join(folder, `${name}-${index}-full.png`);
          const thumb = join(folder, `${name}-${index}-128.png`);
          return writeFile(full, example).then(() => {
            return sharp(full)
              .resize({ width: 128, height: 128 })
              .png()
              .toFile(thumb);
          });
        });
        await Promise.all(promises);
      }
      console.log(`Done working on style: ${style}`);
      console.log(`Examples in ${folder}`);
    }
    console.log(`Done work on category: ${category}`);
  }
  console.log("All done :D");
})();

async function readModifiers(): Promise<Record<string, string[]>> {
  const contents = await readFile(modifiersPath, { encoding: "utf8" });
  return JSON.parse(contents) as Record<string, string[]>;
}

async function readInputs(): Promise<Dirent[]> {
  const entries = await readdir(inputPath, {
    encoding: "utf8",
    withFileTypes: true,
  });
  return entries.filter(
    (entry) => entry.isFile() && inputExpr.test(entry.name)
  );
}

function nameToPrompt(name: string): string {
  const match = inputExpr.exec(name);
  if (!match) {
    throw new Error(`Failed to figure out the prompt for "${name}"`);
  }
  return match[1];
}
