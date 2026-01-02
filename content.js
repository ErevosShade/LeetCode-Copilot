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
    document.getElementById("lc-output").classList.add("hidden");

    // Make panel draggable
    function makeDraggable(box, handle) {
      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;

      handle.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - box.offsetLeft;
        offsetY = e.clientY - box.offsetTop;
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        box.style.left = e.clientX - offsetX + "px";
        box.style.top = e.clientY - offsetY + "px";
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
      });
    }

    // Make box openable
    function makeOpenable(trigger, box) {
      if (!trigger || !box) return; //Null checking
      trigger.addEventListener("click", () => {
        box.classList.remove("hidden");
      });
    }

    // Make box closable
    function makeClosable(box, closeBtn) {
      if (!box || !closeBtn) return;
      closeBtn.addEventListener("click", () => {
        box.classList.add("hidden");
      });
    }

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

    // Scratchpad open / close handlers
    const openScratch = document.getElementById("btn-open-scratch");
    const scratchBox = document.getElementById("scratch-float");
    const closeScratch = document.getElementById("scratch-close");

    makeOpenable(openScratch, scratchBox);
    makeClosable(scratchBox, closeScratch);

    // ---- Floating AI Output Box ----
    const aiFloat = document.createElement("div");
    aiFloat.id = "ai-output-float";
    aiFloat.classList.add("hidden"); // hidden by default

    aiFloat.innerHTML = `
      <div class="ai-header">
        🤖 AI Response
        <button id="ai-close">✕</button>
      </div>
      <div id="ai-output-content">Waiting for AI response...</div>
    `;
    document.body.appendChild(aiFloat);
    makeClosable(aiFloat, document.getElementById("ai-close")); // close button


    // Minimise / Restore Logic
    // bubble
    const bubble = document.createElement("div");
    bubble.id = "lc-bubble";
    bubble.textContent = "💡";
    bubble.style.display = "none";
    document.body.appendChild(bubble);

    // minimise to bubble handler
    document.getElementById("lc-collapse").onclick = () => {
      box.classList.add("hidden-panel");
      bubble.style.display = "flex";
    };

    //restore planel from bubble
    bubble.onclick = () => {
      bubble.style.display = "none";
      box.classList.remove("hidden-panel");

    };

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



    // Drag logic for scratchpad
    const scratchHeader = scratchBox.querySelector(".scratch-header");
    makeDraggable(scratchBox, scratchHeader);

    // Drag logic for Ai output box panel
    const aiBox = document.getElementById("ai-output-float");
    const aiHeader = aiBox.querySelector(".ai-header");
    makeDraggable(aiBox, aiHeader);

    // Drag logic for main panel
    const panel = document.getElementById("lc-ai-box");
    const panelHeader = panel.querySelector(".lc-header");
    makeDraggable(panel, panelHeader);




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
      const aiBox = document.getElementById("ai-output-float");
      const aiContent = document.getElementById("ai-output-content");
      const panel = document.getElementById("lc-ai-box");

      aiContent.innerHTML = mdToHtml(text);
      aiBox.classList.remove("hidden"); // show floating AI box

      // keep main panel clean
      panel.classList.remove("expanded");
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
