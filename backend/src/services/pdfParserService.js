const pdfParse = require('pdf-parse');
const crypto = require('crypto');

/**
 * Extract plain text and compute SHA-256 hash from a PDF buffer.
 * @param {Buffer} fileBuffer 
 * @returns {Promise<{ text: string, hash: string }>}
 */
const parsePdfBuffer = async (fileBuffer) => {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error('Invalid file buffer provided for PDF parsing.');
  }

  // 1. Compute SHA-256 checksum
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  // 2. Parse text content using pdf-parse
  let rawText = '';
  try {
    const data = await pdfParse(fileBuffer);
    rawText = data.text || '';
  } catch (err) {
    throw new Error(`PDF parsing failed: ${err.message || 'Corrupted or unreadable PDF file.'}`);
  }

  // 3. Clean and sanitize extracted text
  const cleanedText = rawText
    .replace(/[\r\n]+/g, '\n')
    .replace(/[^\x20-\x7E\n\t]/g, ' ') // Remove non-printable ASCII
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanedText || cleanedText.length < 20) {
    throw new Error('Unable to extract readable text from PDF. Ensure the PDF contains selectable text (not scanned images).');
  }

  // Limit parsed text to first 25,000 characters for token efficiency
  const truncatedText = cleanedText.slice(0, 25000);

  return {
    text: truncatedText,
    hash,
  };
};

module.exports = {
  parsePdfBuffer,
};
