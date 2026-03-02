import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SafeImage } from '@/components/ui/SafeImage';
import type { DonationConfig } from '@/lib/api/events';

export function DonationSection({
  config,
  onSave,
  canEdit,
  isSaving,
}: {
  config: DonationConfig | null;
  onSave?: (next: DonationConfig) => Promise<void>;
  canEdit?: boolean;
  isSaving?: boolean;
}) {
  const [draft, setDraft] = React.useState<DonationConfig>(config || {});

  React.useEffect(() => {
    setDraft(config || {});
  }, [config]);

  const readOnly = !canEdit || !onSave;

  return (
    <Card className="border-stone-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="font-display text-2xl font-light text-stone-900">Donation</div>
        <div className="text-sm text-muted-foreground">
          Support the mission. Payment details are managed from the admin UI and stored persistently.
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>UPI ID</Label>
            <Input
              value={draft.upiId || ''}
              onChange={(e) => setDraft((d) => ({ ...d, upiId: e.target.value }))}
              placeholder="example@upi"
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label>Google Pay</Label>
            <Input
              value={draft.googlePay || ''}
              onChange={(e) => setDraft((d) => ({ ...d, googlePay: e.target.value }))}
              placeholder="Google Pay handle or number"
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label>PhonePe</Label>
            <Input
              value={draft.phonePe || ''}
              onChange={(e) => setDraft((d) => ({ ...d, phonePe: e.target.value }))}
              placeholder="PhonePe handle or number"
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label>Mobile Number</Label>
            <Input
              value={draft.phoneNumber || ''}
              onChange={(e) => setDraft((d) => ({ ...d, phoneNumber: e.target.value }))}
              placeholder="+91..."
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label>QR Code Image (public path)</Label>
            <Input
              value={draft.qrImagePath || ''}
              onChange={(e) => setDraft((d) => ({ ...d, qrImagePath: e.target.value }))}
              placeholder="/images/events/qr.svg"
              readOnly={readOnly}
            />
          </div>

          {!readOnly && (
            <Button onClick={() => onSave(draft)} disabled={Boolean(isSaving)}>
              {isSaving ? 'Saving…' : 'Save Donation Settings'}
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-stone-900">QR Preview</div>
          <div className="rounded-xl overflow-hidden border bg-muted/20">
            <SafeImage
              category="events"
              src={draft.qrImagePath || null}
              alt="Donation QR"
              className="w-full h-64 object-contain bg-background"
              loading="lazy"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            If no QR is provided, the system falls back to the Events default image.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

