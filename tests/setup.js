/**
 * Jest setup file for CHM Converter tests
 * Configures the testing environment with necessary DOM mocks and utilities
 */

// Import testing utilities
require('@testing-library/jest-dom');

// Mock DOM elements that the application expects
global.document = global.window.document;
global.navigator = global.window.navigator;

// Mock URL.createObjectURL and URL.revokeObjectURL for download tests
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock TextDecoder for CHM file validation
global.TextDecoder = global.TextDecoder || class TextDecoder {
  decode(input) {
    if (input instanceof Uint8Array) {
      // Convert Uint8Array to string for testing
      return String.fromCharCode.apply(null, Array.from(input));
    }
    return String(input);
  }
};

// Mock TextEncoder for testing
global.TextEncoder = global.TextEncoder || class TextEncoder {
  encode(input) {
    // Convert string to Uint8Array for testing
    const result = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i++) {
      result[i] = input.charCodeAt(i);
    }
    return result;
  }
};

// Mock File and Blob APIs for file handling tests
global.File = global.File || class File {
  constructor(data, fileName, options = {}) {
    this.data = data;
    this.name = fileName;
    this.type = options.type || 'application/octet-stream';
    this.lastModified = Date.now();
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(this.data.length));
  }
};

global.Blob = global.Blob || class Blob {
  constructor(data, options = {}) {
    this.data = data;
    this.type = options.type || '';
  }
};

// Suppress console.log during tests unless explicitly needed
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup DOM structure that the app expects
beforeEach(() => {
  document.body.innerHTML = `
    <div id="uploadArea"></div>
    <input type="file" id="fileInput" />
    <div id="status"></div>
    <div id="downloadButtons" style="display: none;">
      <button id="downloadBtn">Download JSON</button>
      <button id="downloadCSVBtn">Download CSV</button>
    </div>
    <pre id="jsonPreview" style="display: none;"></pre>
  `;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
});