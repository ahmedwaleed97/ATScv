import { lines, words } from "./utils";

export const GEMINI = {
  key: import.meta.env.VITE_GEMINI_API_KEY || "",
  model: import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash",
};

const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

export const KEY_FROM_ENV = !!import.meta.env.VITE_GEMINI_API_KEY;

const REVIEW_ENDPOINT = import.meta.env.VITE_REVIEW_ENDPOINT || "";

const GEMINI_SYSTEM = `You are a strict but fair CV/resume reviewer, ATS specialist, and proofreader. Return ONLY a valid JSON object (no markdown, no code fences) with EXACTLY these keys:
- "score" (int 0-100): overall CV quality score
- "grade" (one of: "Needs work" | "Getting there" | "Strong" | "Excellent")
- "summary" (string): one short sentence summarising the result
- "ats" (int 0-100): ATS compatibility score based on structure, keywords, and parsability
- "ats_verdict" (string): "Pass" if the CV will parse correctly in most ATS systems, "Fail" if it has issues that will cause parsing errors or automatic rejection. Base this on: presence of standard section headings (Experience, Education, Skills), plain text format, no tables or columns, contact info present, reasonable length, no images or graphics in text, no headers/footers hiding key info.
- "ats_issues" (array of strings, max 8): specific ATS problems found. Examples: "Uses tables or columns — many ATS parsers garble these", "Missing a standard Skills section heading", "Contact info may be in a header/footer — ATS often ignores these", "Job titles use non-standard formats", "Special characters may break parsing", "CV is too short — ATS may filter it out", "Missing keywords for the apparent target role". Only list real issues found.
- "ats_passed" (array of strings, max 6): ATS checks the CV passes. Examples: "Standard section headings present", "Contact details found in body text", "No tables or columns detected", "Good keyword density", "Appropriate length (1–2 pages)", "Uses plain readable text". Only list checks that genuinely pass.
- "strengths" (array of strings): what the CV does well, be specific
- "missing" (array of strings): missing sections or essential info
- "suggestions" (array of strings): concrete rewrites and improvements including stronger action verbs and quantified achievements
- "keywords" (array of strings, max 6): role-relevant keywords to add
- "spelling" (array of objects): spelling and grammar errors. Each object must have "original" (exact wrong text), "fix" (corrected version), "note" (brief explanation). Max 15. If none, return [].
Be specific and honest. Never invent facts about the candidate.`;

export function cvToText(cv) {
  const parts = [cv.fullName, cv.title, cv.summary, (cv.skills || []).join(", ")];
  (cv.experience || []).forEach((e) =>
    parts.push(`${e.position} at ${e.company}. ${e.description} ${e.achievements}`)
  );
  (cv.education || []).forEach((e) =>
    parts.push(`${e.degree} ${e.field}, ${e.institution}`)
  );
  (cv.projects || []).forEach((p) =>
    parts.push(`Project: ${p.name}. ${p.description} ${p.technologies}`)
  );
  return parts.filter((p) => (p || "").trim()).join("\n");
}

async function reviewViaBackend(text) {
  const res = await fetch("/api/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const e = new Error(await res.text());
    e.status = res.status;
    throw e;
  }
  return res.json();
}

async function callGeminiDirect(text, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI.key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: GEMINI_SYSTEM }] },
      contents: [{ parts: [{ text }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(body);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
}

export async function geminiReview(text) {
  // Production path: backend holds the key — never exposed to the browser.
  try {
    return await reviewViaBackend(text);
  } catch (e) {
    // 404 means no /api/review route (plain `npm run dev` without vercel dev).
    // Fall through to the direct call only in that case.
    if (e.status !== 404 || !GEMINI.key) throw e;
  }

  // Local-dev fallback: direct call using VITE_GEMINI_API_KEY (key stays in .env, not committed).
  const models = [GEMINI.model, ...FALLBACK_MODELS.filter((m) => m !== GEMINI.model)];
  let lastErr;
  for (const model of models) {
    try {
      const out = await callGeminiDirect(text, model);
      return {
        score: Number(out.score) || 0,
        ats: Number(out.ats) || 0,
        ats_verdict: out.ats_verdict || "Fail",
        ats_issues: out.ats_issues || [],
        ats_passed: out.ats_passed || [],
        grade: out.grade || "",
        summary: out.summary || "",
        strengths: out.strengths || [],
        missing: out.missing || [],
        suggestions: out.suggestions || [],
        keywords: out.keywords || [],
        spelling: out.spelling || [],
        source: "gemini",
      };
    } catch (e) {
      lastErr = e;
      if (e.status !== 503 && e.status !== 429) throw e;
    }
  }
  throw lastErr;
}

export async function runAIAnalysis(cv) {
  if (GEMINI.key) {
    try { return await geminiReview(cvToText(cv)); } catch { /* fall back */ }
  }
  if (REVIEW_ENDPOINT) {
    try {
      const res = await fetch(REVIEW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv }),
      });
      if (res.ok) return await res.json();
    } catch { /* fall back */ }
  }
  await new Promise((r) => setTimeout(r, 650));
  return analyzeLocally(cv);
}

const WEAK_VERBS = [
  "responsible for", "worked on", "helped", "assisted", "involved in", "duties included",
];
const ACTION_VERBS = [
  "built", "led", "designed", "automated", "developed", "launched", "cut", "reduced",
  "increased", "improved", "created", "managed", "shipped", "delivered", "optimized",
  "migrated", "implemented",
];
const NUM_RE = /\d|%|\$/;

export function analyzeText(raw) {
  const text = raw.replace(/\r/g, "");
  const low = text.toLowerCase();
  const wc = words(text);
  const strengths = [], missing = [], suggestions = [];
  let score = 0;

  const hasEmail = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(text);
  const hasPhone = /(\+?\d[\d\s().-]{7,})/.test(text);
  if (hasEmail) score += 8; else missing.push("No email address found.");
  if (hasPhone) score += 6; else missing.push("No phone number found.");
  if (hasEmail && hasPhone) strengths.push("Contact details are present.");

  const hasLink = /(linkedin\.com|github\.com|https?:\/\/|\.dev\b|\.io\b|portfolio)/i.test(low);
  if (hasLink) { score += 5; strengths.push("Includes an online profile or link."); }
  else suggestions.push("Add a LinkedIn or portfolio/GitHub link.");

  const sections = [
    { re: /(summary|profile|objective|about)/, label: "summary/profile", pts: 6, miss: "Add a short summary or profile at the top." },
    { re: /(experience|employment|work history)/, label: "experience", pts: 12, miss: "No clear work experience section." },
    { re: /(education|academic|degree|university|bachelor|master)/, label: "education", pts: 7, miss: "No education section found." },
    { re: /(skills|technologies|competencies)/, label: "skills", pts: 8, miss: "No skills section found." },
  ];
  const found = [];
  sections.forEach((s) => {
    if (s.re.test(low)) { score += s.pts; found.push(s.label); }
    else missing.push(s.miss);
  });
  if (found.length >= 3) strengths.push(`Has the core sections (${found.join(", ")}).`);

  if (wc < 150) suggestions.push("CV looks short — aim for ~250–700 words of real content.");
  else if (wc > 900) { suggestions.push("CV is long — tighten it toward 1–2 pages."); score += 4; }
  else { score += 10; strengths.push("Length is in a healthy range."); }

  const sentences = text.split(/\n|\.\s/).map((s) => s.trim()).filter(Boolean);
  const quantified = sentences.filter((s) => NUM_RE.test(s)).length;
  if (quantified >= 3) { score += 10; strengths.push("Achievements are backed by numbers."); }
  else suggestions.push("Quantify more results (%, time saved, scale, revenue).");

  const weakHits = WEAK_VERBS.filter((v) => low.includes(v));
  const actionHits = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`).test(low));
  if (weakHits.length) suggestions.push(`Replace weak phrases (e.g. "${weakHits[0]}") with action verbs like Built, Led, Cut.`);
  else score += 4;
  if (actionHits.length >= 3) { score += 5; strengths.push("Uses strong action verbs."); }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const ats_issues = [], ats_passed = [];
  let ats = 45;

  if (hasEmail && hasPhone) { ats += 12; ats_passed.push("Contact details present in body text."); }
  else ats_issues.push("Missing email or phone — ATS requires contact info in the body, not a header.");

  if (found.length >= 3) { ats += 18; ats_passed.push("Standard section headings detected."); }
  else ats_issues.push("Missing standard section headings (Experience, Education, Skills).");

  if (quantified > 0) { ats += 8; ats_passed.push("Quantified achievements help keyword matching."); }

  if (hasLink) { ats += 5; ats_passed.push("Online profile link present."); }

  if (/[│|]{2,}|\t{2,}/.test(text)) {
    ats -= 12;
    ats_issues.push("Tables or columns detected — many ATS parsers garble these.");
    suggestions.push("Avoid tables/columns — many ATS parsers garble them.");
  } else {
    ats_passed.push("No tables or columns detected.");
  }

  if (wc >= 150 && wc <= 900) ats_passed.push("Appropriate length for ATS scanning.");
  else if (wc < 150) ats_issues.push("CV is too short — ATS may filter it out automatically.");

  ats = Math.max(0, Math.min(100, ats));
  const ats_verdict = ats >= 70 && ats_issues.length === 0 ? "Pass" : ats >= 60 && ats_issues.length <= 1 ? "Pass" : "Fail";

  const grade = score >= 85 ? "Excellent" : score >= 70 ? "Strong" : score >= 50 ? "Getting there" : "Needs work";
  const summary =
    score >= 85 ? "Meets the standards well — minor polish only." :
    score >= 70 ? "A solid CV with a few clear fixes left." :
    score >= 50 ? "The basics are here — close the gaps below." :
    "Several essentials are missing — start with the flagged items.";

  const kwPool = new Set();
  [["docker", "Containerization"], ["aws", "Cloud"], ["python", "Python"], ["react", "React"],
   ["sql", "Databases"], ["agile", "Agile"], ["api", "APIs"], ["linux", "Linux"]]
    .forEach(([t, kw]) => { if (low.includes(t)) kwPool.add(kw); });
  const keywords = [...kwPool].slice(0, 6);

  return { score, grade, summary, ats, ats_verdict, ats_issues, ats_passed, strengths, missing, suggestions, keywords, spelling: [], source: "local" };
}

export function analyzeLocally(cv) {
  const strengths = [], missing = [], suggestions = [];
  let score = 0;

  if (cv.fullName) score += 5; else missing.push("Add your full name.");
  if (cv.title) score += 5; else missing.push("Add a professional title under your name.");
  if (cv.email && cv.phone) score += 8; else missing.push("Include both email and phone in contact details.");
  if (cv.location) score += 2;

  if (cv.summary) {
    const w = words(cv.summary);
    if (w >= 25 && w <= 90) { score += 10; strengths.push("Summary is a good length."); }
    else { score += 4; suggestions.push(w < 25 ? "Expand your summary to 2–3 lines." : "Trim the summary — keep it tight (under ~90 words)."); }
  } else missing.push("Write a short professional summary.");

  if (cv.experience.length > 0) {
    score += 12;
    strengths.push(`${cv.experience.length} experience entr${cv.experience.length > 1 ? "ies" : "y"} listed.`);
  } else missing.push("Add at least one work experience entry.");

  if (cv.education.length > 0) score += 5; else suggestions.push("Add your education.");
  if (cv.skills.length >= 5) { score += 8; strengths.push("Solid skills list."); }
  else missing.push("List at least 5 skills.");
  if (cv.projects.length > 0) { score += 5; strengths.push("Projects included — great for technical roles."); }

  let bulletCount = 0, quantified = 0, weakHits = 0;
  cv.experience.forEach((e) => {
    lines(e.achievements).forEach((b) => {
      bulletCount++;
      if (NUM_RE.test(b)) quantified++;
      const low = b.toLowerCase();
      if (WEAK_VERBS.some((v) => low.includes(v))) weakHits++;
    });
  });

  if (bulletCount > 0) {
    const ratio = quantified / bulletCount;
    if (ratio >= 0.4) { score += 8; strengths.push("Achievements are backed by numbers."); }
    else suggestions.push("Quantify more achievements (%, time saved, scale, $).");
    if (weakHits > 0) suggestions.push(`Replace weak phrases like "responsible for" with action verbs (Built, Led, Automated, Cut).`);
    else score += 2;
  } else if (cv.experience.length > 0) {
    suggestions.push("Add achievement bullets under each role, not just a description.");
  }

  const hasLink = cv.github || cv.linkedin || cv.website || cv.portfolio;
  if (hasLink) score += 4; else suggestions.push("Add a LinkedIn or GitHub link.");

  score = Math.max(0, Math.min(100, Math.round(score)));

  const ats_issues = [], ats_passed = [];
  let ats = 50;

  if (cv.skills.length >= 6) { ats += 15; ats_passed.push("Skills section present with good keyword coverage."); }
  else ats_issues.push("Thin skills section — ATS keyword matching will be weak.");

  if (bulletCount >= 3) { ats += 10; ats_passed.push("Experience bullet points present."); }
  else if (cv.experience.length > 0) ats_issues.push("Experience entries lack bullet points — ATS prefers structured lists.");

  if (cv.summary) { ats += 10; ats_passed.push("Professional summary present."); }
  else ats_issues.push("No summary — ATS keyword scans benefit from a summary section.");

  if (hasLink) { ats += 5; ats_passed.push("Online profile link present."); }

  if (quantified > 0) { ats += 10; ats_passed.push("Quantified achievements aid keyword matching."); }

  if (cv.email && cv.phone) ats_passed.push("Contact details present.");
  else ats_issues.push("Missing email or phone number.");

  if (cv.experience.length > 0) ats_passed.push("Standard Experience section present.");
  else ats_issues.push("No Experience section — most ATS require this.");

  if (cv.education.length > 0) ats_passed.push("Education section present.");
  else ats_issues.push("No Education section.");

  ats = Math.min(100, ats);
  const ats_verdict = ats_issues.length === 0 ? "Pass" : ats_issues.length <= 1 && ats >= 65 ? "Pass" : "Fail";

  const grade = score >= 85 ? "Excellent" : score >= 70 ? "Strong" : score >= 50 ? "Getting there" : "Needs work";
  const summary =
    score >= 85 ? "Recruiter-ready. Minor polish only." :
    score >= 70 ? "A good CV with a few clear wins left." :
    score >= 50 ? "The bones are here — fill the gaps below." :
    "Add the missing essentials to get this interview-ready.";

  const kwPool = new Set();
  const text = (cv.title + " " + cv.skills.join(" ") + " " + cv.summary).toLowerCase();
  [["docker", "Containerization"], ["aws", "Cloud"], ["python", "CI/CD"], ["linux", "Automation"],
   ["fastapi", "REST APIs"], ["sql", "Databases"], ["devops", "Infrastructure as Code"]]
    .forEach(([trigger, kw]) => { if (text.includes(trigger)) kwPool.add(kw); });
  if (cv.title) kwPool.add(cv.title);
  const keywords = [...kwPool].slice(0, 6);

  return { score, grade, summary, ats, ats_verdict, ats_issues, ats_passed, strengths, missing, suggestions, keywords, spelling: [], source: "local" };
}

export function shortErr(e) {
  const m = e && e.message ? e.message : String(e);
  if (/Failed to fetch|NetworkError|load failed/i.test(m))
    return "The request was blocked (likely the sandbox/CSP, or no internet). Run the app in your own dev server, not the preview.";
  if (/API_KEY_INVALID|API key not valid|400/i.test(m))
    return "The API key was rejected (invalid or wrong project).";
  if (/PERMISSION_DENIED|403/i.test(m))
    return "Permission denied — check the key has Gemini API access.";
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(m))
    return "Rate limit / quota hit. Wait a moment or check your free-tier limits.";
  if (/503|high demand|overloaded|unavailable/i.test(m))
    return "All Gemini models are currently overloaded. Showing offline results — try again in a minute.";
  if (/404|not found/i.test(m))
    return "Model name not found — try gemini-2.5-flash or gemini-2.5-flash-lite.";
  return m.slice(0, 180);
}
