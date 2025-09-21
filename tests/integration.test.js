/**
 * Integration tests for CHM Converter DOM interactions
 * Tests the complete workflow including DOM manipulation and file processing
 */

const CHMJsonExtractor = require('./chmextractor.module.js');

describe('CHM Converter Integration Tests', () => {
  let extractor;

  beforeEach(() => {
    // Initialize a new extractor instance
    extractor = new CHMJsonExtractor();
  });

  describe('DOM Initialization', () => {
    test('should initialize UI elements correctly', () => {
      expect(extractor.file).toBeNull();
      expect(extractor.jsonData).toBeNull();
      
      // Check that required DOM elements exist
      expect(document.getElementById('uploadArea')).toBeTruthy();
      expect(document.getElementById('fileInput')).toBeTruthy();
      expect(document.getElementById('status')).toBeTruthy();
      expect(document.getElementById('downloadButtons')).toBeTruthy();
      expect(document.getElementById('jsonPreview')).toBeTruthy();
    });

    test('should set up event listeners', () => {
      const uploadArea = document.getElementById('uploadArea');
      const fileInput = document.getElementById('fileInput');
      
      // Create spy functions to test event handlers
      const clickSpy = jest.fn();
      const dragoverSpy = jest.fn();
      const dropleaveSpy = jest.fn();
      const dropSpy = jest.fn();
      const changeSpy = jest.fn();

      // Add event listeners
      uploadArea.addEventListener('click', clickSpy);
      uploadArea.addEventListener('dragover', dragoverSpy);
      uploadArea.addEventListener('dragleave', dropleaveSpy);
      uploadArea.addEventListener('drop', dropSpy);
      fileInput.addEventListener('change', changeSpy);

      // Simulate events with proper mock data
      uploadArea.dispatchEvent(new Event('click'));
      
      const dragoverEvent = new Event('dragover');
      dragoverEvent.preventDefault = jest.fn();
      uploadArea.dispatchEvent(dragoverEvent);
      
      const dragleaveEvent = new Event('dragleave');  
      dragleaveEvent.preventDefault = jest.fn();
      uploadArea.dispatchEvent(dragleaveEvent);
      
      const dropEvent = new Event('drop');
      dropEvent.preventDefault = jest.fn();
      dropEvent.dataTransfer = { files: [] }; // Empty files array to avoid errors
      uploadArea.dispatchEvent(dropEvent);
      
      fileInput.dispatchEvent(new Event('change'));

      expect(clickSpy).toHaveBeenCalled();
      expect(dragoverSpy).toHaveBeenCalled();
      expect(dropleaveSpy).toHaveBeenCalled();
      expect(dropSpy).toHaveBeenCalled();
      expect(changeSpy).toHaveBeenCalled();
    });
  });

  describe('File Processing Workflow', () => {
    test('should handle valid CHM file', async () => {
      // Create a mock valid CHM file
      const mockFile = {
        name: 'test.chm',
        arrayBuffer: () => {
          return Promise.resolve(createMockCHMBuffer());
        }
      };

      // Spy on the methods
      jest.spyOn(extractor, 'showStatus');
      jest.spyOn(extractor, 'validateCHM').mockReturnValue(true);
      jest.spyOn(extractor, 'extractText').mockReturnValue(
        'Class TestClass This is a test class description'
      );
      jest.spyOn(extractor, 'previewJSON');

      await extractor.loadFile(mockFile);

      expect(extractor.showStatus).toHaveBeenCalledWith('Reading test.chm...');
      expect(extractor.validateCHM).toHaveBeenCalled();
      expect(extractor.extractText).toHaveBeenCalled();
      expect(extractor.previewJSON).toHaveBeenCalled();
      expect(extractor.showStatus).toHaveBeenCalledWith('✅ Extraction successful!', 'success');
    });

    test('should reject non-CHM files', async () => {
      const mockFile = {
        name: 'test.txt',
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
      };

      jest.spyOn(extractor, 'showStatus');

      await extractor.loadFile(mockFile);

      expect(extractor.showStatus).toHaveBeenCalledWith('Only .chm files are supported.', 'error');
    });

    test('should handle invalid CHM format', async () => {
      const mockFile = {
        name: 'test.chm',
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
      };

      jest.spyOn(extractor, 'showStatus');
      jest.spyOn(extractor, 'validateCHM').mockReturnValue(false);

      await extractor.loadFile(mockFile);

      expect(extractor.showStatus).toHaveBeenCalledWith('Invalid CHM format (missing ITSF signature).', 'error');
    });

    test('should show download buttons after successful extraction', async () => {
      const mockFile = {
        name: 'test.chm',
        arrayBuffer: () => Promise.resolve(createMockCHMBuffer())
      };

      jest.spyOn(extractor, 'validateCHM').mockReturnValue(true);
      jest.spyOn(extractor, 'extractText').mockReturnValue('Class Test Description');

      const downloadButtons = document.getElementById('downloadButtons');
      expect(downloadButtons.style.display).toBe('none');

      await extractor.loadFile(mockFile);

      expect(downloadButtons.style.display).toBe('block');
    });
  });

  describe('Text Extraction Integration', () => {
    test('should extract text from buffer correctly', () => {
      const mockBuffer = createMockBufferWithText('Class TestClass  Test description');
      
      const result = extractor.extractText(mockBuffer);
      
      expect(result).toContain('Class TestClass  Test description');
    });

    test('should filter out irrelevant text chunks', () => {
      const mockBuffer = createMockBufferWithText('Just some random text without class definitions');
      
      const result = extractor.extractText(mockBuffer);
      
      expect(result).toBe('');
    });

    test('should handle large buffers in chunks', () => {
      // Create a large buffer (> 16KB to test chunking)
      const largeText = 'Class LargeClass  Large description ' + 'x'.repeat(20000);
      const mockBuffer = createMockBufferWithText(largeText);
      
      const result = extractor.extractText(mockBuffer);
      
      expect(result).toContain('Class LargeClass  Large description');
    });
  });

  describe('JSON Preview Integration', () => {
    test('should display JSON preview correctly', () => {
      const testData = [
        { type: 'Class', name: 'TestClass', description: 'Test description' }
      ];

      extractor.previewJSON(testData);

      const previewElement = document.getElementById('jsonPreview');
      expect(previewElement.style.display).toBe('block');
      expect(previewElement.textContent).toBe(JSON.stringify(testData, null, 2));
    });

    test('should update preview when new data is processed', () => {
      const firstData = [{ type: 'Class', name: 'First', description: 'First desc' }];
      const secondData = [{ type: 'Class', name: 'Second', description: 'Second desc' }];

      extractor.previewJSON(firstData);
      let previewElement = document.getElementById('jsonPreview');
      expect(previewElement.textContent).toBe(JSON.stringify(firstData, null, 2));

      extractor.previewJSON(secondData);
      expect(previewElement.textContent).toBe(JSON.stringify(secondData, null, 2));
    });
  });

  describe('Download Functionality Integration', () => {
    test('should trigger JSON download with proper filename', () => {
      extractor.jsonData = [
        { type: 'Class', name: 'TestClass', description: 'Test description' }
      ];

      const mockElement = {
        href: '',
        download: '',
        click: jest.fn()
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockElement);

      extractor.downloadJSON();

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockElement.download).toBe('chm_api.json');
      expect(mockElement.click).toHaveBeenCalled();
    });

    test('should trigger CSV download with proper filename', () => {
      extractor.jsonData = [
        { type: 'Class', name: 'TestClass', description: 'Test description' }
      ];

      const mockElement = {
        href: '',
        download: '',
        click: jest.fn()
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockElement);

      extractor.downloadCSV();

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockElement.download).toBe('chm_api.csv');
      expect(mockElement.click).toHaveBeenCalled();
    });
  });

  describe('Status Display Integration', () => {
    test('should update status display with different message types', () => {
      const statusElement = document.getElementById('status');

      extractor.showStatus('Loading...', '');
      expect(statusElement.textContent).toBe('Loading...');
      expect(statusElement.className).toBe('status ');

      extractor.showStatus('Success!', 'success');
      expect(statusElement.textContent).toBe('Success!');
      expect(statusElement.className).toBe('status success');

      extractor.showStatus('Error occurred', 'error');
      expect(statusElement.textContent).toBe('Error occurred');
      expect(statusElement.className).toBe('status error');
    });
  });

  // Helper functions for creating mock data
  function createMockCHMBuffer() {
    const buffer = new ArrayBuffer(8);
    const view = new Uint8Array(buffer);
    view[0] = 73; // 'I'
    view[1] = 84; // 'T'
    view[2] = 83; // 'S'
    view[3] = 70; // 'F'
    return buffer;
  }

  function createMockBufferWithText(text) {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(text);
    const buffer = new ArrayBuffer(encoded.length);
    const view = new Uint8Array(buffer);
    view.set(encoded);
    return buffer;
  }
});