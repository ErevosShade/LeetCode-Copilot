(function () {
  // double injection guard
  function injectPanel() {
    if (document.getElementById("lc-ai-box")) return;

    const box = document.createElement("div");
    box.id = "lc-ai-box";
    box.innerHTML = `
    <div class="lc-header">AI Summary</div>
    <button id="lc-run">Summarize</button>
    <div id="lc-output">Click summarize to generate.</div>
  `;
    document.body.appendChild(box);

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

    document.getElementById("lc-run").onclick = () => {
      const text = getProblem();

      chrome.runtime.sendMessage(
        { type: "AI_SUMMARY", text },
        (res) => {
          if (res?.ok) {
            res.summary = res.summary.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");  
            document.getElementById("lc-output").innerHTML = res.summary;
          } else {
            document.getElementById("lc-output").innerText =
              "Error contacting background.";
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
