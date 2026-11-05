'use client';

import { Button } from '@/components/ui/button';
import { ClipboardList, LayoutGrid, LogOut, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { api, errorMessage } from '../lib/api';
import { User } from '../lib/types';
import { Brand } from './brand';

const Session = createContext<User | null>(null);
export function useUser() { return useContext(Session)!; }

export function Workspace({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>();
  const [error, setError] = useState('');
  const [attempt, retry] = useState(0);
  const [busy, setBusy] = useState(false);
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    api<User>('auth/me').then(value => { if (active) setUser(value); })
      .catch(error => { if (active) setError(errorMessage(error)); });
    return () => { active = false; };
  }, [attempt]);

  async function logout() {
    setBusy(true); setError('');
    try {
      await api('auth/logout', { method: 'POST' }, false);
      router.replace('/login');
      router.refresh();
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }

  const nav = [
    { href: '/dashboard', label: 'Ringkasan', icon: LayoutGrid },
    { href: '/reports', label: 'Laporan', icon: ClipboardList },
    ...(user?.role === 'ADMIN' ? [{ href: '/users', label: 'Pengguna', icon: UsersRound }] : []),
  ];
  const current = nav.find(item => path.startsWith(item.href));

  return <div className="workspace">
    <a className="skip-link" href="#main-content">Lewati ke konten</a>
    <aside className="sidebar">
      <Link className="brand-link" href="/dashboard" aria-label="Siklus, ringkasan"><Brand /></Link>
      <nav aria-label="Menu utama">
        {nav.map(({ href, label, icon: Icon }) => <Link href={href} key={href} aria-current={current?.href === href ? 'page' : undefined}><Icon size={18} aria-hidden /><span>{label}</span></Link>)}
      </nav>
      {user && <div className="sidebar-account">
        <span className="avatar" aria-hidden>{user.name.slice(0, 1).toUpperCase()}</span>
        <div><strong>{user.name}</strong><small>{user.role === 'ADMIN' ? 'Administrator' : 'Pelapor'}</small></div>
        <Button variant="ghost" size="icon" aria-label="Keluar" title="Keluar" onClick={logout} disabled={busy}><LogOut size={17} aria-hidden /></Button>
      </div>}
    </aside>
    <div className="workspace-body">
      <header className="topbar"><span>Ruang kerja <span className="breadcrumb-divider">/</span> <strong>{current?.label ?? 'Siklus'}</strong></span>{user && <span className="top-role">{user.role === 'ADMIN' ? 'Admin' : 'Pelapor'}</span>}</header>
      <main id="main-content" className="content">
        {error && <p className="alert error" role="alert">{error} {!user && <Button variant="outline" onClick={() => { setError(''); retry(attempt + 1); }}>Coba lagi</Button>}</p>}
        {user ? <Session.Provider value={user}>{children}</Session.Provider> : !error && <p className="loading" role="status">Memuat ruang kerja…</p>}
      </main>
    </div>
  </div>;
}
