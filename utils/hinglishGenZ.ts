// utils/hinglishGenZ.ts

// 1. Remove emojis and symbols
function cleanText(text: string): string {
  // Remove emojis and most symbols
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{Punctuation}\p{Symbol}]+/gu, '')
             .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@[\\\]^_`{|}~]/g, '')
             .replace(/\s{2,}/g, ' ')
             .trim();
}

// 2. Rewrite in Hinglish Gen-Z style (simple rule-based, can be improved with LLM)
function toHinglishGenZ(text: string): string {
  // Example replacements, expand as needed
  let t = text.toLowerCase();
  t = t.replace(/\bhello\b|\bhi\b/g, "hey bestie");
  t = t.replace(/\bhow are you\b/g, "kya chal raha hai?");
  t = t.replace(/\bwhat's up\b/g, "wassup yaar?");
  t = t.replace(/\bare you\b/g, "tu");
  t = t.replace(/\byou\b/g, "tu");
  t = t.replace(/\bfriend\b/g, "yaar");
  t = t.replace(/\bplease\b/g, "plz");
  t = t.replace(/\bbrother\b/g, "bhai");
  t = t.replace(/\bsister\b/g, "behen");
  t = t.replace(/\bvery\b/g, "bhot");
  t = t.replace(/\bgood\b/g, "mast");
  t = t.replace(/\bbad\b/g, "bakwaas");
  t = t.replace(/\bokay\b|\bok\b/g, "thik hai");
  t = t.replace(/\bno\b/g, "na yaar");
  t = t.replace(/\byes\b/g, "haan bro");
  t = t.replace(/\bthank you\b/g, "shukriya yaar");
  // Add Gen-Z fillers
  t = "umm, " + t + " lol";
  // Capitalize first letter
  t = t.charAt(0).toUpperCase() + t.slice(1);
  return t;
}

// 3. Main function to process user message
export function processUserMessage(
  userMessage: string,
  conversationHistory: Array<{ user: string; bot: string }>
): { hinglish: string; clean: string; updatedHistory: Array<{ user: string; bot: string }> } {
  const clean = cleanText(userMessage);
  const hinglish = toHinglishGenZ(clean);

  // Store in history (add your bot response logic as needed)
  const updatedHistory = [...conversationHistory, { user: userMessage, bot: hinglish }];

  return { hinglish, clean, updatedHistory };
}
