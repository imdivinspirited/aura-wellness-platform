import Cropper from 'react-easy-crop';
import { useCallback, useMemo, useState } from 'react';
import type { CropAreaPixels } from '@/lib/images/cropImage';
import { cropAvatarToFile } from '@/lib/images/cropImage';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  imageSrc: string;
  onOpenChange: (open: boolean) => void;
  onCropped: (out: { file: File; previewUrl: string }) => void;
};

export function AvatarCropModal({ open, imageSrc, onOpenChange, onCropped }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropAreaPixels | null>(null);
  const [busy, setBusy] = useState(false);

  const zoomPct = useMemo(() => Math.round((zoom - 1) * 100), [zoom]);

  const onCropComplete = useCallback((_area: any, areaPixels: CropAreaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const doSave = useCallback(async () => {
    if (!croppedAreaPixels) return;
    setBusy(true);
    try {
      const file = await cropAvatarToFile({
        imageSrc,
        crop: croppedAreaPixels,
        size: 512,
        mimeType: 'image/webp',
        quality: 0.9,
      });
      const previewUrl = URL.createObjectURL(file);
      onCropped({ file, previewUrl });
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }, [croppedAreaPixels, imageSrc, onCropped, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(92vw,520px)] p-0 overflow-hidden">
        <div className="p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle>Adjust profile photo</DialogTitle>
            <DialogDescription>Drag to reposition. Use zoom to fit perfectly.</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <div className="relative w-full overflow-hidden rounded-2xl border bg-muted/30">
              <div className="relative aspect-square w-full">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  objectFit="horizontal-cover"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Zoom</span>
                <span className="tabular-nums text-foreground">{zoomPct}%</span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.01}
                onValueChange={(v) => setZoom(v[0] ?? 1)}
              />
              <p className={cn('text-xs text-muted-foreground', busy && 'opacity-60')}>Tip: keep face centered.</p>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t bg-background/60 px-5 py-4 sm:px-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" onClick={doSave} disabled={!croppedAreaPixels || busy}>
            {busy ? 'Processing…' : 'Use photo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

