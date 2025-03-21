// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { fromPath } = require('pdf2pic');
const libre = require('libreoffice-convert');
const { promisify } = require('util');
const libreConvert = promisify(libre.convert);
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5002;

// Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : false
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/merged', express.static('merged'));

// In production, serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const mergedDir = path.join(__dirname, 'merged');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(mergedDir)) fs.mkdirSync(mergedDir);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
app.post('/api/upload', upload.array('documents', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  const files = req.files.map(file => ({
    id: file.filename,
    name: file.originalname,
    path: file.path,
    size: file.size,
    type: file.mimetype
  }));
  
  res.json({ files });
});

// Convert document to PDF based on file type
async function convertToPdf(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.pdf') {
    return fs.readFileSync(filePath);
  }
  
  if (['.doc', '.docx', '.txt', '.rtf', '.odt'].includes(ext)) {
    // Convert Office documents to PDF using LibreOffice
    const docxBuf = fs.readFileSync(filePath);
    return await libreConvert(docxBuf, '.pdf', undefined);
  }
  
  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext)) {
    // Convert images to PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const img = await fs.promises.readFile(filePath);
    
    let embedImg;
    if (['.jpg', '.jpeg'].includes(ext)) {
      embedImg = await pdfDoc.embedJpg(img);
    } else {
      embedImg = await pdfDoc.embedPng(img);
    }
    
    const page = pdfDoc.addPage([embedImg.width, embedImg.height]);
    page.drawImage(embedImg, {
      x: 0,
      y: 0,
      width: embedImg.width,
      height: embedImg.height,
    });
    
    return await pdfDoc.save();
  }
  
  throw new Error(`Unsupported file type: ${ext}`);
}

// Merge PDFs
app.post('/api/merge', async (req, res) => {
  try {
    const { files } = req.body;
    
    if (!files || files.length < 1) {
      return res.status(400).json({ error: 'No files provided to merge' });
    }
    
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    
    // Process each file
    for (const file of files) {
      const filePath = path.join(__dirname, file.path);
      
      try {
        // Convert to PDF if needed
        const pdfBytes = await convertToPdf(filePath);
        
        // Load the PDF document
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Copy pages from the source document to the merged document
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => {
          mergedPdf.addPage(page);
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Continue with other files
      }
    }
    
    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    const outputFileName = `merged-${Date.now()}.pdf`;
    const outputPath = path.join(mergedDir, outputFileName);
    
    fs.writeFileSync(outputPath, mergedPdfBytes);
    
    res.json({ 
      success: true, 
      file: {
        name: outputFileName,
        path: `/merged/${outputFileName}`,
        url: `http://localhost:${PORT}/merged/${outputFileName}`
      }
    });
  } catch (error) {
    console.error('Error merging PDFs:', error);
    res.status(500).json({ error: 'Failed to merge PDFs' });
  }
});

// Download endpoint
app.get('/api/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'merged', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).json({ error: 'Failed to download file' });
    }
  });
});

// The "catchall" handler for production: for any request that doesn't
// match one above, send back React's index.html file.
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
