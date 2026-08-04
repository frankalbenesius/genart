import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Genart Playground",
  description:
    "A small, readable JavaScript playground for learning generative art with noise.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
