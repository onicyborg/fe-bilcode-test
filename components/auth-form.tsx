'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { api, ApiError, errorMessage, json } from '../lib/api';

type Mode = 'login' | 'register' | 'verify';
const copy = {
  login: ['Masuk ke Siklus', 'Gunakan akunmu untuk melihat dan mengelola laporan.', 'Masuk'],
  register: ['Buat akun', 'Daftar untuk membuat dan memantau laporan sampah.', 'Daftar'],
  verify: ['Verifikasi email', 'Masukkan kode 6 digit yang dikirim ke alamat emailmu.', 'Verifikasi email'],
} as const;

export function AuthForm({ mode, initialEmail = '' }: { mode: Mode; initialEmail?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const verifyUrl = (value: string) => '/verify?email=' + encodeURIComponent(value);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true); setMessage(''); setNotice(''); setNeedsVerification(false);
    try {
      await api(mode === 'verify' ? 'auth/verify-email' : 'auth/' + mode, json('POST', values), false);
      if (mode === 'login') router.replace('/dashboard');
      if (mode === 'register') router.replace(verifyUrl(email));
      if (mode === 'verify') router.replace('/login?verified=1');
    } catch (error) {
      setMessage(errorMessage(error));
      setNeedsVerification(error instanceof ApiError && error.code === 'EMAIL_UNVERIFIED');
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (!email) { setMessage('Masukkan alamat email terlebih dahulu.'); return; }
    setBusy(true); setMessage(''); setNotice('');
    try {
      await api('auth/resend-verification', json('POST', { email }), false);
      setNotice('Jika akun memenuhi syarat, kode baru akan dikirim. Cek kotak masuk dan folder spam.');
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }

  return <>
    <p className="eyebrow">Akun Siklus</p>
    <h1>{copy[mode][0]}</h1>
    <p className="muted auth-intro">{copy[mode][1]}</p>
    <form className="stack" onSubmit={submit}>
      {mode === 'register' && <label>Nama lengkap<Input name="name" autoComplete="name" placeholder="Nama kamu" required maxLength={100} /></label>}
      <label>Email<Input type="email" name="email" autoComplete="email" placeholder="nama@contoh.id" maxLength={254} required value={email} onChange={event => setEmail(event.target.value)} /></label>
      {mode === 'verify'
        ? <label>Kode verifikasi<Input className="code-input" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" required /><small>Berlaku 10 menit sejak dikirim.</small></label>
        : <label>Kata sandi<span className="password-field"><Input name="password" type={show ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Minimal 8 karakter" required minLength={8} maxLength={128} /><Button variant="ghost" size="icon" type="button" onClick={() => setShow(!show)} aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{show ? <EyeOff size={19} /> : <Eye size={19} />}</Button></span></label>}
      {message && <p className="alert error" role="alert">{message}</p>}
      {notice && <p className="alert" role="status">{notice}</p>}
      {needsVerification && <Link className="text-link" href={verifyUrl(email)}>Masukkan kode verifikasi</Link>}
      <Button className="auth-submit" disabled={busy}>{busy ? 'Memproses…' : copy[mode][2]}<ArrowRight size={18} aria-hidden /></Button>
      {mode === 'verify' && <Button type="button" variant="outline" onClick={resend} disabled={busy}>Kirim ulang kode</Button>}
    </form>
    <p className="auth-footer">{mode === 'login' ? <>Belum punya akun? <Link href="/register">Daftar</Link></> : <>Sudah punya akun? <Link href="/login">Masuk</Link></>}</p>
  </>;
}
