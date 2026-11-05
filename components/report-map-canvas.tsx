'use client';

import * as L from 'leaflet';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { ReportMapProps } from './report-map';

const markerIcon = L.divIcon({ className: 'report-map-pin', iconSize: [24, 24], iconAnchor: [12, 12] });

export function ReportMapCanvas({ point, onPick }: ReportMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [tileError, setTileError] = useState(false);
  const editable = Boolean(onPick);
  const pick = useEffectEvent((event: L.LeafletMouseEvent) => {
    const { lat, lng } = event.latlng.wrap();
    onPick?.({ latitude: lat, longitude: lng });
  });

  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, {
      scrollWheelZoom: false, zoomControl: false, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false,
    }).setView([-1, 113], 4);
    map.current = instance;
    instance.attributionControl.setPrefix(false);
    L.control.zoom({ zoomInTitle: 'Perbesar peta', zoomOutTitle: 'Perkecil peta' }).addTo(instance);
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });
    tiles.on('tileerror', () => setTileError(true));
    tiles.on('tileload', () => setTileError(false));
    tiles.addTo(instance);
    if (editable) instance.on('click', event => pick(event));
    const observer = new ResizeObserver(() => instance.invalidateSize({ pan: false }));
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      instance.remove();
      map.current = null;
      marker.current = null;
    };
  }, [editable]);

  const latitude = point?.latitude;
  const longitude = point?.longitude;
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    if (latitude === undefined || longitude === undefined) {
      marker.current?.remove();
      marker.current = null;
      return;
    }
    const coordinates = L.latLng(latitude, longitude);
    if (!marker.current) {
      marker.current = L.marker(coordinates, { icon: markerIcon, interactive: false, keyboard: false }).addTo(instance);
      instance.setView(coordinates, Math.max(instance.getZoom(), 15), { animate: false });
    } else {
      marker.current.setLatLng(coordinates);
      if (!instance.getBounds().pad(-0.2).contains(coordinates)) {
        instance.panTo(coordinates, { animate: false });
      }
    }
  }, [latitude, longitude, editable]);

  return <div className="report-map-frame">
    <div ref={container} className={'report-map' + (editable ? ' report-map-editable' : '')} role="region"
      aria-label={editable ? 'Peta untuk memilih titik laporan' : 'Peta lokasi laporan'} />
    {tileError && <p className="map-message" role="status">Peta dasar belum termuat. Koordinat tetap bisa digunakan.</p>}
  </div>;
}
