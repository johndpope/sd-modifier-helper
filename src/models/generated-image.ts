/**
 * This is a simple model to store generated image details.
 */
export interface GeneratedImage {
  /**
   * The style category of this image.
   */
  category?: string;

  /**
   * The relative or absolute path to this image.
   */
  path: string;

  /**
   * The label for this image, usually including the prompt that created it.
   */
  label: string;
}
