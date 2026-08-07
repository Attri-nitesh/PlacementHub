const { GoogleGenAI } = require('@google/genai');
const { analyzeHeuristic } = require('./heuristicAtsService');

/**
 * Mask PII (emails, phone numbers) before passing text to external API
 * @param {string} text 
 * @returns {string}
 */
const maskPii = (text) => {
  if (!text) return '';
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[STUDENT_EMAIL_REDACTED]')
    .replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE_REDACTED]');
};

/**
 * Execute LLM Analysis via Gemini 1.5 Flash API
 * Returns sub-scores and skill matrices (Backend computes final overall score).
 */
const analyzeResumeGemini = async (resumeText, jobDrive) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback to Heuristic Engine if API key is not configured
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_GEMINI')) {
    console.warn('AI Resume Intelligence: GEMINI_API_KEY not configured. Falling back to Heuristic Engine.');
    const heuristicResult = analyzeHeuristic(resumeText, jobDrive);
    return {
      ...heuristicResult,
      analysisSource: 'Heuristic_Engine',
    };
  }

  const maskedText = maskPii(resumeText);
  const prompt = `
You are the AI Resume Intelligence Analyzer for PlacementHub.
Evaluate the following candidate's resume text against the Job Drive criteria.

JOB DRIVE CRITERIA:
Company: ${jobDrive.companyName || 'Corporate Partner'}
Role Title: ${jobDrive.roleTitle}
Required Skills: ${JSON.stringify(jobDrive.skillsRequired || [])}
Job Description: ${jobDrive.description || ''}

CANDIDATE RESUME TEXT:
<resume_content>
${maskedText}
</resume_content>

STRICT INSTRUCTIONS:
1. Compare the candidate's resume text against the Required Skills list.
2. Return matchedSkills (skills explicitly present in resume) and missingSkills (required skills missing from resume).
3. Evaluate projectsExperienceScore (0 to 100) based on project relevance and tech stack alignment.
4. Evaluate resumeStructureScore (0 to 100) based on section organization and bullet-point clarity.
5. Provide 2-4 actionable suggestions for improvement.
6. Estimate confidence score (0.0 to 1.0).
7. Do NOT calculate the final overall ATS score.
8. Output ONLY a valid JSON object matching the schema below. No markdown wrapping or conversational text.

SCHEMA REQUIRED:
{
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3"],
  "projectsExperienceScore": 85,
  "resumeStructureScore": 90,
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "confidence": 0.95
}
`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    let responseText = response.text ? response.text.trim() : '';

    // Sanitize Gemini responses by removing markdown wrappers
    responseText = responseText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    // Clean JSON response (fallback regex extraction)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const targetJsonString = jsonMatch ? jsonMatch[0] : responseText;

    if (!targetJsonString) {
      throw new Error('Gemini API returned non-JSON response structure.');
    }

    const parsedJson = JSON.parse(targetJsonString);

    return {
      matchedSkills: Array.isArray(parsedJson.matchedSkills) ? parsedJson.matchedSkills : [],
      missingSkills: Array.isArray(parsedJson.missingSkills) ? parsedJson.missingSkills : [],
      projectsExperienceScore: typeof parsedJson.projectsExperienceScore === 'number' ? Math.min(100, Math.max(0, parsedJson.projectsExperienceScore)) : 75,
      resumeStructureScore: typeof parsedJson.resumeStructureScore === 'number' ? Math.min(100, Math.max(0, parsedJson.resumeStructureScore)) : 80,
      suggestions: Array.isArray(parsedJson.suggestions) ? parsedJson.suggestions : [],
      confidence: typeof parsedJson.confidence === 'number' ? parsedJson.confidence : 0.90,
      analysisSource: 'LLM_Gemini',
    };
  } catch (err) {
    console.error('AI Resume Intelligence: Gemini API execution failed. Falling back to Heuristic Engine:', err.message);
    const heuristicResult = analyzeHeuristic(resumeText, jobDrive);
    return {
      ...heuristicResult,
      analysisSource: 'Heuristic_Engine',
    };
  }
};

module.exports = {
  analyzeResumeGemini,
};
