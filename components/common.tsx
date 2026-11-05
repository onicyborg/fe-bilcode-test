'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, errorMessage } from '../lib/api';
import { Status, statusText } from '../lib/types';

export function useData<T>(path: string) {
  const [result, setResult] = useState<{ path: string; data?: T; error?: string }>();
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let current = true;
    const controller = new AbortController();
    api<T>(path, { signal: controller.signal }).then(data => {
      if (current) setResult({ path, data });
    }).catch(error => { if (current) setResult({ path, error: errorMessage(error) }); });
    return () => { current = false; controller.abort(); };
  }, [path, revision]);
  const visible = result?.path === path ? result : undefined;
  return { data: visible?.data, error: visible?.error, reload: () => { setResult(undefined); setRevision(value => value + 1); } };
}

export function useDebouncedSearch(value: string) {
  const [search, setSearch] = useState(value.trim());
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(value.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [value]);
  return value.trim() ? search : '';
}

export function StatusBadge({ status }: { status: Status }) {
  return <Badge variant="outline" className={'status status-' + status.toLowerCase()}><i aria-hidden />{statusText[status]}</Badge>;
}
export function LoadState({ error, retry }: { error?: string; retry: () => void }) {
  return error ? <div className="alert error" role="alert">{error} <Button variant="outline" onClick={retry}>Coba lagi</Button></div>
    : <p className="loading" role="status">Memuat data…</p>;
}
export function Empty({ title, text }: { title: string; text: string }) {
  return <div className="empty"><ClipboardList size={25} aria-hidden /><strong>{title}</strong><p>{text}</p></div>;
}
export function Pagination({ page, limit, total, change }: { page: number; limit: number; total: number; change: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return <div className="pagination"><span>{total ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} dari ${total}` : '0 hasil'}</span>
    <div><Button variant="ghost" size="icon" aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => change(page - 1)}><ChevronLeft size={18} /></Button>
    <span>Halaman {page} / {pages}</span>
    <Button variant="ghost" size="icon" aria-label="Halaman berikutnya" disabled={page >= pages} onClick={() => change(page + 1)}><ChevronRight size={18} /></Button></div>
  </div>;
}
