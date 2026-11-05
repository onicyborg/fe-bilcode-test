import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { categoryText, date, Report } from '../lib/types';
import { Empty, StatusBadge } from './common';

export function ReportTable({ items, filtered = false }: { items: Report[]; filtered?: boolean }) {
  if (!items.length) return <Empty title={filtered ? 'Tidak ada hasil' : 'Belum ada laporan'} text={filtered ? 'Ubah kata kunci atau filter yang dipilih.' : 'Laporan yang masuk akan muncul di sini.'} />;
  return <Table className="report-table">
    <TableHeader><TableRow><TableHead scope="col">Laporan</TableHead><TableHead scope="col">Kategori</TableHead><TableHead scope="col">Status</TableHead><TableHead scope="col">Dibuat</TableHead></TableRow></TableHeader>
    <TableBody>{items.map(item => <TableRow key={item.id}>
      <TableCell><Link className="row-link" href={'/reports/' + item.id}><strong>{item.description}</strong><ArrowUpRight size={16} aria-hidden /></Link><span className="row-id">#{item.id.slice(-8)}</span></TableCell>
      <TableCell>{item.prediction ? categoryText[item.prediction.category] : '—'}</TableCell>
      <TableCell><StatusBadge status={item.status} /></TableCell>
      <TableCell className="table-date">{date(item.createdAt)}</TableCell>
    </TableRow>)}</TableBody>
  </Table>;
}
