import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ error: 'Brak skonfigurowanego hasła w .env' }, { status: 500 });
    }

    if (password === adminPassword) {
      const cookieStore = await cookies();
      
      // Ustawiamy bezpieczne ciasteczko ważne przez 24 godziny
      cookieStore.set('admin_logged', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, 
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Niepoprawne hasło' }, { status: 401 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}