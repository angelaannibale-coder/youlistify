"use client";

import { useEffect, useState } from "react";

export default function LegalReturnLink() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(new URLSearchParams(window.location.search).get("from") === "create-listing");
  }, []);

  if (!visible) return null;

  function returnToListing() {
    if (window.opener) {
      window.close();
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = "/list-service";
  }

  return (
    <button
      type="button"
      onClick={returnToListing}
      style={{border:0,background:"transparent",color:"#5b4df5",fontWeight:800,fontSize:15,cursor:"pointer",padding:"10px 0"}}
    >
      ← Back to Create Listing
    </button>
  );
}
