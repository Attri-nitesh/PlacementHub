/**
 * Job Email Information Parser
 * Extracts Company Name, Job Title, and External Application IDs from recruitment emails.
 */

// Known ATS domains that should NOT be used as company names
const ATS_DOMAINS = [
  'myworkday.com',
  'workday.com',
  'greenhouse.io',
  'lever.co',
  'ashbyhq.com',
  'smartrecruiters.com',
  'icims.com',
  'bamboohr.com',
  'jobvite.com',
  'taleo.net',
  'successfactors.com',
];

// Public/Generic email domains to ignore for company name extraction
const GENERIC_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'mail.com',
];

// Generic word blacklist that must NEVER be returned as a company name
const GENERIC_COMPANY_BLACKLIST = new Set([
  'the', 'a', 'an', 'your', 'our', 'my', 'this', 'that', 'these', 'those',
  'team', 'hiring', 'application', 'applications', 'position', 'positions',
  'role', 'roles', 'company', 'companies', 'recruitment', 'recruiter', 'recruiting',
  'placement', 'hub', 'career', 'careers', 'job', 'jobs', 'candidate',
  'applicant', 'student', 'university', 'opportunity', 'update', 'status',
  'notice', 'information', 'regret', 'interest', 'process', 'stage',
  'round', 'interview', 'assessment', 'offer', 'rejection', 'confirmation',
  'portal', 'system', 'platform', 'workday', 'greenhouse', 'lever', 'ashby',
  'smartrecruiters', 'icims', 'bamboohr', 'jobvite', 'taleo', 'successfactors',
  'no-reply', 'noreply', 'support', 'admin', 'notifications', 'notification',
  'human', 'resources', 'global', 'technologies', 'solutions', 'systems',
]);

// Common employer suffixes to strip for clean display names
const SUFFIX_CLEANUP_REGEX = /\s+(careers|recruitment|talent acquisition|jobs|team|hr|hiring|inc\.?|llc\.?|corp\.?|corporation|pvt\.?\s*ltd\.?|ltd\.?|group|technologies|solutions|systems)$/i;

/**
 * Validates whether a candidate string is a real company name
 */
const isValidCompanyName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const cleaned = name.trim().toLowerCase();
  if (cleaned.length < 2 || cleaned.length > 40) return false;
  if (GENERIC_COMPANY_BLACKLIST.has(cleaned)) return false;

  const words = cleaned.split(/\s+/);
  const nonBlacklistedWords = words.filter((w) => !GENERIC_COMPANY_BLACKLIST.has(w));
  if (nonBlacklistedWords.length === 0) return false;

  return true;
};

/**
 * Extracts Company Name using ATS detection, body regex, display name, and domain analysis
 */
const extractCompany = ({ subject = '', sender = '', senderEmail = '', plainTextBody = '' }) => {
  const fullText = `${subject}\n${plainTextBody}`;

  // 1. Contextual Company Regex Patterns in Subject/Body
  const companyPatterns = [
    /(?:position|role|job|application)\s+(?:at|with)\s+([A-Z0-9][A-Za-z0-9\s&\.\-]{1,30}?)(?:\.|\,|\s+team|\s+hiring|\s+for|\n|$)/i,
    /for\s+(?:the\s+)?[^.]+?\s+(?:position|role)\s+at\s+([A-Z0-9][A-Za-z0-9\s&\.\-]{1,30}?)(?:\.|\,|\n|$)/i,
    /thank\s+you\s+for\s+applying\s+(?:to|for\s+(?:the\s+)?[^.]+?\s+at)\s+([A-Z0-9][A-Za-z0-9\s&\.\-]{1,30}?)(?:\.|\s+for|\s+position|\s+role|\s+team|\n|$)/i,
    /([A-Z0-9][A-Za-z0-9\s&\.\-]{1,30}?)\s+(?:hiring|recruitment|talent|careers|team|jobs)/i,
    /application\s+(?:to|with)\s+([A-Z0-9][A-Za-z0-9\s&\.\-]{1,30}?)(?:\s+has|\s+is|\s+was|\s+for|\n|$)/i,
    /interview\s+with\s+([A-Z0-9][A-Za-z0-9\s&\.\-]{1,30}?)(?:\.|\s+for|\n|$)/i,
    /offer\s+from\s+([A-Z0-9][A-Za-z0-9\s&\.\-]{1,30}?)(?:\.|\s+for|\n|$)/i,
  ];

  for (const pattern of companyPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (isValidCompanyName(candidate) && !isATSOrGeneric(candidate)) {
        return cleanCompanyName(candidate);
      }
    }
  }

  // 2. Sender Display Name Analysis (e.g. "Amazon Jobs <no-reply@amazon.com>")
  if (sender && sender.length > 1 && !sender.includes('@')) {
    const cleanedSender = cleanCompanyName(sender);
    if (isValidCompanyName(cleanedSender) && !isATSOrGeneric(cleanedSender)) {
      return cleanedSender;
    }
  }

  // 3. Sender Email Domain Analysis (e.g. "careers@adobe.com" -> "Adobe")
  if (senderEmail && senderEmail.includes('@')) {
    const domain = senderEmail.split('@')[1];
    if (domain && !ATS_DOMAINS.includes(domain) && !GENERIC_DOMAINS.includes(domain)) {
      const domainName = domain.split('.')[0];
      if (domainName && isValidCompanyName(domainName)) {
        return capitalizeWord(domainName);
      }
    }
  }

  return 'Unknown Company';
};

/**
 * Extracts Job Title / Role Name from Subject or Body
 */
const extractJobTitle = ({ subject = '', plainTextBody = '' }) => {
  const fullText = `${subject}\n${plainTextBody}`;

  // Check for explicit standard tech role in subject or body first
  const commonRoleMatches = fullText.match(
    /(Software Engineer Intern|Associate Software Engineer|Full Stack Developer|Frontend Engineer|Backend Engineer|Data Analyst|Data Scientist|DevOps Engineer|Product Manager|QA Engineer|Systems Engineer|UI\/UX Designer|Cloud Architect|Security Engineer|Software Engineer)(\s+Intern|\s+Junior|\s+Senior|\s+Lead)?/i
  );
  if (commonRoleMatches) {
    return commonRoleMatches[0].trim();
  }

  const titlePatterns = [
    /(?:for|position|role)\s+of\s+(?:a\s+|the\s+)?([A-Za-z0-9\s\/\-\#\+]{3,40}?)(?:\s+at|\s+with|\s+position|\s+role|\.|\n|$)/i,
    /applying\s+for\s+(?:the\s+)?([A-Za-z0-9\s\/\-\#\+]{3,40}?)\s+(?:position|role|at|with|\.|\n|$)/i,
    /for\s+the\s+([A-Za-z0-9\s\/\-\#\+]{3,40}?)\s+(?:position|role)/i,
    /([A-Za-z0-9\s\/\-\#\+]{3,40}?)\s+position\s+at/i,
    /([A-Za-z0-9\s\/\-\#\+]{3,40}?)\s+role\s+at/i,
    /application\s+(?:for|received:?)\s+([A-Za-z0-9\s\/\-\#\+]{3,40}?)(?:\s+at|\s+-\s+|\.|\n|$)/i,
  ];

  for (const pattern of titlePatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (
        candidate.length >= 3 &&
        candidate.length <= 50 &&
        !/thank you|application|received|welcome|congratulations/i.test(candidate)
      ) {
        return cleanJobTitle(candidate);
      }
    }
  }

  return 'Software Engineer';
};

/**
 * Extracts Requisition or Application ID if present
 */
const extractExternalAppId = ({ subject = '', plainTextBody = '' }) => {
  const fullText = `${subject}\n${plainTextBody}`;
  const reqMatch = fullText.match(
    /(?:Application|Req|Requisition|Job|Candidate)\s*(?:ID|Num|Number|\#|Code)[\s\:\#]*([A-Za-z0-9\-]{3,20})/i
  );
  return reqMatch ? reqMatch[1].trim() : null;
};

/**
 * Normalizes title by expanding common role acronyms (SDE, SWE, SE, FTE, OA)
 */
const expandTitleAcronyms = (str) => {
  if (!str) return '';
  let text = str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

  // Replace acronyms as standalone words
  text = text
    .replace(/\bsde\b/g, 'software engineer')
    .replace(/\bswe\b/g, 'software engineer')
    .replace(/\bse\b/g, 'software engineer')
    .replace(/\bsoftware development engineer\b/g, 'software engineer')
    .replace(/\bfte\b/g, 'full time')
    .replace(/\boa\b/g, 'online assessment');

  return text.trim();
};

/**
 * Calculates Token Similarity & Role Guards between two Job Title strings
 * Handles acronym expansion (SDE == Software Engineer) and guards against merging different roles.
 */
const calculateTitleSimilarity = (titleA, titleB) => {
  if (!titleA || !titleB) return 0;

  const expandedA = expandTitleAcronyms(titleA);
  const expandedB = expandTitleAcronyms(titleB);

  if (expandedA === expandedB) return 1.0;

  // Seniority & Role Type Guards
  const internA = /\bintern\b|\binternship\b/.test(expandedA);
  const internB = /\bintern\b|\binternship\b/.test(expandedB);
  if (internA !== internB) return 0.0;

  const seniorA = /\bsenior\b|\bsr\b|\blead\b|\bprincipal\b/.test(expandedA);
  const seniorB = /\bsenior\b|\bsr\b|\blead\b|\bprincipal\b/.test(expandedB);
  if (seniorA !== seniorB) return 0.0;

  // Domain Guards (Data Analyst vs Software Engineer vs Product Manager)
  const isDataA = /\bdata\b|\banalyst\b|\banalytics\b/.test(expandedA);
  const isDataB = /\bdata\b|\banalyst\b|\banalytics\b/.test(expandedB);
  if (isDataA !== isDataB) return 0.0;

  const isPmA = /\bproduct\s+manager\b|\bpm\b/.test(expandedA);
  const isPmB = /\bproduct\s+manager\b|\bpm\b/.test(expandedB);
  if (isPmA !== isPmB) return 0.0;

  // Stop words to strip out noise like "drive", "hybrid", "position", "role"
  const NOISE_WORDS = new Set(['position', 'role', 'drive', 'the', 'for', 'and', 'hybrid', 'full', 'time', 'opening', 'job']);

  const tokensA = new Set(expandedA.split(/\s+/).filter((t) => t.length > 1 && !NOISE_WORDS.has(t)));
  const tokensB = new Set(expandedB.split(/\s+/).filter((t) => t.length > 1 && !NOISE_WORDS.has(t)));

  if (tokensA.size === 0 || tokensB.size === 0) return 0.0;

  let intersection = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersection++;
  }

  const union = new Set([...tokensA, ...tokensB]).size;
  return Number((intersection / union).toFixed(2));
};

/**
 * Normalizes string for database matching (lowercase, strip punctuation, strip company suffixes)
 */
const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(SUFFIX_CLEANUP_REGEX, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Helpers
const isATSOrGeneric = (name) => {
  const lower = name.toLowerCase();
  return (
    GENERIC_COMPANY_BLACKLIST.has(lower) ||
    ATS_DOMAINS.some((d) => lower.includes(d.split('.')[0])) ||
    GENERIC_DOMAINS.some((d) => lower.includes(d.split('.')[0])) ||
    ['workday', 'greenhouse', 'lever', 'ashby', 'smartrecruiters', 'icims', 'jobs', 'careers', 'recruitment', 'no-reply', 'noreply'].includes(lower)
  );
};

const cleanCompanyName = (name) => {
  let cleaned = name.replace(SUFFIX_CLEANUP_REGEX, '').trim();
  return capitalizeWord(cleaned);
};

const cleanJobTitle = (title) => {
  return title
    .replace(/^(next round for the|pleased to offer you the|offer you the|round for the|the|a|an)\s+/i, '')
    .replace(/\s+(at|with|for|position|role)$/i, '')
    .trim();
};

const capitalizeWord = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

module.exports = {
  extractCompany,
  extractJobTitle,
  extractExternalAppId,
  calculateTitleSimilarity,
  expandTitleAcronyms,
  normalizeString,
  isValidCompanyName,
};
