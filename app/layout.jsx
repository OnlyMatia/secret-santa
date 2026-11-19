import { Geist, Geist_Mono } from "next/font/google";
import AppShell from "./components/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Secret Santa",
  description: "Jednostavna Secret Santa aplikacija za grupu",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="hr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col text-slate-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}