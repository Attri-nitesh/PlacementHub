const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const JobDrive = require('../models/JobDrive');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { analyzeResumeGemini } = require('../services/geminiService');
const { parsePdfBuffer } = require('../services/pdfParserService');

/**
 * @desc    Analyze Candidate Resume for ATS Match Score before applying
 * @route   POST /api/ai/analyze-ats
 * @access  Private (Student)
 */
const analyzeAtsScore = async (req, res, next) => {
  try {
    const { jobDriveId, forceRefresh } = req.body;

    if (!jobDriveId) {
      return res.status(400).json({ success: false, message: 'Please provide a valid jobDriveId.' });
    }

    // 1. Verify Job Drive existence & status
    const jobDrive = await JobDrive.findById(jobDriveId);
    if (!jobDrive) {
      return res.status(404).json({ success: false, message: 'Job Drive not found.' });
    }

    if (jobDrive.status === 'Closed' || jobDrive.status === 'Archived') {
      return res.status(400).json({ success: false, message: 'Applications for this placement drive are closed.' });
    }

    // 2. Verify Student Resume existence
    let resume = await Resume.findOne({ user: req.user._id });
    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'No resume found. Please upload a PDF resume in the Resume Vault before analyzing ATS match.',
      });
    }

    // 3. Fallback: Parse PDF if parsedText is missing on legacy uploads
    if (!resume.parsedText || !resume.resumeHash) {
      const normalizedPath = (resume.fileUrl || '').replace(/^\//, '');
      const filePath = path.join(__dirname, '../../', normalizedPath);
      if (fs.existsSync(filePath)) {
        try {
          const buffer = fs.readFileSync(filePath);
          const parsed = await parsePdfBuffer(buffer);
          resume.parsedText = parsed.text;
          resume.resumeHash = parsed.hash;
          resume.parsedAt = new Date();
          await resume.save();
        } catch (pErr) {
          return res.status(422).json({
            success: false,
            message: 'Unable to extract text from your resume PDF. Please re-upload a text-selectable PDF file.',
          });
        }
      } else {
        return res.status(400).json({ success: false, message: 'Resume file not found on server storage. Please re-upload.' });
      }
    }

    // 4. Cache Verification Strategy via ResumeAnalysis Model (SHA-256 Hash & Version Check)
    let analysisDoc = await ResumeAnalysis.findOne({ user: req.user._id, jobDrive: jobDriveId });
    const isHashMatched = analysisDoc && analysisDoc.resumeHash === resume.resumeHash;
    const isVersionMatched = analysisDoc && analysisDoc.resumeVersion === (resume.resumeVersion || 1);
    const hasAtsData = analysisDoc && analysisDoc.atsAnalysis && typeof analysisDoc.atsAnalysis.overallScore === 'number';

    if (!forceRefresh && isHashMatched && isVersionMatched && hasAtsData) {
      const ats = analysisDoc.atsAnalysis;
      return res.status(200).json({
        success: true,
        schemaVersion: '1.0',
        analysis: {
          overallScore: ats.overallScore,
          scoreCategory: ats.scoreCategory,
          technicalSkillsScore: ats.technicalSkillsScore,
          projectsExperienceScore: ats.projectsExperienceScore,
          resumeStructureScore: ats.resumeStructureScore,
          matchedSkills: ats.matchedSkills,
          missingSkills: ats.missingSkills,
          suggestions: ats.suggestions,
          analysisSource: ats.analysisSource,
          confidence: ats.confidence,
          cached: true,
          analyzedAt: ats.analyzedAt,
        },
      });
    }

    // 5. Execute Gemini LLM Resume Intelligence Analysis
    const llmResult = await analyzeResumeGemini(resume.parsedText, jobDrive);

    // 6. Backend Mathematical Sub-Score & Overall Score Calculation
    const matchedSkills = llmResult.matchedSkills || [];
    const missingSkills = llmResult.missingSkills || [];
    const totalSkills = matchedSkills.length + missingSkills.length;
    const technicalSkillsScore = totalSkills > 0 ? Math.round((matchedSkills.length / totalSkills) * 100) : 100;

    const projectsExperienceScore = llmResult.projectsExperienceScore || 75;
    const resumeStructureScore = llmResult.resumeStructureScore || 80;

    // Backend Formula: 50% Technical + 35% Projects & Experience + 15% Resume Structure
    const overallScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          0.50 * technicalSkillsScore +
          0.35 * projectsExperienceScore +
          0.15 * resumeStructureScore
        )
      )
    );

    let scoreCategory = 'Moderate Match';
    if (overallScore >= 80) scoreCategory = 'High Match';
    else if (overallScore < 60) scoreCategory = 'Low Match';

    const atsPayload = {
      overallScore,
      scoreCategory,
      technicalSkillsScore,
      projectsExperienceScore,
      resumeStructureScore,
      matchedSkills,
      missingSkills,
      suggestions: llmResult.suggestions || [],
      analysisSource: llmResult.analysisSource || 'LLM_Gemini',
      confidence: llmResult.confidence || 0.90,
      analyzedAt: new Date(),
    };

    // 7. Persist or Update Analysis Document in ResumeAnalysis Collection
    if (analysisDoc) {
      analysisDoc.schemaVersion = '1.0';
      analysisDoc.resumeHash = resume.resumeHash;
      analysisDoc.resumeVersion = resume.resumeVersion || 1;
      analysisDoc.atsAnalysis = atsPayload;
      await analysisDoc.save();
    } else {
      analysisDoc = await ResumeAnalysis.create({
        user: req.user._id,
        jobDrive: jobDriveId,
        schemaVersion: '1.0',
        resumeHash: resume.resumeHash,
        resumeVersion: resume.resumeVersion || 1,
        atsAnalysis: atsPayload,
      });
    }

    // 8. Return Standardized Response
    res.status(200).json({
      success: true,
      schemaVersion: '1.0',
      analysis: {
        ...atsPayload,
        cached: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeAtsScore,
};
