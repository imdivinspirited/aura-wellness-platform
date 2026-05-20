import { memo, useMemo, useRef, useState } from 'react';
import { Copy, Download, Link2, QrCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type ShareProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publicUrl: string;
  name?: string;
};

export const ShareProfileDialog = memo(function ShareProfileDialog({
  open,
  onOpenChange,
  publicUrl,
  name,
}: ShareProfileDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [busy, setBusy] = useState(false);

  const filename = useMemo(() => {
    const safe = (name || 'profile').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `${safe || 'profile'}-qr.png`;
  }, [name]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Public profile link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const onDownload = async () => {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const url = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    } catch {
      toast.error('Could not download QR');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" aria-hidden />
            Share your public profile
          </DialogTitle>
          <DialogDescription>
            Copy the link or scan the QR code. You can also download the QR as an image.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
            <Link2 className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-xs text-foreground">{publicUrl}</span>
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg" onClick={onCopy}>
              <Copy className="h-3.5 w-3.5" aria-hidden />
              Copy
            </Button>
          </div>

          <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-background p-5">
            <QRCodeCanvas
              value={publicUrl}
              size={220}
              includeMargin
              level="M"
              ref={(node) => {
                canvasRef.current = node;
              }}
            />
          </div>
        </div>

        <DialogFooter className="mt-2 sm:justify-between">
          <Button type="button" variant="outline" className="gap-2" onClick={onDownload} disabled={busy}>
            <Download className="h-4 w-4" aria-hidden />
            Download QR
          </Button>
          <Button type="button" className="gap-2" onClick={onCopy}>
            <Copy className="h-4 w-4" aria-hidden />
            Copy link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

