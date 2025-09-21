/**
 * CHMJsonExtractor class module for testing
 * This file exports the CHMJsonExtractor class without DOM initialization
 */

class CHMJsonExtractor {
  constructor() {
    this.file = null;
    this.jsonData = null;
    // Only call initUI if we're in a browser environment
    if (typeof document !== 'undefined' && document.getElementById) {
      this.initUI();
    }
  }

  initUI() {
    const upload = document.getElementById('uploadArea');
    const input = document.getElementById('fileInput');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadCSVBtn = document.getElementById('downloadCSVBtn');

    if (upload && input && downloadBtn && downloadCSVBtn) {
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
  }

  showStatus(msg, type = '') {
    const status = document.getElementById('status');
    if (status) {
      status.textContent = msg;
      status.className = `status ${type}`;
    }
  }

  async loadFile(file) {
    if (!file.name.toLowerCase().endsWith('.chm')) {
      return this.showStatus('Only .chm files are supported.', 'error');
    }

    this.showStatus(`Reading ${file.name}...`);
    const buffer = await file.arrayBuffer();

    if (!this.validateCHM(buffer)) {
      return this.showStatus('Invalid CHM format (missing ITSF signature).', 'error');
    }

    const content = this.extractText(buffer);
    this.jsonData = this.toStructuredJSON(content);
    this.previewJSON(this.jsonData);

    this.showStatus('✅ Extraction successful!', 'success');
    const downloadButtons = document.getElementById('downloadButtons');
    if (downloadButtons) {
      downloadButtons.style.display = 'block';
    }
  }

  validateCHM(buffer) {
    if (buffer.byteLength < 4) {
      return false;
    }
    const sig = new TextDecoder().decode(new Uint8Array(buffer, 0, 4));
    return sig === 'ITSF';
  }

  extractText(buffer) {
    const decoder = new TextDecoder('utf-8');
    const step = 16384;
    const blocks = [];

    for (let i = 0; i < buffer.byteLength; i += step) {
      const chunk = new Uint8Array(buffer, i, Math.min(step, buffer.byteLength - i));
      const text = decoder.decode(chunk);
      if (this.containsRelevantText(text)) {
        blocks.push(text);
      }
    }

    return blocks.join('\n');
  }

  containsRelevantText(text) {
    return /Class\s+[A-Z][a-zA-Z0-9_]+\s{2,}/i.test(text);
  }

  toStructuredJSON(rawText) {
    const entries = [];
    const lines = rawText.split('\n');

    const classPattern = /\bClass\s+([A-Z][\w\d]*)\s+(.*)/i;

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(classPattern);
      if (match) {
        const name = match[1].trim();
        let description = match[2].trim();

        while (
          i + 1 < lines.length &&
          !lines[i + 1].match(/\bClass\s+[A-Z]/i) &&
          !lines[i + 1].match(/^\s*$/)
        ) {
          description += ' ' + lines[++i].trim();
        }
        entries.push({ type: 'Class', name, description });
      }
    }

    return entries;
  }

  previewJSON(json) {
    const pre = document.getElementById('jsonPreview');
    if (pre) {
      pre.style.display = 'block';
      pre.textContent = JSON.stringify(json, null, 2);
    }
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

// Browser environment initialization
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('DOMContentLoaded', () => new CHMJsonExtractor());
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CHMJsonExtractor;
}

// Export for ES modules
if (typeof window !== 'undefined') {
  window.CHMJsonExtractor = CHMJsonExtractor;
} else if (typeof global !== 'undefined') {
  global.CHMJsonExtractor = CHMJsonExtractor;
}