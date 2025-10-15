'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  transactionSignature?: string;
}

export function SuccessDialog({ open, onClose, title, description, transactionSignature }: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-green-500">✅</span>
            {title}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>{description}</p>
            {transactionSignature && (
              <div className="mt-2 p-2 bg-muted rounded">
                <p className="text-sm font-medium">Transaction Signature:</p>
                <code className="text-xs break-all">{transactionSignature}</code>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}