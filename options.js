const input = document.getElementById("apikey");
const status = document.getElementById("status");
const saveBtn = document.getElementById("save");

// Load saved key
chrome.storage.sync.get(["gemini_key"], (res) => {
  if (res.gemini_key) {
    input.value = res.gemini_key;
    status.textContent = "API key already saved.";
    status.className = "status success";
  }
});

saveBtn.onclick = async () => {
  const key = input.value.trim();

  if (!key) {
    status.textContent = "Please enter a valid API key.";
    status.className = "status error";
    return;
  }

  await chrome.storage.sync.set({ gemini_key: key });

  status.textContent = "API key saved successfully.";
  status.className = "status success";
};
