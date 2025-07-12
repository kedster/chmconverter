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

    if (!this.validateCHM(buffer)) {
      return this.showStatus('Invalid CHM format (missing ITSF signature).', 'error');
    }

    const content = this.extractText(buffer);
    this.jsonData = this.toStructuredJSON(content);
    this.previewJSON(this.jsonData);
    this.showStatus('✅ Extraction successful!', 'success');
    document.getElementById('downloadBtn').style.display = 'inline-block';
  }

  validateCHM(buffer) {
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
      if (this.containsAPIPattern(text)) {
        blocks.push(text);
      }
    }

    return blocks.join('\n');
  }

  containsAPIPattern(text) {
    return /\b(class|function|interface|method|namespace)\b/i.test(text);
  }

  toStructuredJSON(rawText) {
    const result = {
      classes: [],
      methods: [],
      interfaces: [],
      metadata: {
        extracted: new Date().toISOString()
      }
    };

    const lines = rawText.split('\n');
    lines.forEach(line => {
      if (/class\s+(\w+)/i.test(line)) result.classes.push(RegExp.$1);
      if (/function\s+(\w+)/i.test(line)) result.methods.push(RegExp.$1);
      if (/interface\s+(\w+)/i.test(line)) result.interfaces.push(RegExp.$1);
    });

    return result;
  }

  previewJSON(json) {
    const pre = document.getElementById('jsonPreview');
    pre.style.display = 'block';
    pre.textContent = JSON.stringify(json, null, 2);
  }

  downloadJSON() {
    const blob = new Blob([JSON.stringify(this.jsonData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'chm_api.json';
    a.click();
  }
}

document.addEventListener('DOMContentLoaded', () => new CHMJsonExtractor());
