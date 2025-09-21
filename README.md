# CHM to JSON Converter

A lightweight, browser-based tool for converting Compiled HTML Help (.chm) files into structured JSON or CSV format. Specifically designed to extract API documentation, class definitions, and their descriptions from CHM files commonly used in software documentation.

![CHM Converter Interface](https://github.com/user-attachments/assets/ed32f4b1-a251-40e7-9bab-f067fec888ce)

## 🎯 Purpose

CHM (Compiled HTML Help) files are Microsoft's proprietary format for help documentation, commonly used in Windows applications and development tools. This converter extracts structured data from these files, making it easier to:

- **Modernize Legacy Documentation**: Convert outdated CHM files to modern, searchable formats
- **API Documentation Extraction**: Extract class definitions and descriptions for further processing
- **Data Migration**: Move documentation content to modern documentation systems
- **Content Analysis**: Analyze and process large amounts of technical documentation

## ✨ Key Features

- **🌐 Browser-Based**: No installation required - runs entirely in your web browser
- **📁 Drag & Drop Interface**: Simply drag your CHM file onto the upload area
- **🔍 Smart Content Extraction**: Automatically identifies and extracts class definitions using regex patterns
- **📊 Multiple Export Formats**: Export extracted data as JSON or CSV
- **✅ File Validation**: Validates CHM files by checking ITSF (InfoTech Storage Format) signatures
- **👁️ Live Preview**: See extracted data before downloading
- **📱 Responsive Design**: Works on desktop and mobile browsers

## 🚀 Usage

### Getting Started

1. **Open the Application**: Open `index.html` in any modern web browser
2. **Upload CHM File**: 
   - Click the upload area, or
   - Drag and drop your .chm file onto the upload area
3. **View Results**: The extracted data will be displayed in a preview
4. **Download**: Choose your preferred format (JSON or CSV) and download

### Supported Input Formats

- **CHM Files**: Compiled HTML Help files with `.chm` extension
- **ITSF Format**: Files must contain valid InfoTech Storage Format signatures

### Output Formats

#### JSON Format
```json
[
  {
    "type": "Class",
    "name": "ExampleClass",
    "description": "Description of the class and its functionality"
  }
]
```

#### CSV Format
```csv
Type,Name,Description
Class,"ExampleClass","Description of the class and its functionality"
```

## 🛠️ Technical Details

### Architecture

The converter is built using vanilla JavaScript and consists of several key components:

- **CHMJsonExtractor Class**: Main application logic
- **File Validation**: Checks for ITSF signature in CHM files
- **Content Extraction**: Processes binary data and extracts text content
- **Pattern Matching**: Uses regex to identify class definitions
- **Data Structuring**: Converts raw text to structured JSON objects

### Content Extraction Process

1. **File Reading**: Reads CHM file as ArrayBuffer
2. **Validation**: Verifies ITSF signature (first 4 bytes)
3. **Text Extraction**: Processes file in 16KB chunks using UTF-8 decoding
4. **Pattern Recognition**: Identifies class definitions using regex: `/\bClass\s+([A-Z][\w\d]*)\s+(.*)/i`
5. **Data Structuring**: Formats extracted data into structured objects
6. **Export**: Generates downloadable JSON/CSV files

### Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Required APIs**: FileReader, ArrayBuffer, TextDecoder, Blob, URL.createObjectURL

## 🏃‍♂️ Local Development

### Running Locally

Since this is a client-side application, you can run it locally using any HTTP server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

### File Structure

```
chmconverter/
├── index.html      # Main HTML structure
├── script.js       # Application logic and CHM processing
├── styles.css      # UI styling and responsive design
└── README.md       # Project documentation
```

## 🎨 Features in Detail

### Smart Content Detection

The converter specifically looks for patterns matching class definitions:
- Identifies lines containing "Class" followed by a capitalized class name
- Extracts multi-line descriptions that follow class declarations
- Filters out irrelevant content to focus on structured data

### User Interface

- **Modern Design**: Clean, gradient-based interface with hover effects
- **Responsive Layout**: Adapts to different screen sizes
- **Status Feedback**: Real-time feedback during file processing
- **Error Handling**: Clear error messages for unsupported files or processing issues

### Data Processing

- **Efficient Memory Usage**: Processes large files in manageable chunks
- **Text Encoding**: Handles various text encodings commonly found in CHM files
- **Data Validation**: Ensures extracted data is properly structured before export

## 📋 Limitations

- **Pattern-Based Extraction**: Currently optimized for class definitions; other content types may not be extracted
- **Browser-Based Processing**: Large files (>100MB) may impact browser performance
- **Text Content Only**: Does not extract images, formatting, or complex HTML structures
- **Single Format Focus**: Primarily designed for API documentation patterns

## 🤝 Contributing

This project welcomes contributions! Areas for enhancement include:

- Support for additional content patterns (functions, interfaces, etc.)
- Enhanced error handling and user feedback
- Additional export formats (XML, Markdown, etc.)
- Improved content detection algorithms
- Performance optimizations for large files

## 📄 License

This project is open source. Please check the repository for license information.

## 🆘 Support

If you encounter issues or have questions:

1. Check that your CHM file is valid and contains the expected content patterns
2. Ensure you're using a modern browser with JavaScript enabled
3. Try with smaller files if you experience performance issues
4. Open an issue in the GitHub repository for bugs or feature requests