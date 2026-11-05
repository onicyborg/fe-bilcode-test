import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Workspace } from '../../components/workspace';

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  if (!(await cookies()).has('siklus_refresh')) redirect('/login');
  return <Workspace>{children}</Workspace>;
}
