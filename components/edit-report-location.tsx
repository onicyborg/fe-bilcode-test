'use client';

import { LocateFixed } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReportMap, type MapPoint } from './report-map';

export function EditReportLocation({ initialPoint, busy }: { initialPoint: MapPoint; busy: boolean }) {
  const [point, setPoint] = useState(initialPoint);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  function locate() {
    if (!navigator.geolocation) {
      setError('Lokasi perangkat tidak tersedia. Pilih titik di peta.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setPoint({ latitude: coords.latitude, longitude: coords.longitude });
      setLocating(false);
    }, () => {
      setError('Lokasi perangkat tidak bisa diambil. Periksa izin lokasi atau pilih titik di peta.');
      setLocating(false);
    }, { timeout: 8000 });
  }

  return <fieldset className="edit-report-location">
    <legend>Lokasi laporan</legend>
    <div className="edit-location-tools">
      <small>Klik atau ketuk peta untuk memindahkan pin.</small>
      <Button type="button" variant="outline" onClick={locate} disabled={busy || locating}>
        <LocateFixed aria-hidden />{locating ? 'Mengambil lokasi…' : 'Gunakan lokasi saat ini'}
      </Button>
    </div>
    {error && <p className="alert error" role="status">{error}</p>}
    <ReportMap point={point} onPick={selected => {
      if (!busy && !locating) { setPoint(selected); setError(''); }
    }} />
    <div className="coordinates">
      <label>Lintang<Input name="latitude" value={point.latitude.toFixed(6)} readOnly /></label>
      <label>Bujur<Input name="longitude" value={point.longitude.toFixed(6)} readOnly /></label>
    </div>
  </fieldset>;
}
