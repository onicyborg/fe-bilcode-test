'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, ClipboardList, Clock3, Timer, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Page, Report, Stats, statuses, statusText } from '../lib/types';
import { LoadState, useData } from './common';
import { ReportTable } from './report-table';
import { NewReportDialog } from './new-report-dialog';
import { useUser } from './workspace';

const icons = { PENDING: Clock3, IN_PROGRESS: Timer, COMPLETED: Check, REJECTED: X };
const format = new Intl.NumberFormat('id-ID');

export function Dashboard() {
  const user = useUser();
  const [notice, setNotice] = useState(false);
  const stats = useData<Stats>('dashboard/stats');
  const recent = useData<Page<Report>>('reports?limit=5');
  return <>
    <div className="page-heading">
      <div><p className="eyebrow">Operasional / 01</p><h1>Ringkasan laporan</h1><p>{user.role === 'ADMIN' ? 'Pantau antrean dan progres penanganan seluruh laporan.' : 'Pantau progres penanganan laporan yang kamu kirim.'}</p></div>
      <NewReportDialog onCreated={() => { setNotice(true); stats.reload(); recent.reload(); }} />
    </div>
    {notice && <p className="alert" role="status">Laporan berhasil dikirim.</p>}
    {stats.data ? <section className="overview" aria-label="Statistik laporan">
      <div className="total-card"><span className="total-icon"><ClipboardList size={22} aria-hidden /></span><p>Total laporan</p><strong>{format.format(stats.data.total)}</strong><small>{user.role === 'ADMIN' ? 'Seluruh laporan aktif' : 'Laporan aktif milikmu'}</small></div>
      <div className="panel distribution">
        <div className="panel-heading"><div><h2>Status penanganan</h2><p>Distribusi laporan berdasarkan status saat ini.</p></div></div>
        <div className="status-grid">{statuses.map(status => {
          const Icon = icons[status];
          const count = stats.data!.byStatus[status];
          const percentage = stats.data!.total ? (count / stats.data!.total) * 100 : 0;
          return <div className={'metric metric-' + status.toLowerCase()} key={status}>
            <p><Icon size={16} aria-hidden />{statusText[status]}</p><strong>{format.format(count)}</strong>
            <div className="metric-track" aria-hidden><span style={{ width: `${percentage}%` }} /></div>
          </div>;
        })}</div>
      </div>
    </section> : <Card className="panel"><LoadState error={stats.error} retry={stats.reload} /></Card>}
    <Card className="panel recent">
      <div className="panel-heading"><div><h2>Laporan terbaru</h2><p>Hingga lima laporan terakhir di ruang kerjamu.</p></div><Button asChild variant="outline"><Link href="/reports">Semua laporan<ArrowRight aria-hidden /></Link></Button></div>
      {recent.data ? <ReportTable items={recent.data.items} /> : <LoadState error={recent.error} retry={recent.reload} />}
    </Card>
  </>;
}
