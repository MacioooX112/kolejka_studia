import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const adminCookie = cookieStore.get("admin_logged")?.value
        if(adminCookie == "true"){
            return NextResponse.json({ isLogged: true });
        } else {
            return NextResponse.json({ isLogged: false });
        }
    } catch (err) {
        console.error(err);
            return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
    }
}