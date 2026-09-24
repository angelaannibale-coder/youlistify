import type { Metadata } from "next";
import Script from "next/script";
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

const siteDescription = "YouListify helps people find and list local and remote service providers. Search by service and location, compare providers, and connect directly.";

export const metadata: Metadata = {
  title: "YouListify | Find the right person. Call them in minutes.",
  description: siteDescription,
  applicationName: "YouListify",
  metadataBase: new URL("https://youlistify.com"),
  keywords: [
    "local services",
    "remote services",
    "service providers",
    "list your service",
    "find service providers",
    "local professionals",
    "jobs",
    "gigs",
    "tasks"
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
    title: "YouListify | Find and list local and remote services",
    description: siteDescription,
    url: "https://youlistify.com",
    siteName: "YouListify",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "YouListify | Find and list local and remote services",
    description: siteDescription
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
      logo: "https://youlistify.com/path-sun-logo.svg",
      description: siteDescription,
      sameAs: [
        "https://www.facebook.com/YouListify"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://youlistify.com/#website",
      name: "YouListify",
      url: "https://youlistify.com",
      description: siteDescription,
      publisher: { "@id": "https://youlistify.com/#organization" },
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://youlistify.com/?service={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://youlistify.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is YouListify?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "YouListify helps people find and list local and remote service providers. Customers can search by service and location, then connect directly with providers."
          }
        },
        {
          "@type": "Question",
          name: "Can providers list remote services on YouListify?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Providers can list local services, remote services, or services that are both local and remote."
          }
        },
        {
          "@type": "Question",
          name: "Can providers create a free YouListify listing?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Providers can create a YouListify listing and start with a free introductory period. The listing can help customers find them and contact them directly."
          }
        },
        {
          "@type": "Question",
          name: "How do customers contact providers on YouListify?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Depending on what the provider chooses to display, customers can connect by call, text, email, or YouListify message."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({ children }: Readonly<{children:React.ReactNode}>) {
  return (
    <html lang="en">
      <body className="youlistify-brand-refresh">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0JTPD4HSQE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-0JTPD4HSQE');`}
        </Script>
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
