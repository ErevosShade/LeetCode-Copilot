document.getElementById("save").onclick = async () => {
  const key = document.getElementById("apikey").value.trim();

  await chrome.storage.sync.set({ gemini_key: key });

  alert("API key saved!");
};

// Load saved key (optional)
chrome.storage.sync.get(["gemini_key"], (res) => {
  if (res.gemini_key) {
    document.getElementById("apikey").value = res.gemini_key;
  }
});
