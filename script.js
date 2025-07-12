// CHM Converter Script
class CHMConverter {
    constructor() {
        this.selectedFile = null;
        this.convertedData = null;
        this.selectedFormat = 'txt';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const convertBtn = document.getElementById('convertBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const formatBtns = document.querySelectorAll('.format-btn');

        // File upload handling
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Format selection
        formatBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                formatBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedFormat = btn.dataset.format;
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
            this.showStatus('Please select a CHM file.', 'error');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            this.showStatus('File size exceeds 50MB limit.', 'error');
            return;
        }

        this.selectedFile = file;
        this.displayFileInfo(file);
        this.updateConvertButton();
    }

    displayFileInfo(file) {
        const fileInfo = document.getElementById('fileInfo');
        const size = this.formatFileSize(file.size);
        
        fileInfo.innerHTML = `
            <div class="file-details">
                <span class="file-name">${file.name}</span>
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
        if (this.selectedFile) {
            convertBtn.disabled = false;
            convertBtn.textContent = `Convert to ${this.selectedFormat.toUpperCase()}`;
        } else {
            convertBtn.disabled = true;
            convertBtn.textContent = 'Select a file to convert';
        }
    }

    async convertFile() {
        if (!this.selectedFile) return;

        this.showProgress(0);
        this.showStatus('Reading CHM file...', 'processing');

        try {
            // Simulate CHM parsing process
            const arrayBuffer = await this.readFileAsArrayBuffer(this.selectedFile);
            this.showProgress(25);
            
            // Extract content from CHM (simulated)
            const extractedContent = await this.extractCHMContent(arrayBuffer);
            this.showProgress(50);
            
            // Convert to selected format
            const convertedData = await this.convertToFormat(extractedContent, this.selectedFormat);
            this.showProgress(100);
            
            this.convertedData = convertedData;
            this.showStatus(`Successfully converted to ${this.selectedFormat.toUpperCase()}!`, 'success');
            this.showDownloadButton();
            
        } catch (error) {
            this.showStatus('Error converting file: ' + error.message, 'error');
            this.hideProgress();
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

    async extractCHMContent(arrayBuffer) {
        // Simulate CHM content extraction
        await this.delay(1000);
        
        // Mock extracted content structure
        return {
            title: this.selectedFile.name.replace('.chm', ''),
            topics: [
                {
                    title: 'Introduction',
                    content: 'This is the introduction section of the CHM file. It contains basic information about the topic and provides an overview of what will be covered in the subsequent chapters.'
                },
                {
                    title: 'Getting Started',
                    content: 'This section covers the basic steps to get started with the software or topic. It includes installation instructions, system requirements, and initial setup procedures.'
                },
                {
                    title: 'Advanced Features',
                    content: 'Here we explore the more advanced features and capabilities. This section is designed for users who have mastered the basics and want to leverage more sophisticated functionality.'
                },
                {
                    title: 'Troubleshooting',
                    content: 'Common issues and their solutions are covered in this section. This includes error messages, performance problems, and compatibility issues you might encounter.'
                },
                {
                    title: 'Conclusion',
                    content: 'This concluding section summarizes the key points covered throughout the documentation and provides additional resources for further learning.'
                }
            ],
            metadata: {
                extractedDate: new Date().toISOString(),
                originalFile: this.selectedFile.name,
                fileSize: this.selectedFile.size
            }
        };
    }

    async convertToFormat(content, format) {
        await this.delay(500);
        
        switch (format) {
            case 'txt':
                return this.convertToTXT(content);
            case 'pdf':
                return this.convertToPDF(content);
            case 'json':
                return this.convertToJSON(content);
            default:
                throw new Error('Unsupported format');
        }
    }

    convertToTXT(content) {
        let txtContent = `${content.title}\n`;
        txtContent += '='.repeat(content.title.length) + '\n\n';
        
        content.topics.forEach(topic => {
            txtContent += `${topic.title}\n`;
            txtContent += '-'.repeat(topic.title.length) + '\n';
            txtContent += `${topic.content}\n\n`;
        });
        
        txtContent += '\n--- File Information ---\n';
        txtContent += `Original File: ${content.metadata.originalFile}\n`;
        txtContent += `Extracted: ${new Date(content.metadata.extractedDate).toLocaleString()}\n`;
        txtContent += `File Size: ${this.formatFileSize(content.metadata.fileSize)}\n`;
        
        return {
            type: 'text/plain',
            content: txtContent,
            filename: content.title + '.txt'
        };
    }

    convertToPDF(content) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let y = 20;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        
        // Title
        doc.setFontSize(18);
        doc.text(content.title, margin, y);
        y += 15;
        
        // Topics
        content.topics.forEach(topic => {
            // Check if we need a new page
            if (y > pageHeight - 40) {
                doc.addPage();
                y = 20;
            }
            
            // Topic title
            doc.setFontSize(14);
            doc.text(topic.title, margin, y);
            y += 10;
            
            // Topic content
            doc.setFontSize(10);
            const lines = doc.splitTextToSize(topic.content, 170);
            lines.forEach(line => {
                if (y > pageHeight - 20) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, margin, y);
                y += 5;
            });
            y += 5;
        });
        
        // Metadata
        if (y > pageHeight - 30) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(8);
        doc.text(`Original File: ${content.metadata.originalFile}`, margin, y);
        doc.text(`Extracted: ${new Date(content.metadata.extractedDate).toLocaleString()}`, margin, y + 5);
        doc.text(`File Size: ${this.formatFileSize(content.metadata.fileSize)}`, margin, y + 10);
        
        return {
            type: 'application/pdf',
            content: doc.output('blob'),
            filename: content.title + '.pdf'
        };
    }

    convertToJSON(content) {
        const jsonContent = JSON.stringify(content, null, 2);
        
        return {
            type: 'application/json',
            content: jsonContent,
            filename: content.title + '.json'
        };
    }

    downloadFile() {
        if (!this.convertedData) return;
        
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
    }

    showProgress(percentage) {
        const progressBar = document.getElementById('progressBar');
        const progressFill = document.getElementById('progressFill');
        
        progressBar.style.display = 'block';
        progressFill.style.width = percentage + '%';
        
        if (percentage >= 100) {
            setTimeout(() => {
                progressBar.style.display = 'none';
            }, 1000);
        }
    }

    hideProgress() {
        document.getElementById('progressBar').style.display = 'none';
    }

    showStatus(message, type) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = 'status ' + type;
        status.style.display = 'block';
    }

    showDownloadButton() {
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.style.display = 'block';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CHMConverter();
});