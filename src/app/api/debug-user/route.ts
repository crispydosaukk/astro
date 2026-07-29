import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const astSnapshot = await getDocs(collection(db, 'astrologers'));
    const astrologers = astSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ users, astrologers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const filePath = path.join(process.cwd(), 'debug-info.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
