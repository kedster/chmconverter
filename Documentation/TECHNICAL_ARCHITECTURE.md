# CHM Converter - Technical Architecture

## Architecture Overview

The CHM Converter is built as a **client-side web application** using vanilla JavaScript, HTML5, and CSS3. This architecture choice enables:
- No server requirements
- Direct file processing in the user's browser
- Enhanced privacy (files never leave the user's machine)
- Cross-platform compatibility

## System Components

### 1. User Interface Layer (`index.html` + `styles.css`)
- **Drag & Drop Interface**: File upload via drag-and-drop or click-to-browse
- **Responsive Design**: Adapts to desktop and mobile browsers
- **Status Feedback**: Real-time processing status and error messages
- **Results Preview**: Live preview of extracted data before download
- **Export Controls**: Download buttons for JSON and CSV formats

### 2. Core Processing Engine (`script.js`)

#### CHMJsonExtractor Class
The main application controller that orchestrates the conversion process:

```javascript
class CHMJsonExtractor {
  // Core methods:
  // - loadFile(): Handles file input and validation
  // - validateCHM(): Verifies ITSF signature
  // - extractText(): Processes binary data to text
  // - toStructuredJSON(): Converts text to structured data
  // - downloadJSON/CSV(): Generates downloadable files
}
```

### 3. File Processing Pipeline

#### Stage 1: File Validation
```
User File Input → File Extension Check (.chm) → ITSF Signature Validation → Proceed/Reject
```

#### Stage 2: Text Extraction
```
CHM Binary Data → 16KB Chunk Processing → UTF-8 Decoding → Relevance Filtering → Text Aggregation
```

#### Stage 3: Pattern Recognition
```
Raw Text → Line Splitting → Regex Pattern Matching → Multi-line Description Capture → Data Structuring
```

#### Stage 4: Data Export
```
Structured Data → JSON/CSV Formatting → Blob Generation → Download Trigger
```

## Key Algorithms

### CHM File Validation
```javascript
validateCHM(buffer) {
  const sig = new TextDecoder().decode(new Uint8Array(buffer, 0, 4));
  return sig === 'ITSF';  // InfoTech Storage Format signature
}
```

### Text Extraction Strategy
- **Chunked Processing**: Reads file in 16KB increments to manage memory
- **Content Filtering**: Only processes chunks containing class definition patterns
- **Encoding Handling**: Uses UTF-8 TextDecoder for consistent character interpretation

### Pattern Recognition Engine
```javascript
const classPattern = /\bClass\s+([A-Z][\w\d]*)\s+(.*)/i;
```
- Identifies lines starting with "Class" followed by capitalized class names
- Captures multi-line descriptions until next class definition or empty line
- Filters out noise and irrelevant content

## Data Flow

### Input Processing
1. **File Selection**: User drags/selects CHM file
2. **File Reading**: Browser FileReader API loads file as ArrayBuffer  
3. **Validation**: Check for CHM format signature
4. **Error Handling**: Display appropriate error messages for invalid files

### Content Extraction  
1. **Binary Processing**: Convert ArrayBuffer to processable chunks
2. **Text Decoding**: Apply UTF-8 decoding to each chunk
3. **Relevance Filter**: Only retain chunks with class definition patterns
4. **Aggregation**: Combine relevant chunks into complete text

### Data Structuring
1. **Line Processing**: Split aggregated text into individual lines
2. **Pattern Matching**: Apply regex to identify class definitions
3. **Description Capture**: Collect multi-line descriptions for each class
4. **Object Creation**: Generate structured JSON objects

### Output Generation
1. **Preview Display**: Show extracted data in formatted preview
2. **Export Preparation**: Format data for JSON or CSV download
3. **File Generation**: Create downloadable Blob objects
4. **Download Trigger**: Initiate browser download process

## Browser Compatibility

### Required APIs
- **FileReader API**: For reading uploaded files
- **ArrayBuffer**: For binary file data processing  
- **TextDecoder**: For UTF-8 text conversion
- **Blob API**: For creating downloadable files
- **URL.createObjectURL**: For generating download links

### Supported Browsers
- **Chrome/Chromium**: Version 50+ (full support)
- **Firefox**: Version 45+ (full support)
- **Safari**: Version 10+ (full support) 
- **Edge**: Version 79+ (full support)
- **Mobile Browsers**: iOS Safari 10+, Chrome Mobile 50+

## Performance Characteristics

### Memory Usage
- **Chunk-based Processing**: Limits memory footprint during large file processing
- **Garbage Collection**: Discards irrelevant chunks immediately
- **Preview Optimization**: JSON preview limited to prevent browser freeze

### Processing Speed
- **Pattern Optimization**: Regex engine optimized for class definition detection
- **Selective Processing**: Only processes relevant content chunks
- **Async Operations**: Non-blocking file reading and processing

### Scalability Limits  
- **File Size**: Recommended maximum 100MB (browser memory dependent)
- **Pattern Density**: Performance degrades with high pattern match density
- **Browser Constraints**: Subject to individual browser memory limits

## Error Handling

### File Validation Errors
- Invalid file extensions (not .chm)
- Missing or invalid ITSF signature
- Corrupted or unreadable file data

### Processing Errors
- Memory limitations during large file processing
- Text encoding issues
- Pattern matching failures

### User Feedback
- Clear error messages with specific failure reasons
- Processing status updates during long operations
- Success confirmation with result statistics

## Security Considerations

### Client-Side Processing
- **Data Privacy**: Files processed locally, never transmitted to servers
- **No Network Dependencies**: Operates completely offline after initial page load
- **Sandbox Security**: Runs within browser security sandbox

### File Handling
- **Input Validation**: Strict file type and signature checking
- **Memory Protection**: Chunked processing prevents memory overflow attacks
- **Error Isolation**: Processing errors contained within application scope