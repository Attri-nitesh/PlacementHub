/**
 * Gmail Message Payload Normalizer
 * Decodes Gmail API raw message structures into clean plain text and headers.
 */

// Decode Base64 / Base64URL string safely
const decodeBase64 = (data) => {
  if (!data) return '';
  try {
    // Replace base64url characters if needed and decode UTF-8
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf8');
  } catch (err) {
    return '';
  }
};

// Convert HTML content into clean readable text
const htmlToText = (html) => {
  if (!html) return '';

  let text = html;
  // Remove script and style blocks
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Replace line breaks and paragraphs with spaces/newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/tr>/gi, '\n');
  text = text.replace(/<\/li>/gi, '\n');

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&ndash;/gi, '-')
    .replace(/&mdash;/gi, '--');

  // Normalize excessive whitespace while preserving single newlines
  text = text
    .split('\n')
    .map((line) => line.trim().replace(/[ \t]+/g, ' '))
    .filter((line, idx, arr) => line.length > 0 || (idx > 0 && arr[idx - 1].length > 0))
    .join('\n');

  return text.trim();
};

// Recursively traverse MIME parts to extract plain text and html content
const extractBodyParts = (part, result = { plain: '', html: '' }) => {
  if (!part) return result;

  if (part.mimeType === 'text/plain' && part.body && part.body.data) {
    result.plain += decodeBase64(part.body.data) + '\n';
  } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
    result.html += decodeBase64(part.body.data) + '\n';
  }

  if (part.parts && Array.isArray(part.parts)) {
    for (const subPart of part.parts) {
      extractBodyParts(subPart, result);
    }
  }

  return result;
};

/**
 * Parses raw Gmail API message response into a clean normalized object
 */
const normalizeGmailMessage = (messageData) => {
  if (!messageData || !messageData.payload) {
    return {
      gmailMessageId: messageData?.id || '',
      gmailThreadId: messageData?.threadId || '',
      subject: '',
      sender: '',
      senderEmail: '',
      receivedAt: new Date(),
      plainTextBody: '',
      snippet: messageData?.snippet || '',
      labelIds: messageData?.labelIds || [],
      gmailSource: 'INBOX',
    };
  }

  const headers = messageData.payload.headers || [];

  const getHeader = (name) => {
    const found = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
    return found ? found.value : '';
  };

  const subject = getHeader('Subject');
  const fromHeader = getHeader('From');
  const dateHeader = getHeader('Date');

  const labelIds = messageData.labelIds || [];
  let gmailSource = 'INBOX';
  if (labelIds.includes('SPAM')) {
    gmailSource = 'SPAM';
  } else if (labelIds.includes('INBOX')) {
    gmailSource = 'INBOX';
  } else if (labelIds.length > 0) {
    gmailSource = labelIds.join(', ');
  }

  // Parse sender display name and email address from "Display Name <email@domain.com>"
  let sender = fromHeader;
  let senderEmail = fromHeader;

  const emailMatch = fromHeader.match(/(.*?)\s*<([^>]+)>/);
  if (emailMatch) {
    sender = emailMatch[1].replace(/^["']|["']$/g, '').trim() || emailMatch[2];
    senderEmail = emailMatch[2].trim().toLowerCase();
  } else {
    senderEmail = fromHeader.trim().toLowerCase();
    sender = senderEmail;
  }

  let receivedAt = dateHeader ? new Date(dateHeader) : new Date();
  if (isNaN(receivedAt.getTime())) {
    receivedAt = messageData.internalDate ? new Date(Number(messageData.internalDate)) : new Date();
  }

  // Extract body content
  let bodyContent = '';
  if (messageData.payload.body && messageData.payload.body.data) {
    const rawData = decodeBase64(messageData.payload.body.data);
    if (messageData.payload.mimeType === 'text/html') {
      bodyContent = htmlToText(rawData);
    } else {
      bodyContent = rawData;
    }
  }

  if (!bodyContent && messageData.payload.parts) {
    const partsResult = extractBodyParts(messageData.payload);
    if (partsResult.plain && partsResult.plain.trim().length > 0) {
      bodyContent = partsResult.plain.trim();
    } else if (partsResult.html) {
      bodyContent = htmlToText(partsResult.html);
    }
  }

  if (!bodyContent) {
    bodyContent = messageData.snippet || '';
  }

  return {
    gmailMessageId: messageData.id,
    gmailThreadId: messageData.threadId,
    subject,
    sender,
    senderEmail,
    receivedAt,
    plainTextBody: bodyContent,
    snippet: messageData.snippet || '',
    labelIds,
    gmailSource,
  };
};

module.exports = {
  normalizeGmailMessage,
  htmlToText,
  decodeBase64,
};
