import type { Metadata } from "next";
import "./globals.css";
import "./categories-polish.css";

export const metadata: Metadata = {
  title: "YouListify | Find the right person. Call them in minutes.",
  description: "Find local professionals ready to work. Search by service and location, compare providers, and connect directly.",
  metadataBase: new URL("https://youlistify.com"),
  openGraph: {
    title: "YouListify",
    description: "Find the right person. Call them in minutes. Get the job done.",
    url: "https://youlistify.com",
    siteName: "YouListify",
    type: "website"
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{children:React.ReactNode}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <div style={{ textAlign: "center", padding: "18px 20px 26px", background: "#fff", borderTop: "1px solid #eef0f5" }}>
          <a href="/safety" style={{ color: "#5b4df5", fontWeight: 800, textDecoration: "none", fontSize: "16px" }}>
            Safety &amp; Resources
          </a>
        </div>
      </body>
    </html>
  );
}
