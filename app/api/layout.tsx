import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "SMSBower Personal Client",
  description: "Personal SMSBower API dashboard"
};
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#eafff7" };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="id"><body>{children}</body></html>;
}