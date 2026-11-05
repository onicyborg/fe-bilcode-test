import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Siklus | Pengelolaan sampah', template: '%s | Siklus' },
  description: 'Laporkan sampah dan pantau penanganannya dalam satu ruang kerja.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
