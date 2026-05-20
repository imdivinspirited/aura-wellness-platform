export type CropAreaPixels = { x: number; y: number; width: number; height: number };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Create a square cropped avatar from an image URL + pixel crop.
 * Returns a File (webp by default) ready to upload.
 */
export async function cropAvatarToFile(opts: {
  imageSrc: string;
  crop: CropAreaPixels;
  size: number; // output size in px (e.g. 512)
  mimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
  quality?: number; // 0..1
}): Promise<File> {
  const img = await loadImage(opts.imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Canvas not supported');

  const outSize = clamp(Math.floor(opts.size || 512), 128, 2048);
  canvas.width = outSize;
  canvas.height = outSize;

  const { x, y, width, height } = opts.crop;
  if (width <= 0 || height <= 0) throw new Error('Invalid crop');

  // Draw cropped region into square canvas
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, outSize, outSize);
  ctx.drawImage(img, x, y, width, height, 0, 0, outSize, outSize);

  const mimeType = opts.mimeType || 'image/webp';
  const quality = typeof opts.quality === 'number' ? clamp(opts.quality, 0.6, 1) : 0.9;

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))),
      mimeType,
      quality
    );
  });

  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/jpeg' ? 'jpg' : 'webp';
  return new File([blob], `avatar.${ext}`, { type: mimeType });
}

