export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

const messages: Record<string, string> = {
  INVALID_INPUT: 'Periksa kembali isian formulir.',
  INVALID_CREDENTIALS: 'Email atau kata sandi salah, atau akun tidak aktif.',
  EMAIL_UNVERIFIED: 'Verifikasi email sebelum masuk.',
  EMAIL_UNAVAILABLE: 'Email ini sudah terdaftar.',
  INVALID_VERIFICATION: 'Kode salah, kedaluwarsa, atau terkunci. Minta kode baru bila perlu.',
  PHOTO_REQUIRED: 'Pilih foto laporan.',
  INVALID_PHOTO: 'Gunakan foto JPEG atau PNG yang valid.',
  PHOTO_TOO_LARGE: 'Ukuran foto maksimal 5 MiB.',
  PHOTO_STORAGE_UNAVAILABLE: 'Penyimpanan foto sedang tidak tersedia.',
  NOT_FOUND: 'Data tidak ditemukan atau sudah dihapus.',
  INVALID_STATUS_TRANSITION: 'Status laporan sudah berubah. Muat ulang sebelum mencoba lagi.',
  REPORT_NOT_PENDING: 'Hanya laporan menunggu yang bisa diubah atau dihapus.',
  RATE_LIMITED: 'Terlalu banyak permintaan. Coba lagi sebentar.',
};

let refreshing: Promise<Response> | undefined;

async function send(path: string, init?: RequestInit, authenticated = true) {
  let response = await fetch('/api/' + path, { ...init, cache: 'no-store' });
  if (authenticated && response.status === 401) {
    refreshing ??= fetch('/api/auth/refresh', { method: 'POST' }).finally(() => { refreshing = undefined; });
    const refreshed = await refreshing;
    if (refreshed.ok) response = await fetch('/api/' + path, { ...init, cache: 'no-store' });
    else response = refreshed;
    if (response.status === 401 && typeof window !== 'undefined') window.location.replace('/login');
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(response.status, data.code, messages[data.code] || data.message || 'Permintaan gagal.');
  }
  return response;
}

export async function api<T>(path: string, init?: RequestInit, authenticated = true): Promise<T> {
  const response = await send(path, init, authenticated);
  return response.status === 204 ? undefined as T : response.json();
}
export async function photoBlob(id: string) {
  return (await send(`reports/${id}/photo`)).blob();
}
export function json(method: string, data?: unknown): RequestInit {
  return { method, headers: { 'content-type': 'application/json' }, body: data === undefined ? undefined : JSON.stringify(data) };
}
export function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Koneksi terputus. Coba lagi.';
}
