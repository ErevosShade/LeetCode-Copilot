chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "AI_SUMMARY") {
    // Mock AI — replace this with real API later
    const text = msg.text || "";
    const summary =
      "AI Summary (mock): " +
      text.slice(0, 150) +
      (text.length > 150 ? "..." : "");

    sendResponse({ ok: true, summary });
  }
  return true;
});
