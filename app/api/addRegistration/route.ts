import { zajecia, zgloszenia } from "@/app/types/types";
import db from "@/lib/db";
import { NextResponse } from "next/server";


export async function POST(req: Request){
    try{
        const body = await req.json();
        const { imie, nazwisko, id_zajec, liczba_plusow } = body;
        
        console.log(imie, nazwisko, id_zajec, liczba_plusow)
        const query1 = `SELECT * 
                        FROM zgloszenia 
                        WHERE id_zajec = $1
                        AND LOWER(TRIM(imie)) = LOWER(TRIM($2))
                        AND LOWER(TRIM(nazwisko)) = LOWER(TRIM($3));`
        const czy_juz_zarejestrowany = await db.query<zgloszenia>(query1, [id_zajec, imie, nazwisko])
        if(czy_juz_zarejestrowany?.rowCount && czy_juz_zarejestrowany.rowCount > 0){
            return NextResponse.json(
                { error: "Osoba o tych danych jest już zarejestrowana na te zajęcia" }, 
                { status: 400 }
            )
        }
        const query2 = `INSERT INTO zgloszenia (imie, nazwisko, id_zajec, liczba_plusow) VALUES ($1, $2, $3, $4);`;
        const res = await db.query<zgloszenia>(query2, [imie, nazwisko, id_zajec, liczba_plusow])
        return NextResponse.json({ status: 200 });
    }catch(err){
        console.log(err)
        return NextResponse.error()
    }

}