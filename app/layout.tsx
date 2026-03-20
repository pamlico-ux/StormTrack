import type { Metadata } from "next";
import "./globals.css"; // Global styles
import { CastProvider } from "@/components/CastContext";

export const metadata: Metadata = {
  title: "SBC Cast Hub",
  description:
    "Touch-friendly dashboard for a multi-platform SBC casting solution supporting AirPlay, Google Cast, and Miracast.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className="bg-zinc-950 text-zinc-50 antialiased overflow-hidden"
        suppressHydrationWarning
      >
        <CastProvider>{children}</CastProvider>
      </body>
    </html>
  );
}
