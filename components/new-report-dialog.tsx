'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ReportForm } from './report-form';

export function NewReportDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return <Dialog open={open} onOpenChange={value => { if (!busy) setOpen(value); }}>
    <DialogTrigger asChild><Button className="h-11 px-4"><Plus aria-hidden />Buat laporan</Button></DialogTrigger>
    <DialogContent className="report-dialog motion-reduce:animate-none" showCloseButton={!busy}
      onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}
      onPointerDownOutside={event => { if (busy) event.preventDefault(); }}>
      <DialogHeader className="report-dialog-heading"><DialogTitle>Buat laporan</DialogTitle>
        <DialogDescription>Sertakan foto dan koordinat agar petugas bisa menemukan lokasinya.</DialogDescription>
      </DialogHeader>
      <ReportForm onBusy={setBusy} onCancel={() => setOpen(false)} onCreated={() => { setOpen(false); onCreated(); }} />
    </DialogContent>
  </Dialog>;
}
