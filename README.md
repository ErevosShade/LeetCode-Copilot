# LeetCode AI Summary (Chrome Extension)

This is a small Chrome extension that adds a little panel on LeetCode problem pages.  
Right now it can grab the problem description and generate a quick “AI summary” (it’s a mock for now).  
Mostly made this so I can build more features on top of it later.

## How it works
- The extension injects a tiny floating UI box on the right side of any LeetCode problem page.
- When you click the **Summarize** button, it grabs the problem description from the page.
- It sends that text to the background script.
- The background script returns a mock summary for now (easy to swap out for real OpenAI/Gemini/etc).

Honestly nothing fancy yet, just a basic working setup.

## Install (local)
1. Clone or download this repo.
2. Go to `chrome://extensions`
3. Turn on Developer Mode.
4. Click **Load unpacked** and pick the project folder.

Then visit any LeetCode problem and the little panel should show up on the right.

## File overview
- `manifest.json` — tells Chrome what the extension is allowed to do.
- `content.js` — runs on LeetCode pages; injects the UI and talks to background.
- `background.js` — handles the summary request (mock at the moment).
- `styles.css` — styles for the panel.

## Things I want to add later
Just dropping ideas here so I don’t forget:
- real AI integration (OpenAI / Gemini / Claude, or even local models)
- edge case generator
- constraint extractor
- example inputs
- hint mode / coaching mode
- small scratchpad editor inside the panel
- maybe a visualizer for pointer problems

If you want any of these, feel free to fork or open an issue.

## License
Probably MIT or something. Haven’t decided.  
For now: do whatever you want with it.
