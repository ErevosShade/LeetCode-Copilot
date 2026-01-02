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
Rephrase the following LeetCode problem in SIMPLE English.

STRICT RULES:
- Use 1 to 3 short sentences
- Keep it under 45 words total
- No explanations
- No algorithm or approach
- No edge cases
- Plain beginner-friendly language only

Problem:
${text}


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
Extract ONLY the constraints from the following LeetCode problem.

STRICT RULES:
- Bullet points only
- Maximum 6 bullets
- Do not add or infer anything
- No explanations or extra text

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
List important edge cases for this problem.

STRICT RULES:
- Bullet points only
- One short line per bullet
- No explanations
- No solutions or hints

Problem:
${text}
`;
        const result = await callGeminiAPI(prompt);
        sendResponse({ ok: result.ok, summary: result.text });
        return;
      }

      // Socratic hints 

      if (msg.type === "HINTS") {
        const prompt = `
Give Socratic-style hints to help a student think through this problem.

RULES:
- Ask 2 to 3 guiding questions
- Do NOT reveal the solution
- Do NOT mention specific code
- Encourage logical reasoning
- Use short, clear paragraphs

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
Provide a concise algorithm reference for this problem.

Include:
- Best-fit algorithm or pattern
- Why it fits this problem
- Time complexity
- Space complexity

RULES:
- Use clear headings or bullet points
- Be concise and structured
- Avoid long explanations
- No code

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
