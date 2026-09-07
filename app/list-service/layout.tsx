import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "List Your Service | YouListify",
  description: "Create a YouListify service listing so nearby and remote customers can find and contact you directly.",
  alternates: { canonical: "/list-service" },
  openGraph: {
    title: "List Your Service | YouListify",
    description: "Create a YouListify service listing so nearby and remote customers can find and contact you directly.",
    url: "/list-service",
    siteName: "YouListify",
    type: "website"
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
