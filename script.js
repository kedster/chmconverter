// Enhanced CHM Converter Script with API Focus and Error Handling
class CHMConverter {
    constructor() {
        this.selectedFile = null;
        this.convertedData = null;
        this.selectedFormat = 'txt';
        this.chmData = null;
        this.maxArrayLength = 67108864; // 64MB max array length
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

        if (file.size > 100 * 1024 * 1024) {
            this.showStatus('File size exceeds 100MB limit.', 'error');
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
            this.showProgress(10);
            this.showStatus('Reading CHM file...', 'processing');
            const arrayBuffer = await this.readFileAsArrayBuffer(this.selectedFile);
            
            // Step 2: Parse CHM structure with safety checks
            this.showProgress(25);
            this.showStatus('Parsing CHM structure...', 'processing');
            const chmInfo = await this.analyzeCHMStructure(arrayBuffer);
            
            // Step 3: Extract content using multiple strategies
            this.showProgress(50);
            this.showStatus('Extracting API documentation...', 'processing');
            const extractedContent = await this.extractAPIContent(arrayBuffer, chmInfo);
            
            // Step 4: Process and organize content
            this.showProgress(75);
            this.showStatus('Processing and organizing content...', 'processing');
            const processedContent = await this.processAPIContent(extractedContent);
            
            // Step 5: Convert to format
            this.showProgress(90);
            this.showStatus(`Converting to ${this.selectedFormat.toUpperCase()} format...`, 'processing');
            const convertedData = await this.convertToFormat(processedContent, this.selectedFormat);
            
            // Step 6: Finalize
            this.showProgress(100);
            this.showStatus('Finalizing conversion...', 'processing');
            
            this.convertedData = convertedData;
            this.showStatus(`✅ Successfully converted! Found ${processedContent.totalEntries} API entries. Ready for download.`, 'success');
            
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

    async analyzeCHMStructure(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        const decoder = new TextDecoder('utf-8', { fatal: false });
        
        // Check CHM signature
        if (arrayBuffer.byteLength < 8) {
            throw new Error('File too small to be a valid CHM file');
        }
        
        const signature = new Uint8Array(arrayBuffer, 0, 4);
        const signatureStr = String.fromCharCode(...signature);
        
        if (signatureStr !== 'ITSF') {
            throw new Error('Invalid CHM file format - missing ITSF signature');
        }
        
        // Safely read header information
        const headerInfo = {
            signature: signatureStr,
            version: arrayBuffer.byteLength >= 8 ? view.getUint32(4, true) : 0,
            totalSize: arrayBuffer.byteLength,
            hasValidStructure: false,
            directoryOffset: 0,
            directoryLength: 0
        };
        
        // Try to find directory information safely
        try {
            if (arrayBuffer.byteLength >= 56) {
                const directoryOffset = view.getUint32(48, true);
                const directoryLength = view.getUint32(52, true);
                
                // Validate directory bounds
                if (directoryOffset > 0 && directoryOffset < arrayBuffer.byteLength &&
                    directoryLength > 0 && directoryLength < arrayBuffer.byteLength &&
                    directoryOffset + directoryLength <= arrayBuffer.byteLength) {
                    
                    headerInfo.directoryOffset = directoryOffset;
                    headerInfo.directoryLength = directoryLength;
                    headerInfo.hasValidStructure = true;
                }
            }
        } catch (e) {
            console.warn('Could not read directory info:', e);
        }
        
        return headerInfo;
    }

    async extractAPIContent(arrayBuffer, chmInfo) {
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const content = [];
        const chunkSize = 8192; // Process in 8KB chunks
        
        // Strategy 1: If we have valid directory structure, use it
        if (chmInfo.hasValidStructure) {
            try {
                const directoryData = new Uint8Array(arrayBuffer, chmInfo.directoryOffset, 
                    Math.min(chmInfo.directoryLength, this.maxArrayLength));
                const directoryText = decoder.decode(directoryData);
                
                if (this.containsAPIContent(directoryText)) {
                    content.push({
                        source: 'directory',
                        content: directoryText
                    });
                }
            } catch (e) {
                console.warn('Directory extraction failed:', e);
            }
        }
        
        // Strategy 2: Scan entire file in chunks looking for API patterns
        let offset = 0;
        while (offset < arrayBuffer.byteLength) {
            try {
                const chunkEnd = Math.min(offset + chunkSize, arrayBuffer.byteLength);
                const chunk = new Uint8Array(arrayBuffer, offset, chunkEnd - offset);
                const chunkText = decoder.decode(chunk);
                
                if (this.containsAPIContent(chunkText)) {
                    // Extract a larger context around API content
                    const contextStart = Math.max(0, offset - chunkSize);
                    const contextEnd = Math.min(arrayBuffer.byteLength, offset + chunkSize * 2);
                    
                    try {
                        const contextChunk = new Uint8Array(arrayBuffer, contextStart, contextEnd - contextStart);
                        const contextText = decoder.decode(contextChunk);
                        
                        content.push({
                            source: 'chunk',
                            offset: contextStart,
                            content: contextText
                        });
                    } catch (e) {
                        // If context extraction fails, use the original chunk
                        content.push({
                            source: 'chunk',
                            offset: offset,
                            content: chunkText
                        });
                    }
                }
                
                offset += chunkSize;
            } catch (e) {
                console.warn(`Error processing chunk at offset ${offset}:`, e);
                offset += chunkSize;
            }
        }
        
        // Strategy 3: Look for HTML content with API documentation
        const htmlMatches = this.findHTMLContent(arrayBuffer);
        content.push(...htmlMatches);
        
        return content;
    }

    containsAPIContent(text) {
        const apiPatterns = [
            /\b(class|interface|enum|namespace|struct|module)\s+\w+/i,
            /\b(function|method|procedure|sub|def)\s+\w+/i,
            /\b(property|field|attribute|var|let|const)\s+\w+/i,
            /\b\w+\s*\([^)]*\)\s*[:{=]/,
            /\b\w+\.\w+\s*[\(=:]/,
            /<(h[1-6]|div|span|p|pre|code)[^>]*>(.*?)(api|method|class|function|property|namespace|interface|enum)/i,
            /\b(public|private|protected|static|abstract|virtual|override)\s+\w+/i,
            /\b(returns?|parameters?|arguments?|throws?|deprecated|since|version)\s*[:=]/i,
            /\b(get|set|add|remove|create|delete|update|insert|select)\s*\(/i,
            /\b(event|delegate|callback|handler)\s+\w+/i
        ];
        
        return apiPatterns.some(pattern => pattern.test(text));
    }

    findHTMLContent(arrayBuffer) {
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const content = [];
        const chunkSize = 16384; // 16KB chunks for HTML search
        
        let offset = 0;
        while (offset < arrayBuffer.byteLength) {
            try {
                const chunkEnd = Math.min(offset + chunkSize, arrayBuffer.byteLength);
                const chunk = new Uint8Array(arrayBuffer, offset, chunkEnd - offset);
                const chunkText = decoder.decode(chunk);
                
                // Look for HTML tags and API documentation
                const htmlPatterns = [
                    /<html[^>]*>[\s\S]*?<\/html>/gi,
                    /<head[^>]*>[\s\S]*?<\/head>/gi,
                    /<body[^>]*>[\s\S]*?<\/body>/gi,
                    /<div[^>]*class[^>]*api[^>]*>[\s\S]*?<\/div>/gi,
                    /<pre[^>]*>[\s\S]*?<\/pre>/gi,
                    /<code[^>]*>[\s\S]*?<\/code>/gi
                ];
                
                htmlPatterns.forEach(pattern => {
                    const matches = chunkText.match(pattern);
                    if (matches) {
                        matches.forEach(match => {
                            if (this.containsAPIContent(match)) {
                                content.push({
                                    source: 'html',
                                    offset: offset,
                                    content: match
                                });
                            }
                        });
                    }
                });
                
                offset += chunkSize;
            } catch (e) {
                console.warn(`Error finding HTML content at offset ${offset}:`, e);
                offset += chunkSize;
            }
        }
        
        return content;
    }

    async processAPIContent(extractedContent) {
        const apiElements = {
            classes: new Map(),
            interfaces: new Map(),
            enums: new Map(),
            namespaces: new Map(),
            methods: new Map(),
            properties: new Map(),
            events: new Map(),
            delegates: new Map(),
            constants: new Map(),
            types: new Map(),
            documentation: []
        };
        
        for (const item of extractedContent) {
            try {
                const cleanContent = this.cleanContent(item.content);
                
                // Extract different API elements
                this.extractClasses(cleanContent, apiElements.classes);
                this.extractInterfaces(cleanContent, apiElements.interfaces);
                this.extractEnums(cleanContent, apiElements.enums);
                this.extractNamespaces(cleanContent, apiElements.namespaces);
                this.extractMethods(cleanContent, apiElements.methods);
                this.extractProperties(cleanContent, apiElements.properties);
                this.extractEvents(cleanContent, apiElements.events);
                this.extractDelegates(cleanContent, apiElements.delegates);
                this.extractConstants(cleanContent, apiElements.constants);
                this.extractTypes(cleanContent, apiElements.types);
                
                // Store general documentation
                if (cleanContent.length > 100) {
                    apiElements.documentation.push({
                        source: item.source,
                        content: cleanContent
                    });
                }
            } catch (e) {
                console.warn('Error processing content item:', e);
            }
        }
        
        // Convert Maps to Arrays for easier processing
        const result = {
            classes: Array.from(apiElements.classes.entries()).map(([name, content]) => ({ name, content })),
            interfaces: Array.from(apiElements.interfaces.entries()).map(([name, content]) => ({ name, content })),
            enums: Array.from(apiElements.enums.entries()).map(([name, content]) => ({ name, content })),
            namespaces: Array.from(apiElements.namespaces.entries()).map(([name, content]) => ({ name, content })),
            methods: Array.from(apiElements.methods.entries()).map(([name, content]) => ({ name, content })),
            properties: Array.from(apiElements.properties.entries()).map(([name, content]) => ({ name, content })),
            events: Array.from(apiElements.events.entries()).map(([name, content]) => ({ name, content })),
            delegates: Array.from(apiElements.delegates.entries()).map(([name, content]) => ({ name, content })),
            constants: Array.from(apiElements.constants.entries()).map(([name, content]) => ({ name, content })),
            types: Array.from(apiElements.types.entries()).map(([name, content]) => ({ name, content })),
            documentation: apiElements.documentation.slice(0, 50), // Limit to 50 docs
            metadata: {
                extractedDate: new Date().toISOString(),
                originalFile: this.selectedFile.name,
                fileSize: this.selectedFile.size,
                format: this.selectedFormat,
                totalSources: extractedContent.length
            }
        };
        
        result.totalEntries = result.classes.length + result.interfaces.length + result.enums.length + 
                            result.namespaces.length + result.methods.length + result.properties.length + 
                            result.events.length + result.delegates.length + result.constants.length + 
                            result.types.length + result.documentation.length;
        
        return result;
    }

    cleanContent(content) {
        // Remove binary data and control characters
        let cleaned = content.replace(/[\x00-\x08\x0E-\x1F\x7F-\x9F]/g, '');
        
        // Remove HTML tags but preserve structure
        cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        cleaned = cleaned.replace(/<[^>]+>/g, ' ');
        
        // Clean up whitespace
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        // Decode HTML entities
        cleaned = cleaned.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        
        return cleaned;
    }

    extractClasses(content, classesMap) {
        const patterns = [
            /\b(?:public|private|protected|internal)?\s*(?:abstract|sealed|static)?\s*class\s+(\w+)[\s\S]*?(?=\bclass\s+\w+|\n\n|\r\n\r\n|$)/gi,
            /\bclass\s+(\w+)\s*[{:][\s\S]*?(?=\bclass\s+\w+|\n\n|\r\n\r\n|$)/gi
        ];
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1] && !classesMap.has(match[1])) {
                    classesMap.set(match[1], match[0].trim());
                }
            }
        });
    }

    extractInterfaces(content, interfacesMap) {
        const pattern = /\b(?:public|private|protected|internal)?\s*interface\s+(\w+)[\s\S]*?(?=\binterface\s+\w+|\n\n|\r\n\r\n|$)/gi;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (match[1] && !interfacesMap.has(match[1])) {
                interfacesMap.set(match[1], match[0].trim());
            }
        }
    }

    extractEnums(content, enumsMap) {
        const pattern = /\b(?:public|private|protected|internal)?\s*enum\s+(\w+)[\s\S]*?(?=\benum\s+\w+|\n\n|\r\n\r\n|$)/gi;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (match[1] && !enumsMap.has(match[1])) {
                enumsMap.set(match[1], match[0].trim());
            }
        }
    }

    extractNamespaces(content, namespacesMap) {
        const pattern = /\bnamespace\s+(\w+(?:\.\w+)*)[\s\S]*?(?=\bnamespace\s+\w+|\n\n|\r\n\r\n|$)/gi;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (match[1] && !namespacesMap.has(match[1])) {
                namespacesMap.set(match[1], match[0].trim());
            }
        }
    }

    extractMethods(content, methodsMap) {
        const patterns = [
            /\b(?:public|private|protected|internal)?\s*(?:static|virtual|override|abstract)?\s*(?:\w+\s+)?(\w+)\s*\([^)]*\)\s*[{;][\s\S]*?(?=\b\w+\s*\([^)]*\)\s*[{;]|\n\n|\r\n\r\n|$)/gi,
            /\bfunction\s+(\w+)\s*\([^)]*\)[\s\S]*?(?=\bfunction\s+\w+|\n\n|\r\n\r\n|$)/gi,
            /\bdef\s+(\w+)\s*\([^)]*\)[\s\S]*?(?=\bdef\s+\w+|\n\n|\r\n\r\n|$)/gi
        ];
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1] && !methodsMap.has(match[1]) && this.isValidMethodName(match[1])) {
                    methodsMap.set(match[1], match[0].trim());
                }
            }
        });
    }

    extractProperties(content, propertiesMap) {
        const patterns = [
            /\b(?:public|private|protected|internal)?\s*(?:static|virtual|override|abstract)?\s*(\w+)\s+(\w+)\s*[{;][\s\S]*?(?=\b\w+\s+\w+\s*[{;]|\n\n|\r\n\r\n|$)/gi,
            /\bproperty\s+(\w+)[\s\S]*?(?=\bproperty\s+\w+|\n\n|\r\n\r\n|$)/gi,
            /\b(?:var|let|const)\s+(\w+)[\s\S]*?(?=\b(?:var|let|const)\s+\w+|\n\n|\r\n\r\n|$)/gi
        ];
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const propName = match[2] || match[1];
                if (propName && !propertiesMap.has(propName) && this.isValidPropertyName(propName)) {
                    propertiesMap.set(propName, match[0].trim());
                }
            }
        });
    }

    extractEvents(content, eventsMap) {
        const pattern = /\b(?:public|private|protected|internal)?\s*event\s+(\w+)[\s\S]*?(?=\bevent\s+\w+|\n\n|\r\n\r\n|$)/gi;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (match[1] && !eventsMap.has(match[1])) {
                eventsMap.set(match[1], match[0].trim());
            }
        }
    }

    extractDelegates(content, delegatesMap) {
        const pattern = /\b(?:public|private|protected|internal)?\s*delegate\s+(\w+)[\s\S]*?(?=\bdelegate\s+\w+|\n\n|\r\n\r\n|$)/gi;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (match[1] && !delegatesMap.has(match[1])) {
                delegatesMap.set(match[1], match[0].trim());
            }
        }
    }

    extractConstants(content, constantsMap) {
        const pattern = /\b(?:public|private|protected|internal)?\s*const\s+(\w+)[\s\S]*?(?=\bconst\s+\w+|\n\n|\r\n\r\n|$)/gi;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (match[1] && !constantsMap.has(match[1])) {
                constantsMap.set(match[1], match[0].trim());
            }
        }
    }

    extractTypes(content, typesMap) {
        const pattern = /\b(?:public|private|protected|internal)?\s*(?:struct|union|typedef)\s+(\w+)[\s\S]*?(?=\b(?:struct|union|typedef)\s+\w+|\n\n|\r\n\r\n|$)/gi;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (match[1] && !typesMap.has(match[1])) {
                typesMap.set(match[1], match[0].trim());
            }
        }
    }

    isValidMethodName(name) {
        // Filter out common false positives
        const invalidNames = ['get', 'set', 'add', 'remove', 'new', 'delete', 'if', 'else', 'for', 'while', 'return', 'this', 'base', 'super'];
        return !invalidNames.includes(name.toLowerCase()) && name.length > 1;
    }

    isValidPropertyName(name) {
        // Filter out common false positives
        const invalidNames = ['int', 'string', 'bool', 'void', 'object', 'class', 'interface', 'enum', 'namespace'];
        return !invalidNames.includes(name.toLowerCase()) && name.length > 1;
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
        txtContent += '='.repeat(80) + '\n\n';
        
        txtContent += `Extraction Summary:\n`;
        txtContent += `- Original File: ${content.metadata.originalFile}\n`;
        txtContent += `- File Size: ${this.formatFileSize(content.metadata.fileSize)}\n`;
        txtContent += `- Extracted: ${new Date(content.metadata.extractedDate).toLocaleString()}\n`;
        txtContent += `- Total Sources Processed: ${content.metadata.totalSources}\n`;
        txtContent += `- Total API Entries Found: ${content.totalEntries}\n\n`;
        
        txtContent += `Content Breakdown:\n`;
        txtContent += `- Classes: ${content.classes.length}\n`;
        txtContent += `- Interfaces: ${content.interfaces.length}\n`;
        txtContent += `- Enums: ${content.enums.length}\n`;
        txtContent += `- Namespaces: ${content.namespaces.length}\n`;
        txtContent += `- Methods: ${content.methods.length}\n`;
        txtContent += `- Properties: ${content.properties.length}\n`;
        txtContent += `- Events: ${content.events.length}\n`;
        txtContent += `- Delegates: ${content.delegates.length}\n`;
        txtContent += `- Constants: ${content.constants.length}\n`;
        txtContent += `- Types: ${content.types.length}\n`;
        txtContent += `- Documentation Blocks: ${content.documentation.length}\n\n`;
        txtContent += '='.repeat(80) + '\n\n';
        
        // Add content sections
        const sections = [
            { title: 'NAMESPACES', items: content.namespaces, symbol: '📁' },
            { title: 'CLASSES', items: content.classes, symbol: '🏗️' },
            { title: 'INTERFACES', items: content.interfaces, symbol: '🔌' },
            { title: 'ENUMS', items: content.enums, symbol: '📋' },
            { title: 'METHODS', items: content.methods, symbol: '⚙️' },
            { title: 'PROPERTIES', items: content.properties, symbol: '🔧' },
            { title: 'EVENTS', items: content.events, symbol: '📡' },
            { title: 'DELEGATES', items: content.delegates, symbol: '🎯' },
            { title: 'CONSTANTS', items: content.constants, symbol: '🔒' },
            { title: 'TYPES', items: content.types, symbol: '📊' }
        ];
        
        sections.forEach(section => {
            if (section.items.length > 0) {
                txtContent += `${section.symbol} ${section.title}\n`;
                txtContent += '-'.repeat(80) + '\n\n';
                
                section.items.forEach((item, index) => {
                    txtContent += `${index + 1}. ${item.name}\n`;
                    txtContent += '~'.repeat(item.name.length + 3) + '\n';
                    txtContent += `${item.content}\n\n`;
                });
                txtContent += '\n';
            }
        });
        
        // Add additional documentation
        if (content.documentation.length > 0) {
            txtContent += `📚 ADDITIONAL DOCUMENTATION\n`;
            txtContent += '-'.repeat(80) + '\n\n';
            content.documentation.forEach((doc, index) => {
                txtContent += `${index + 1}. Documentation Block (Source: ${doc.source})\n`;
                txtContent += '~'.repeat(30) + '\n';
                txtContent += `${doc.content.substring(0, 1000)}${doc.content.length > 1000 ? '...' : ''}\n\n`;
            });
        }
        
        txtContent += '\n' + '='.repeat(80) + '\n';
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
        doc.setFontSize(24);
        doc.text('API Documentation', pageWidth / 2, y, { align: 'center' });
        y += 15;
        
        doc.setFontSize(14);
        doc.text(content.metadata.originalFile, pageWidth / 2, y, { align: 'center' });
        y += 20;
        
        // Summary box
        doc.setFontSize(12);
        doc.text('Extraction Summary', margin, y);
        y += 10;
        
        doc.setFontSize(10);
        const summaryItems = [
            `File Size: ${this.formatFileSize(content.metadata.fileSize)}`,
            `Extracted: ${new Date(content.metadata.extractedDate).toLocaleString()}`,
            `Total API Entries: ${content.totalEntries}`,
            `Classes: ${content.classes.length}`,
            `Interfaces: ${content.interfaces.length}`,
            `Methods: ${content.methods.length}`,
            `Properties: ${content.properties.length}`,
            `Events: ${content.events.length}`,
            `Namespaces: ${content.namespaces.length}`
        ];
        
        summaryItems.forEach(item => {
            doc.text(item, margin, y);
            y += lineHeight;
        });
        
        y += 15;
        
        // Add content sections
        const sections = [
            { title: 'Namespaces', items: content.namespaces, icon: '📁' },
            { title: 'Classes', items: content.classes, icon: '🏗️' },
            { title: 'Interfaces', items: content.interfaces, icon: '🔌' },
            { title: 'Enums', items: content.enums, icon: '📋' },
            { title: 'Methods', items: content.methods, icon: '⚙️' },
            { title: 'Properties', items: content.properties, icon: '🔧' },
            { title: 'Events', items: content.events, icon: '📡' },
            { title: 'Delegates', items: content.delegates, icon: '🎯' },
            { title: 'Constants', items: content.constants, icon: '🔒' },
            { title: 'Types', items: content.types, icon: '📊' }
        ];
        
        sections.forEach(section => {
            if (section.items.length > 0) {
                // Check if we need a new page
                if (y > pageHeight - 40) {
                    doc.addPage();
                    y = 20;
                }
                
                // Section header
                doc.setFontSize(16);
                doc.text(`${section.icon} ${section.title}`, margin, y);
                y += 15;
                
                // Items
                section.items.forEach((item, index) => {
                    if (index >= 20) return; // Limit items per section in PDF
                    
                    const maxWidth = pageWidth - (margin * 2);
                    
                    if (y > pageHeight - 30) {
                        doc.addPage();
                        y = 20;
                    }
                    
                    doc.setFontSize(12);
                    doc.text(`${index + 1}. ${item.name}`, margin, y);
                    y += 8;
                    
                    doc.setFontSize(9);
                    const content = item.content.substring(0, 500); // Limit content length
                    const lines = doc.splitTextToSize(content, maxWidth);
                    
                    lines.slice(0, 10).forEach(line => { // Limit lines per item
                        if (y > pageHeight - 20) {
                            doc.addPage();
                            y = 20;
                        }
                        doc.text(line, margin, y);
                        y += lineHeight;
                    });
                    
                    y += 5;
                });
                
                y += 10;
            }
        });
        
        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 10);
        }
        
        return {
            type: 'application/pdf',
            content: doc.output('blob'),
            filename: this.sanitizeFilename(content.metadata.originalFile.replace('.chm', '')) + '_api_docs.pdf'
        };
    }

    convertToJSON(content) {
        // Create a more structured JSON output
        const jsonContent = {
            metadata: content.metadata,
            summary: {
                totalEntries: content.totalEntries,
                breakdown: {
                    classes: content.classes.length,
                    interfaces: content.interfaces.length,
                    enums: content.enums.length,
                    namespaces: content.namespaces.length,
                    methods: content.methods.length,
                    properties: content.properties.length,
                    events: content.events.length,
                    delegates: content.delegates.length,
                    constants: content.constants.length,
                    types: content.types.length,
                    documentation: content.documentation.length
                }
            },
            api: {
                namespaces: content.namespaces,
                classes: content.classes,
                interfaces: content.interfaces,
                enums: content.enums,
                methods: content.methods,
                properties: content.properties,
                events: content.events,
                delegates: content.delegates,
                constants: content.constants,
                types: content.types
            },
            documentation: content.documentation.slice(0, 10) // Limit documentation in JSON
        };
        
        return {
            type: 'application/json',
            content: JSON.stringify(jsonContent, null, 2),
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