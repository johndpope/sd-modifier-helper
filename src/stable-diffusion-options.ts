export type Mode = "cpu" | "gpu";
export type Upscaling =
  | false
  | "RealESRGAN_x4plus"
  | "RealESRGAN_x4plus_anime_6B";
export type FaceCorrection = false | "GFPGANv1.3";

export type StableDiffusionOptions = {
  outputs: number;
  steps: number;
  guidance: number;
  width: number;
  height: number;
  turbo: boolean;
  mode: Mode;
  fullPrecision: boolean;
  upscale: Upscaling;
  faceCorrection: FaceCorrection;
  seed: number | (() => number);
  timeout: number;
  initialImagePath?: string;
  promptStrength?: number;
};
