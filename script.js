// Enhanced CHM Converter Script with Real Content Extraction
class CHMConverter {
    constructor() {
        this.selectedFile = null;
        this.convertedData = null;
        this.selectedFormat = 'txt';
        this.chmData = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const convertBtn = document.getElementById('convertBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const formatBtns = document.querySelectorAll('.format-btn');

        // File upload handling
        uploadArea.addEventListener('click', (e) => {
            if (e.target !== fileInput) {
                fileInput.click();
            }
        });
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Format selection
        formatBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.selectedFile) {
                    this.showStatus('Please upload a CHM file first', 'error');
                    return;
                }
                formatBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedFormat = btn.dataset.format;
                this.updateConvertButton();
            });
        });

        // Convert button
        convertBtn.addEventListener('click', this.convertFile.bind(this));

        // Download button
        downloadBtn.addEventListener('click', this.downloadFile.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        if (e.target.files.length > 0) {
            this.processFile(e.target.files[0]);
        }
    }

    processFile(file) {
        if (!file.name.toLowerCase().endsWith('.chm')) {
            this.showStatus('Please select a CHM file (.chm extension required).', 'error');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            this.showStatus('File size exceeds 50MB limit.', 'error');
            return;
        }

        this.selectedFile = file;
        this.displayFileInfo(file);
        this.updateConvertButton();
        this.showStatus('CHM file loaded successfully! Select your output format and click convert.', 'success');
    }

    displayFileInfo(file) {
        const fileInfo = document.getElementById('fileInfo');
        const size = this.formatFileSize(file.size);
        
        fileInfo.innerHTML = `
            <div class="file-details">
                <span class="file-name">📄 ${file.name}</span>
                <span class="file-size">${size}</span>
            </div>
        `;
        fileInfo.style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateConvertButton() {
        const convertBtn = document.getElementById('convertBtn');
        const btnText = convertBtn.querySelector('.btn-text');
        
        if (this.selectedFile) {
            convertBtn.disabled = false;
            btnText.textContent = `Convert to ${this.selectedFormat.toUpperCase()}`;
        } else {
            convertBtn.disabled = true;
            btnText.textContent = 'Select a CHM file first';
        }
    }

    async convertFile() {
        if (!this.selectedFile) return;

        // Show progress section
        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('downloadBtn').style.display = 'none';
        
        this.showProgress(0);
        this.showStatus('Starting conversion process...', 'processing');
        
        try {
            // Step 1: Read file
            this.showProgress(5);
            this.showStatus('Reading CHM file...', 'processing');
            const arrayBuffer = await this.readFileAsArrayBuffer(this.selectedFile);
            
            // Step 2: Parse CHM structure
            this.showProgress(15);
            this.showStatus('Parsing CHM binary structure...', 'processing');
            const parsedData = await this.parseCHMFile(arrayBuffer);
            
            // Step 3: Extract HTML content
            this.showProgress(35);
            this.showStatus('Extracting HTML content...', 'processing');
            const htmlContent = await this.extractHTMLContent(parsedData);
            
            // Step 4: Process and clean content
            this.showProgress(60);
            this.showStatus('Processing and cleaning content...', 'processing');
            const processedContent = await this.processHTMLContent(htmlContent);
            
            // Step 5: Convert to format
            this.showProgress(80);
            this.showStatus(`Converting to ${this.selectedFormat.toUpperCase()} format...`, 'processing');
            const convertedData = await this.convertToFormat(processedContent, this.selectedFormat);
            
            // Step 6: Finalize
            this.showProgress(100);
            this.showStatus('Finalizing conversion...', 'processing');
            
            this.convertedData = convertedData;
            this.showStatus(`✅ Successfully converted to ${this.selectedFormat.toUpperCase()}! Extracted ${processedContent.totalEntries} entries. Ready for download.`, 'success');
            
            // Show download button after successful conversion
            setTimeout(() => {
                this.showDownloadButton();
                document.getElementById('progressSection').style.display = 'none';
            }, 1000);
            
        } catch (error) {
            this.showStatus('❌ Error converting file: ' + error.message, 'error');
            this.hideProgress();
            console.error('Conversion error:', error);
        }
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    async parseCHMFile(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        const decoder = new TextDecoder('utf-8', { fatal: false });
        
        // Check CHM signature
        const signature = new Uint8Array(arrayBuffer, 0, 4);
        const signatureStr = String.fromCharCode(...signature);
        
        if (signatureStr !== 'ITSF') {
            throw new Error('Invalid CHM file format - missing ITSF signature');
        }
        
        // Parse CHM header
        const headerLength = view.getUint32(20, true);
        const directoryOffset = view.getUint32(48, true);
        const directoryLength = view.getUint32(52, true);
        
        // Extract directory entries
        const entries = [];
        const directoryData = new Uint8Array(arrayBuffer, directoryOffset, directoryLength);
        
        // Look for HTML files and content
        let offset = 0;
        while (offset < directoryData.length - 8) {
            try {
                const entryLength = view.getUint32(directoryOffset + offset, true);
                if (entryLength === 0 || entryLength > directoryLength) {
                    offset += 4;
                    continue;
                }
                
                const entryData = new Uint8Array(arrayBuffer, directoryOffset + offset, Math.min(entryLength, directoryLength - offset));
                const entryText = decoder.decode(entryData);
                
                if (entryText.includes('.html') || entryText.includes('.htm') || 
                    entryText.includes('class') || entryText.includes('method') || 
                    entryText.includes('function') || entryText.includes('api')) {
                    entries.push({
                        offset: directoryOffset + offset,
                        length: entryLength,
                        content: entryText
                    });
                }
                
                offset += Math.max(entryLength, 1);
            } catch (e) {
                offset += 4;
            }
        }
        
        return {
            signature: signatureStr,
            headerLength,
            directoryOffset,
            directoryLength,
            entries,
            totalSize: arrayBuffer.byteLength
        };
    }

    async extractHTMLContent(parsedData) {
        const htmlContent = [];
        const decoder = new TextDecoder('utf-8', { fatal: false });
        
        // Look for HTML-like content throughout the file
        const searchPatterns = [
            /<html[^>]*>/gi,
            /<head[^>]*>/gi,
            /<body[^>]*>/gi,
            /<div[^>]*>/gi,
            /<span[^>]*>/gi,
            /<p[^>]*>/gi,
            /<h[1-6][^>]*>/gi,
            /<pre[^>]*>/gi,
            /<code[^>]*>/gi,
            /class\s+\w+/gi,
            /function\s+\w+/gi,
            /method\s+\w+/gi,
            /property\s+\w+/gi,
            /namespace\s+\w+/gi,
            /interface\s+\w+/gi,
            /enum\s+\w+/gi
        ];
        
        // Process each entry
        for (const entry of parsedData.entries) {
            try {
                const content = entry.content;
                
                // Check if content contains HTML or API documentation
                const hasHTML = searchPatterns.some(pattern => pattern.test(content));
                
                if (hasHTML) {
                    // Extract meaningful content
                    const cleanContent = this.extractMeaningfulContent(content);
                    if (cleanContent.trim().length > 50) {
                        htmlContent.push(cleanContent);
                    }
                }
            } catch (e) {
                console.warn('Error processing entry:', e);
            }
        }
        
        return htmlContent;
    }

    extractMeaningfulContent(rawContent) {
        // Remove binary data and control characters
        let content = rawContent.replace(/[\x00-\x08\x0E-\x1F\x7F-\x9F]/g, '');
        
        // Extract text between HTML tags
        content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        content = content.replace(/<[^>]+>/g, ' ');
        
        // Clean up whitespace
        content = content.replace(/\s+/g, ' ').trim();
        
        // Look for API documentation patterns
        const apiPatterns = [
            /\b(class|interface|enum|namespace|struct)\s+\w+[\s\S]*?(?=\b(?:class|interface|enum|namespace|struct)\s+\w+|\n\n|\r\n\r\n|$)/gi,
            /\b(function|method|property|field|event)\s+\w+[\s\S]*?(?=\b(?:function|method|property|field|event)\s+\w+|\n\n|\r\n\r\n|$)/gi,
            /\b\w+\s*\([^)]*\)\s*[:=]\s*[^;]+/gi,
            /\b\w+\.\w+[\s\S]*?(?=\b\w+\.\w+|\n\n|\r\n\r\n|$)/gi
        ];
        
        let extractedContent = '';
        
        for (const pattern of apiPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                extractedContent += matches.join('\n\n') + '\n\n';
            }
        }
        
        // If no API patterns found, return cleaned content
        if (extractedContent.trim().length === 0) {
            return content;
        }
        
        return extractedContent;
    }

    async processHTMLContent(htmlContent) {
        const processedEntries = [];
        const classMap = new Map();
        const methodMap = new Map();
        const propertyMap = new Map();
        
        for (const content of htmlContent) {
            // Extract classes
            const classMatches = content.match(/\b(?:class|interface|enum|namespace|struct)\s+(\w+)[\s\S]*?(?=\b(?:class|interface|enum|namespace|struct)\s+\w+|$)/gi);
            if (classMatches) {
                classMatches.forEach(match => {
                    const className = match.match(/\b(?:class|interface|enum|namespace|struct)\s+(\w+)/i)?.[1];
                    if (className) {
                        classMap.set(className, match.trim());
                    }
                });
            }
            
            // Extract methods/functions
            const methodMatches = content.match(/\b(?:function|method|procedure|sub)\s+(\w+)[\s\S]*?(?=\b(?:function|method|procedure|sub)\s+\w+|\n\n|$)/gi);
            if (methodMatches) {
                methodMatches.forEach(match => {
                    const methodName = match.match(/\b(?:function|method|procedure|sub)\s+(\w+)/i)?.[1];
                    if (methodName) {
                        methodMap.set(methodName, match.trim());
                    }
                });
            }
            
            // Extract properties
            const propertyMatches = content.match(/\b(?:property|field|attribute|var|let|const)\s+(\w+)[\s\S]*?(?=\b(?:property|field|attribute|var|let|const)\s+\w+|\n\n|$)/gi);
            if (propertyMatches) {
                propertyMatches.forEach(match => {
                    const propertyName = match.match(/\b(?:property|field|attribute|var|let|const)\s+(\w+)/i)?.[1];
                    if (propertyName) {
                        propertyMap.set(propertyName, match.trim());
                    }
                });
            }
            
            // Add general content if it looks like documentation
            if (content.length > 100 && (content.includes('(') || content.includes('{') || content.includes(':'))) {
                processedEntries.push({
                    type: 'documentation',
                    content: content.trim()
                });
            }
        }
        
        // Convert maps to arrays
        const classes = Array.from(classMap.entries()).map(([name, content]) => ({
            type: 'class',
            name,
            content
        }));
        
        const methods = Array.from(methodMap.entries()).map(([name, content]) => ({
            type: 'method',
            name,
            content
        }));
        
        const properties = Array.from(propertyMap.entries()).map(([name, content]) => ({
            type: 'property',
            name,
            content
        }));
        
        return {
            classes,
            methods,
            properties,
            documentation: processedEntries,
            totalEntries: classes.length + methods.length + properties.length + processedEntries.length,
            metadata: {
                extractedDate: new Date().toISOString(),
                originalFile: this.selectedFile.name,
                fileSize: this.selectedFile.size,
                format: this.selectedFormat
            }
        };
    }

    async convertToFormat(content, format) {
        switch (format) {
            case 'txt':
                return this.convertToTXT(content);
            case 'pdf':
                return this.convertToPDF(content);
            case 'json':
                return this.convertToJSON(content);
            default:
                throw new Error('Unsupported format: ' + format);
        }
    }

    convertToTXT(content) {
        let txtContent = `API Documentation - ${content.metadata.originalFile}\n`;
        txtContent += '='.repeat(60) + '\n\n';
        
        txtContent += `Extraction Summary:\n`;
        txtContent += `- Total Entries: ${content.totalEntries}\n`;
        txtContent += `- Classes: ${content.classes.length}\n`;
        txtContent += `- Methods: ${content.methods.length}\n`;
        txtContent += `- Properties: ${content.properties.length}\n`;
        txtContent += `- Documentation Blocks: ${content.documentation.length}\n`;
        txtContent += `- Original File Size: ${this.formatFileSize(content.metadata.fileSize)}\n`;
        txtContent += `- Extracted: ${new Date(content.metadata.extractedDate).toLocaleString()}\n\n`;
        txtContent += '='.repeat(60) + '\n\n';
        
        // Add Classes
        if (content.classes.length > 0) {
            txtContent += 'CLASSES\n';
            txtContent += '-'.repeat(60) + '\n\n';
            content.classes.forEach((cls, index) => {
                txtContent += `${index + 1}. ${cls.name}\n`;
                txtContent += '-'.repeat(cls.name.length + 3) + '\n';
                txtContent += `${cls.content}\n\n`;
            });
            txtContent += '\n';
        }
        
        // Add Methods
        if (content.methods.length > 0) {
            txtContent += 'METHODS\n';
            txtContent += '-'.repeat(60) + '\n\n';
            content.methods.forEach((method, index) => {
                txtContent += `${index + 1}. ${method.name}\n`;
                txtContent += '-'.repeat(method.name.length + 3) + '\n';
                txtContent += `${method.content}\n\n`;
            });
            txtContent += '\n';
        }
        
        // Add Properties
        if (content.properties.length > 0) {
            txtContent += 'PROPERTIES\n';
            txtContent += '-'.repeat(60) + '\n\n';
            content.properties.forEach((prop, index) => {
                txtContent += `${index + 1}. ${prop.name}\n`;
                txtContent += '-'.repeat(prop.name.length + 3) + '\n';
                txtContent += `${prop.content}\n\n`;
            });
            txtContent += '\n';
        }
        
        // Add Documentation
        if (content.documentation.length > 0) {
            txtContent += 'ADDITIONAL DOCUMENTATION\n';
            txtContent += '-'.repeat(60) + '\n\n';
            content.documentation.forEach((doc, index) => {
                txtContent += `${index + 1}. Documentation Block\n`;
                txtContent += '-'.repeat(25) + '\n';
                txtContent += `${doc.content}\n\n`;
            });
        }
        
        txtContent += '\n' + '='.repeat(60) + '\n';
        txtContent += 'End of API Documentation\n';
        txtContent += `Generated by CHM Converter on ${new Date().toLocaleString()}\n`;
        
        return {
            type: 'text/plain',
            content: txtContent,
            filename: this.sanitizeFilename(content.metadata.originalFile.replace('.chm', '')) + '_api_docs.txt'
        };
    }

    convertToPDF(content) {
        const { jsPDF } = window.jsPDF;
        const doc = new jsPDF();
        
        let y = 20;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        const lineHeight = 6;
        
        // Title page
        doc.setFontSize(20);
        doc.text('API Documentation', pageWidth / 2, y, { align: 'center' });
        y += 15;
        
        doc.setFontSize(14);
        doc.text(content.metadata.originalFile, pageWidth / 2, y, { align: 'center' });
        y += 20;
        
        // Summary
        doc.setFontSize(12);
        doc.text('Extraction Summary:', margin, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.text(`Total Entries: ${content.totalEntries}`, margin, y);
        y += lineHeight;
        doc.text(`Classes: ${content.classes.length}`, margin, y);
        y += lineHeight;
        doc.text(`Methods: ${content.methods.length}`, margin, y);
        y += lineHeight;
        doc.text(`Properties: ${content.properties.length}`, margin, y);
        y += lineHeight;
        doc.text(`Documentation Blocks: ${content.documentation.length}`, margin, y);
        y += 20;
        
        // Add content sections
        const sections = [
            { title: 'Classes', items: content.classes },
            { title: 'Methods', items: content.methods },
            { title: 'Properties', items: content.properties },
            { title: 'Documentation', items: content.documentation }
        ];
        
        sections.forEach(section => {
            if (section.items.length > 0) {
                // Section header
                if (y > pageHeight - 30) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.setFontSize(16);
                doc.text(section.title, margin, y);
                y += 15;
                
                // Items
                section.items.forEach((item, index) => {
                    const title = item.name || `${section.title} Item ${index + 1}`;
                    const maxWidth = pageWidth - (margin * 2);
                    
                    if (y > pageHeight - 40) {
                        doc.addPage();
                        y = 20;
                    }
                    
                    doc.setFontSize(12);
                    doc.text(`${index + 1}. ${title}`, margin, y);
                    y += 10;
                    
                    doc.setFontSize(9);
                    const lines = doc.splitTextToSize(item.content, maxWidth);
                    
                    lines.forEach(line => {
                        if (y > pageHeight - 20) {
                            doc.addPage();
                            y = 20;
                        }
                        doc.text(line, margin, y);
                        y += lineHeight;
                    });
                    
                    y += 8;
                });
            }
        });
        
        return {
            type: 'application/pdf',
            content: doc.output('blob'),
            filename: this.sanitizeFilename(content.metadata.originalFile.replace('.chm', '')) + '_api_docs.pdf'
        };
    }

    convertToJSON(content) {
        const jsonContent = JSON.stringify(content, null, 2);
        
        return {
            type: 'application/json',
            content: jsonContent,
            filename: this.sanitizeFilename(content.metadata.originalFile.replace('.chm', '')) + '_api_docs.json'
        };
    }

    sanitizeFilename(filename) {
        return filename.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
    }

    downloadFile() {
        if (!this.convertedData) {
            this.showStatus('No converted file available for download.', 'error');
            return;
        }
        
        try {
            const blob = this.convertedData.type === 'application/pdf' 
                ? this.convertedData.content 
                : new Blob([this.convertedData.content], { type: this.convertedData.type });
                
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.convertedData.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showStatus('✅ File downloaded successfully!', 'success');
        } catch (error) {
            this.showStatus('❌ Error downloading file: ' + error.message, 'error');
        }
    }

    showProgress(percentage) {
        const progressSection = document.getElementById('progressSection');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressSection.style.display = 'block';
        progressFill.style.width = percentage + '%';
        progressText.textContent = percentage + '%';
    }

    hideProgress() {
        document.getElementById('progressSection').style.display = 'none';
    }

    showStatus(message, type) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = 'status ' + type;
        status.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                status.style.display = 'none';
            }, 5000);
        }
    }

    showDownloadButton() {
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.style.display = 'flex';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CHMConverter();
});