import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Youlistify | Find the right person. Call them in minutes.",
  description:
    "Find local professionals who are ready to work. Browse services, check availability, and call the right person in minutes.",
  metadataBase: new URL("https://youlistify.com"),
  openGraph: {
    title: "Youlistify",
    description: "Find the right person. Call them in minutes. Get the job done.",
    url: "https://youlistify.com",
    siteName: "Youlistify",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Youlistify",
    description: "Find the right person. Call them in minutes. Get the job done."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
