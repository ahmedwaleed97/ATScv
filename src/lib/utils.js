export const lines = (s) => (s || "").split("\n").map((x) => x.trim()).filter(Boolean);
export const words = (s) => (s || "").trim().split(/\s+/).filter(Boolean).length;
export const prefixUrl = (u) => (!u ? "#" : /^https?:\/\//i.test(u) ? u : `https://${u}`);
