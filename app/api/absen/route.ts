import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

interface AbsenBody {
  nama: string;
  day: string;
  divisi: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: AbsenBody = await req.json();
    const { nama, day, divisi } = body;

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1s9oAtKp7ISBY-BOTeQpPnj6fCSGtMkQwBj5li4D_kqU";

    // 1. Ambil semua data di Kolom B untuk mencari baris si Panitia
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${day}!B:B`,
    });

    const rows = response.data.values;
    if (!rows) throw new Error("Data sheet kosong");

    // 2. Cari index namanya (index 0 = baris 1 di excel)
    const rowIndex = rows.findIndex((row) => row[0] === nama);

    if (rowIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: `Nama "${nama}" tidak ditemukan di Kolom B pada sheet ${day}.`,
        },
        { status: 404 },
      );
    }

    const excelRowNumber = rowIndex + 1; // Konversi index ke nomor baris nyata Excel

    // 3. Timpa Kolom C (Waktu), D (Status), dan E (Divisi) di baris tersebut
    const updateRange = `${day}!C${excelRowNumber}:E${excelRowNumber}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }), // Masuk Kolom C
            "Hadir", // Masuk Kolom D
            divisi, // Masuk Kolom E
          ],
        ],
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kehadiran berhasil dicatat.",
    });
  } catch (error) {
    console.error("Spreadsheet Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mencatat kehadiran." },
      { status: 500 },
    );
  }
}
