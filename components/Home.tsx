"use client";

import { useEffect, useState } from "react";
import { UrlRecord } from "@/types/UrlRecord";

type Props = {
  result?: UrlRecord;
};

export default function Home({ result }: Props) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<UrlRecord | null>(null);

  useEffect(() => {
    if (result) {
      setRecord(result);
    }
  }, [result]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/qrcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalUrl, path }),
    });

    const data = await res.json();
    if (data) setRecord(data);
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-md border rounded-xl p-6 shadow-md"
      >
        <h1 className="text-xl font-bold">Test QR Code API</h1>

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
        </div>
      )}
    </div>
  );
}
