import { wyniki, wynikItem, zajecia, zgloszenia } from "@/app/types/types";
import db from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(req: Request){
    try{
        const { searchParams } = new URL(req.url);
        const id_zajec = searchParams.get('id_zajec');
        
        const q1 = "SELECT zgloszenia.id, zgloszenia.imie, zgloszenia.nazwisko, zgloszenia.id_zajec, zgloszenia.liczba_plusow, wyniki.pozycja  FROM wyniki JOIN zgloszenia ON wyniki.id_zgloszenia = zgloszenia.id WHERE zgloszenia.id_zajec = $1";
        const res1 = await db.query<wynikItem>(q1, [id_zajec])
        if(res1.rowCount == null || !res1.rows){
            return NextResponse.json(
                { error: "Brak wyników zajęć" }, 
                { status: 400 }
            )
        }
        const wyniki = res1.rows;
        const sformatowaneWyniki: wynikItem[] = wyniki.map((row: any) => {
            // Wyciągamy 'pozycja', a reszta pól trafia do obiektu 'rest' (czyli dane zgłoszenia)
            const { pozycja, ...rest } = row;

            return {
                pozycja: Number(pozycja),
                zgloszenie: {
                    id: Number(rest.id),
                    imie: rest.imie,
                    nazwisko: rest.nazwisko,
                    id_zajec: Number(rest.id_zajec),
                    liczba_plusow: Number(rest.liczba_plusow),
                }
            };
        });
        
        return NextResponse.json(sformatowaneWyniki, { status: 200 });
    }catch(err){
        console.log(err)
        return NextResponse.error()
    }

}
