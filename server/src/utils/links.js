export const extractLinks = (text) => {
    if (!text) return [];
    const matches = text.match(/https?:\/\/[^\s)]+/g) || [];
    return matches.map(s => s.replace(/[),.;:!?]+$/, ""));
  };
  