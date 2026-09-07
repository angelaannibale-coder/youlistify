import type { Metadata } from "next";
import "./globals.css";
import "./categories-polish.css";
import "./home-card-tilt.css";
import "./mobile-header-polish.css";
import "./modal-stability.css";
import "./brand-refresh.css";
import LaunchPolish from "./LaunchPolish";
import FoundingProviderOffer from "./FoundingProviderOffer";
import HomepageProviderPriority from "./HomepageProviderPriority";
import ProviderAccountLinker from "./ProviderAccountLinker";
import ProviderSignupPolish from "./ProviderSignupPolish";
import ContactModalCleanup from "./ContactModalCleanup";
import JobBoardComingSoon from "./JobBoardComingSoon";
import SearchVocabularyBridge from "./SearchVocabularyBridge";
import ProviderNotificationBridge from "./ProviderNotificationBridge";
import ReviewDisplayCleanup from "./ReviewDisplayCleanup";
import ProviderAccountSignOutBridge from "./ProviderAccountSignOutBridge";
import HomepageWorkNavBridge from "./HomepageWorkNavBridge";

export const metadata: Metadata = {
  title: "YouListify | Find the right person. Call them in minutes.",
  description: "Find local professionals ready to work. Search by service and location, compare providers, and connect directly.",
  applicationName: "YouListify",
  metadataBase: new URL("https://youlistify.com"),
  keywords: [
    "local services",
    "service providers",
    "local professionals",
    "jobs",
    "gigs",
    "tasks",
    "remote services"
  ],
  creator: "YouListify",
  publisher: "YouListify",
  category: "services marketplace",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  icons: {
    icon: "/path-sun-logo.svg",
    shortcut: "/path-sun-logo.svg"
  },
  openGraph: {
    title: "YouListify | Find the right person",
    description: "Search local and remote services, see who is available, and connect directly.",
    url: "https://youlistify.com",
    siteName: "YouListify",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "YouListify | Find the right person",
    description: "Search local and remote services, see who is available, and connect directly."
  },
  robots: { index: true, follow: true }
};

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://youlistify.com/#organization",
      name: "YouListify",
      url: "https://youlistify.com",
      logo: "https://youlistify.com/path-sun-logo.svg"
    },
    {
      "@type": "WebSite",
      "@id": "https://youlistify.com/#website",
      name: "YouListify",
      url: "https://youlistify.com",
      description: "Find local and remote service providers and connect directly.",
      publisher: { "@id": "https://youlistify.com/#organization" },
      inLanguage: "en-US"
    }
  ]
};

export default function RootLayout({ children }: Readonly<{children:React.ReactNode}>) {
  return (
    <html lang="en">
      <body className="youlistify-brand-refresh">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteStructuredData).replace(/</g, "\\u003c") }}
        />
        {children}
        <ContactModalCleanup />
        <ProviderAccountLinker />
        <ProviderSignupPolish />
        <FoundingProviderOffer />
        <LaunchPolish />
        <HomepageProviderPriority />
        <JobBoardComingSoon />
        <HomepageWorkNavBridge />
        <SearchVocabularyBridge />
        <ProviderNotificationBridge />
        <ReviewDisplayCleanup />
        <ProviderAccountSignOutBridge />
      </body>
    </html>
  );
}
