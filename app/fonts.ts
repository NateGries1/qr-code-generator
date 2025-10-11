import localFont from "next/font/local";

export const lato = localFont({
  src: [
    { path: "/fonts/Lato-Thin.woff2", weight: "100", style: "normal" },
    { path: "/fonts/Lato-ThinItalic.woff2", weight: "100", style: "italic" },
    { path: "/fonts/Lato-Light.woff2", weight: "300", style: "normal" },
    { path: "/fonts/Lato-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "/fonts/Lato-Regular.woff2", weight: "400", style: "normal" },
    { path: "/fonts/Lato-Italic.woff2", weight: "400", style: "italic" },
    { path: "/fonts/Lato-Medium.woff2", weight: "500", style: "normal" },
    { path: "/fonts/Lato-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "/fonts/Lato-Semibold.woff2", weight: "600", style: "normal" },
    {
      path: "/fonts/Lato-SemiboldItalic.woff2",
      weight: "600",
      style: "italic",
    },
    { path: "/fonts/Lato-Bold.woff2", weight: "700", style: "normal" },
    { path: "/fonts/Lato-BoldItalic.woff2", weight: "700", style: "italic" },
    { path: "/fonts/Lato-Heavy.woff2", weight: "800", style: "normal" },
    { path: "/fonts/Lato-HeavyItalic.woff2", weight: "800", style: "italic" },
    { path: "/fonts/Lato-Black.woff2", weight: "900", style: "normal" },
    { path: "/fonts/Lato-BlackItalic.woff2", weight: "900", style: "italic" },
  ],
  variable: "--font-lato",
});
