import { zajecia } from "@/app/types/types";
import db from "@/lib/db";
import { NextResponse } from "next/server";


export async function POST(req: Request){
    try{
        const body = await req.json();
        const { id_zajec } = body;
        const zajecia = await db.query<zajecia>("SELECT * FROM zajecia WHERE id = $1", [id_zajec])
        return NextResponse.json(zajecia.rows[0]);
    }catch(err){
        console.log(err)
        return NextResponse.error()
    }

}