import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Force this route to be dynamic so Next.js doesn't try to prerender it
export const dynamic = 'force-dynamic';

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