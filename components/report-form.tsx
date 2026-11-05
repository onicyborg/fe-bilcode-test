'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LocateFixed, Upload } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { api, errorMessage } from '../lib/api';
import { MapPoint, readMapPoint, ReportMap } from './report-map';

export function ReportForm({ onCreated, onCancel, onBusy }: { onCreated: () => void; onCancel: () => void; onBusy: (value: boolean) => void }) {
  const [position, setPosition] = useState({ latitude: '', longitude: '' });
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [filename, setFilename] = useState('');

  function setPoint({ latitude, longitude }: MapPoint) {
    setPosition({ latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) });
  }

  function locate() {
    if (!navigator.geolocation) { setLocationError('Lokasi perangkat tidak tersedia. Isi koordinat secara manual.'); return; }
    setLocating(true); setLocationError('');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setPoint(coords); setLocating(false);
    }, () => {
      setLocationError('Lokasi tidak dapat diambil. Periksa izin browser atau isi koordinat secara manual.'); setLocating(false);
    }, { timeout: 8000 });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const body = new FormData(event.currentTarget);
    const photo = body.get('photo');
    if (!(photo instanceof File) || !photo.size) { setError('Pilih foto laporan.'); return; }
    if (photo.size > 5 * 1024 * 1024) { setError('Ukuran foto maksimal 5 MiB.'); return; }
    setBusy(true); onBusy(true);
    try {
      await api('reports', { method: 'POST', body });
      onCreated();
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); onBusy(false); }
  }

  return <form className="report-dialog-form stack" onSubmit={submit}>
      <label>Foto sampah <span className="upload-field"><Upload size={22} aria-hidden /><span>{filename || 'Pilih foto JPEG atau PNG'}<small>Maksimal 5 MiB</small></span><Input type="file" name="photo" accept="image/jpeg,image/png" onChange={event => setFilename(event.target.files?.[0]?.name ?? '')} required /></span></label>
      <label>Deskripsi<Textarea name="description" rows={4} required maxLength={1000} placeholder="Contoh: Tumpukan kardus di tepi jalan dekat pintu masuk pasar." /></label>
      <fieldset><legend>Lokasi laporan</legend><Button type="button" variant="outline" onClick={locate} disabled={locating || busy}><LocateFixed size={18} aria-hidden />{locating ? 'Mengambil lokasi…' : 'Gunakan lokasi perangkat'}</Button>
        {locationError && <p className="muted" role="status">{locationError}</p>}
        <ReportMap point={readMapPoint(position.latitude, position.longitude)} onPick={point => {
          if (!busy && !locating) { setPoint(point); setLocationError(''); }
        }} />
        <small>Ketuk peta untuk menyesuaikan pin, atau isi koordinat secara manual.</small>
        <div className="coordinates"><label>Lintang<Input type="number" name="latitude" step="any" min={-90} max={90} required value={position.latitude} onChange={event => setPosition({ ...position, latitude: event.target.value })} /></label><label>Bujur<Input type="number" name="longitude" step="any" min={-180} max={180} required value={position.longitude} onChange={event => setPosition({ ...position, longitude: event.target.value })} /></label></div>
      </fieldset>
      {error && <p className="alert error" role="alert">{error}</p>}
      <div className="actions"><Button disabled={busy}>{busy ? 'Mengirim laporan…' : 'Kirim laporan'}</Button><Button type="button" variant="outline" onClick={onCancel} disabled={busy}>Batal</Button></div>
    </form>;
}
