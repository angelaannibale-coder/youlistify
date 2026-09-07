import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Account dashboard | YouListify",
  robots: { index: false, follow: false, noarchive: true }
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
