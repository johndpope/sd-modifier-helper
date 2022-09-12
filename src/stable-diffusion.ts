import axios from "axios";
import { readFile } from "fs/promises";
import { StableDiffusionOptions } from "./stable-diffusion-options";
import { StableDiffusionImageResponse } from "./stable-diffusion-response";

export class StableDiffusion {
  static readonly DEFAULTS: StableDiffusionOptions = {
    height: 512,
    width: 512,
    mode: "gpu",
    fullPrecision: false,
    guidance: 7.5,
    outputs: 1,
    seed: () => Math.floor(Math.random() * 4_294_967_296),
    steps: 50,
    timeout: 1000 * 60 * 10,
    turbo: true,
    upscale: "RealESRGAN_x4plus",
    faceCorrection: "GFPGANv1.3",
    promptStrength: 0.8,
  };

  constructor(private readonly backend = "http://localhost:9000") {}

  async generate(
    prompt: string,
    options: Partial<StableDiffusionOptions> = {}
  ): Promise<Buffer[]> {
    const args = { ...StableDiffusion.DEFAULTS, ...options };
    const payload = await StableDiffusion.toRequestPayload(prompt, args);
    const url = `${this.backend}/image`;

    const { data } = await axios.post(url, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      responseEncoding: "utf-8",
      timeout: Math.max(1000, args.timeout),
    });
    return (data as StableDiffusionImageResponse).output.map(({ data }) =>
      StableDiffusion.dataImageToBinary(data)
    );
  }

  static async loadImage(path: string): Promise<string> {
    const contents = await readFile(path);
    return this.binaryToDataImage(contents);
  }

  static dataImageToBinary(dataImg: string): Buffer {
    const expr = /^data:image\/png;base64,(.*)$/;
    const match = expr.exec(dataImg);
    if (match !== null) {
      return Buffer.from(match[1], "base64");
    }
    throw new Error("Unsupported image data");
  }

  static binaryToDataImage(image: Buffer, mime = "image/png"): string {
    return `data:${mime};base64,${image.toString("base64")}`;
  }

  static async toRequestPayload(
    prompt: string,
    options: StableDiffusionOptions
  ): Promise<any> {
    return {
      prompt,
      num_outputs: Math.max(1, options.outputs),
      num_inference_steps: Math.max(1, options.steps),
      guidance_scale: Math.max(1, options.guidance),
      width: options.width,
      height: options.height,
      turbo: options.turbo,
      use_cpu: options.mode === "cpu",
      use_full_precision: options.fullPrecision,
      show_only_filtered_image: options.faceCorrection !== false,
      seed: typeof options.seed === "number" ? options.seed : options.seed(),
      ...(options.faceCorrection
        ? { use_face_correction: options.faceCorrection }
        : {}),
      ...(options.upscale ? { use_upscale: options.upscale } : {}),
      ...(typeof options.initialImagePath === "string"
        ? { init_image: await this.loadImage(options.initialImagePath) }
        : {}),
      ...(typeof options.promptStrength === "number"
        ? { prompt_strength: options.promptStrength }
        : {}),
    };
  }
}
