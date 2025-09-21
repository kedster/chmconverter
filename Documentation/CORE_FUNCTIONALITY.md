# CHM Converter - Core Functionality Definition

## Executive Summary

The **CHM Converter** is a specialized, browser-based tool designed to extract structured data from Compiled HTML Help (CHM) files and convert them into modern, machine-readable formats (JSON and CSV). 

## Primary Purpose

### What CHM Converter Does
The CHM Converter serves as a **legacy documentation modernization tool** that:

1. **Reads CHM Files**: Processes Microsoft's proprietary Compiled HTML Help (.chm) format
2. **Extracts Structured Data**: Identifies and extracts class definitions and their descriptions using pattern recognition
3. **Converts to Modern Formats**: Outputs extracted data as JSON or CSV files for further processing
4. **Validates Input**: Ensures files are valid CHM format by checking ITSF (InfoTech Storage Format) signatures

### What CHM Converter Does NOT Do
- **Does not extract images, formatting, or complex HTML structures** - focuses on text-based class definitions only
- **Does not convert entire CHM content** - selectively extracts specific patterns (class definitions)
- **Does not support other help file formats** - specifically designed for CHM files only
- **Does not provide real-time editing** - operates as a one-way conversion tool

## Core Use Cases

### 1. **Legacy Documentation Migration**
- **Scenario**: Organizations with outdated CHM-based API documentation
- **Goal**: Modernize documentation for integration with contemporary documentation systems
- **Output**: Structured data that can be imported into modern platforms

### 2. **API Documentation Extraction**
- **Scenario**: Developers needing to extract class definitions from CHM files
- **Goal**: Create searchable, programmatically accessible API references  
- **Output**: Clean JSON/CSV data with class names and descriptions

### 3. **Documentation Analysis**
- **Scenario**: Technical writers analyzing large volumes of legacy documentation
- **Goal**: Process and categorize existing documentation content
- **Output**: Structured data suitable for analysis tools

### 4. **Content Archival**
- **Scenario**: Preserving historical technical documentation
- **Goal**: Extract key information before CHM files become obsolete
- **Output**: Future-proof data formats (JSON/CSV)

## Technical Scope

### Input Requirements
- **File Format**: CHM (Compiled HTML Help) files with `.chm` extension
- **Validation**: Must contain valid ITSF (InfoTech Storage Format) signature
- **Content Pattern**: Optimized for files containing class definitions in the format: `Class [ClassName] [Description]`

### Processing Capabilities
- **Pattern Recognition**: Uses regex pattern `/\bClass\s+([A-Z][\w\d]*)\s+(.*)/i` to identify class definitions
- **Text Extraction**: Processes files in 16KB chunks for memory efficiency
- **Multi-line Description Handling**: Captures class descriptions that span multiple lines
- **Data Validation**: Ensures extracted data integrity before export

### Output Formats

#### JSON Format
```json
[
  {
    "type": "Class",
    "name": "ExampleClass", 
    "description": "Complete description of the class functionality and purpose"
  }
]
```

#### CSV Format
```csv
Type,Name,Description
Class,"ExampleClass","Complete description of the class functionality and purpose"
```

## Operational Boundaries

### What Works Well
- **Modern API Documentation CHM Files**: Files with consistent class definition patterns
- **Well-Structured Content**: CHM files with clear text-based class declarations
- **Medium-sized Files**: Files under 50MB process efficiently in browser environments

### Limitations
- **Pattern Dependency**: Only extracts content matching the specific class definition pattern
- **Browser Memory Constraints**: Very large files (>100MB) may impact performance  
- **Single Content Type**: Currently optimized only for class definitions, not functions, interfaces, or other constructs
- **Text-Only Extraction**: Does not preserve formatting, links, or multimedia content

## Success Metrics
- **Extraction Accuracy**: Successfully identifies and extracts class definitions from valid CHM files
- **Data Integrity**: Output JSON/CSV files contain complete, properly formatted class information
- **File Validation**: Correctly rejects invalid or non-CHM files
- **User Experience**: Provides clear feedback during processing and error states

## Future Enhancement Opportunities
- Support for additional content patterns (functions, interfaces, enums)
- Enhanced error handling and recovery mechanisms
- Additional export formats (XML, Markdown, YAML)
- Batch processing capabilities for multiple files
- Performance optimizations for larger files