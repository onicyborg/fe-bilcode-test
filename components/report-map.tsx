'use client';

import dynamic from 'next/dynamic';

export type MapPoint = { latitude: number; longitude: number };
export type ReportMapProps = { point?: MapPoint; onPick?: (point: MapPoint) => void };

export const ReportMap = dynamic<ReportMapProps>(() => import('./report-map-canvas').then(module => module.ReportMapCanvas), {
  ssr: false,
  loading: () => <div className="report-map map-loading" role="status">Memuat peta…</div>,
});

export function readMapPoint(latitude: string, longitude: string): MapPoint | undefined {
  if (!latitude.trim() || !longitude.trim()) return undefined;
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return undefined;
  return { latitude: lat, longitude: lng };
}
