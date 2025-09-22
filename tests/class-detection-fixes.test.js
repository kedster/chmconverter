/**
 * Additional tests to verify the class detection improvements
 */

const CHMJsonExtractor = require('./chmextractor.module.js');

describe('CHMJsonExtractor - Class Detection Improvements', () => {
  let extractor;

  beforeEach(() => {
    extractor = new CHMJsonExtractor();
  });

  describe('Issue #18 - Classes without long descriptions', () => {
    test('should extract class with no description', () => {
      const rawText = 'Class MyClass';
      const result = extractor.toStructuredJSON(rawText);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'Class',
        name: 'MyClass',
        description: 'MyClass class'
      });
    });

    test('should extract class with very short description', () => {
      const rawText = 'Class Button OK';
      const result = extractor.toStructuredJSON(rawText);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'Class',
        name: 'Button',
        description: 'OK'
      });
    });

    test('should extract multiple classes without long descriptions', () => {
      const rawText = `Class Window
      Class Button
      Class Dialog`;
      const result = extractor.toStructuredJSON(rawText);
      
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Window');
      expect(result[1].name).toBe('Button');
      expect(result[2].name).toBe('Dialog');
      // All should have auto-generated descriptions
      expect(result[0].description).toBe('Window class');
      expect(result[1].description).toBe('Button class');
      expect(result[2].description).toBe('Dialog class');
    });

    test('should extract class with lowercase format', () => {
      const rawText = 'class MyWidget: widget description';
      const result = extractor.toStructuredJSON(rawText);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'Class',
        name: 'MyWidget',
        description: 'widget description'
      });
    });

    test('should not extract false positives from common text', () => {
      const rawText = 'This text has some class definitions mentioned but no actual classes';
      const result = extractor.toStructuredJSON(rawText);
      
      expect(result).toEqual([]);
    });

    test('should handle mixed content with real classes', () => {
      const rawText = `Introduction text here
      Class FileManager
      This class manages files and data
      Some other content here
      Class Database
      Handles data storage`;
      const result = extractor.toStructuredJSON(rawText);
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('FileManager');
      expect(result[0].description).toBe('This class manages files and data Some other content here');
      expect(result[1].name).toBe('Database');
      expect(result[1].description).toBe('Handles data storage');
    });
  });

  describe('Case sensitivity improvements', () => {
    test('should handle different case formats', () => {
      const testCases = [
        'Class TestClass',
        'class TestClass',
        'CLASS TestClass description'
      ];
      
      testCases.forEach((testCase, index) => {
        const result = extractor.toStructuredJSON(testCase);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('TestClass');
        expect(result[0].type).toBe('Class');
      });
    });
  });

  describe('Regression tests for existing functionality', () => {
    test('should still work with original format', () => {
      const rawText = 'Class TestClass This is a longer description that should work';
      const result = extractor.toStructuredJSON(rawText);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'Class',
        name: 'TestClass',
        description: 'This is a longer description that should work'
      });
    });
  });
});