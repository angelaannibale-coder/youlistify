"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function JobBoardComingSoon() {
  const [mountNode, setMountNode] = useState<Element | null>(null);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const providerSection = document.querySelector("#providers");
    if (!providerSection?.parentElement) return;
    const node = document.createElement("div");
    node.id = "youlistify-find-or-post";
    providerSection.insertAdjacentElement("afterend", node);
    setMountNode(node);
    return () => node.remove();
  }, []);

  if (!mountNode) return null;

  return createPortal(
    <section className="yl-work-zone">
      <div className="yl-work-zone-inner yl-work-zone-single">
        <div className="yl-work-zone-copy">
          <span className="yl-work-kicker">JOBS · GIGS · TASKS</span>
          <h2>Post available work. Find people fast.</h2>
          <p>Need help with a job, gig, task, errand, project, or one-time job? Post it free so local or remote workers can respond.</p>
          <div className="yl-work-offer">
            <strong>🎉 Free to post</strong>
            <span>No fees to post jobs, gigs, or tasks. No credit card required.</span>
          </div>
          <div className="yl-work-actions">
            <a className="yl-work-primary" href="/post-work">Post Job · Gig · Task</a>
          </div>
          <a className="yl-work-small-link" href="/work">Looking for work? View open jobs, gigs & tasks.</a>
        </div>
      </div>
    </section>,
    mountNode
  );
}
