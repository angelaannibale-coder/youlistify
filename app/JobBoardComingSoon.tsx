"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function JobBoardComingSoon() {
  const [mountNode, setMountNode] = useState<Element | null>(null);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const categoriesSection = document.querySelector("#categories");
    if (!categoriesSection?.parentElement) return;
    const node = document.createElement("div");
    node.id = "youlistify-find-or-post";
    categoriesSection.insertAdjacentElement("afterend", node);
    setMountNode(node);
    return () => node.remove();
  }, []);

  if (!mountNode) return null;

  return createPortal(
    <section className="yl-work-zone">
      <div className="yl-work-zone-inner">
        <div className="yl-work-zone-copy">
          <span className="yl-work-kicker">JOBS · GIGS · TASKS</span>
          <h2>Can’t find exactly what you need? Post it.</h2>
          <p>Whether it’s an ongoing job, freelance gig or one-time task, tell people what you need and let the right person respond.</p>
          <div className="yl-work-offer">
            <strong>🎉 Post FREE for your first 3 months</strong>
            <span>Then one simple yearly fee for unlimited posts.</span>
          </div>
          <div className="yl-work-actions">
            <a className="yl-work-primary" href="/post-work">Post FREE</a>
            <a className="yl-work-secondary" href="/work">Browse Jobs, Gigs & Tasks</a>
          </div>
        </div>
        <div className="yl-work-types" aria-label="Types of work posts">
          <article><span>JOB</span><strong>Ongoing work</strong><p>Full-time, part-time or recurring opportunities.</p></article>
          <article><span>GIG</span><strong>Freelance & contract</strong><p>Projects, temporary work and flexible opportunities.</p></article>
          <article><span>TASK</span><strong>One-time help</strong><p>Something specific you need done now or soon.</p></article>
        </div>
      </div>
    </section>,
    mountNode
  );
}
