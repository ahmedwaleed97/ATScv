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

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(503).json({ error: "AI review not configured on this server." });
  }

  const { text } = req.body || {};
  if (!text || typeof text !== "string" || text.trim().length < 20) {
    return res.status(400).json({ error: "Missing or too-short CV text." });
  }

  const trimmed = text.slice(0, 8000);

  let lastErr;
  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: GEMINI_SYSTEM }] },
          contents: [{ parts: [{ text: trimmed }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
        }),
      });
      if (!r.ok) {
        const e = new Error(await r.text());
        e.status = r.status;
        throw e;
      }
      const data = await r.json();
      const out = JSON.parse(data.candidates[0].content.parts[0].text);
      return res.status(200).json({
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
      });
    } catch (e) {
      lastErr = e;
      if (e.status !== 503 && e.status !== 429) break;
    }
  }

  res.status(lastErr?.status || 500).json({ error: lastErr?.message || "Review failed." });
}
