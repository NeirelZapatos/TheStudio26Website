import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header2 from "./Components/Header2";
import Footer2 from "./Components/Footer2";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "The Studio 26",
  description: "The Studio 26 Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <Header2 />

          <main className="flex-grow p-4">{children}</main>
          <Footer2 />
        </div>
      </body>
    </html>
  );
}
