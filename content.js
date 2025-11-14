(function () {
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
          document.getElementById("lc-output").innerText = res.summary;
        } else {
          document.getElementById("lc-output").innerText =
            "Error contacting background.";
        }
      }
    );
  };
})();
