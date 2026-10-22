import { zajecia } from "@/app/types/types";
import db from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(req: Request){
    try{
        const { searchParams } = new URL(req.url);
        const id_zajec = searchParams.get("id_zajec");
        const zajecia = await db.query<zajecia>("SELECT * FROM zajecia WHERE id = $1", [id_zajec])
        return NextResponse.json(zajecia.rows[0]);
    }catch(err){
        console.log(err)
        return NextResponse.error()
    }

}