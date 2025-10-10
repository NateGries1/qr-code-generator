"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { UrlRecord } from "@/types/UrlRecord";

function QRCodePageInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const pathUrl = searchParams.get("pathUrl");

  const [originalUrl, setOriginalUrl] = useState("");
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<UrlRecord | null>(null);

  useEffect(() => {
    async function fetchQRCode() {
      if (!pathUrl) return;
      try {
        const res = await fetch("/api/qrcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: pathUrl }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setRecord(data);
      } catch (err) {
        console.error("Failed to fetch QR code:", err);
      }
    }
    fetchQRCode();
  }, [pathUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/qrcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl, path }),
      });
      const data = await res.json();
      setRecord(data);
    } catch (err) {
      console.error("Error submitting form:", err);
    }
    setLoading(false);
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
        <p className="text-red-500 font-medium bg-red-100 border border-red-300 rounded-lg px-4 py-2">
          No shortlink found for <strong>{pathUrl}</strong>. Click below to
          create it.
        </p>
        <Link href="/" className="text-blue-600 hover:underline font-medium">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-md border rounded-xl p-6 shadow-md"
      >
        <h1 className="text-xl font-bold">QR Code & Shortlink Generator</h1>

        <input
          type="text"
          placeholder="Original URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Shortened URL Path"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate QR Code"}
        </button>
      </form>

      {record && (
        <div className="mt-6 p-4 border rounded-lg bg-white shadow-sm">
          <div
            className="w-64 h-64"
            dangerouslySetInnerHTML={{ __html: record.qr_code }}
          />
          <p className="mt-2 text-center text-sm text-gray-600">
            <strong>{record.new}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default function QRCodePage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <QRCodePageInner />
    </Suspense>
  );
}
