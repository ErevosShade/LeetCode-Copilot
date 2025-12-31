🚀 LeetCode Copilot — Chrome Extension
An AI-powered productivity tool for LeetCode, built by Erevos

A lightweight Chrome extension that enhances your LeetCode workflow using Gemini AI.
Understand problems faster, extract constraints, generate hints, save notes, and access algorithm references — all directly beside the problem.

✨ Features
🤖 AI Problem Understanding

Rephrase complex LeetCode problems into simple English

Extract constraints directly from the problem description

Suggest meaningful edge cases

Markdown-like formatting is converted into clean UI-friendly HTML

📘 Workspace Tools
📝 Scratchpad (Auto-Save per Problem)

Persistent notes for every problem

Automatically saved locally using chrome.storage.local

Notes reload instantly when revisiting the same problem

💡 Socratic Hint System

Get step-by-step, interactive hints without revealing the full solution

Designed to teach reasoning, not spoon-feed answers

📚 Algorithm Quick Reference

One-click lookup:

Two pointers

DP patterns

Sliding window

Graph/Tree templates

Search strategies

All powered through Gemini prompts

🎨 UI/UX Features

Smooth collapsing animations

“💡” bubble mode when minimized

Back button to return to the main menu

Clean modern panel styled to match LeetCode’s UI

Your name Erevos displayed as the extension’s maker

🔧 Installation (Developer Mode)

Download or clone this repository:

git clone https://github.com/<your-username>/leetcode-copilot


Open chrome://extensions/

Enable Developer Mode

Click Load Unpacked

Select the project folder

Open the extension Options page and paste your Gemini API Key

🧠 How It Works
On every LeetCode problem page:

The extension injects a floating panel

Detects problem description using multiple DOM selectors

Converts AI outputs → clean HTML (safe, sanitized)

All actions communicate with background.js using chrome.runtime.sendMessage

Background Tasks

background.js handles:

Fetching from Gemini API

Retry logic + failure-friendly messaging

Returning summaries, hints, algorithm notes, etc.

📁 Project Structure
📦 leetcode-copilot
 ┣ 📜 manifest.json
 ┣ 📜 background.js
 ┣ 📜 content.js
 ┣ 📜 styles.css
 ┣ 📜 options.html
 ┣ 📜 options.js
 ┗ 📜 README.md

🖥️ Screenshots (Replace With Your Images)
Main Panel

Bubble Mode

Scratchpad

🔐 API Key Storage

Your Gemini key stays local

Never exposed publicly

Stored only in chrome.storage.sync

👤 Author
Made with ❤️ by Erevos

If you like this extension, ⭐ the repo or contribute!
