import { zajecia } from "@/app/types/types";
import db from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(){
    try{
        const zajecia = await db.query<zajecia>("SELECT * FROM zajecia WHERE data >= $1 ORDER BY data ASC;", [new Date()])
        return NextResponse.json(zajecia.rows);
    }catch(err){
        console.log(err)
        return NextResponse.error()
    }

}