import QRCode from "qrcode";
import fs from "fs";

const logoPath = "./public/logo.png";
const logoData = fs.readFileSync(logoPath);
const base64Logo = `data:image/png;base64,${logoData.toString("base64")}`;

export const generateQRCode = async (path: string) => {
  const newUrl = "https://cmla.cc/s/" + path;
  const svgString = await QRCode.toString(newUrl, {
    version: 5,
    type: "svg",
    width: 375,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });

  const viewBoxMatch = svgString.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const widthMatch = svgString.match(/width="([\d.]+)"/);
  const heightMatch = svgString.match(/height="([\d.]+)"/);

  const boxWidth = viewBoxMatch
    ? parseFloat(viewBoxMatch[1])
    : widthMatch
    ? parseFloat(widthMatch[1])
    : 256;
  const boxHeight = viewBoxMatch
    ? parseFloat(viewBoxMatch[2])
    : heightMatch
    ? parseFloat(heightMatch[1])
    : 256;

  const extendedHeight = boxHeight * (400 / 375); // proportional increase (~+6.7%)
  const extraSpace = extendedHeight - boxHeight;
  const xOffset =
    (viewBoxMatch
      ? parseFloat(viewBoxMatch[1])
      : widthMatch
      ? parseFloat(widthMatch[1])
      : 256) *
    (25 / 400);

  // logo placement remains the same
  const logoSize = boxWidth * 0.27;
  const logoX = (boxWidth - logoSize) / 2;
  const logoY = (boxHeight - logoSize) / 2;

  // Update the SVG opening tag
  let svg = svgString
    // Extend the viewBox height slightly
    .replace(
      /viewBox="0 0 ([\d.]+) ([\d.]+)"/,
      `viewBox="0 0 ${boxWidth} ${extendedHeight}"`
    )
    // Make sure the rendered height is 400, width is 375
    .replace(/width="[\d.]+"/, `width="400"`)
    .replace(/height="[\d.]+"/, `height="400"`);

  // Add white background to full area
  svg = svg.replace(
    /<svg([^>]+)>/,
    `<svg$1 preserveAspectRatio="xMidYMid meet">
   <rect width="100%" height="100%" fill="white"/>`
  );

  // Add logo + text
  const logo = `
  <rect 
    x="${logoX - 1}" 
    y="${logoY - 1}" 
    width="${logoSize + 2}" 
    height="${logoSize + 2}" 
    fill="white" 
  />
  <image
    href="${base64Logo}"
    x="${logoX}"
    y="${logoY}"
    width="${logoSize}"
    height="${logoSize}"
    preserveAspectRatio="xMidYMid meet"
  />
  <text
    x="50%"
    y="${boxHeight + extraSpace * 0.5}"
    text-anchor="middle"
    fill="black"
    font-size="${3}"
    font-family="Lato, Arial, sans-serif"
    font-weight="600"
  >
    cmla.cc/s/${path}
  </text>
`;

  const svgWithLogo = svg.replace("</svg>", `${logo}</svg>`);
  return svgWithLogo;
};
