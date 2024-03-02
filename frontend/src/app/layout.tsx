"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Inter } from "next/font/google";
import Image from "next/image";
import logo from "../../public/logo.png";
import "./globals.css";

const queryClient = new QueryClient();

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
          <div className="flex mb-4 rounded-2xl  my-a p-2 bg-[#1D4ED8] mt-20">
            <Image src={logo} alt="logo" width={100} height={100} />
          </div>
          <div
            style={{
              width: 800,
              //minHeight: 300,
              //backgroundColor: "rgba(255, 255, 255, 0.8)",
            }}
            // className=" rounded-xl p-6 shadow-lg"
          >
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </div>
        </main>
      </body>
    </html>
  );
}
