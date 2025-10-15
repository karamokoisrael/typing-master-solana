'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LoadingDialogProps {
  open: boolean;
  title: string;
  description: string;
}

export function LoadingDialog({ open, title, description }: LoadingDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <div className="animate-pulse text-muted-foreground text-sm">
            Please wait while we process your request...
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}