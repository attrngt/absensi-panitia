import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { nama, divisi, sesiRapat, token } = await req.json();

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1s9oAtKp7ISBY-BOTeQpPnj6fCSGtMkQwBj5li4D_kqU";

    // 1. VALIDASI TOKEN DARI SHEET "Pengaturan" (Cari baris yang event-nya "Rapat")
    const settingsRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Pengaturan!A:B",
    });
    const settingRows = settingsRes.data.values || [];
    const eventSetting = settingRows.find((row) => row[0] === "Rapat");

    if (!eventSetting || eventSetting[1] !== token) {
      return NextResponse.json(
        { success: false, message: "Token Rapat tidak valid!" },
        { status: 403 },
      );
    }

    // 2. CEK DUPLIKAT DI SHEET "Rapat"
    const rapatRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Rapat!B:G", // B (Nama) sampai G (Sesi)
    });
    const rapatRows = rapatRes.data.values || [];

    // Cek apakah ada baris dengan Nama (index 0) dan Sesi (index 5) yang sama persis
    const isDuplicate = rapatRows.some(
      (row) => row[0] === nama && row[5] === sesiRapat,
    );
    if (isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda sudah presensi untuk sesi rapat ini!",
        },
        { status: 400 },
      );
    }

    // 3. APPEND DATA RAPAT BARU
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Rapat!A:G",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            `=ROW()-1`,
            nama,
            new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
            "Hadir",
            divisi,
            "",
            sesiRapat,
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
