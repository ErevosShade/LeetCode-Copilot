(function () {
  // double injection guard
  function injectPanel() {
    if (document.getElementById("lc-ai-box")) return;

    const box = document.createElement("div");
    box.id = "lc-ai-box";
    box.innerHTML = `
      <div class="lc-header">
        <div class="lc-title">LeetCode Copilot</div>
        <button id="lc-collapse" title="Collapse">✕</button>
      </div>

      <button id="btn-problem-understanding" class="section-toggle">🧠 Problem Understanding</button>

      <div id="problem-understanding-panel" class="section-content">
        <button id="btn-rephrase" class="small-btn">Rephrase Problem</button>
        <button id="btn-constraints" class="small-btn secondary">Extract Constraints</button>
        <button id="btn-edgecases" class="small-btn secondary">Suggest Edge Cases</button>
      </div>

      <div id="lc-output">Click a button to generate a concise rephrase.</div>
      <div class="lc-footer">Enter API key: Extensions → Details → Options</div>
    `;
    document.body.appendChild(box);

    // bubble (minimised panel )
    const bubble = document.createElement("div");
    bubble.id = "lc-bubble";
    bubble.textContent = "💡";
    bubble.style.display = "none";
    document.body.appendChild(bubble);
    
    // minimise to bubble handler
    document.getElementById("lc-collapse").onclick = () => {
      box.style.display = "none";
      bubble.style.display = "flex";  // show small icon
    };

    //restore planel from bubble
    bubble.onclick = () => {
      bubble.style.display = "none";
      box.style.display = "block";
    };

    // expand/collapse the section
    const toggleBtn = document.getElementById("btn-problem-understanding");
    const panel = document.getElementById("problem-understanding-panel");
    toggleBtn.onclick = () => {
      panel.style.display = panel.style.display === "block" ? "none" : "block";
    };

    // Identify problem description with multiple fallbacks
    function getProblem() {
      const selectors = [
        '[data-track-load="description_content"]', // NEW selector
        '[data-key="description-content"]',
        '.question-content__JfgR',
        '.content__u3I1',
        'div[data-cy="question-content"]'
      ];

      for (const s of selectors) {
        const el = document.querySelector(s);
        if (el) return el.innerText.trim();
      }
      return "";
    }

    // Convert minimal Markdown -> HTML (bold only, safe)
    function mdToHtml(md) {
      if (!md) return "";

      let html = md;

      // Remove LaTeX math wrappers
      html = html.replace(/\$/g, "");

      // Replace common LaTeX operators
      html = html.replace(/\\le/g, "≤");
      html = html.replace(/\\ge/g, "≥");

      // Replace ^ exponent with unicode superscript
      html = html.replace(/10\^4/g, "10⁴");

      // Remove \text{...}
      html = html.replace(/\\text\{([^}]+)\}/g, "$1");

      // Remove any leftover backslashes
      html = html.replace(/\\/g, "");

      // Convert **bold** markdown
      html = html.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      // Convert bullet points properly
      html = html.replace(/^\s*\*\s/gm, "• ");

      // Convert newlines → <br>
      html = html.replace(/\n/g, "<br>");

      return html;
    }

    function showOutput(text) {
      const out = document.getElementById("lc-output");
      out.innerHTML = mdToHtml(text);
    }

    // Button handlers: send different message types to background
    document.getElementById("btn-rephrase").onclick = () => {
      const text = getProblem();
      if (!text) {
        showOutput("Could not find problem text on this page.");
        return;
      }
      showOutput("Generating rephrase...");
      chrome.runtime.sendMessage({ type: "REPHRASE", text }, (res) => {
        if (res?.ok) {
          showOutput(res.summary);
        } else {
          showOutput("Error: " + (res?.summary || "No response"));
        }
      });
    };

    document.getElementById("btn-constraints").onclick = () => {
      const text = getProblem();
      if (!text) {
        showOutput("Could not find problem text on this page.");
        return;
      }
      showOutput("Extracting constraints...");
      chrome.runtime.sendMessage({ type: "CONSTRAINTS", text }, (res) => {
        if (res?.ok) {
          showOutput(res.summary);
        } else {
          showOutput("Error: " + (res?.summary || "No response"));
        }
      });
    };

    document.getElementById("btn-edgecases").onclick = () => {
      const text = getProblem();
      if (!text) {
        showOutput("Could not find problem text on this page.");
        return;
      }
      showOutput("Suggesting edge cases...");
      chrome.runtime.sendMessage({ type: "EDGECASES", text }, (res) => {
        if (res?.ok) {
          showOutput(res.summary);
        } else {
          showOutput("Error: " + (res?.summary || "No response"));
        }
      });
    };
  }
  //store last url
  let lastUrl = location.href;

  //mutationobservser to handle SPA navigation
  const observer = new MutationObserver(() => {
    const currentUrl = location.href
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;

      setTimeout(() => { injectPanel(); }, 500);
    }
  });

  //watch for Dom changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  //initial load
  injectPanel();
})();
