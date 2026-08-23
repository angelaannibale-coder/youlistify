import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety & Resources | YouListify",
  description:
    "Practical safety tips and resources for customers and service providers using YouListify.",
};

const tips = [
  {
    icon: "🤝",
    title: "Meet safely",
    text: "For a first meeting, use a public or well-lit location when practical. Tell someone where you are going, keep your phone available, and trust your judgment if something does not feel right.",
  },
  {
    icon: "✓",
    title: "Verify credentials",
    text: "When a job requires a license, permit, certification, insurance, or specialized training, ask the provider for current documentation and verify it with the appropriate state or local authority.",
  },
  {
    icon: "🔎",
    title: "Check before you hire",
    text: "Review the provider's profile, references, online presence, and relevant public records. If you want additional screening, you may choose an independent background-check service appropriate for your needs and permitted by law.",
  },
  {
    icon: "💳",
    title: "Protect your payments",
    text: "Agree on the scope, price, and payment terms before work begins. Be cautious with large upfront payments, gift cards, wire transfers, cryptocurrency, or requests to move payment outside the arrangement you agreed to.",
  },
  {
    icon: "📝",
    title: "Keep the details",
    text: "For larger jobs, keep written estimates, messages, receipts, photos, and any agreed changes. Clear records help both customers and providers avoid misunderstandings.",
  },
  {
    icon: "⚑",
    title: "Report concerns",
    text: "If a listing appears misleading, unsafe, fraudulent, or inappropriate, stop communication and report the concern to YouListify. For an immediate threat or emergency, contact local emergency services.",
  },
];

export default function SafetyPage() {
  return (
    <main className="safety-page">
      <style>{`
        .safety-page{min-height:100vh;background:#fbfcff;color:#101a38;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .safety-topbar{height:82px;display:flex;align-items:center;justify-content:space-between;padding:0 5.3vw;background:#fff;border-bottom:1px solid #eef0f5}
        .safety-brand{display:flex;align-items:center;gap:11px;text-decoration:none;color:#101a38;font-size:22px;font-weight:850}
        .safety-logo{display:grid;place-items:center;width:40px;height:40px;border-radius:13px;background:#5b4df5;color:white;font-weight:900}
        .safety-home{color:#5b4df5;text-decoration:none;font-weight:750}
        .safety-hero{padding:78px 5.3vw 48px;text-align:center;background:linear-gradient(180deg,#f5f3ff 0%,#fbfcff 100%)}
        .safety-kicker{display:inline-block;color:#5b4df5;font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;margin-bottom:15px}
        .safety-hero h1{font-size:clamp(38px,6vw,68px);line-height:1.02;letter-spacing:-.04em;margin:0 auto 18px;max-width:850px}
        .safety-hero p{max-width:720px;margin:0 auto;color:#667085;font-size:18px;line-height:1.65}
        .safety-wrap{max-width:1120px;margin:0 auto;padding:52px 24px 80px}
        .safety-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
        .safety-card{background:#fff;border:1px solid #e7eaf0;border-radius:22px;padding:28px;box-shadow:0 12px 32px rgba(16,26,56,.05)}
        .safety-icon{font-size:28px;margin-bottom:14px}
        .safety-card h2{font-size:21px;margin:0 0 10px}
        .safety-card p{margin:0;color:#667085;line-height:1.65}
        .safety-note{margin-top:28px;background:#101a38;color:#fff;border-radius:24px;padding:30px}
        .safety-note h2{margin:0 0 10px;font-size:24px}
        .safety-note p{margin:0;color:#d7dbea;line-height:1.7}
        .safety-disclaimer{margin-top:24px;padding:24px;border-radius:20px;background:#f6f7fb;border:1px solid #e7eaf0;color:#667085;line-height:1.7;font-size:14px}
        .safety-back{display:inline-flex;margin-top:28px;padding:13px 20px;border-radius:14px;background:#5b4df5;color:#fff;text-decoration:none;font-weight:800}
        @media(max-width:760px){.safety-grid{grid-template-columns:1fr}.safety-topbar{padding:0 20px}.safety-hero{padding:56px 20px 38px}.safety-wrap{padding:36px 18px 60px}}
      `}</style>

      <header className="safety-topbar">
        <a className="safety-brand" href="/" aria-label="YouListify home">
          <span className="safety-logo">Y</span>
          <span>YouListify</span>
        </a>
        <a className="safety-home" href="/">Back to home</a>
      </header>

      <section className="safety-hero">
        <span className="safety-kicker">Safety & Resources</span>
        <h1>Connect with confidence.</h1>
        <p>
          YouListify makes it easy to find and contact people directly. A few simple checks can help customers and providers make safer, more informed decisions before meeting or starting a job.
        </p>
      </section>

      <section className="safety-wrap">
        <div className="safety-grid">
          {tips.map((tip) => (
            <article className="safety-card" key={tip.title}>
              <div className="safety-icon" aria-hidden="true">{tip.icon}</div>
              <h2>{tip.title}</h2>
              <p>{tip.text}</p>
            </article>
          ))}
        </div>

        <div className="safety-note">
          <h2>Use extra care for higher-risk work</h2>
          <p>
            Jobs involving children, vulnerable adults, access to a home, driving, financial information, valuable property, regulated trades, or other sensitive responsibilities may call for additional identity, reference, license, insurance, or background checks before you proceed.
          </p>
        </div>

        <div className="safety-disclaimer">
          <strong>About YouListify:</strong> YouListify is a marketplace that helps people discover and contact independent service providers. Providers are not employees of YouListify. Unless a listing specifically states otherwise, YouListify does not represent that a provider has been background checked, licensed, insured, certified, or otherwise independently verified. Customers and providers are responsible for deciding whether a particular engagement is appropriate for them.
        </div>

        <a className="safety-back" href="/">← Return to YouListify</a>
      </section>
    </main>
  );
}
