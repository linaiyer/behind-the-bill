// Comprehensive HTML entity decoder for news articles

export function decodeHtmlEntities(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Decode numeric entities first (like &#8220;, &#8221;, etc.)
  text = text.replace(/&#(\d+);/g, (_, dec) => {
    return String.fromCharCode(dec);
  });

  // Decode hexadecimal entities (like &#x2019;)
  text = text.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  // Common named HTML entities
  const entities: Record<string, string> = {
    // Quotes and apostrophes
    '&quot;': '"',
    '&apos;': "'",
    '&lsquo;': "'", // Left single quotation mark
    '&rsquo;': "'", // Right single quotation mark
    '&ldquo;': '"', // Left double quotation mark
    '&rdquo;': '"', // Right double quotation mark
    '&sbquo;': '‚', // Single low-9 quotation mark
    '&bdquo;': '„', // Double low-9 quotation mark
    
    // Basic HTML entities
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    
    // Dashes and hyphens
    '&ndash;': '–', // En dash
    '&mdash;': '—', // Em dash
    '&minus;': '−', // Minus sign
    '&shy;': '', // Soft hyphen (remove)
    
    // Ellipsis and dots
    '&hellip;': '…', // Horizontal ellipsis
    '&middot;': '·', // Middle dot
    '&bull;': '•', // Bullet
    
    // Spaces and breaks
    '&ensp;': ' ', // En space
    '&emsp;': ' ', // Em space
    '&thinsp;': ' ', // Thin space
    '&zwnj;': '', // Zero width non-joiner (remove)
    '&zwj;': '', // Zero width joiner (remove)
    
    // Currency and symbols
    '&cent;': '¢',
    '&pound;': '£',
    '&curren;': '¤',
    '&yen;': '¥',
    '&euro;': '€',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&deg;': '°',
    '&plusmn;': '±',
    '&sup1;': '¹',
    '&sup2;': '²',
    '&sup3;': '³',
    '&frac14;': '¼',
    '&frac12;': '½',
    '&frac34;': '¾',
    
    // Accented characters
    '&agrave;': 'à', '&aacute;': 'á', '&acirc;': 'â', '&atilde;': 'ã',
    '&auml;': 'ä', '&aring;': 'å', '&aelig;': 'æ', '&ccedil;': 'ç',
    '&egrave;': 'è', '&eacute;': 'é', '&ecirc;': 'ê', '&euml;': 'ë',
    '&igrave;': 'ì', '&iacute;': 'í', '&icirc;': 'î', '&iuml;': 'ï',
    '&eth;': 'ð', '&ntilde;': 'ñ', '&ograve;': 'ò', '&oacute;': 'ó',
    '&ocirc;': 'ô', '&otilde;': 'õ', '&ouml;': 'ö', '&oslash;': 'ø',
    '&ugrave;': 'ù', '&uacute;': 'ú', '&ucirc;': 'û', '&uuml;': 'ü',
    '&yacute;': 'ý', '&thorn;': 'þ', '&yuml;': 'ÿ',
    
    // Capital accented characters
    '&Agrave;': 'À', '&Aacute;': 'Á', '&Acirc;': 'Â', '&Atilde;': 'Ã',
    '&Auml;': 'Ä', '&Aring;': 'Å', '&AElig;': 'Æ', '&Ccedil;': 'Ç',
    '&Egrave;': 'È', '&Eacute;': 'É', '&Ecirc;': 'Ê', '&Euml;': 'Ë',
    '&Igrave;': 'Ì', '&Iacute;': 'Í', '&Icirc;': 'Î', '&Iuml;': 'Ï',
    '&ETH;': 'Ð', '&Ntilde;': 'Ñ', '&Ograve;': 'Ò', '&Oacute;': 'Ó',
    '&Ocirc;': 'Ô', '&Otilde;': 'Õ', '&Ouml;': 'Ö', '&Oslash;': 'Ø',
    '&Ugrave;': 'Ù', '&Uacute;': 'Ú', '&Ucirc;': 'Û', '&Uuml;': 'Ü',
    '&Yacute;': 'Ý', '&THORN;': 'Þ',
    
    // Mathematical and technical symbols
    '&times;': '×',
    '&divide;': '÷',
    '&sect;': '§',
    '&para;': '¶',
    '&not;': '¬',
    '&macr;': '¯',
    '&acute;': '´',
    '&micro;': 'µ',
    '&cedil;': '¸',
    '&ordm;': 'º',
    '&ordf;': 'ª',
    '&laquo;': '«',
    '&raquo;': '»',
    '&iquest;': '¿',
    '&iexcl;': '¡',
    '&brvbar;': '¦',
    '&uml;': '¨',
  };

  // Apply named entity replacements
  for (const [entity, replacement] of Object.entries(entities)) {
    text = text.replace(new RegExp(entity, 'g'), replacement);
  }

  // Clean up any remaining malformed entities
  text = text.replace(/&[a-zA-Z][a-zA-Z0-9]*;/g, ''); // Remove unknown named entities
  text = text.replace(/&#[0-9]+;/g, ''); // Remove any remaining numeric entities
  text = text.replace(/&#x[0-9A-Fa-f]+;/g, ''); // Remove any remaining hex entities

  return text;
}

// Clean text specifically for news articles
export function cleanNewsText(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Remove JavaScript code blocks first (before HTML entity decoding)
  text = removeJavaScriptCode(text);

  // First decode HTML entities
  text = decodeHtmlEntities(text);

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Remove JavaScript artifacts that might remain
  text = removeCodeArtifacts(text);

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Remove common news article artifacts
  text = text.replace(/\[[\d\s\w+]+\]/g, ''); // Remove [+123 chars] type indicators
  text = text.replace(/\b(Read more|Continue reading|Click here|Subscribe|Newsletter)\b.*$/gi, '');

  // Clean up quotes and punctuation
  text = text.replace(/[""]/g, '"'); // Normalize quotes
  text = text.replace(/['']/g, "'"); // Normalize apostrophes
  text = text.replace(/…/g, '...'); // Normalize ellipsis

  // Remove extra dots and clean punctuation
  text = text.replace(/\.{4,}/g, '...'); // Max 3 dots for ellipsis
  text = text.replace(/\s+([,.!?;:])/g, '$1'); // Remove space before punctuation
  text = text.replace(/([,.!?;:])\s*/g, '$1 '); // Ensure space after punctuation

  return text.trim();
}

// Remove JavaScript code blocks and inline scripts
function removeJavaScriptCode(text: string): string {
  // Remove script tags and their content
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove inline JavaScript handlers
  text = text.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove JavaScript object declarations (like var disqus_config = ...)
  text = text.replace(/\b(var|let|const|function)\s+\w+\s*=\s*[^;]+;?/gi, '');
  
  // Remove object/function declarations spanning multiple lines
  text = text.replace(/\b(var|let|const)\s+\w+\s*=\s*function\s*\([^)]*\)\s*\{[^}]*\}/gi, '');
  
  // Remove this.page.url type statements
  text = text.replace(/\bthis\.\w+(\.\w+)*\s*=\s*[^;]+;?/gi, '');
  
  // Remove function calls and method chains
  text = text.replace(/\w+\(\s*\)\s*(\.\w+\([^)]*\))*\s*;?/gi, '');
  
  return text;
}

// Remove code artifacts and programming-related content
function removeCodeArtifacts(text: string): string {
  // Remove URLs and protocol patterns
  text = text.replace(/https?:\/\/[^\s]+/gi, '');
  text = text.replace(/www\.[^\s]+/gi, '');
  
  // Remove JavaScript variable patterns
  text = text.replace(/\b(disqus_config|gtag|ga|fbq|_gaq|analytics|tracking)\b[^.]*$/gim, '');
  
  // Remove code-like patterns
  text = text.replace(/\b\w+\.\w+(\.\w+)*\s*=\s*[^;]+;?/gi, ''); // object.property = value
  text = text.replace(/\{\s*\w+\s*:\s*[^}]+\}/gi, ''); // {key: value} objects
  text = text.replace(/\[\s*\d+(\s*,\s*\d+)*\s*\]/gi, ''); // [1, 2, 3] arrays
  
  // Remove CSS-like patterns
  text = text.replace(/\w+\s*:\s*[\w\d#%-]+\s*;?/gi, ''); // property: value;
  
  // Remove file paths and technical references
  text = text.replace(/\/[\/\w.-]+\.(js|css|php|html|htm)(\?\w+=\w+(&\w+=\w+)*)?\b/gi, '');
  
  // Remove common code variables and functions
  text = text.replace(/\b(getElementById|querySelector|addEventListener|setTimeout|setInterval|console\.log|window\.|document\.)\w*/gi, '');
  
  // Remove hexadecimal and other code-like strings
  text = text.replace(/\b0x[0-9a-fA-F]+\b/gi, ''); // hex numbers
  text = text.replace(/\b[a-fA-F0-9]{8,}\b/gi, ''); // long hex strings
  
  // Remove programming keywords when they appear isolated
  text = text.replace(/\b(var|let|const|function|return|if|else|for|while|switch|case|break|continue|try|catch|finally|throw|new|this|null|undefined|true|false|async|await|export|import|require|module|exports)\b\s*/gi, '');
  
  // Remove common ad/tracking related terms
  text = text.replace(/\b(adsbygoogle|googletag|adsystem|doubleclick|facebook\.com|twitter\.com|analytics|gtm|utm_|fbclid|gclid)\b[^\s]*/gi, '');
  
  return text;
}