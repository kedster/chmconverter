class CHMJsonExtractor {
  constructor() {
    this.file = null;
    this.jsonData = null;
    this.initUI();
  }

  initUI() {
    const upload = document.getElementById('uploadArea');
    const input = document.getElementById('fileInput');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadCSVBtn = document.getElementById('downloadCSVBtn');

    upload.addEventListener('click', () => input.click());
    upload.addEventListener('dragover', e => {
      e.preventDefault();
      upload.classList.add('dragover');
    });
    upload.addEventListener('dragleave', e => {
      e.preventDefault();
      upload.classList.remove('dragover');
    });
    upload.addEventListener('drop', e => {
      e.preventDefault();
      upload.classList.remove('dragover');
      if (e.dataTransfer.files.length) this.loadFile(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', e => {
      if (e.target.files.length) this.loadFile(e.target.files[0]);
    });

    downloadBtn.addEventListener('click', () => this.downloadJSON());
    downloadCSVBtn.addEventListener('click', () => this.downloadCSV());
  }

  showStatus(msg, type = '') {
    const status = document.getElementById('status');
    status.textContent = msg;
    status.className = `status ${type}`;
  }

  async loadFile(file) {
    if (!file.name.toLowerCase().endsWith('.chm')) {
      return this.showStatus('Only .chm files are supported.', 'error');
    }

    this.showStatus(`Reading ${file.name}...`);
    const buffer = await file.arrayBuffer();

    const validation = this.validateCHM(buffer);
    if (!validation) {
      return this.showStatus('Invalid CHM format (missing ITSF signature or corrupted header).', 'error');
    }

    this.showStatus(`Valid CHM file (version ${validation.version}). Extracting content...`);
    
    try {
      const content = this.extractCHMContent(buffer, validation);
      this.jsonData = this.toStructuredJSON(content);
      this.previewJSON(this.jsonData);

      if (this.jsonData && this.jsonData.length > 0) {
        this.showStatus(`✅ Extraction successful! Found ${this.jsonData.length} class definitions.`, 'success');
        document.getElementById('downloadButtons').style.display = 'block';
      } else {
        this.showStatus('⚠️ No class definitions found in this CHM file.', 'warning');
      }
    } catch (error) {
      this.showStatus(`❌ Extraction failed: ${error.message}`, 'error');
    }
  }

  validateCHM(buffer) {
    if (buffer.byteLength < 96) { // Minimum ITSF header size
      return false;
    }
    
    // Check ITSF signature
    const sig = new TextDecoder().decode(new Uint8Array(buffer, 0, 4));
    if (sig !== 'ITSF') {
      return false;
    }
    
    // Check version (should be 3 for most CHM files)
    const view = new DataView(buffer);
    const version = view.getUint32(4, true); // Little endian
    
    // Validate header size
    const headerSize = view.getUint32(8, true);
    if (headerSize < 96 || headerSize > buffer.byteLength) {
      return false;
    }
    
    return { version, headerSize };
  }

  extractCHMContent(buffer, validation) {
    try {
      const view = new DataView(buffer);
      const content = [];
      
      // Parse ITSF header for section offsets
      const headerSize = validation.headerSize;
      
      // Read directory header section
      const offset = headerSize;
      if (offset + 16 <= buffer.byteLength) {
        const dirHeaderOffset = Number(view.getBigUint64(offset, true));
        const dirHeaderSize = Number(view.getBigUint64(offset + 8, true));
        
        if (dirHeaderOffset > 0 && dirHeaderOffset < buffer.byteLength) {
          // Try to find and extract content from the directory structure
          content.push(...this.extractContentFromDirectory(buffer, dirHeaderOffset, dirHeaderSize));
        }
      }
      
      // Fallback: scan for readable text patterns in the entire file
      if (content.length === 0) {
        content.push(...this.scanForTextContent(buffer));
      }
      
      return content.join('\n');
    } catch (error) {
      // If structured parsing fails, fall back to text scanning
      console.warn('Structured CHM parsing failed, falling back to text scanning:', error);
      return this.scanForTextContent(buffer).join('\n');
    }
  }

  extractContentFromDirectory(buffer, dirOffset, dirSize) {
    const content = [];
    
    try {
      // Parse directory entries to find HTML files and content
      let currentOffset = dirOffset;
      const endOffset = Math.min(dirOffset + dirSize, buffer.byteLength);
      
      while (currentOffset < endOffset - 8) {
        // Look for potential HTML content or text blocks
        const chunk = new Uint8Array(buffer, currentOffset, Math.min(4096, endOffset - currentOffset));
        const text = this.tryDecodeChunk(chunk);
        
        if (this.containsRelevantText(text)) {
          content.push(text);
        }
        
        currentOffset += 4096;
      }
    } catch (error) {
      console.warn('Directory parsing error:', error);
    }
    
    return content;
  }

  scanForTextContent(buffer) {
    const content = [];
    const step = 4096; // Increased chunk size for better text extraction
    
    for (let i = 0; i < buffer.byteLength; i += step) {
      const chunkSize = Math.min(step, buffer.byteLength - i);
      const chunk = new Uint8Array(buffer, i, chunkSize);
      const text = this.tryDecodeChunk(chunk);
      
      if (this.containsRelevantText(text)) {
        // Clean up null bytes and excessive whitespace
        const cleanText = text.replace(/\0/g, '').replace(/\s+/g, ' ').trim();
        if (cleanText.length > 0) {
          content.push(cleanText);
        }
      }
    }
    
    return content;
  }

  tryDecodeChunk(chunk) {
    try {
      // Try UTF-8 first
      return new TextDecoder('utf-8', { fatal: true }).decode(chunk);
    } catch {
      try {
        // Fallback to UTF-16 for some CHM files
        return new TextDecoder('utf-16le', { fatal: true }).decode(chunk);
      } catch {
        try {
          // Fallback to Windows-1252 for legacy files
          return new TextDecoder('windows-1252', { fatal: true }).decode(chunk);
        } catch {
          // Last resort: decode as latin1 and filter printable characters
          const latin1 = new TextDecoder('latin1').decode(chunk);
          // Replace control characters with spaces, keeping tabs, newlines, carriage returns
          let filtered = '';
          for (let i = 0; i < latin1.length; i++) {
            const char = latin1[i];
            const code = char.charCodeAt(0);
            if (code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126) || (code >= 160 && code <= 255)) {
              filtered += char;
            } else {
              filtered += ' ';
            }
          }
          return filtered;
        }
      }
    }
  }

  containsRelevantText(text) {
    if (!text || text.length < 10) return false;
    
    // First clean the text of null bytes for pattern matching but preserve original spacing for pattern 1
    const cleanTextForPattern = text.replace(/\0/g, ' '); // Don't collapse spaces yet
    const cleanText = cleanTextForPattern.replace(/\s+/g, ' ');
    
    // Enhanced patterns to catch various class definition formats
    const patterns = [
      /\bClass\s+[A-Z][a-zA-Z0-9_]+\s{2,}/i,  // Original pattern - at least 2 spaces (use uncollapsed text)
      /<h[1-6][^>]*>Class\s+[A-Z][a-zA-Z0-9_]+/i,  // HTML headers with class
      /\bclass\s+[A-Z][a-zA-Z0-9_]+\s*:/i,  // Class with colon
      /\bClass\s+[A-Z][a-zA-Z0-9_]+\s*\(/i,  // Class with parentheses
      /\bclass\s+[A-Z][a-zA-Z0-9_]+\s*\{/i,  // Class with brace
      /\b[A-Z][a-zA-Z0-9_]{2,}\s+Class\b/i,     // Type Class pattern (but must be at least 3 chars)
      /\bClass\s+[A-Z][a-zA-Z0-9_]+\s+/i,    // More lenient: Class + Name + space
    ];
    
    // Test the first pattern against uncollapsed text, others against clean text
    const hasClassPattern = patterns[0].test(cleanTextForPattern) || 
                           patterns.slice(1).some(pattern => pattern.test(cleanText));
    const hasClassKeyword = cleanText.includes('Class');
    
    if (!hasClassPattern || !hasClassKeyword) {
      return false;
    }
    
    // Ensure it's not just garbled binary data by checking alphabetic character ratio
    // Use clean text for ratio calculation
    const alphabeticChars = (cleanText.match(/[a-zA-Z]/g) || []).length;
    const textRatio = alphabeticChars / cleanText.length;
    
    return textRatio > 0.2; // More lenient ratio for CHM files with embedded nulls
  }

  toStructuredJSON(rawText) {
    if (!rawText || rawText.trim().length === 0) {
      return [];
    }

    const entries = [];
    const lines = rawText.split('\n');

    // Enhanced patterns to match various class definition formats
    const classPatterns = [
      /\bclass\s+([A-Z][\w\d]*)\s*:\s*(.*)/i,         // Class with colon (more specific first)
      /\bClass\s+([A-Z][\w\d]*)\s*\((.*?)\)/i,        // Class with parentheses
      /<h[1-6][^>]*>Class\s+([A-Z][\w\d]*)[^<]*(.*?)<\/h[1-6]>/i,  // HTML headers
      /\bCLASS\s+([A-Z][\w\d]*)\s+(.*)/i,             // ALL CAPS CLASS (require space)
      /\bClass\s+([A-Z][\w\d]*)\s+(.*)/i,             // Original pattern (require space)
      /\bclass\s+([A-Z][\w\d]*)\s+(.*)/i,             // Lowercase class (require space)
      // Fallback patterns (more lenient spacing) 
      /\bClass\s+([A-Z][\w\d]*)\s*(.*)/i,             // Class with optional space
      /\bclass\s+([A-Z][\w\d]*)\s*(.*)/i,             // class with optional space
    ];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Remove HTML tags for processing but keep the content
      line = line.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Skip obviously non-class lines - use case-insensitive check
      if (line.length < 6 || !line.toLowerCase().includes('class')) {
        continue;
      }
      
      for (const pattern of classPatterns) {
        const match = line.match(pattern);
        if (match && match[1] && match[1].length > 1) { // Ensure we have a real class name
          const name = match[1].trim();
          let description = (match[2] || '').trim();

          // Skip if the "class name" looks like it's part of other text or is a common word
          if (name.length < 2 || name === 'Class' || 
              ['definitions', 'definition', 'text', 'without', 'any', 'some', 'regular', 'just', 'manages', 'files', 'content', 'other', 'here'].includes(name.toLowerCase())) {
            continue;
          }

          // Collect multi-line description
          let nextLineIndex = i + 1;
          while (
            nextLineIndex < lines.length &&
            !this.isNewClassDefinition(lines[nextLineIndex]) &&
            lines[nextLineIndex].trim().length > 0
          ) {
            let nextLine = lines[nextLineIndex].trim();
            nextLine = nextLine.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
            if (nextLine.length > 0 && !nextLine.match(/^<\w+>.*<\/\w+>$/)) { // Skip pure HTML tags
              description += ' ' + nextLine;
            }
            nextLineIndex++;
          }

          // Update the main loop counter to skip processed lines
          i = nextLineIndex - 1;

          // Clean up description
          description = description.replace(/\s+/g, ' ').trim();
          
          // Allow classes with no description or very short descriptions
          if (name && name.length > 1) {
            // Provide default description if none exists
            if (!description || description.length === 0) {
              description = `${name} class`;
            }
            entries.push({ 
              type: 'Class', 
              name, 
              description: description.substring(0, 500) // Limit description length
            });
          }
          break; // Found a match, no need to try other patterns
        }
      }
    }

    return entries;
  }

  isNewClassDefinition(line) {
    if (!line) return false;
    const cleanLine = line.replace(/<[^>]*>/g, ' ').trim();
    // More specific pattern to avoid false positives like "This class manages..."
    return /^\s*\bClass\s+[A-Z][\w\d]*/i.test(cleanLine) || /^\s*\bCLASS\s+[A-Z][\w\d]*/i.test(cleanLine);
  }

  previewJSON(json) {
    const pre = document.getElementById('jsonPreview');
    pre.style.display = 'block';
    pre.textContent = JSON.stringify(json, null, 2);
  }

  downloadJSON() {
    if (!this.jsonData || !this.jsonData.length) return;

    const blob = new Blob([JSON.stringify(this.jsonData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'chm_api.json';
    a.click();
  }

  downloadCSV() {
    if (!this.jsonData || !this.jsonData.length) return;

    const csvRows = ['Type,Name,Description'];
    this.jsonData.forEach(row => {
      csvRows.push([
        row.type,
        `"${row.name}"`,
        `"${row.description.replace(/"/g, '""')}"`
      ].join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'chm_api.csv';
    a.click();
  }
}

document.addEventListener('DOMContentLoaded', () => new CHMJsonExtractor());
