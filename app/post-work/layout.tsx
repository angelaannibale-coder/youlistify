import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Post a Job, Gig or Task | YouListify",
  description: "Post a job, gig, or task on YouListify and connect with people ready to help.",
  alternates: { canonical: "/post-work" },
  openGraph: {
    title: "Post a Job, Gig or Task | YouListify",
    description: "Post a job, gig, or task on YouListify and connect with people ready to help.",
    url: "/post-work",
    siteName: "YouListify",
    type: "website"
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
