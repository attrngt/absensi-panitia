import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { nama, divisi, sesiRapat } = await req.json();

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1s9oAtKp7ISBY-BOTeQpPnj6fCSGtMkQwBj5li4D_kqU";

    // Menambah baris baru (Append) ke sheet "Rapat" sampai Kolom G
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Rapat!A:G",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            `=ROW()-1`, // Kolom A: Nomor urut otomatis
            nama, // Kolom B: Nama
            new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }), // Kolom C: Waktu Submit
            "Hadir", // Kolom D: Status
            divisi, // Kolom E: Divisi
            "", // Kolom F: Alasan (Kosong)
            sesiRapat, // Kolom G: Tanggal & Jam Rapat (Fiksasi Sesi)
          ],
        ],
      },
    });

    return NextResponse.json({
      success: true,
      message: "Presensi rapat berhasil dicatat.",
    });
  } catch (error) {
    console.error("Spreadsheet Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mencatat presensi rapat." },
      { status: 500 },
    );
  }
}
