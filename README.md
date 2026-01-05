# 🤖 LeetCode Copilot

**LeetCode Copilot** is a Chrome extension that lives directly inside LeetCode problem pages and helps with the *thinking* part of problem-solving — without taking you away from the editor.

Originally built for the **IEEE LEAD 6.0** event (and winner 🏆), the project has been further refined based on real-world DSA practice and daily use.

---

## ✨ Features

- 🔍 **Problem Rephrasing**  
  Converts complex problem statements into simpler, human-readable explanations.

- 📏 **Constraint Extraction**  
  Automatically highlights important constraints and limits.

- 🧠 **Edge Case Suggestions**  
  Helps identify tricky cases that are easy to miss.

- 📝 **Workspace Tools**  
  Includes a scratchpad, hints, and quick references for structured thinking.

- 🌗 **Dark & Light Mode Support**  
  Seamlessly adapts to your LeetCode theme.

- 🫧 **Minimizable Floating Panel**  
  Can collapse into a small bubble so it never gets in the way while coding.

- 🔐 **Privacy-First Design**  
  Uses your personal **Google Gemini API key**, stored locally and never shared.

---

## 🧠 Why LeetCode Copilot?

While practicing DSA, it’s easy to jump straight into coding and debug blindly.

LeetCode Copilot is designed to:
- Encourage clarity before implementation
- Reduce cognitive load
- Keep everything inside the problem page

No tab switching.  
No copy-paste chaos.  
Just **think → solve → iterate**.

---

## 🛠 Tech Stack

- **JavaScript** (DOM-heavy, dynamic UI injection)
- **Chrome Extensions API**
- **HTML / CSS**
- Event-driven UI state management and clean UX

Tested on:
- ✅ macOS
- ✅ Windows

---

## 🔑 API Key Setup (Gemini)

LeetCode Copilot uses the **Google Gemini API** for generating AI-powered insights.

### How to add your API key:

1. Get a Gemini API key from:  
   https://aistudio.google.com/app/api-keys

2. Open Chrome and navigate to:
   chrome://extensions

3. Find **LeetCode Copilot** → Click **Details**

4. Click **Extension options**

5. Paste your **Gemini API key** and save

Once saved, the extension will automatically use the key on LeetCode problem pages.

### 🔐 Privacy Note
- Your API key is stored **locally** in your browser
- It is **never sent to any external server**
- All API calls are made directly from the client

---

## ⚙️ Installation (Local)

1. Clone the repository:
```bash
git clone https://github.com/ErevosShade/LeetCode-Copilot.git
```

2.Open Chrome and go to:
  chrome://extensions
3.Enable Developer mode

4.Click Load unpacked

5.Select the project folder
The extension will now appear on LeetCode problem pages.

---

## 🧪 Usage

1. Add your Gemini API key via the extension options
2. Open any LeetCode problem
3. The Copilot panel appears on the right
4. Choose a tool:
   - Rephrase problem
   - Extract constraints
   - Generate edge cases
5. Use workspace tools while solving
6. Minimize the panel when not needed

---

## 📸 Screenshots

The project includes:

- Main panel in dark & light mode
- AI response in action
- Workspace tools during problem-solving
- Secure API setup flow
- Minimized floating bubble view

(See screenshots in the repository or LinkedIn post.)

---

## 🏆 Acknowledgements

- Built for the **IEEE LEAD 6.0** event
- Winner of the event 🏆
- Refined post-event through continuous personal use

---

## 🚧 Future Improvements

- Keyboard shortcuts
- Better response streaming
- Offline scratchpad persistence
- Custom prompt tuning
- Optional model switching

---

## 📌 Project Status

This project is under **active refinement**.  
Feedback, issues, and suggestions are welcome.

---

## 👋 Author

Built by **Erevos**  
Dev logs and progress updates under **#ErevosLogs**


