import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Jobs, Gigs & Tasks | YouListify",
  description: "Browse local and remote jobs, gigs, and tasks posted on YouListify.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: "Jobs, Gigs & Tasks | YouListify",
    description: "Browse local and remote jobs, gigs, and tasks posted on YouListify.",
    url: "/work",
    siteName: "YouListify",
    type: "website"
  }
};

export default function WorkLayout({ children }: { children: ReactNode }) {
  return children;
}
