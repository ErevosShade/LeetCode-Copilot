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
        <button id="btn-open-scratch" class="small-btn secondary">📝 Open Scratchpad</button>
        <button id="btn-quickref" class="small-btn secondary">📚 Algorithm Quick Reference</button>
      </div>

      <div id="lc-output">Click a button to generate a concise rephrase.</div>
      <div class="lc-footer">Enter API key: Extensions → Details → Options</div>
      <div class="lc-footer-brand"> Made by <b>Erevos</b> </div>


    `;
    document.body.appendChild(box);

    // ---- Floating Scratchpad ----
    const scratchFloat = document.createElement("div");
    scratchFloat.id = "scratch-float";
    scratchFloat.classList.add("hidden");   // keep hidden by default
    scratchFloat.style.top = "140px";       // set fixed position
    scratchFloat.style.left = "calc(100vw - 680px)";
    scratchFloat.innerHTML = `
      <div id="scratch-header" class="scratch-header">
        📝 Scratchpad
        <button id="scratch-close">✕</button>
      </div>
    <textarea id="scratchpad" placeholder="Write notes here…"></textarea>
    `;
    document.body.appendChild(scratchFloat);

    // Scratchpad auto-save
    const scratch = document.getElementById("scratchpad");
    const parts = location.pathname.split("/");
    const problemId = parts.includes("problems")
      ? parts[parts.indexOf("problems") + 1]
      : "global";

    chrome.storage.local.get(["scratch_" + problemId], (res) => {
      scratch.value = res["scratch_" + problemId] || "";
    });

    scratch.addEventListener("input", () => {
      chrome.storage.local.set({
        ["scratch_" + problemId]: scratch.value
      });
    });

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
      document.getElementById("lc-ai-box").classList.remove("expanded");  // collapse panel

    };


    // bubble (minimised panel )
    const bubble = document.createElement("div");
    bubble.id = "lc-bubble";
    bubble.textContent = "💡";
    bubble.style.display = "none";
    document.body.appendChild(bubble);

    // minimise to bubble handler
    document.getElementById("lc-collapse").onclick = () => {
      resetPanelState();
      box.classList.add("hidden-panel");
      bubble.style.display = "flex";

      bubble.style.display = "flex";  // show small icon
    };

    //restore planel from bubble
    bubble.onclick = () => {
      resetPanelState();
      bubble.style.display = "none";
      bubble.style.display = "none";
box.classList.remove("hidden-panel");

    };

    function resetPanelState() {
      const box = document.getElementById("lc-ai-box");

      // 1️⃣ Reset panel expansion
      box.classList.remove("expanded");

      // 2️⃣ Close all expandable sections
      const sections = [
        "problem-understanding-panel",
        "workspace-panel",
      ];

      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.remove("show");
          el.style.display = "none"; // important for your current CSS
        }
      });

      // 3️⃣ Reset output text
      const out = document.getElementById("lc-output");
      if (out) {
        out.innerHTML = "Click a button to generate a concise rephrase.";
      }

      // 4️⃣ Hide back button
      const backBtn = document.getElementById("lc-back");
      if (backBtn) {
        backBtn.style.display = "none";
      }
    }

    // universal toggle function
    function setupToggle(buttonId, panelId) {
      const btn = document.getElementById(buttonId);
      const panel = document.getElementById(panelId);
      btn.onclick = () => {
        const isOpen = panel.classList.contains("show");

        if (isOpen) {
          panel.classList.remove("show");
        } else {
          panel.classList.add("show");
          box.classList.add("expanded");   // 👈 force panel growth
        }

        // shrink only if nothing is open
        const anyOpen =
          document.getElementById("problem-understanding-panel")?.classList.contains("show") ||
          document.getElementById("workspace-panel")?.classList.contains("show");

        if (!anyOpen) {
          box.classList.remove("expanded");
        }
      };
    }
    setupToggle("btn-problem-understanding", "problem-understanding-panel");
    setupToggle("btn-workspace", "workspace-panel");

    // Scratchpad open / close handlers
    const openScratch = document.getElementById("btn-open-scratch");
    const scratchBox = document.getElementById("scratch-float");
    const closeScratch = document.getElementById("scratch-close");

    openScratch.onclick = () => {
      scratchBox.classList.toggle("hidden");
    };

    closeScratch.onclick = () => {
      scratchBox.classList.add("hidden");
    };

    // Drag logic for scratchpad
    const header = document.getElementById("scratch-header");
    let isDragging = false, offsetX = 0, offsetY = 0;

    header.onmousedown = (e) => {
      isDragging = true;
      offsetX = e.clientX - scratchBox.offsetLeft;
      offsetY = e.clientY - scratchBox.offsetTop;
    };

    document.onmousemove = (e) => {
      if (!isDragging) return;
      scratchBox.style.left = e.clientX - offsetX + "px";
      scratchBox.style.top = e.clientY - offsetY + "px";
    };

    document.onmouseup = () => {
      isDragging = false;
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
      const panel = document.getElementById("lc-ai-box");

      out.innerHTML = mdToHtml(text);
      backBtn.style.display = "block";

      if (!text.endsWith("…")) {
        panel.classList.add("expanded");
      }
    }


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
