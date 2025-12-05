import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import pool from "../../../../lib/server/dbConnectors/postgresConnector";
import { errorLogger } from "../../../../lib/server/errorLoggers/errorLogger";

export async function GET(req){
    const { userId } = getAuth(req)

    if (!userId) {
      return  NextResponse.json({ error: "Not authorized" }, { status: 400 });
    }
    
    try {
        const results = await pool.query("SELECT payment_status FROM users WHERE user_id = $1", [userId]);
       return NextResponse.json({ paymentStatus: results.rows[0].payment_status}, { status: 200 });
    } catch (error) {
        errorLogger(req.nextUrl, error, userId);
        return NextResponse.json({ error: "Error fetching payment status" }, { status: 500 });
    }
}