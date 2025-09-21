# Testing Documentation

## Overview

This project uses Jest as the testing framework to ensure code quality and consistency. The test suite covers both JavaScript functionality and CSS styling consistency.

## Test Structure

```
tests/
├── setup.js                    # Jest configuration and global mocks
├── chmextractor.test.js        # Unit tests for core CHM extraction logic
├── integration.test.js         # Integration tests for DOM interactions
├── css-consistency.test.js     # CSS styling and consistency tests
└── chmextractor.module.js      # Testable module version of the main script
```

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Categories

#### Unit Tests (`chmextractor.test.js`)
- **CHMJsonExtractor Constructor**: Initialization and setup
- **validateCHM()**: CHM file validation logic
- **containsRelevantText()**: Text filtering logic
- **toStructuredJSON()**: JSON conversion logic
- **showStatus()**: Status message display
- **previewJSON()**: JSON preview functionality
- **downloadJSON()/downloadCSV()**: File download functionality

#### Integration Tests (`integration.test.js`)
- **DOM Initialization**: UI element setup and event binding
- **File Processing Workflow**: Complete file upload and processing
- **Text Extraction**: Buffer processing and text extraction
- **JSON Preview**: Preview display functionality
- **Download Functionality**: File download integration
- **Status Display**: Status message integration

#### CSS Consistency Tests (`css-consistency.test.js`)
- **CSS Syntax Validation**: Valid CSS structure
- **Color Scheme Consistency**: Consistent color usage
- **Layout and Responsive Design**: Grid, flexbox, and media queries
- **Interactive Elements**: Hover states, focus styles, transitions
- **Typography**: Font consistency and hierarchy
- **Visual Effects**: Border radius, shadows, and modern effects
- **Component Styles**: Specific component styling
- **Browser Compatibility**: Vendor prefixes and compatibility
- **Performance**: Reasonable usage of expensive CSS properties

## Test Configuration

The testing environment is configured with:

- **JSDOM**: Simulates browser environment for DOM testing
- **Mocked APIs**: File, Blob, URL, TextDecoder/TextEncoder APIs
- **Global Setup**: DOM structure and cleanup for consistent testing
- **Coverage Reporting**: Tracks code coverage across all tests

## Mock Data and Utilities

The test suite includes utilities for creating mock CHM files and test data:

- `createMockCHMBuffer()`: Creates valid ITSF signature buffer
- `createMockBufferWithText()`: Creates buffer with specific text content
- Mocked File APIs for upload simulation
- Mocked DOM events for interaction testing

## Code Coverage

Run `npm run test:coverage` to generate a detailed coverage report showing:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

## Best Practices

1. **Isolated Tests**: Each test is independent and doesn't affect others
2. **Descriptive Names**: Test names clearly describe what's being tested
3. **Comprehensive Coverage**: Tests cover both happy paths and edge cases
4. **Mock External Dependencies**: File system, DOM APIs, and browser features
5. **Consistent Setup**: Standardized test environment and cleanup

## Adding New Tests

When adding new functionality:

1. Add unit tests for core logic in `chmextractor.test.js`
2. Add integration tests for DOM interactions in `integration.test.js`
3. Add CSS tests for new styles in `css-consistency.test.js`
4. Update mock utilities if new APIs are used
5. Ensure all tests pass before committing

## Troubleshooting

Common issues and solutions:

- **JSDOM Environment**: Ensure DOM elements exist before testing interactions
- **Async Operations**: Use `async/await` for file processing tests
- **Mock APIs**: Verify all browser APIs are properly mocked
- **Text Encoding**: Use proper TextEncoder/TextDecoder mocks for buffer tests