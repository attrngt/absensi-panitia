import { google } from "googleapis";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1s9oAtKp7ISBY-BOTeQpPnj6fCSGtMkQwBj5li4D_kqU";

    // Mengambil daftar nama dari sheet Day 1 mulai baris 2 di Kolom B
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Day 1!B2:B",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ names: [] });
    }

    const names = rows.map((row) => row[0]).filter((name) => name);

    return NextResponse.json({ names });
  } catch (error) {
    console.error("Fetch Panitia Error:", error);
    return NextResponse.json({ names: [] }, { status: 500 });
  }
}
