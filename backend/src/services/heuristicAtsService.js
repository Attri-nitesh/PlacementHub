/**
 * Heuristic ATS Analysis Engine (Deterministic Rule-Based Fallback)
 * Evaluates skill overlap, project relevance, and structure when Gemini LLM API is unavailable.
 */

const analyzeHeuristic = (resumeText, jobDrive) => {
  const textLower = (resumeText || '').toLowerCase();
  const requiredSkills = jobDrive.skillsRequired || [];
  const roleTitle = (jobDrive.roleTitle || '').toLowerCase();
  const description = (jobDrive.description || '').toLowerCase();

  // 1. Skill Overlap Extraction
  const matchedSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((skill) => {
    const sLower = skill.toLowerCase().trim();
    if (sLower && textLower.includes(sLower)) {
      matchedSkills.push(skill);
    } else if (sLower) {
      missingSkills.push(skill);
    }
  });

  // 2. Technical Skills Sub-Score Calculation
  const totalSkillsCount = matchedSkills.length + missingSkills.length;
  const technicalSkillsScore = totalSkillsCount > 0
    ? Math.round((matchedSkills.length / totalSkillsCount) * 100)
    : 100;

  // 3. Projects & Experience Sub-Score Evaluation
  let projectsScore = 65; // Base default
  if (textLower.includes('project') || textLower.includes('github') || textLower.includes('live')) {
    projectsScore += 15;
  }
  if (textLower.includes('intern') || textLower.includes('experience') || textLower.includes('developer')) {
    projectsScore += 10;
  }
  if (roleTitle && textLower.includes(roleTitle.split(' ')[0])) {
    projectsScore += 10;
  }
  const projectsExperienceScore = Math.min(100, projectsScore);

  // 4. Resume Structure & Section Check
  let structureScore = 70;
  const commonSections = ['education', 'skills', 'projects', 'experience', 'certifications', 'contact'];
  commonSections.forEach((sec) => {
    if (textLower.includes(sec)) structureScore += 5;
  });
  const resumeStructureScore = Math.min(100, structureScore);

  // 5. Actionable Suggestions Generation
  const suggestions = [];
  if (missingSkills.length > 0) {
    suggestions.push(`Incorporate missing required technical keywords: ${missingSkills.slice(0, 3).join(', ')}.`);
  }
  if (!textLower.includes('project')) {
    suggestions.push('Add a dedicated Projects section with quantifiable outcomes and tech stacks.');
  }
  if (!textLower.includes('github') && !textLower.includes('linkedin')) {
    suggestions.push('Link your GitHub and LinkedIn profiles at the top of your resume.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Your resume content aligns well with the job requirements. Keep formatting clean and bullet points concise.');
  }

  return {
    matchedSkills,
    missingSkills,
    projectsExperienceScore,
    resumeStructureScore,
    suggestions,
    confidence: 0.80,
  };
};

module.exports = {
  analyzeHeuristic,
};
