export const SEARCH_VOCABULARY: Record<string, string[]> = {
  "Furniture Assembly": ["assemble furniture", "furniture assembler", "put together furniture", "put together dresser", "assemble dresser", "ikea assembly", "ikea furniture", "build furniture", "dresser assembly", "desk assembly", "bed assembly"],
  "Junk Removal": ["haul away furniture", "haul away junk", "junk hauling", "trash removal", "trash pickup", "get rid of couch", "remove old furniture", "debris removal", "cleanout", "clean out"],
  "TV Mounting": ["mount tv", "tv installer", "tv installation", "hang tv", "wall mount tv", "television mounting", "mount television"],
  "Handyman": ["handy man", "odd jobs", "small repairs", "minor repairs", "home repairs", "fix things around house"],
  "House Cleaning": ["house cleaner", "home cleaning", "clean my house", "maid", "maid service", "residential cleaning"],
  "Deep Cleaning": ["deep clean", "heavy cleaning", "spring cleaning", "thorough cleaning"],
  "Move-Out Cleaning": ["move out cleaner", "moving cleaning", "end of lease cleaning", "vacant home cleaning"],
  "Auto Detailing": ["car detailing", "car detailer", "detail my car", "vehicle detailing", "mobile detailing", "mobile car detailing", "car cleaning at my house"],
  "Notary": ["notary public", "mobile notary", "notarize", "notarization", "notary at my house"],
  "Dog Walker": ["dog walking", "walk my dog", "pet walking", "someone to walk my dog"],
  "Dog Grooming": ["dog groomer", "pet grooming", "mobile dog grooming", "mobile groomer"],
  "DJ": ["disc jockey", "party dj", "wedding dj", "event dj", "mobile dj"],
  "Bartending": ["bartender", "mobile bartender", "party bartender", "event bartender", "wedding bartender"],
  "Bookkeeping": ["bookkeeper", "remote bookkeeper", "virtual bookkeeper", "online bookkeeping", "books for my business"],
  "Virtual Assistant": ["virtual assistant", "remote assistant", "online assistant", "va", "administrative assistant", "admin help", "remote admin"],
  "Administrative Support": ["admin support", "administrative help", "office help", "remote admin", "virtual admin"],
  "Tutoring": ["tutor", "online tutor", "virtual tutor", "remote tutor", "help with school", "homework help"],
  "Math Tutoring": ["math tutor", "math help", "help with math", "online math tutor"],
  "Tax Preparation": ["tax prep", "prepare my taxes", "tax preparer", "file my taxes", "tax help"],
  "Lawn Care": ["cut my grass", "mow lawn", "lawn mowing", "yard work", "grass cutting", "mobile lawn service"],
  "Moving Help": ["help me move", "movers", "moving labor", "load moving truck", "unload moving truck"],
};

const STOP_WORDS = new Set(["i","a","an","the","to","for","of","my","me","someone","somebody","need","want","looking","find","who","can","please","person","that","with"]);
const DELIVERY_WORDS = new Set(["mobile","onsite","on-site","remote","virtual","online","phone"]);

export function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

export function coreServiceQuery(value: string) {
  return normalizeSearch(value)
    .split(" ")
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word) && !DELIVERY_WORDS.has(word))
    .join(" ")
    .trim();
}

function usefulTokens(value: string) {
  return coreServiceQuery(value).split(" ").filter(Boolean);
}

export function aliasesForService(serviceName: string) {
  const normalizedName = normalizeSearch(serviceName);
  const exact = Object.entries(SEARCH_VOCABULARY).find(([name]) => normalizeSearch(name) === normalizedName);
  if (exact) return exact[1];

  const partial = Object.entries(SEARCH_VOCABULARY).find(([name]) => {
    const n = normalizeSearch(name);
    return n.includes(normalizedName) || normalizedName.includes(n);
  });
  return partial?.[1] || [];
}

export function textMatchesService(query: string, serviceName: string) {
  const q = normalizeSearch(query);
  const name = normalizeSearch(serviceName);
  if (!q) return true;
  if (name.includes(q) || q.includes(name)) return true;

  const phrases = [serviceName, ...aliasesForService(serviceName)].map(normalizeSearch);
  if (phrases.some((phrase) => phrase && (q.includes(phrase) || phrase.includes(q)))) return true;

  const queryTokens = usefulTokens(q);
  if (!queryTokens.length) return false;
  return phrases.some((phrase) => {
    const phraseTokens = usefulTokens(phrase);
    if (!phraseTokens.length) return false;
    const overlap = queryTokens.filter((token) => phraseTokens.some((p) => p === token || (p.length >= 5 && (p.startsWith(token) || token.startsWith(p))))).length;
    return overlap >= Math.min(2, queryTokens.length) && overlap / queryTokens.length >= 0.5;
  });
}

export function queryRequestsRemote(query: string) {
  const q = normalizeSearch(query);
  return /\b(remote|virtual|online|phone)\b/.test(q);
}

export function queryRequestsMobile(query: string) {
  const q = normalizeSearch(query);
  return /\b(mobile|on-site|onsite|at my house|at my home|come to me)\b/.test(q);
}
