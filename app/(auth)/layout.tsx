import { Camera, ClipboardCheck, MapPin } from 'lucide-react';
import { Brand } from '../../components/brand';

const stages = [
  [Camera, 'Catat', 'Foto dan titik lokasi'],
  [MapPin, 'Pantau', 'Status setiap laporan'],
  [ClipboardCheck, 'Tuntaskan', 'Riwayat penanganan'],
] as const;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="auth-layout">
    <aside className="auth-story" aria-label="Tentang Siklus">
      <Brand />
      <div className="auth-story-content">
        <p className="story-label">Ruang kerja pengelolaan sampah</p>
        <h2>Satu laporan,<br />sampai tuntas<span>.</span></h2>
        <p>Dari foto di lapangan hingga penanganan selesai. Ikuti setiap tahap di satu tempat.</p>
        <ol className="story-route">
          {stages.map(([Icon, title, subtitle], index) => <li key={title}>
            <span className="story-icon"><Icon size={19} aria-hidden /></span>
            <span><strong>{title}</strong><small>{subtitle}</small></span>
            <span className="story-number">0{index + 1}</span>
          </li>)}
        </ol>
      </div>
      <span className="story-footer">Siklus / Laporan lingkungan</span>
    </aside>
    <div className="auth-main"><div className="auth-card"><div className="mobile-brand"><Brand /></div>{children}</div></div>
  </main>;
}
