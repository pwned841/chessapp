import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    title: "ChessApp",
    description: "Created by @pwned841",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-black dark:text-white flex flex-col min-h-screen`}
        >
        {/* Navbar with padding */}
        <header className="px-8 pt-4">
            <Navbar />
        </header>

        {/* Main content that grows to fill the space */}
        <main className="flex-grow px-8">{children}</main>

        {/* Footer always at the bottom */}
        <footer className="mt-auto">
            <Footer />
        </footer>
        </body>
        </html>
    );
}
