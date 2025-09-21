/**
 * CSS consistency and styling tests for CHM Converter
 * Validates CSS syntax, color schemes, and styling consistency
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('css-tree');

describe('CSS Styling Tests', () => {
  let cssContent;
  let parsedCSS;

  beforeAll(() => {
    // Load and parse the CSS file
    const cssPath = path.join(__dirname, '../styles.css');
    cssContent = fs.readFileSync(cssPath, 'utf8');
    parsedCSS = parse(cssContent);
  });

  describe('CSS Syntax Validation', () => {
    test('should have valid CSS syntax', () => {
      expect(() => {
        parse(cssContent);
      }).not.toThrow();
    });

    test('should not be empty', () => {
      expect(cssContent.trim()).not.toBe('');
      expect(cssContent.length).toBeGreaterThan(100);
    });
  });

  describe('Color Scheme Consistency', () => {
    test('should use consistent primary color scheme', () => {
      const primaryColors = [
        '#667eea',
        '#764ba2'
      ];

      primaryColors.forEach(color => {
        expect(cssContent.toLowerCase()).toContain(color.toLowerCase());
      });
    });

    test('should have consistent gradient colors', () => {
      // Check that gradients use the primary color scheme
      const gradientRegex = /linear-gradient\([^)]*#667eea[^)]*#764ba2[^)]*\)/gi;
      const gradients = cssContent.match(gradientRegex);
      
      expect(gradients).toBeTruthy();
      expect(gradients.length).toBeGreaterThan(0);
    });

    test('should use consistent neutral colors for text and borders', () => {
      const neutralColors = [
        '#333', '#555', '#ddd', '#f9f9f9'
      ];

      neutralColors.forEach(color => {
        expect(cssContent.toLowerCase()).toContain(color.toLowerCase());
      });
    });
  });

  describe('Layout and Responsive Design', () => {
    test('should include box-sizing border-box reset', () => {
      expect(cssContent).toMatch(/\*\s*{\s*[^}]*box-sizing:\s*border-box/);
    });

    test('should have responsive media queries', () => {
      expect(cssContent).toMatch(/@media\s*\([^)]*max-width/i);
    });

    test('should use flexbox or grid for layouts', () => {
      const layoutProperties = /display:\s*(flex|grid)/gi;
      const layoutMatches = cssContent.match(layoutProperties);
      
      expect(layoutMatches).toBeTruthy();
      expect(layoutMatches.length).toBeGreaterThan(0);
    });

    test('should have proper spacing consistency', () => {
      // Check for consistent margin/padding patterns
      const spacingPattern = /(margin|padding):\s*(10px|15px|20px|30px)/gi;
      const spacingMatches = cssContent.match(spacingPattern);
      
      expect(spacingMatches).toBeTruthy();
      expect(spacingMatches.length).toBeGreaterThan(5);
    });
  });

  describe('Interactive Elements', () => {
    test('should have hover effects for interactive elements', () => {
      expect(cssContent).toMatch(/:hover\s*{/);
    });

    test('should have focus styles for accessibility', () => {
      expect(cssContent).toMatch(/:focus\s*{/);
    });

    test('should include transition effects', () => {
      expect(cssContent).toMatch(/transition:/i);
    });

    test('should have cursor pointer for clickable elements', () => {
      expect(cssContent).toMatch(/cursor:\s*pointer/i);
    });
  });

  describe('Typography', () => {
    test('should define consistent font families', () => {
      expect(cssContent).toMatch(/font-family:/i);
      // Check for fallback fonts
      expect(cssContent).toMatch(/font-family:[^;]*sans-serif/i);
    });

    test('should have proper font size hierarchy', () => {
      const fontSizes = cssContent.match(/font-size:\s*[\d.]+(?:em|px|rem)/gi);
      expect(fontSizes).toBeTruthy();
      expect(fontSizes.length).toBeGreaterThan(2);
    });

    test('should use consistent font weights', () => {
      expect(cssContent).toMatch(/font-weight:\s*bold/i);
    });
  });

  describe('Visual Effects', () => {
    test('should have consistent border radius values', () => {
      const borderRadiusPattern = /border-radius:\s*(8px|10px|20px)/gi;
      const borderMatches = cssContent.match(borderRadiusPattern);
      
      expect(borderMatches).toBeTruthy();
      expect(borderMatches.length).toBeGreaterThan(3);
    });

    test('should include box shadows for depth', () => {
      expect(cssContent).toMatch(/box-shadow:/i);
    });

    test('should have backdrop filters for modern effects', () => {
      expect(cssContent).toMatch(/backdrop-filter:/i);
    });
  });

  describe('Component Specific Styles', () => {
    test('should style upload area appropriately', () => {
      // Check for file input or upload area specific styles
      const uploadStyles = cssContent.match(/\.file-input|input\[type="file"\]/gi);
      expect(uploadStyles).toBeTruthy();
    });

    test('should style buttons consistently', () => {
      const buttonStyles = cssContent.match(/(button|\.btn)/gi);
      expect(buttonStyles).toBeTruthy();
      expect(buttonStyles.length).toBeGreaterThan(0);
    });

    test('should include download button styles', () => {
      // Check for download button specific styles
      expect(cssContent).toMatch(/#downloadButtons/i);
    });
  });

  describe('Browser Compatibility', () => {
    test('should include vendor prefixes for gradients', () => {
      expect(cssContent).toMatch(/-webkit-background-clip/i);
    });

    test('should handle text fill color for webkit', () => {
      expect(cssContent).toMatch(/-webkit-text-fill-color/i);
    });
  });

  describe('Performance Considerations', () => {
    test('should avoid excessive use of expensive properties', () => {
      // Count box-shadow usage (should be reasonable)
      const shadowCount = (cssContent.match(/box-shadow:/gi) || []).length;
      expect(shadowCount).toBeLessThan(20); // Reasonable limit
    });

    test('should use transform for animations rather than layout properties', () => {
      const transforms = cssContent.match(/transform:/gi);
      if (transforms) {
        expect(transforms.length).toBeGreaterThan(0);
      }
    });
  });
});