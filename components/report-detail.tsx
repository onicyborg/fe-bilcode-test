'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { ArrowLeft, Clock3, ImageOff, MapPin, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { api, errorMessage, json, photoBlob } from '../lib/api';
import { categoryText, date, ReportDetail, Status, statusText } from '../lib/types';
import { LoadState, StatusBadge, useData } from './common';
import { useUser } from './workspace';
import { ReportMap } from './report-map';
import { EditReportLocation } from './edit-report-location';

function ReportPhoto({ id }: { id: string }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;
    photoBlob(id).then(blob => {
      if (active) { objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id]);
  return <div className="report-photo">
    {url ? <img src={url} alt="Foto sampah yang disertakan dalam laporan" /> : <p role="status"><ImageOff size={22} aria-hidden />{error ? 'Foto tidak dapat dimuat.' : 'Memuat foto…'}</p>}
  </div>;
}

export function Detail({ id }: { id: string }) {
  const user = useUser();
  const router = useRouter();
  const { data: report, error, reload } = useData<ReportDetail>('reports/' + id);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [next, setNext] = useState<Status | ''>('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');

  async function mutate(path: string, method: string, data?: unknown) {
    setBusy(true); setMessage(''); setNotice('');
    try {
      await api(path, json(method, data));
      if (method === 'DELETE') { router.replace('/reports'); return; }
      setEditing(false); setNext(''); setNotice('Perubahan tersimpan.'); reload();
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }

  function edit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    void mutate('reports/' + id, 'PATCH', { description: values.get('description'), latitude: Number(values.get('latitude')), longitude: Number(values.get('longitude')) });
  }

  function status(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = new FormData(event.currentTarget).get('reason');
    void mutate(`reports/${id}/status`, 'PATCH', { status: next, ...(reason ? { reason } : {}) });
  }

  const allowed: Status[] = report?.status === 'PENDING' ? ['IN_PROGRESS', 'REJECTED']
    : report?.status === 'IN_PROGRESS' ? ['COMPLETED', 'REJECTED'] : [];
  const canEdit = report?.status === 'PENDING';

  return <div className="report-detail-page">
    <Link href="/reports" className="back-link"><ArrowLeft size={17} aria-hidden />Kembali ke laporan</Link>

    <header className="detail-heading">
      <div>
        <div className="detail-heading-meta"><span>Laporan #{id.slice(-8)}</span>{report && <StatusBadge status={report.status} />}</div>
        <h1>Detail laporan</h1>
        {report && <p className="detail-date"><Clock3 size={15} aria-hidden />Dibuat {date(report.createdAt)}</p>}
      </div>
      {canEdit && !editing && !confirm && <div className="actions">
        <Button variant="outline" onClick={() => setEditing(true)}><Pencil size={16} aria-hidden />Edit laporan</Button>
        <Button variant="destructive" onClick={() => setConfirm(true)}><Trash2 size={16} aria-hidden />Hapus laporan</Button>
      </div>}
    </header>

    {notice && <p className="alert" role="status">{notice}</p>}
    {message && <p className="alert error" role="alert">{message}</p>}
    {canEdit && confirm && <div className="alert confirm" role="region" aria-label="Konfirmasi penghapusan">
      <p>Hapus laporan ini dari daftar?</p>
      <div className="actions"><Button variant="destructive" disabled={busy} onClick={() => mutate('reports/' + id, 'DELETE')}>{busy ? 'Menghapus…' : 'Ya, hapus laporan'}</Button><Button variant="outline" disabled={busy} onClick={() => setConfirm(false)}>Batal</Button></div>
    </div>}

    {!report ? <LoadState error={error} retry={reload} /> : <>
      <Card className="panel detail-summary">
        {editing ? <form className="stack" onSubmit={edit}>
          <h2>Edit laporan</h2>
          <label>Deskripsi<Textarea name="description" defaultValue={report.description} rows={3} maxLength={1000} required /></label>
          <EditReportLocation initialPoint={report} busy={busy} />
          <div className="actions"><Button disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan'}</Button><Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={busy}>Batal</Button></div>
        </form> : <><h2>Deskripsi</h2><p className="description">{report.description}</p></>}
      </Card>

      <div className="detail-grid">
        <div className="detail-column">
          {!editing && <Card className="panel detail-map-card">
            <div className="detail-card-heading">
              <span className="detail-location-icon"><MapPin size={18} aria-hidden /></span>
              <div><h2>Lokasi laporan</h2><p className="detail-card-caption">Titik yang ditandai oleh pelapor</p></div>
            </div>
            <ReportMap point={report} />
            <div className="detail-map-footer">
              <span>Koordinat GPS</span>
              <strong>{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</strong>
            </div>
          </Card>}

          <Card className="panel detail-section">
            <h2>Riwayat status</h2>
            <ol className="timeline">{[...report.statusHistory].reverse().map(item => <li key={item.id}>
              <StatusBadge status={item.toStatus} />
              <small>{date(item.createdAt)}</small>
              {item.reason && <p>{item.reason}</p>}
            </li>)}</ol>
          </Card>
        </div>

        <div className="detail-column">
          <Card className="panel detail-evidence">
            <div className="detail-card-heading"><h2>Foto laporan</h2></div>
            <ReportPhoto id={id} />
            <div className="detail-prediction">
              <h3>Prediksi kategori</h3>
              {report.prediction
                ? <><p><strong>{categoryText[report.prediction.category]}</strong> · skor model {Math.round(report.prediction.confidence * 100)}%</p><small>Perkiraan satu kategori utama. Foto sampah campuran dapat menghasilkan prediksi keliru meskipun skornya tinggi.</small></>
                : <p>Belum ada hasil prediksi.</p>}
            </div>
          </Card>

          {user.role === 'ADMIN' && allowed.length > 0 && <Card className="panel detail-section">
            <h2>Ubah status</h2>
            <form className="stack" onSubmit={status}>
              <label>Status berikutnya<NativeSelect aria-label="Status berikutnya" required value={next} onChange={event => setNext(event.target.value as Status | '')}>
                <NativeSelectOption value="">Pilih status</NativeSelectOption>
                {allowed.map(item => <NativeSelectOption key={item} value={item}>{statusText[item]}</NativeSelectOption>)}
              </NativeSelect></label>
              {next === 'REJECTED' && <label>Alasan penolakan<Textarea name="reason" rows={3} required maxLength={500} /></label>}
              <Button disabled={busy || !next}>{busy ? 'Menyimpan…' : 'Simpan status'}</Button>
            </form>
          </Card>}
        </div>
      </div>
    </>}
  </div>;
}
