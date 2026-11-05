export const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'] as const;
export type Status = typeof statuses[number];
export const statusText: Record<Status, string> = {
  PENDING: 'Menunggu', IN_PROGRESS: 'Diproses', COMPLETED: 'Selesai', REJECTED: 'Ditolak',
};
export const categories = ['ORGANIC', 'PLASTIC', 'PAPER', 'GLASS', 'METAL', 'CARDBOARD', 'CLOTHES', 'FOOTWEAR', 'BATTERY', 'OTHER'] as const;
export type Category = typeof categories[number];
export const categoryText: Record<Category, string> = { ORGANIC: 'Organik', PLASTIC: 'Plastik', PAPER: 'Kertas', GLASS: 'Kaca', METAL: 'Logam', CARDBOARD: 'Kardus', CLOTHES: 'Pakaian', FOOTWEAR: 'Alas kaki', BATTERY: 'Baterai', OTHER: 'Lainnya' };
export type User = { id: string; name: string; email: string; role: 'USER' | 'ADMIN'; isActive: boolean; createdAt: string };
export type Page<T> = { items: T[]; page: number; limit: number; total: number };
export type Report = {
  id: string; reporterId: string; description: string; latitude: number; longitude: number;
  status: Status; prediction: { category: Category; confidence: number; modelVersion: string } | null;
  createdAt: string; updatedAt: string;
};
export type ReportDetail = Report & { statusHistory: {
  id: string; fromStatus: Status | null; toStatus: Status; reason: string | null; createdAt: string;
}[] };
export type Stats = { total: number; byStatus: Record<Status, number> };
export const date = (value: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
