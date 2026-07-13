'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export async function loginAdmin(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    const cookieStore = await cookies();
    cookieStore.set('admin_auth', 'true', { secure: true, httpOnly: true, path: '/' });
  } catch (error) {
    return { error: 'Invalid email or password' };
  }
  
  redirect('/admin-panel');
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_auth');
  redirect('/admin-panel/login');
}
