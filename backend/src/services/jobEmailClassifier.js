/**
 * Rule-Based Job Application Email Classifier (V1 - No Paid AI API Required)
 * Classifies recruitment emails into normalized stages with confidence scoring.
 */

// Configurable Confidence Thresholds
const THRESHOLDS = {
  HIGH: 0.85, // Automatic application creation / update
  MEDIUM: 0.6, // Stored as PENDING_REVIEW (no Kanban modification)
  LOW: 0.6, // Below 0.60 is IGNORED
};

// Marketing / Alert / Digest Regex Patterns
const MARKETING_REGEX = [
  /\b\d+\s+(tips|ways|hacks|advice|jobs|roles)\b/i,
  /\b(interview|resume|job|career)\s+(tips|advice|hacks|digest|newsletter)\b/i,
  /\b(jobs|roles)\s+(recommended|for you|matching|near you|picks)\b/i,
  /\b(job|career|hiring)\s+alert\b/i,
  /\b(weekly|daily)\s+(jobs|digest)\b/i,
  /\bhow\s+to\s+(prepare|ace|land|get)\b/i,
  /\b5\s+tips\b/i,
];

// Stage Specific Rules with Regex support
const STAGE_RULES = {
  OFFER: [
    { pattern: /offer\s+letter/i, weight: 0.95 },
    { pattern: /pleased\s+to\s+offer/i, weight: 0.95 },
    { pattern: /employment\s+offer/i, weight: 0.95 },
    { pattern: /job\s+offer/i, weight: 0.9 },
    { pattern: /offer\s+of\s+employment/i, weight: 0.95 },
    { pattern: /delighted\s+to\s+offer/i, weight: 0.95 },
    { pattern: /congratulations\s+on\s+your\s+offer/i, weight: 0.95 },
  ],
  REJECTED: [
    { pattern: /not\s+(?:be\s+)?moving\s+forward/i, weight: 0.95 },
    { pattern: /will\s+not\s+be\s+progressing/i, weight: 0.95 },
    { pattern: /application\s+unsuccessful/i, weight: 0.95 },
    { pattern: /regret\s+to\s+inform/i, weight: 0.95 },
    { pattern: /not\s+selected/i, weight: 0.85 },
    { pattern: /decided\s+not\s+to\s+(?:move|proceed)/i, weight: 0.95 },
    { pattern: /pursuing\s+other\s+candidates/i, weight: 0.9 },
    { pattern: /decided\s+to\s+proceed\s+with\s+other/i, weight: 0.95 },
    { pattern: /unfortunately/i, weight: 0.65 },
  ],
  INTERVIEW: [
    { pattern: /interview\s+invitation/i, weight: 0.95 },
    { pattern: /invite\s+you\s+to\s+interview/i, weight: 0.95 },
    { pattern: /schedule\s+(?:an|your)\s+interview/i, weight: 0.95 },
    { pattern: /interview\s+availability/i, weight: 0.85 },
    { pattern: /interview\s+scheduled/i, weight: 0.9 },
    { pattern: /technical\s+interview/i, weight: 0.85 },
    { pattern: /behavioral\s+interview/i, weight: 0.85 },
    { pattern: /invitation\s+to\s+interview/i, weight: 0.95 },
    { pattern: /invite\s+you\s+for\s+an\s+interview/i, weight: 0.95 },
  ],
  SHORTLISTED: [
    { pattern: /shortlisted/i, weight: 0.95 },
    { pattern: /selected\s+for\s+the\s+next\s+round/i, weight: 0.95 },
    { pattern: /moved\s+to\s+the\s+next\s+stage/i, weight: 0.95 },
    { pattern: /progressing\s+your\s+application/i, weight: 0.9 },
    { pattern: /advance\s+your\s+application/i, weight: 0.9 },
  ],
  ONLINE_ASSESSMENT: [
    { pattern: /online\s+assessment/i, weight: 0.95 },
    { pattern: /coding\s+assessment/i, weight: 0.95 },
    { pattern: /technical\s+assessment/i, weight: 0.95 },
    { pattern: /assessment\s+invitation/i, weight: 0.9 },
    { pattern: /complete\s+the\s+assessment/i, weight: 0.9 },
    { pattern: /coding\s+challenge/i, weight: 0.9 },
    { pattern: /hackerrank/i, weight: 0.9 },
    { pattern: /codility/i, weight: 0.9 },
  ],
  APPLIED: [
    { pattern: /thank\s+you\s+for\s+applying/i, weight: 0.95 },
    { pattern: /application\s+received/i, weight: 0.95 },
    { pattern: /we\s+received\s+your\s+application/i, weight: 0.95 },
    { pattern: /application\s+has\s+been\s+submitted/i, weight: 0.95 },
    { pattern: /successfully\s+applied/i, weight: 0.9 },
    { pattern: /we\s+have\s+received\s+your\s+application/i, weight: 0.95 },
    { pattern: /your\s+application\s+for/i, weight: 0.7 },
    { pattern: /your\s+application\s+to/i, weight: 0.7 },
  ],
};

// Hierarchy priority for breaking score ties or choosing specific lifecycle stages over generic APPLIED
const STAGE_PRIORITY = {
  OFFER: 6,
  REJECTED: 6,
  INTERVIEW: 5,
  SHORTLISTED: 4,
  ONLINE_ASSESSMENT: 3,
  APPLIED: 1,
  UNKNOWN: 0,
};

/**
 * Classifies email into a candidate recruitment event
 * @param {Object} emailData { subject, sender, senderEmail, plainTextBody }
 * @returns {Object} { isJobEmail, eventType, confidence, matchedSignals }
 */
const classifyJobEmail = ({ subject = '', sender = '', senderEmail = '', plainTextBody = '' }) => {
  const textSubject = subject.toLowerCase();
  const textBody = plainTextBody.toLowerCase();
  const textFull = `${textSubject}\n${textBody}`;

  // 1. Check for Marketing / Job Alert / Newsletter signals
  const isMarketing = MARKETING_REGEX.some((rgx) => rgx.test(textSubject) || rgx.test(textFull));
  if (isMarketing) {
    return {
      isJobEmail: false,
      eventType: 'UNKNOWN',
      confidence: 0,
      matchedSignals: ['MARKETING_REJECTED'],
    };
  }

  // 2. Evaluate stage candidate signals
  let bestStage = 'UNKNOWN';
  let maxScore = 0;
  let matchedSignals = [];

  for (const [stage, rules] of Object.entries(STAGE_RULES)) {
    let score = 0;
    const currentMatches = [];

    for (const rule of rules) {
      const matchSubj = rule.pattern.test(textSubject);
      const matchBody = rule.pattern.test(textBody);

      if (matchSubj || matchBody) {
        let ruleScore = rule.weight;
        if (matchSubj) {
          ruleScore = Math.min(1.0, ruleScore + 0.05);
        }
        if (ruleScore > score) {
          score = ruleScore;
        }
        currentMatches.push(rule.pattern.source);
      }
    }

    if (score > 0) {
      const isPriorityHigher =
        score > maxScore ||
        (Math.abs(score - maxScore) < 0.05 && STAGE_PRIORITY[stage] > STAGE_PRIORITY[bestStage]);

      if (isPriorityHigher) {
        maxScore = score;
        bestStage = stage;
        matchedSignals = currentMatches;
      }
    }
  }

  const isJobEmail = maxScore >= THRESHOLDS.LOW && bestStage !== 'UNKNOWN';

  return {
    isJobEmail,
    eventType: isJobEmail ? bestStage : 'UNKNOWN',
    confidence: Number(maxScore.toFixed(2)),
    matchedSignals,
  };
};

module.exports = {
  classifyJobEmail,
  THRESHOLDS,
};
