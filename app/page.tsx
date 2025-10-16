"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { QrRecord } from "@/types/QrRecord";

function QRCodePageInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const pathUrl = searchParams.get("pathUrl");

  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [path, setPath] = useState<string>("");
  const [copyLink, setcopyLink] = useState<string>("https://cmla.cc/s/...");
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [record, setRecord] = useState<QrRecord | null>(null);

  useEffect(() => {
    async function fetchQRCode() {
      if (!pathUrl) return;
      try {
        const res = await fetch(
          `/api/qrcode?pathUrl=${encodeURIComponent(pathUrl)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data: QrRecord | any = await res.json();

        if (!res.ok) {
          alert(data.error);
          return;
        }

        setRecord(data);
        setcopyLink(data.new);
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

      if (!res.ok) {
        throw "Issue Adding QR Code";
      }
      const data = await res.json();
      setRecord(data);
      console.log(data);
    } catch (err) {
      console.error("Error submitting form:", err);
      setLoading(false);
    }
    setLoading(false);
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(copyLink);
      setCopied(true);

      setTimeout(() => setCopied(false), 500);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handleCopyCode = async (svgString: string) => {
    try {
      await navigator.clipboard.writeText(svgString);
      console.log("SVG copied!");
    } catch (err) {
      console.error("Failed to copy SVG:", err);
    }
  };

  const handleSaveCode = (svgString: string, filename = "qrcode.svg") => {
    // Create a blob from the SVG string
    const blob = new Blob([svgString], { type: "image/svg+xml" });

    // Create an object URL
    const url = URL.createObjectURL(blob);

    // Create a hidden link element
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    // Trigger the download
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
    <div className="flex flex-col justify-center items-center min-h-screen w-screen">
      <h1 className="font-belanosima text-[96px] text-center">
        QR Code Generator
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-[50px]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center w-[560px] h-[575px] rounded-[20px] p-[25px]"
        >
          <label className="text-2xl font-semibold">Original URL</label>
          <input
            type="text"
            placeholder="www.google.com"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="form-field px-4 h-[60px] rounded-xl text-2xl mt-[5px]"
            required
          />

          <label className="text-2xl font-semibold mt-[27px]">
            Shortened URL Path (Alias)
          </label>

          <input
            type="text"
            placeholder="cookie"
            value={path}
            maxLength={26}
            onChange={(e) => {
              setPath(e.target.value);
              setcopyLink(`https://cmla.cc/s/${e.target.value}`);
            }}
            className="form-field px-4 h-[60px] rounded-xl text-2xl mt-[5px] mb-[30px]"
            required
          />

          <button
            type="submit"
            className="h-[80px] py-2 px-4 rounded-xl font-bold text-[32px] disabled:opacity-50 mb-[30px]"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate QR Code"}
          </button>

          <div className="flex justify-between items-center shortlink relative rounded-xl px-4 h-[60px] pr-4">
            <span id="copyText" className="text-2xl overflow-hidden">
              {copyLink}
            </span>
            <div className="relative cursor-pointer">
              <svg
                width="29"
                height="29"
                viewBox="0 0 29 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
                onClick={handleCopyText}
              >
                <path
                  d="M22.7161 7.14417H10.3255C8.56851 7.14417 7.14417 8.56851 7.14417 10.3255V22.7161C7.14417 24.4732 8.56851 25.8975 10.3255 25.8975H22.7161C24.4732 25.8975 25.8975 24.4732 25.8975 22.7161V10.3255C25.8975 8.56851 24.4732 7.14417 22.7161 7.14417Z"
                  stroke="#848484"
                  strokeWidth="1.78603"
                  strokeLinejoin="round"
                />
                <path
                  d="M21.4045 7.14416L21.4324 5.80464C21.4301 4.97641 21.1 4.18278 20.5144 3.59713C19.9287 3.01149 19.1351 2.68143 18.3069 2.67908H6.25114C5.30463 2.68187 4.39769 3.05911 3.7284 3.7284C3.05911 4.39769 2.68187 5.30463 2.67908 6.25114V18.3069C2.68143 19.1351 3.01149 19.9287 3.59713 20.5144C4.18278 21.1 4.97641 21.4301 5.80464 21.4324H7.14416"
                  stroke="#848484"
                  strokeWidth="1.78603"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {copied && (
                <span className="absolute bottom-[-34px] left-[14.5px] -translate-x-1/2 text-sm bg-white border text-black rounded px-2 py-1">
                  Copied
                </span>
              )}
            </div>
          </div>
        </form>

        <div className="flex flex-col justify-between h-[575px]">
          <div className="flex flex-col justify-center gap-y-[10px] w-[435px] h-[460px] rounded-[20px] qr-bg">
            {record && (
              <div className="w-[400px] h-[400px] mx-auto">
                <div dangerouslySetInnerHTML={{ __html: record.qr_code }} />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-[18px]">
            <button
              className="flex justify-between items-center px-[24px] h-[60px] rounded-xl"
              onClick={() =>
                record
                  ? handleCopyCode(record.qr_code)
                  : alert("Create QR code first")
              }
            >
              <p className="font-bold text-[24px]">Copy</p>
              <svg
                width="29"
                height="29"
                viewBox="0 0 29 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.716 7.14417H10.3254C8.56839 7.14417 7.14404 8.56851 7.14404 10.3255V22.7161C7.14404 24.4732 8.56839 25.8975 10.3254 25.8975H22.716C24.473 25.8975 25.8974 24.4732 25.8974 22.7161V10.3255C25.8974 8.56851 24.473 7.14417 22.716 7.14417Z"
                  stroke="var(--qr-bg)"
                  strokeWidth="1.78603"
                  strokeLinejoin="round"
                />
                <path
                  d="M21.4044 7.14416L21.4323 5.80464C21.43 4.97641 21.0999 4.18278 20.5142 3.59713C19.9286 3.01149 19.135 2.68143 18.3067 2.67908H6.25102C5.30451 2.68187 4.39757 3.05911 3.72828 3.7284C3.05899 4.39769 2.68175 5.30463 2.67896 6.25114V18.3069C2.68131 19.1351 3.01137 19.9287 3.59701 20.5144C4.18266 21.1 4.97629 21.4301 5.80451 21.4324H7.14404"
                  stroke="var(--qr-bg)"
                  strokeWidth="1.78603"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className="flex justify-between items-center px-[24px] h-[60px] rounded-xl"
              onClick={() =>
                record
                  ? handleSaveCode(
                      record.qr_code,
                      pathUrl
                        ? `qr-${String(pathUrl)
                            .split("/")
                            .join("-")
                            .replace(/[<>:"\/\\|?*]/g, "")}.svg`
                        : undefined
                    )
                  : alert("Create QR code first")
              }
            >
              <p className="font-bold text-[24px]">Save As</p>
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 11H23.5C24.163 11 24.7989 11.2634 25.2678 11.7322C25.7366 12.2011 26 12.837 26 13.5V26.5C26 27.163 25.7366 27.7989 25.2678 28.2678C24.7989 28.7366 24.163 29 23.5 29H8.5C7.83696 29 7.20107 28.7366 6.73223 28.2678C6.26339 27.7989 6 27.163 6 26.5V13.5C6 12.837 6.26339 12.2011 6.73223 11.7322C7.20107 11.2634 7.83696 11 8.5 11H11"
                  stroke="var(--qr-bg)"
                  strokeWidth="2.125"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 17L16 22L21 17M16 3V21"
                  stroke="var(--qr-bg)"
                  strokeWidth="2.125"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
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
