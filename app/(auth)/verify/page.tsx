import { AuthForm } from '../../../components/auth-form';
export const metadata = { title: 'Verifikasi email' };
export default async function Verify({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return <AuthForm mode="verify" initialEmail={typeof email === 'string' ? email : ''} />;
}
