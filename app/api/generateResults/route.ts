import { wyniki, zajecia, zgloszenia } from "@/app/types/types";
import db from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";


export async function POST(req: Request){
    try{
        const cookieStore = await cookies();
        const adminCookie = cookieStore.get('admin_logged');

        // Sprawdzamy czy ciasteczko autoryzacyjne istnieje i jest poprawne
        if (!adminCookie || adminCookie.value !== 'true') {
        return NextResponse.json(
            { error: 'Brak autoryzacji. Musisz się zalogować jako administrator.' }, 
            { status: 401 }
        );
        }

        const body = await req.json();
        const { id_zajec } = body;
        
        const q1 = "SELECT * FROM zgloszenia WHERE id_zajec = $1 ORDER BY liczba_plusow ASC";
        const res1 = await db.query<zgloszenia>(q1, [id_zajec])
        if(res1.rowCount == null || !res1.rows){
            return NextResponse.json(
                { error: "Brak zgłoszeń na te zajęcia" }, 
                { status: 400 }
            )
        }

        const zgloszenia: zgloszenia[] = res1.rows;
            
        let index = 0;
        const wyniki: zgloszenia[] = new Array(zgloszenia.length).fill(undefined);
        for (let plusy = 0; index < zgloszenia.length; plusy++) {
            let starting_index = index;
            let ending_index = index;
            while(index < zgloszenia.length && zgloszenia[index].liczba_plusow == plusy){
                ending_index += 1
                index += 1
            }
            const rozmieszczenie = rozmiesc_lowowo(starting_index, ending_index - 1);
            for (let i = starting_index; i < ending_index; i++) {
                wyniki[i] = zgloszenia[rozmieszczenie[i-starting_index]]
            }
        }

        let q2 = "INSERT INTO wyniki (id_zgloszenia, pozycja) VALUES";
        const values: any[] = []
        for (let index = 0; index < wyniki.length; index++) {
            q2 += ` ($${(index+1) * 2 - 1}, $${(index+1) * 2}),`
            values.push(wyniki[index].id);
            values.push(index)
        }
        q2 = q2.slice(0, -1) + ";"
        const res2 = await db.query<wyniki>(q2, values)

        return NextResponse.json(wyniki, { status: 200 });
    }catch(err){
        console.log(err)
        return NextResponse.error()
    }

}

function rozmiesc_lowowo(start: number, end: number): number[] {
    const indexy: number[] = []
    for (let index = start; index <= end; index++) {
        let rnd;
        while(rnd == undefined || indexy.includes(rnd)){
            rnd = losowa(start, end)
        }
        indexy.push(rnd)
    }
    return indexy;
}

function losowa(x: number, y: number) {
    return Math.floor(Math.random() * (y - x + 1)) + x;
}