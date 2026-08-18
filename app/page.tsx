"use client";
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Select from "react-select";
import Link from "next/link";

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

  const [selectedName, setSelectedName] = useState<any>(null);

  const days: string[] = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"];
  const divisions: string[] = [
    "mentor",
    "task",
    "opras",
    "fundraise",
    "acara",
    "k3",
    "supervisor",
    "design",
    "produksi",
    "HumPub",
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

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? "#b8860b" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #b8860b" : "none",
      "&:hover": {
        borderColor: "#b8860b",
      },
      padding: "2px",
      borderRadius: "0.5rem",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#711c27"
        : state.isFocused
          ? "#fdf1d6"
          : "white",
      color: state.isSelected ? "white" : "#3e1619",
      cursor: "pointer",
    }),
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#3b0918] via-[#21040b] to-[#120105] flex items-center justify-center p-4 md:p-6 font-sans">
      <div className="bg-[#fcf8ed] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-lg border-4 border-[#c59c53] relative overflow-hidden">
        <div className="w-full bg-[#120105] border-b-4 border-[#c59c53]">
          <img
            src="/image.png"
            alt="Prorientation 2026 Header"
            className="w-full h-auto object-cover max-h-48"
          />
        </div>

        <div className="p-6 sm:p-8">
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#5c1a26] mb-6 text-center tracking-wide uppercase"
            style={{ textShadow: "1px 1px 2px rgba(197, 156, 83, 0.3)" }}
          >
            Presensi Panitia
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#5c1a26] mb-1">
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
                    ? "Menggulung tirai nama..."
                    : "Ketik atau pilih nama..."
                }
                isClearable
                styles={customSelectStyles}
                instanceId="nama-panitia-select"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#5c1a26] mb-1">
                  Hari
                </label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c59c53] focus:border-[#c59c53] outline-none bg-white text-[#3e1619] font-medium"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#5c1a26] mb-1">
                  Divisi
                </label>
                <select
                  name="divisi"
                  value={formData.divisi}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c59c53] focus:border-[#c59c53] outline-none bg-white capitalize text-[#3e1619] font-medium"
                >
                  {divisions.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLoadingNames}
              className="w-full mt-4 bg-gradient-to-r from-[#8c1c2b] to-[#5c1a26] text-[#f7e5b4] font-bold py-3.5 rounded-lg hover:from-[#5c1a26] hover:to-[#3b0918] transition-all duration-300 shadow-md border border-[#c59c53] uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Kirim Absensi"}
            </button>
          </form>

          {status && (
            <div
              className={`mt-5 p-3.5 rounded-lg text-center font-bold border ${status.includes("Berhasil") ? "bg-[#e6f4ea] text-[#1e4620] border-[#a8d0b2]" : "bg-[#fce8e6] text-[#a50e0e] border-[#f0b4b4]"}`}
            >
              {status}
            </div>
          )}

          {/* Ini bagian tambahannya: Link ke halaman rapat */}
          <div className="mt-6 text-center">
            <Link
              href="/rapat"
              className="text-[#c59c53] hover:text-[#8c1c2b] font-semibold text-sm underline transition-colors"
            >
              Pindah ke Presensi Rapat
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
