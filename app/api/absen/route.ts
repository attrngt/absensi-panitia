import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { nama, day, divisi, token } = await req.json();

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1s9oAtKp7ISBY-BOTeQpPnj6fCSGtMkQwBj5li4D_kqU';

    // 1. VALIDASI TOKEN DARI SHEET "Pengaturan"
    const settingsRes = await sheets.spreadsheets.values.get({
      spreadsheetId, range: 'Pengaturan!A:B',
    });
    const settingRows = settingsRes.data.values || [];
    const eventSetting = settingRows.find(row => row[0] === day);
    
    if (!eventSetting || eventSetting[1] !== token) {
      return NextResponse.json({ success: false, message: 'Token tidak valid atau kedaluwarsa!' }, { status: 403 });
    }

    // 2. CEK DUPLIKAT DAN CARI BARIS NAMA DI SHEET HARI H
    // Ambil dari Kolom A sampai E untuk melihat Status di Kolom D
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId, range: `${day}!A:E`,
    });

    const rows = response.data.values;
    if (!rows) throw new Error('Data sheet kosong');

    // row[1] adalah Nama (Kolom B), row[3] adalah Status (Kolom D)
    const rowIndex = rows.findIndex(row => row[1] === nama);

    if (rowIndex === -1) {
      return NextResponse.json({ success: false, message: `Nama "${nama}" tidak ditemukan di sheet ${day}.` }, { status: 404 });
    }

    if (rows[rowIndex][3] === 'Hadir') {
      return NextResponse.json({ success: false, message: 'Anda sudah melakukan presensi hari ini!' }, { status: 400 });
    }

    const excelRowNumber = rowIndex + 1;

    // 3. UPDATE ABSENSI (Masuk ke C, D, E)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${day}!C${excelRowNumber}:E${excelRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }), 'Hadir', divisi]],
      },
    });

    return NextResponse.json({ success: true, message: 'Kehadiran berhasil dicatat.' });
  } catch (error) {
    console.error('Spreadsheet Error:', error);
    return NextResponse.json({ success: false, message: 'Gagal mencatat kehadiran.' }, { status: 500 });
  }
}