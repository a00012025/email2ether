"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Inter, Lato, Roboto } from "next/font/google";
import "./globals.css";

const queryClient = new QueryClient();

const inter = Inter({
  weight: ["100", "200", "400", "500", "600", "700", "800", "900"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex flex-1 min-h-screen  flex-col items-center ">
          <div
            style={{
              width: 800,
            }}
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
