import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/shared/components/Layout/Layout";
import { ReduxProvider } from "../store/Provider"; // Import the new Provider component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "shopify-storefront | Place for all trendy wears",
  description: "Place for all trendy wears",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider> 
          <Layout>{children}</Layout>
        </ReduxProvider>
      </body>
    </html>
  );
}
