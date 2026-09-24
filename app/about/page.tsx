import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About YouListify | Local and Remote Service Marketplace",
  description: "Learn what YouListify is, who it helps, and how it connects customers with local and remote service providers.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About YouListify",
    description: "YouListify helps people find and list local and remote service providers.",
    url: "/about",
    siteName: "YouListify",
    type: "website"
  }
};

export default function AboutPage() {
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
        <div style={{ color: "#5b4df5", fontSize: 12, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase" }}>About YouListify</div>
        <h1 style={{ fontSize: "clamp(40px,7vw,72px)", lineHeight: 1.03, letterSpacing: "-.045em", margin: "14px 0 20px" }}>Find help. Offer help. Get connected.</h1>
        <p style={{ maxWidth: 760, margin: "0 auto", color: "#667085", fontSize: 19, lineHeight: 1.65 }}>
          YouListify helps people find and list local and remote service providers. Customers can search by service and location, compare options, and connect directly with providers who are ready to work.
        </p>
      </section>

      <section style={{ maxWidth: 1050, margin: "0 auto", padding: "24px 22px 86px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
          <article style={{ background: "white", border: "1px solid #e7eaf0", borderRadius: 22, padding: 28, boxShadow: "0 12px 32px rgba(16,26,56,.05)" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 24 }}>For customers</h2>
            <p style={{ margin: 0, color: "#667085", lineHeight: 1.7 }}>
              Search for services such as cleaning, repairs, pet care, lessons, beauty, errands, tech help, remote assistance, and more. You can connect without filling out long quote forms.
            </p>
          </article>
          <article style={{ background: "white", border: "1px solid #e7eaf0", borderRadius: 22, padding: 28, boxShadow: "0 12px 32px rgba(16,26,56,.05)" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 24 }}>For providers</h2>
            <p style={{ margin: 0, color: "#667085", lineHeight: 1.7 }}>
              Create a YouListify listing so customers can find your service. You can show what you offer, where you work, how people can contact you, and whether you provide local, remote, or both types of service.
            </p>
          </article>
          <article style={{ background: "white", border: "1px solid #e7eaf0", borderRadius: 22, padding: 28, boxShadow: "0 12px 32px rgba(16,26,56,.05)" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 24 }}>Local and remote</h2>
            <p style={{ margin: 0, color: "#667085", lineHeight: 1.7 }}>
              Some services happen in person. Some happen online or by phone. Some can be both. YouListify is built to support local services, remote services, and providers who offer both.
            </p>
          </article>
        </div>

        <div style={{ marginTop: 26, background: "#101a38", color: "white", borderRadius: 24, padding: 32 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 28 }}>Why YouListify exists</h2>
          <p style={{ margin: 0, color: "#d7dbea", lineHeight: 1.75, fontSize: 17 }}>
            Many people need simple, direct ways to find service providers. Many providers need a clear place to list what they do without paying commissions or relying only on word of mouth. YouListify brings those needs together in one searchable marketplace.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
          <a href="/" style={{ display: "inline-block", background: "#5b4df5", color: "white", padding: "14px 20px", borderRadius: 14, textDecoration: "none", fontWeight: 850 }}>Search services</a>
          <a href="/list-service" style={{ display: "inline-block", background: "#ff2f87", color: "white", padding: "14px 20px", borderRadius: 14, textDecoration: "none", fontWeight: 850 }}>List your service</a>
          <a href="/how-it-works" style={{ display: "inline-block", background: "white", color: "#5b4df5", border: "1px solid #ddd6fe", padding: "14px 20px", borderRadius: 14, textDecoration: "none", fontWeight: 850 }}>How it works</a>
        </div>
      </section>
    </main>
  );
}
