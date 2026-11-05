import { AuthForm } from '../../../components/auth-form';
export const metadata = { title: 'Masuk' };
export default async function Login({ searchParams }: { searchParams: Promise<{ verified?: string }> }) {
  return <>{(await searchParams).verified === '1' && <p className="alert" role="status">Email terverifikasi. Silakan masuk.</p>}<AuthForm mode="login" /></>;
}
