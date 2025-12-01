chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "AI_SUMMARY") {
    // Mock AI — replace this with real API later
    const text = msg.text || "";

    chrome.storage.sync.get(["gemini_key"], async ({ gemini_key }) => {
      if (!gemini_key) {
        sendResponse({
          ok: false,
          summary: "❗ No API key set. Go to extension Options to add your Gemini key."
        });
        return;
      }


    try {

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${gemini_key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `Summarize this LeetCode problem:\n${text}` }] }]
            })
          }
        );

        const data = await response.json();
        const summary =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No summary returned.";

        sendResponse({ ok: true, summary });
      } catch (err) {
        sendResponse({ ok: false, summary: "Error: " + err.message });
      }
    });

    return true; // Keep async
  }
});
