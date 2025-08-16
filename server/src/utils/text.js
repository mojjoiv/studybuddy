export const cleanText = (t) =>
  (t || "")
    .replace(/\r/g, " ")
    .replace(/\t/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
