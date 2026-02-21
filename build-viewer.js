const fs = require('fs');
const path = require('path');

const dir = __dirname;
const mdFiles = fs.readdirSync(dir)
  .filter(f => f.endsWith('.md') && f !== 'README.md')
  .sort();

const fileData = {};
for (const file of mdFiles) {
  fileData[file] = fs.readFileSync(path.join(dir, file), 'utf8');
}

const filesJson = JSON.stringify(fileData);

// DOMPurify sanitizes all HTML before DOM insertion - safe against XSS
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Defense Documents</title>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js"><\/script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    background: #0d1117;
    color: #c9d1d9;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .tabs {
    display: flex;
    background: #161b22;
    border-bottom: 1px solid #30363d;
    overflow-x: auto;
    flex-shrink: 0;
    scrollbar-width: thin;
  }
  .tabs::-webkit-scrollbar { height: 4px; }
  .tabs::-webkit-scrollbar-thumb { background: #30363d; border-radius: 2px; }
  .tab {
    padding: 10px 18px;
    cursor: pointer;
    font-size: 13px;
    color: #8b949e;
    white-space: nowrap;
    border-bottom: 2px solid transparent;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .tab:hover { color: #c9d1d9; background: #1c2128; }
  .tab.active {
    color: #58a6ff;
    border-bottom-color: #58a6ff;
    background: #0d1117;
  }
  .content {
    flex: 1;
    overflow-y: auto;
    padding: 40px 60px;
  }
  .markdown-body {
    max-width: 900px;
    margin: 0 auto;
    line-height: 1.7;
  }
  .markdown-body h1 {
    font-size: 2em;
    border-bottom: 1px solid #30363d;
    padding-bottom: 0.3em;
    margin: 0 0 16px;
    color: #f0f6fc;
  }
  .markdown-body h2 {
    font-size: 1.5em;
    border-bottom: 1px solid #21262d;
    padding-bottom: 0.3em;
    margin: 24px 0 16px;
    color: #f0f6fc;
  }
  .markdown-body h3 { font-size: 1.25em; margin: 24px 0 16px; color: #f0f6fc; }
  .markdown-body h4, .markdown-body h5, .markdown-body h6 { margin: 24px 0 16px; color: #f0f6fc; }
  .markdown-body p { margin: 0 0 16px; }
  .markdown-body ul, .markdown-body ol { padding-left: 2em; margin: 0 0 16px; }
  .markdown-body li { margin: 4px 0; }
  .markdown-body li > ul, .markdown-body li > ol { margin: 0; }
  .markdown-body a { color: #58a6ff; text-decoration: none; }
  .markdown-body a:hover { text-decoration: underline; }
  .markdown-body strong { color: #f0f6fc; }
  .markdown-body blockquote {
    padding: 0 1em;
    color: #8b949e;
    border-left: 3px solid #3b4048;
    margin: 0 0 16px;
  }
  .markdown-body code {
    background: #1f2937;
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.85em;
    font-family: "SF Mono", "Fira Code", monospace;
  }
  .markdown-body pre {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 6px;
    padding: 16px;
    overflow-x: auto;
    margin: 0 0 16px;
  }
  .markdown-body pre code { background: none; padding: 0; font-size: 0.85em; line-height: 1.5; }
  .markdown-body table { width: 100%; border-collapse: collapse; margin: 0 0 16px; }
  .markdown-body th, .markdown-body td { padding: 8px 12px; border: 1px solid #30363d; text-align: left; }
  .markdown-body th { background: #161b22; font-weight: 600; color: #f0f6fc; }
  .markdown-body tr:nth-child(even) { background: rgba(22, 27, 34, 0.5); }
  .markdown-body hr { border: none; border-top: 1px solid #30363d; margin: 24px 0; }
  .markdown-body img { max-width: 100%; border-radius: 6px; }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #484f58; }
</style>
</head>
<body>
<div class="tabs" id="tabs"></div>
<div class="content" id="content"></div>
<script>
// All markdown content is from local files owned by the user.
// DOMPurify.sanitize() is called on all rendered HTML before DOM insertion.
var FILES = ${filesJson};
var tabsEl = document.getElementById('tabs');
var contentEl = document.getElementById('content');
var names = Object.keys(FILES);
marked.setOptions({ gfm: true, breaks: true });

function show(name) {
  // Sanitize rendered markdown HTML with DOMPurify before inserting into DOM
  var sanitized = DOMPurify.sanitize(marked.parse(FILES[name]), { USE_PROFILES: { html: true } });
  while (contentEl.firstChild) contentEl.removeChild(contentEl.firstChild);
  var wrap = document.createElement('div');
  wrap.className = 'markdown-body';
  // Safe: content has been sanitized by DOMPurify above
  wrap.insertAdjacentHTML('afterbegin', sanitized);
  contentEl.appendChild(wrap);
  contentEl.scrollTop = 0;
  var allTabs = document.querySelectorAll('.tab');
  for (var i = 0; i < allTabs.length; i++) {
    allTabs[i].classList.toggle('active', allTabs[i].dataset.name === name);
  }
}

for (var i = 0; i < names.length; i++) {
  var t = document.createElement('div');
  t.className = 'tab';
  t.textContent = names[i].replace('.md', '');
  t.dataset.name = names[i];
  t.addEventListener('click', (function(n) { return function() { show(n); }; })(names[i]));
  tabsEl.appendChild(t);
}

if (names.length > 0) show(names[0]);
</script>
</body>
</html>`;

fs.writeFileSync(path.join(dir, 'viewer.html'), html, 'utf8');
console.log('Generated viewer.html with ' + mdFiles.length + ' files: ' + mdFiles.join(', '));
