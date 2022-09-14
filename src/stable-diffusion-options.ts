export type Mode = "cpu" | "gpu";
export type Upscaling =
  | false
  | "RealESRGAN_x4plus"
  | "RealESRGAN_x4plus_anime_6B";
export type FaceCorrection = false | "GFPGANv1.3";

export interface StableDiffusionOptions {
  /**
   * How many images to generate.
   * Should be at least 1, and it's limited by hardware constraints (VRAM).
   * @default 1
   */
  outputs: number;

  /**
   * How many inference steps should take place.
   * A solid start is 50, but higher numbers can improve details.
   * @default 50
   */
  steps: number;

  /**
   * The guidance scale of the prompt in question.
   * @default 7.5
   */
  guidance: number;

  /**
   * The target width of the generated images, in pixels
   * @default 512
   */
  width: number;

  /**
   * The target height of the generated images, in pixels
   * @default 512
   */
  height: number;

  /**
   * If the turbo mode should be used.
   * This increases VRAM usage slightly.
   * @default true
   */
  turbo: boolean;

  /**
   * Whether to run this task on a GPU or a CPU.
   * @default "gpu"
   */
  mode: Mode;

  /**
   * Full precision mode, which is required for some 1650 and 1660 GPU models.
   * @default false
   */
  fullPrecision: boolean;

  /**
   * Which upscaling algorithm to use, if any.
   * @default false
   */
  upscale: Upscaling;

  /**
   * Which face correction to use, if any.
   * @default false
   */
  faceCorrection: FaceCorrection;

  /**
   * The initial seed for the first image.
   * Iff {@link outputs} is greater than 1, these images will have their
   * seed incremented automagically.
   * @default 42
   */
  seed: number | (() => number);

  /**
   * A general timeout setting for HTTP connections to the back-end.
   */
  timeout: number;

  /**
   * The initial image file that should be used to generate this image.
   */
  initialImagePath?: string;

  /**
   * The strength of the prompt, which plays a part iff {@link initialImagePath}
   * is defined.
   * @default 0.8
   */
  promptStrength?: number;
}
