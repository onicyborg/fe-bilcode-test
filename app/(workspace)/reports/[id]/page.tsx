import { notFound } from 'next/navigation';
import { Detail } from '../../../../components/report-detail';
export const metadata = { title: 'Detail laporan' };
export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) notFound();
  return <Detail id={id} />;
}
