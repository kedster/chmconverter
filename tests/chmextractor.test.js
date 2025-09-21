/**
 * Unit tests for CHMJsonExtractor core functionality
 * Tests the main application logic without DOM dependencies where possible
 */

const CHMJsonExtractor = require('./chmextractor.module.js');

describe('CHMJsonExtractor', () => {
  let extractor;

  beforeEach(() => {
    // Create a new instance for each test
    extractor = new CHMJsonExtractor();
    // Reset the state
    extractor.file = null;
    extractor.jsonData = null;
    // Mock initUI to prevent DOM manipulation during construction if needed
    if (typeof document !== 'undefined') {
      jest.spyOn(extractor, 'initUI').mockImplementation(() => {});
    }
  });

  describe('Constructor', () => {
    test('should initialize with null file and jsonData', () => {
      expect(extractor.file).toBeNull();
      expect(extractor.jsonData).toBeNull();
    });

    test('should have initUI method available', () => {
      expect(typeof extractor.initUI).toBe('function');
    });
  });

  describe('validateCHM', () => {
    test('should return true for valid CHM signature (ITSF)', () => {
      const buffer = new ArrayBuffer(8);
      const view = new Uint8Array(buffer);
      view[0] = 73;  // 'I'
      view[1] = 84;  // 'T'
      view[2] = 83;  // 'S'
      view[3] = 70;  // 'F'

      expect(extractor.validateCHM(buffer)).toBe(true);
    });

    test('should return false for invalid signature', () => {
      const buffer = new ArrayBuffer(8);
      const view = new Uint8Array(buffer);
      view[0] = 88; // 'X'
      view[1] = 89; // 'Y'
      view[2] = 90; // 'Z'
      view[3] = 65; // 'A'

      expect(extractor.validateCHM(buffer)).toBe(false);
    });

    test('should return false for empty buffer', () => {
      const buffer = new ArrayBuffer(0);
      expect(extractor.validateCHM(buffer)).toBe(false);
    });
  });

  describe('containsRelevantText', () => {
    test('should return true for text with class definitions', () => {
      const text = 'Class TestClass  This is a test class';
      expect(extractor.containsRelevantText(text)).toBe(true);
    });

    test('should return true for class with different casing', () => {
      const text = 'class MyClass  Description of the class';
      expect(extractor.containsRelevantText(text)).toBe(true);
    });

    test('should return false for text without class definitions', () => {
      const text = 'This is just regular text without any class definitions';
      expect(extractor.containsRelevantText(text)).toBe(false);
    });

    test('should return false for empty text', () => {
      expect(extractor.containsRelevantText('')).toBe(false);
    });

    test('should return false for class without proper spacing', () => {
      const text = 'ClassNoSpaces Description';
      expect(extractor.containsRelevantText(text)).toBe(false);
    });
  });

  describe('toStructuredJSON', () => {
    test('should extract single class definition', () => {
      const rawText = 'Class TestClass This is a test class description';
      const result = extractor.toStructuredJSON(rawText);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'Class',
        name: 'TestClass',
        description: 'This is a test class description'
      });
    });

    test('should extract multiple class definitions', () => {
      const rawText = `Class FirstClass First class description

Class SecondClass Second class description`;
      
      const result = extractor.toStructuredJSON(rawText);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        type: 'Class',
        name: 'FirstClass',
        description: 'First class description'
      });
      expect(result[1]).toEqual({
        type: 'Class',
        name: 'SecondClass',
        description: 'Second class description'
      });
    });

    test('should handle multi-line descriptions', () => {
      const rawText = `Class TestClass This is the first line
and this is the second line
and this continues
Class NextClass Next description`;
      
      const result = extractor.toStructuredJSON(rawText);
      
      expect(result).toHaveLength(2);
      expect(result[0].description).toBe(
        'This is the first line and this is the second line and this continues'
      );
    });

    test('should handle empty input', () => {
      const result = extractor.toStructuredJSON('');
      expect(result).toEqual([]);
    });

    test('should handle input without class definitions', () => {
      const rawText = 'Just some regular text without any class definitions';
      const result = extractor.toStructuredJSON(rawText);
      expect(result).toEqual([]);
    });
  });

  describe('showStatus', () => {
    test('should update status element with message and type', () => {
      const statusElement = document.getElementById('status');
      
      extractor.showStatus('Test message', 'success');
      
      expect(statusElement.textContent).toBe('Test message');
      expect(statusElement.className).toBe('status success');
    });

    test('should update status element with message only', () => {
      const statusElement = document.getElementById('status');
      
      extractor.showStatus('Another test message');
      
      expect(statusElement.textContent).toBe('Another test message');
      expect(statusElement.className).toBe('status ');
    });

    test('should handle empty message', () => {
      const statusElement = document.getElementById('status');
      
      extractor.showStatus('');
      
      expect(statusElement.textContent).toBe('');
      expect(statusElement.className).toBe('status ');
    });
  });

  describe('previewJSON', () => {
    test('should display JSON data in preview element', () => {
      const previewElement = document.getElementById('jsonPreview');
      const testData = [
        { type: 'Class', name: 'TestClass', description: 'Test description' }
      ];
      
      extractor.previewJSON(testData);
      
      expect(previewElement.style.display).toBe('block');
      expect(previewElement.textContent).toBe(JSON.stringify(testData, null, 2));
    });

    test('should handle empty data', () => {
      const previewElement = document.getElementById('jsonPreview');
      
      extractor.previewJSON([]);
      
      expect(previewElement.style.display).toBe('block');
      expect(previewElement.textContent).toBe('[]');
    });
  });

  describe('downloadJSON', () => {
    test('should create download when jsonData exists', () => {
      extractor.jsonData = [
        { type: 'Class', name: 'TestClass', description: 'Test description' }
      ];
      
      // Mock document.createElement and click
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
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    test('should not create download when jsonData is empty', () => {
      extractor.jsonData = [];
      
      jest.spyOn(document, 'createElement');
      
      extractor.downloadJSON();
      
      expect(document.createElement).not.toHaveBeenCalled();
    });

    test('should not create download when jsonData is null', () => {
      extractor.jsonData = null;
      
      jest.spyOn(document, 'createElement');
      
      extractor.downloadJSON();
      
      expect(document.createElement).not.toHaveBeenCalled();
    });
  });

  describe('downloadCSV', () => {
    test('should create CSV download when jsonData exists', () => {
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

    test('should handle quotes in CSV data', () => {
      extractor.jsonData = [
        { type: 'Class', name: 'TestClass', description: 'Description with "quotes"' }
      ];
      
      const mockBlob = jest.fn();
      global.Blob = mockBlob;
      
      const mockElement = {
        href: '',
        download: '',
        click: jest.fn()
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockElement);
      
      extractor.downloadCSV();
      
      expect(mockBlob).toHaveBeenCalledWith(
        ['Type,Name,Description\nClass,"TestClass","Description with ""quotes"""'],
        { type: 'text/csv' }
      );
    });
  });
});