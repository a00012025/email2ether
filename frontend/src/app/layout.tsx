"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex flex-1 min-h-screen  flex-col items-center justify-between p-24">
          <div
            style={{ width: 400, height: 300 }}
            className="bg-offwhite rounded-xl p-6"
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
