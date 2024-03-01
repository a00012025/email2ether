"use client";
import { Inter } from "next/font/google";
import Image from "next/image";
import logo from "../../public/logo.png";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex flex-1 min-h-screen  flex-col items-center ">
          <div className="flex mb-4 rounded-2xl  my-a p-2">
            <Image src={logo} alt="logo" width={100} height={100} />
          </div>
          <div
            style={{
              width: 600,
              minHeight: 400,
              backgroundColor: "rgba(255, 255, 255, 0.5)",
            }}
            className=" rounded-xl p-6 shadow-lg"
          >
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
