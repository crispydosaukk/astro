import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth');

  if (authCookie?.value !== 'true') {
    redirect('/admin-panel/login');
  }

  return <div className="min-h-screen bg-[#F8F3EA] text-[#292522]">{children}</div>;
}
