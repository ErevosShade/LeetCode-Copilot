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

      <!-- WORKSPACE TOOLS -->
      <button id="btn-workspace" class="section-toggle">📘 Workspace Tools</button>
      <div id="workspace-panel" class="section-content">

        <button id="btn-hints" class="small-btn">💡 Socratic Hint</button>
        <button id="btn-quickref" class="small-btn secondary">📚 Algorithm Quick Reference</button>

        <div class="scratch-title">📝 Scratchpad (auto-saves)</div>
        <textarea id="scratchpad" placeholder="Write notes here…"></textarea>
      </div>

      <div id="lc-output">Click a button to generate a concise rephrase.</div>
      <div class="lc-footer">Enter API key: Extensions → Details → Options</div>
      <span style="opacity:0.7; font-size:12px;">Made by <b>Erevos</b></span>

    `;
    document.body.appendChild(box);

    // Back button
    const out = document.getElementById("lc-output");

    const backBtn = document.createElement("button");
    backBtn.id = "lc-back";
    backBtn.textContent = "⬅ Back";
    backBtn.className = "small-btn secondary";
    backBtn.style.display = "none";   // hidden by default

    // insert back button ABOVE output panel
    out.parentNode.insertBefore(backBtn, out);

    // clicking "Back" returns to main menu
    backBtn.onclick = () => {
      out.innerHTML = "Click a button to generate a concise rephrase.";
      backBtn.style.display = "none";

      // hide open sections
      document.getElementById("problem-understanding-panel").style.display = "none";
      document.getElementById("workspace-panel").style.display = "none";

    };


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

    // universal toggle function
    function setupToggle(buttonId, panelId) {
      const btn = document.getElementById(buttonId);
      const panel = document.getElementById(panelId);
      btn.onclick = () => {
        panel.style.display = panel.style.display === "block" ? "none" : "block";
      };
    }
    setupToggle("btn-problem-understanding", "problem-understanding-panel");
    setupToggle("btn-workspace", "workspace-panel");

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
      html = html.replace(/\$/g, "");
      html = html.replace(/\\le/g, "≤");
      html = html.replace(/\\ge/g, "≥");
      html = html.replace(/10\^4/g, "10⁴");
      html = html.replace(/\\text\{([^}]+)\}/g, "$1");
      html = html.replace(/\\/g, "");
      html = html.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
      html = html.replace(/^\s*\*\s/gm, "• ");
      html = html.replace(/\n/g, "<br>");

      return html;
    }

    function showOutput(text) {
      const out = document.getElementById("lc-output");
      const backBtn = document.getElementById("lc-back");

      out.innerHTML = mdToHtml(text);
      backBtn.style.display = "block";
    }

    //scratchpad auto-save
    const scratch = document.getElementById("scratchpad");
    const parts = location.pathname.split("/");
    const problemId = parts.includes("problems") ? parts[parts.indexOf("problems") + 1] : "global";

    chrome.storage.local.get(["scratch_" + problemId], (res) => {
      scratch.value = res["scratch_" + problemId] || "";
    });

    scratch.addEventListener("input", () => {
      chrome.storage.local.set({
        ["scratch_" + problemId]: scratch.value
      });
    });


    // Button handlers: send different message types to background
    function send(type, loadingText) {
      const text = getProblem();
      if (!text) {
        showOutput("Could not find problem description.");
        return;
      }
      showOutput(loadingText);

      chrome.runtime.sendMessage({ type, text }, (res) => {
        if (res?.ok) showOutput(res.summary);
        else showOutput("Error: " + (res?.summary || "No response"));
      });
    }

    document.getElementById("btn-rephrase").onclick = () =>
      send("REPHRASE", "Rephrasing…");

    document.getElementById("btn-constraints").onclick = () =>
      send("CONSTRAINTS", "Extracting constraints…");

    document.getElementById("btn-edgecases").onclick = () =>
      send("EDGECASES", "Finding edge cases…");

    document.getElementById("btn-hints").onclick = () =>
      send("HINTS", "Generating guided hint…");

    document.getElementById("btn-quickref").onclick = () =>
      send("QUICKREF", "Loading algorithm reference…");
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
