chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("MSG:", msg?.type);

  const text = msg.text || "";

  chrome.storage.sync.get(["gemini_key"], async ({ gemini_key }) => {
    if (!gemini_key) {
      sendResponse({
        ok: false,
        summary: "❗ No API key set. Go to extension Options to add your Gemini key."
      });
      return;
    }

    async function callGeminiAPI(prompt, retry = false) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${gemini_key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );

        const data = await response.json();
        console.log("Gemini raw:", data);

        if (data?.error?.code === 503) {
          console.warn("Model overloaded (503). Retry:", retry);

          // Retry only once
          if (!retry) {
            await new Promise(res => setTimeout(res, 300)); // wait 0.3 sec
            return await callGeminiAPI(prompt, true);
          }

          return {
            ok: false,
            text: "🚨 Gemini is overloaded right now.\nPlease try again in a moment."
          };
        }
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidate) return { ok: true, text: candidate };

        return {
          ok: false,
          text: "No summary returned.\n\n" + JSON.stringify(data, null, 2)
        };

      } catch (err) {
        console.error("Fetch error:", err);
        return { ok: false, text: "Error: " + err.message };
      }
    }

    (async () => {
      // rphrase      
      if (msg.type === "REPHRASE") {
        const prompt = `
Rephrase the following LeetCode problem in simple, beginner-friendly English in 2 sentences.
Do NOT include approach, steps, complexity, or edge cases.

Problem:
${text}
`;
        const result = await callGeminiAPI(prompt);
        sendResponse({ ok: result.ok, summary: result.text });
        return;
      }

      // -----------------------
      // CONSTRAINTS
      // -----------------------
      if (msg.type === "CONSTRAINTS") {
        const prompt = `
Extract ONLY the constraints from this LeetCode problem.
Return short bullet points, no extra wording.

Problem:
${text}
`;
        const result = await callGeminiAPI(prompt);
        sendResponse({ ok: result.ok, summary: result.text });
        return;
      }
      // Edgecases
      if (msg.type === "EDGECASES") {
        const prompt = `
List exactly 4 relevant edge cases for this LeetCode problem.
Return bullet points only.

Problem:
${text}
`;
        const result = await callGeminiAPI(prompt);
        sendResponse({ ok: result.ok, summary: result.text });
        return;
      }

      // Socratic hints 

      if (msg.type === "HINTS") {
        const prompt = `Give a Socratic-style guided hint for this LeetCode problem.
❗ DO NOT reveal the solution.
Ask 2–3 leading questions that help the student think.

Problem:
${text}
`;

        const result = await callGeminiAPI(prompt);
        sendResponse({ ok: result.ok, summary: result.text });
        return;
      }

      //Algorithm quick ref 

      if(msg.type === "QUICKREF") {
        const prompt = `
Give a short algorithm/data-structure reference relevant to this LeetCode problem.
Include:
• What algorithm fits best
• One-line explanation
• Time Complexity
• Space Complexity

Keep it concise.
Problem:
${text}
`;
        const result = await callGeminiAPI(prompt);
        sendResponse({ ok: result.ok, summary: result.text });
        return;
      }

      // Unknown message type
      sendResponse({ ok: false, summary: "Unknown message type" });

    })();
  });

  return true; // keep channel open for async response
});
