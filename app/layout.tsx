import type { Metadata } from "next";
import "./globals.css";
import "./categories-polish.css";
import "./home-card-tilt.css";
import "./mobile-header-polish.css";
import SafetyFooterLink from "./SafetyFooterLink";
import LaunchPolish from "./LaunchPolish";
import FoundingProviderOffer from "./FoundingProviderOffer";
import HomepageProviderPriority from "./HomepageProviderPriority";
import ProviderAccountLinker from "./ProviderAccountLinker";
import ProviderSignupPolish from "./ProviderSignupPolish";

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
        <ProviderAccountLinker />
        <ProviderSignupPolish />
        <FoundingProviderOffer />
        <LaunchPolish />
        <HomepageProviderPriority />
        <SafetyFooterLink />
      </body>
    </html>
  );
}
