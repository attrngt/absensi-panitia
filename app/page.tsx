"use client";
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Select from "react-select";

interface AbsenFormData {
  nama: string;
  day: string;
  divisi: string;
}

interface OptionType {
  value: string;
  label: string;
}

export default function Home() {
  const [formData, setFormData] = useState<AbsenFormData>({
    nama: "",
    day: "Day 1",
    divisi: "mentor",
  });
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [daftarPanitia, setDaftarPanitia] = useState<OptionType[]>([]);
  const [isLoadingNames, setIsLoadingNames] = useState<boolean>(true);

  // Menggunakan 'any' untuk menghindari konflik tipe bawaan react-select
  const [selectedName, setSelectedName] = useState<any>(null);

  const days: string[] = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"];
  const divisions: string[] = [
    "mentor",
    "task",
    "opras",
    "fundraise",
    "acara",
    "k3",
    "spv",
    "design",
    "produksi",
    "publikasi",
    "PI",
  ];

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const res = await fetch("/api/panitia");
        if (res.ok) {
          const data = await res.json();
          const options = data.names.map((name: string) => ({
            value: name,
            label: name,
          }));
          setDaftarPanitia(options);
        }
      } catch (error) {
        console.error("Gagal memuat nama panitia");
      } finally {
        setIsLoadingNames(false);
      }
    };

    fetchNames();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.nama) {
      setStatus("Mohon pilih nama panitia terlebih dahulu.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/absen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("Berhasil absen sebagai Hadir!");
        setFormData({ ...formData, nama: "" });
        setSelectedName(null);
      } else {
        const data = await res.json();
        setStatus(data.message || "Gagal absen. Silakan coba lagi.");
      }
    } catch (err) {
      setStatus("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (selectedOption: any) => {
    setSelectedName(selectedOption);
    setFormData((prev) => ({
      ...prev,
      nama: selectedOption ? selectedOption.value : "",
    }));
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Absensi Panitia
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <Select
              options={daftarPanitia}
              value={selectedName}
              onChange={handleNameChange}
              isLoading={isLoadingNames}
              isDisabled={isLoadingNames}
              placeholder={
                isLoadingNames
                  ? "Memuat dari Spreadsheet..."
                  : "Ketik atau pilih nama..."
              }
              isClearable
              className="text-gray-800"
              instanceId="nama-panitia-select"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Hari
            </label>
            <select
              name="day"
              value={formData.day}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Divisi
            </label>
            <select
              name="divisi"
              value={formData.divisi}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white capitalize"
            >
              {divisions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || isLoadingNames}
            className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Memproses..." : "Kirim Absensi"}
          </button>
        </form>

        {status && (
          <div
            className={`mt-4 p-3 rounded-lg text-center font-semibold ${status.includes("Berhasil") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {status}
          </div>
        )}
      </div>
    </main>
  );
}
