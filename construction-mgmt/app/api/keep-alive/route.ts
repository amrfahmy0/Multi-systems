import { NextResponse } from "next/server";

// Database keep-alive endpoint for Vercel Cron Job
// Prevents Supabase free-tier database from sleeping
// Configure in vercel.json: { "crons": [{ "path": "/api/keep-alive", "schedule": "0 0 * * 0" }] }

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ status: "skip", message: "No Supabase credentials" });
    }

    // Lightweight query to keep DB alive
    const response = await fetch(`${supabaseUrl}/rest/v1/projects?select=id&limit=1`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ status: "error", code: response.status }, { status: 500 });
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
