export const CV_EXPORT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
:root{--ink:#202331;--ink-2:#5a5f73;--ink-3:#8a8fa3;--accent:#2f5e54;--accent-soft:#e4efe9;--accent-ink:#1f3f39;--hair:#e1e2e9}
*{box-sizing:border-box}
body{margin:0;background:#e9eaef;font-family:'Inter',system-ui,sans-serif;color:#2a2d3a}
.export-wrap{max-width:760px;margin:24px auto;padding:0 16px}
.export-bar{position:fixed;bottom:0;left:0;right:0;display:flex;gap:14px;align-items:center;justify-content:center;
  background:#202331;color:#fff;padding:12px;font-size:13px;flex-wrap:wrap;text-align:center}
.export-bar button{background:#2f5e54;color:#fff;border:none;border-radius:999px;padding:9px 20px;font:inherit;font-weight:600;cursor:pointer}
.cv-sheet{background:#fff;border-radius:6px;box-shadow:0 12px 40px rgba(32,35,49,.14);padding:46px 50px;font-size:13px;line-height:1.55}
.cv-header{display:flex;gap:20px;align-items:flex-start;padding-bottom:16px;border-bottom:2px solid var(--ink);margin-bottom:18px}
.cv-photo{width:78px;height:78px;border-radius:50%;background:#eee center/cover no-repeat;flex:none}
.cv-name{font-family:'Fraunces',serif;font-weight:600;font-size:30px;line-height:1.05;margin:0;color:var(--ink)}
.cv-role{font-size:14.5px;color:var(--accent);font-weight:600;margin:4px 0 9px}
.cv-contact{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:12px;color:var(--ink-2)}
.cv-contact span{display:inline-flex;align-items:center;gap:5px}
.cv-contact svg,.cv-links svg{color:var(--accent)}
.cv-links{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:12px;margin-top:6px}
.cv-links a{display:inline-flex;align-items:center;gap:5px;color:var(--accent-ink);text-decoration:none}
.cv-empty{display:none}
.cv-section{margin-bottom:18px}
.cv-section-title{font-weight:700;font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--accent);margin:0 0 10px;padding-bottom:4px;border-bottom:1px solid var(--hair)}
.cv-summary{margin:0;color:#3a3d4a}
.cv-entry{margin-bottom:13px}
.cv-entry-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.cv-entry-title{font-weight:600;font-size:13.5px;color:var(--ink)}
.cv-at{font-weight:500;color:var(--ink-2)}
.cv-date{font-size:11.5px;color:var(--ink-3);white-space:nowrap;flex:none}
.cv-proj-links{display:flex;gap:10px}.cv-proj-links a{color:var(--accent);text-decoration:none}
.cv-entry-desc{margin:3px 0 0;color:#414452}
.cv-tech{margin:4px 0 0;font-size:12px;color:var(--accent-ink);font-weight:500}
.cv-bullets{margin:5px 0 0;padding-left:18px;color:#414452}
.cv-bullets li{margin-bottom:2px}
.cv-row{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:6px}
.cv-row a{color:var(--accent-ink);text-decoration:none}
.cv-skills{display:flex;flex-wrap:wrap;gap:7px}
.cv-skills span{background:var(--accent-soft);color:var(--accent-ink);border-radius:6px;padding:4px 10px;font-size:12px;font-weight:500}
.cv-langs{display:flex;flex-wrap:wrap;gap:6px 22px;color:#414452}
@page{margin:14mm}
@media print{
  body{background:#fff}
  .export-bar,.no-print{display:none!important}
  .export-wrap{margin:0;padding:0;max-width:100%}
  .cv-sheet{box-shadow:none;border-radius:0;padding:0;font-size:11.5px}
  .cv-section,.cv-entry{break-inside:avoid}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}`;

export function exportCV(name) {
  const node = document.querySelector(".print-source .cv-sheet");
  if (!node) return;
  const fileBase = (name || "CV").trim().replace(/\s+/g, "_") || "CV";
  const doc = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${fileBase} — CV</title>
<style>${CV_EXPORT_CSS}</style>
</head><body>
<div class="export-wrap">${node.outerHTML}</div>
<div class="export-bar no-print">
  <button onclick="window.print()">Save as PDF</button>
  <span>Use your browser's print dialog → choose "Save as PDF".</span>
</div>
<script>window.addEventListener('load',function(){setTimeout(function(){try{window.print();}catch(e){}},400);});<\/script>
</body></html>`;
  const blob = new Blob([doc], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileBase}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
