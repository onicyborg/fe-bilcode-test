'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { api, errorMessage, json } from '../lib/api';
import { date, Page, User } from '../lib/types';
import { Empty, LoadState, Pagination, useData, useDebouncedSearch } from './common';
import { useUser } from './workspace';

export function Users() {
  if (useUser().role !== 'ADMIN') return <p className="alert error" role="alert">Halaman ini hanya untuk administrator.</p>;
  return <UserList />;
}

function UserList() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<User>();
  const search = useDebouncedSearch(q);
  const result = useData<Page<User>>('users?' + new URLSearchParams({ q: search, page: String(page) }));

  async function change(item: User, remove = false) {
    setBusy(true); setMessage(''); setNotice('');
    try {
      await api('users/' + item.id, json(remove ? 'DELETE' : 'PATCH', remove ? undefined : { isActive: !item.isActive }));
      setConfirm(undefined);
      setNotice(remove ? 'Akun sudah dihapus.' : 'Status akun sudah diperbarui.');
      if (remove && page > 1 && result.data?.items.length === 1) setPage(page - 1);
      else result.reload();
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }

  return <>
    <div className="page-heading"><div><p className="eyebrow">Operasional / 03</p><h1>Pengguna</h1><p>Cari akun pelapor dan kelola aksesnya.</p></div></div>
    {message && <p className="alert error" role="alert">{message}</p>}
    {notice && <p className="alert" role="status">{notice}</p>}
    {confirm && <div className="alert confirm" role="region" aria-label="Konfirmasi penghapusan"><p>Hapus akun <strong>{confirm.name}</strong> beserta laporannya?</p><div className="actions"><Button variant="destructive" disabled={busy} onClick={() => change(confirm, true)}>Ya, hapus akun</Button><Button variant="outline" disabled={busy} onClick={() => setConfirm(undefined)}>Batal</Button></div></div>}
    <Card className="panel">
      <div className="filters user-filter" role="search" aria-label="Cari pengguna"><label>Pencarian<span className="search-field"><Search size={18} aria-hidden /><Input name="q" placeholder="Nama atau email" maxLength={100} value={q} onChange={event => { setQ(event.target.value); setPage(1); }} /></span></label></div>
      {result.data ? <>{result.data.items.length ? <Table className="user-table"><TableHeader><TableRow><TableHead scope="col">Akun</TableHead><TableHead scope="col">Peran</TableHead><TableHead scope="col">Status</TableHead><TableHead scope="col">Terdaftar</TableHead><TableHead scope="col">Tindakan</TableHead></TableRow></TableHeader>
        <TableBody>{result.data.items.map(item => <TableRow key={item.id}><TableCell><strong>{item.name}</strong><span className="row-id">{item.email}</span></TableCell><TableCell>{item.role === 'ADMIN' ? 'Admin' : 'Pelapor'}</TableCell><TableCell><Badge variant="outline" className={'status ' + (item.isActive ? 'status-completed' : 'status-rejected')}><i aria-hidden />{item.isActive ? 'Aktif' : 'Nonaktif'}</Badge></TableCell><TableCell>{date(item.createdAt)}</TableCell><TableCell>{item.role === 'USER' ? <div className="actions"><Button variant="outline" disabled={busy || !!confirm} onClick={() => change(item)}>{item.isActive ? 'Nonaktifkan' : 'Aktifkan'}</Button><Button variant="destructive" disabled={busy || !!confirm} onClick={() => setConfirm(item)}>Hapus</Button></div> : '—'}</TableCell></TableRow>)}</TableBody></Table> : <Empty title="Tidak ada pengguna" text="Coba kata kunci lain." />}<Pagination {...result.data} change={setPage} /></> : <LoadState error={result.error} retry={result.reload} />}
    </Card>
  </>;
}
