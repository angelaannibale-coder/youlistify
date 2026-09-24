import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How YouListify Works | Find and List Services",
  description: "See how YouListify works for customers searching for services and providers creating local or remote service listings.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How YouListify Works",
    description: "Search for services, compare providers, connect directly, or create your own service listing.",
    url: "/how-it-works",
    siteName: "YouListify",
    type: "website"
  }
};

const customerSteps = [
  ["1", "Search what you need", "Enter a service such as cleaner, handyman, pet care, tutor, remote assistant, beauty service, errands, or another type of help."],
  ["2", "Choose a location", "Search by city, ZIP code, or remote options so you can find local providers, remote providers, or both."],
  ["3", "Connect directly", "Open a listing and use the contact options the provider chose to display, such as call, text, email, or YouListify message."]
];

const providerSteps = [
  ["1", "Create your listing", "Add your name or business name, service details, location, remote options, photos, availability, and how customers can contact you."],
  ["2", "Control what shows", "Choose how your name appears and which contact options show publicly. Details you do not display stay private."],
  ["3", "Receive interest", "Customers can find your listing, view your services, and contact you directly or through YouListify depending on the options you select."]
];

function StepCards({ steps }: { steps: string[][] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
      {steps.map(([number, title, text]) => (
        <article key={title} style={{ background: "white", border: "1px solid #e7eaf0", borderRadius: 22, padding: 28, boxShadow: "0 12px 32px rgba(16,26,56,.05)" }}>
          <span style={{ display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: 14, background: "#f1edff", color: "#5b4df5", fontWeight: 900, marginBottom: 16 }}>{number}</span>
          <h3 style={{ margin: "0 0 10px", fontSize: 23 }}>{title}</h3>
          <p style={{ margin: 0, color: "#667085", lineHeight: 1.7 }}>{text}</p>
        </article>
      ))}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#fbfcff", color: "#101a38", fontFamily: 'Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <header style={{ height: 82, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 5.3vw", background: "white", borderBottom: "1px solid #eef0f5" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", color: "#101a38", fontSize: 22, fontWeight: 850 }}>
          <span style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 13, background: "#5b4df5", color: "white", fontWeight: 900 }}>Y</span>
          YouListify
        </a>
        <a href="/?returnTo=footer#site-footer" style={{ color: "#5b4df5", textDecoration: "none", fontWeight: 750 }}>Back to Home</a>
      </header>

      <section style={{ maxWidth: 980, margin: "0 auto", padding: "78px 22px 36px", textAlign: "center" }}>
        <div style={{ color: "#5b4df5", fontSize: 12, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase" }}>How It Works</div>
        <h1 style={{ fontSize: "clamp(40px,7vw,72px)", lineHeight: 1.03, letterSpacing: "-.045em", margin: "14px 0 20px" }}>Search, list, and connect directly.</h1>
        <p style={{ maxWidth: 760, margin: "0 auto", color: "#667085", fontSize: 19, lineHeight: 1.65 }}>
          YouListify is a service marketplace for people who need help and people who offer help. It supports local services, remote services, and providers who do both.
        </p>
      </section>

      <section style={{ maxWidth: 1050, margin: "0 auto", padding: "24px 22px 40px" }}>
        <div style={{ color: "#ff2f87", fontSize: 12, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>For customers</div>
        <h2 style={{ fontSize: "clamp(30px,4vw,46px)", letterSpacing: "-.035em", margin: "0 0 18px" }}>Find the right person faster.</h2>
        <StepCards steps={customerSteps} />
      </section>

      <section style={{ maxWidth: 1050, margin: "0 auto", padding: "30px 22px 80px" }}>
        <div style={{ color: "#ff2f87", fontSize: 12, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>For providers</div>
        <h2 style={{ fontSize: "clamp(30px,4vw,46px)", letterSpacing: "-.035em", margin: "0 0 18px" }}>Create a listing customers can find.</h2>
        <StepCards steps={providerSteps} />

        <div style={{ marginTop: 30, background: "#101a38", color: "white", borderRadius: 24, padding: 32 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 28 }}>Simple, direct connection</h2>
          <p style={{ margin: 0, color: "#d7dbea", lineHeight: 1.75, fontSize: 17 }}>
            YouListify does not replace your judgment or agreement with another person. It helps people discover listings, understand what is offered, and connect using the contact options available on each listing.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
          <a href="/" style={{ display: "inline-block", background: "#5b4df5", color: "white", padding: "14px 20px", borderRadius: 14, textDecoration: "none", fontWeight: 850 }}>Start searching</a>
          <a href="/list-service" style={{ display: "inline-block", background: "#ff2f87", color: "white", padding: "14px 20px", borderRadius: 14, textDecoration: "none", fontWeight: 850 }}>Create a listing</a>
          <a href="/about" style={{ display: "inline-block", background: "white", color: "#5b4df5", border: "1px solid #ddd6fe", padding: "14px 20px", borderRadius: 14, textDecoration: "none", fontWeight: 850 }}>About YouListify</a>
        </div>
      </section>
    </main>
  );
}
