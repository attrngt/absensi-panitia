"use client";
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Select from "react-select";
import Link from "next/link";

interface RapatFormData {
  nama: string;
  divisi: string;
  sesiRapat: string;
  token: string;
}

export default function Rapat() {
  const [formData, setFormData] = useState<RapatFormData>({
    nama: "",
    divisi: "mentor",
    sesiRapat: "",
    token: "",
  });
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [daftarPanitia, setDaftarPanitia] = useState<any[]>([]);
  const [isLoadingNames, setIsLoadingNames] = useState<boolean>(true);
  const [selectedName, setSelectedName] = useState<any>(null);
  const divisions = [
    "Mentor",
    "Task",
    "Opras",
    "Fundraising",
    "Acara",
    "K3",
    "Supervisor",
    "Design",
    "produksi",
    "HumPub",
    "PI",
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlSesi = params.get("sesi");
      const urlToken = params.get("token");
      const savedNama = localStorage.getItem("pror26_nama");
      const savedDivisi = localStorage.getItem("pror26_divisi");

      setFormData((prev) => ({
        ...prev,
        sesiRapat: urlSesi || prev.sesiRapat,
        token: urlToken || prev.token,
        nama: savedNama || prev.nama,
        divisi: savedDivisi || prev.divisi,
      }));

      if (savedNama) {
        setSelectedName({ value: savedNama, label: savedNama });
      }
    }

    const fetchNames = async () => {
      try {
        const res = await fetch("/api/panitia");
        if (res.ok) {
          const data = await res.json();
          setDaftarPanitia(
            data.names.map((n: string) => ({ value: n, label: n })),
          );
        }
      } catch (error) {
        console.error("Gagal mengambil nama");
      } finally {
        setIsLoadingNames(false);
      }
    };
    fetchNames();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.nama || !formData.sesiRapat || !formData.token) {
      setStatus("Mohon lengkapi data dan token.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/absen-rapat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("Berhasil! Kehadiran rapat telah tercatat.");
        if (typeof window !== "undefined") {
          localStorage.setItem("pror26_nama", formData.nama);
          localStorage.setItem("pror26_divisi", formData.divisi);
        }
      } else {
        setStatus(data.message || "Gagal absen.");
      }
    } catch (err) {
      setStatus("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
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
      "&:hover": { borderColor: "#b8860b" },
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/image.png"
            alt="Header"
            className="w-full h-auto object-cover max-h-48"
          />
        </div>
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold text-[#5c1a26] mb-2 text-center tracking-wide uppercase">
            Presensi Rapat
          </h1>
          <p className="text-center text-[#8c1c2b] mb-6 text-sm">
            Prorientation 2026
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#5c1a26] mb-1">
                  Token Rapat
                </label>
                <input
                  type="text"
                  name="token"
                  required
                  value={formData.token}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#c59c53] bg-yellow-50 rounded-lg text-center font-bold tracking-widest outline-none text-[#8c1c2b]"
                  placeholder="Token"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#5c1a26] mb-1">
                  Sesi / Tanggal
                </label>
                <input
                  type="text"
                  name="sesiRapat"
                  required
                  value={formData.sesiRapat}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-[#3e1619] font-medium"
                  placeholder="Cth: 18 Agustus"
                />
              </div>
            </div>

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
                placeholder="Cari nama..."
                isClearable
                styles={customSelectStyles}
                instanceId="nama-panitia-select"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#5c1a26] mb-1">
                Divisi
              </label>
              <select
                name="divisi"
                value={formData.divisi}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none text-[#3e1619] font-medium capitalize"
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
              className="w-full mt-4 bg-gradient-to-r from-[#8c1c2b] to-[#5c1a26] text-[#f7e5b4] font-bold py-3.5 rounded-lg hover:from-[#5c1a26] hover:to-[#3b0918] transition-all shadow-md border border-[#c59c53] uppercase disabled:opacity-70"
            >
              {loading ? "Memvalidasi..." : "Hadir Rapat"}
            </button>
          </form>

          {status && (
            <div
              className={`mt-5 p-3.5 rounded-lg text-center font-bold border ${status.includes("Berhasil") ? "bg-[#e6f4ea] text-[#1e4620] border-[#a8d0b2]" : "bg-[#fce8e6] text-[#a50e0e] border-[#f0b4b4]"}`}
            >
              {status}
            </div>
          )}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-[#c59c53] hover:text-[#8c1c2b] font-semibold text-sm underline transition-colors"
            >
              Kembali ke Presensi Harian
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
