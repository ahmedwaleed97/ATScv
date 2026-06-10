let _pdfjs = null;

export function loadPdfJs() {
  if (_pdfjs) return Promise.resolve(_pdfjs);
  if (typeof window !== "undefined" && window.pdfjsLib) {
    _pdfjs = window.pdfjsLib;
    return Promise.resolve(_pdfjs);
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload = () => {
      const lib = window.pdfjsLib;
      if (!lib) return reject(new Error("pdf reader unavailable"));
      lib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      _pdfjs = lib;
      resolve(lib);
    };
    s.onerror = () => reject(new Error("could not load pdf reader"));
    document.head.appendChild(s);
  });
}

export async function extractPdfText(file) {
  const lib = await loadPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: buf }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    out += tc.items.map((it) => it.str).join(" ") + "\n";
  }
  return out;
}
