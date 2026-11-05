import Link from 'next/link';
export default function NotFound() {
  return <main className="not-found"><h1>Halaman tidak ditemukan</h1><p>Periksa alamat atau kembali ke ringkasan.</p><Link className="button primary" href="/">Kembali ke Siklus</Link></main>;
}
