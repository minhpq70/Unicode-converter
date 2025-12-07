import { TCVN3_MAP } from '../constants';

/**
 * Converts a string from TCVN3 (ABC) encoding to Unicode.
 * This function handles the character mapping logic.
 */
export const convertTcvn3ToUnicode = (text: string): string => {
  let result = '';
  const len = text.length;

  for (let i = 0; i < len; i++) {
    const char = text[i];
    // Check if the character exists in our map
    // Note: TCVN3 maps standard ASCII characters to Vietnamese glyphs in specific fonts.
    // However, basic ASCII (a-z, A-Z) often remains the same, 
    // it's the extended ASCII range that needs mapping.
    
    // In TCVN3, some chars map directly, but mixed text can be tricky.
    // We prioritize the map.
    if (TCVN3_MAP[char]) {
        // TCVN3 mapping is tricky because some capital letters map to lowercase keys in object
        // but visually appear distinct in the font. 
        // A simple lookup is often insufficient for perfect case handling without context,
        // but for standard TCVN3 documents, direct mapping works for the specific code points.
        
        // However, there is a nuance: The input 'text' is a standard JS string (UTF-16).
        // If the Docx reader interprets the bytes as Windows-1252 (common default), 
        // we map from those chars.
        
        // This simple map handles the characters as they typically appear when 
        // opened in a non-TCVN3 environment.
        result += TCVN3_MAP[char];
    } else {
      result += char;
    }
  }
  return result;
};

/**
 * Replaces font names in a string (usually XML content).
 */
export const replaceFontNames = (xmlContent: string, map: Record<string, string>): string => {
  let newContent = xmlContent;
  Object.entries(map).forEach(([oldFont, newFont]) => {
    // Regex to find w:ascii="oldFont" or w:hAnsi="oldFont"
    // We need to be careful to match exact font names to avoid partial replacements if names overlap
    const regex = new RegExp(`(w:ascii|w:hAnsi|w:eastAsia|w:cs)=["']${oldFont.replace('.', '\\.')}["']`, 'g');
    newContent = newContent.replace(regex, `$1="${newFont}"`);
  });
  return newContent;
};
