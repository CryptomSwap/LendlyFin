import type { Metadata } from "next";
import { Heebo, Assistant } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-heebo",
});

const assistant = Assistant({
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "600"],
  variable: "--font-assistant",
});

export const metadata: Metadata = {
  title: "Lendly",
  description: "Lendly Frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.variable} ${assistant.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
