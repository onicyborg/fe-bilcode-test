'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { categories, categoryText, Page, Report, statuses, statusText } from '../lib/types';
import { LoadState, Pagination, useData, useDebouncedSearch } from './common';
import { NewReportDialog } from './new-report-dialog';
import { ReportTable } from './report-table';

const initialFilters = { q: '', status: '', category: '' };

export function Reports() {
  const [filters, setFilters] = useState(initialFilters);
  const search = useDebouncedSearch(filters.q);
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState('');
  const query = new URLSearchParams({ page: String(page) });
  if (search) query.set('q', search);
  if (filters.status) query.set('status', filters.status);
  if (filters.category) query.set('category', filters.category);
  const result = useData<Page<Report>>('reports?' + query);
  const filtered = Boolean(filters.q || filters.status || filters.category);

  function filter(key: keyof typeof initialFilters, value: string) {
    setFilters(current => ({ ...current, [key]: value }));
    setPage(1);
  }

  function created() {
    setNotice('Laporan berhasil dikirim.');
    setFilters(initialFilters);
    setPage(1);
    result.reload();
  }

  return <>
    <div className="page-heading"><div><p className="eyebrow">Operasional / 02</p><h1>Laporan sampah</h1><p>Cari laporan dan lihat progres penanganannya.</p></div><NewReportDialog onCreated={created} /></div>
    {notice && <p className="alert" role="status">{notice}</p>}
    <Card className="panel">
      <div className="filters" role="search" aria-label="Filter laporan">
        <label>Pencarian<span className="search-field"><Search size={18} aria-hidden /><Input name="q" placeholder="Deskripsi atau ID lengkap" maxLength={100} value={filters.q} onChange={event => filter('q', event.target.value)} /></span></label>
        <label>Status<NativeSelect name="status" aria-label="Status" value={filters.status} onChange={event => filter('status', event.target.value)}><NativeSelectOption value="">Semua status</NativeSelectOption>{statuses.map(status => <NativeSelectOption value={status} key={status}>{statusText[status]}</NativeSelectOption>)}</NativeSelect></label>
        <label>Kategori<NativeSelect name="category" aria-label="Kategori" value={filters.category} onChange={event => filter('category', event.target.value)}><NativeSelectOption value="">Semua kategori</NativeSelectOption>{categories.map(category => <NativeSelectOption value={category} key={category}>{categoryText[category]}</NativeSelectOption>)}</NativeSelect></label>
        {filtered && <Button variant="outline" onClick={() => { setFilters(initialFilters); setPage(1); }}>Reset filter</Button>}
      </div>
      {result.data ? <><ReportTable items={result.data.items} filtered={filtered} /><Pagination {...result.data} change={setPage} /></> : <LoadState error={result.error} retry={result.reload} />}
    </Card>
  </>;
}
