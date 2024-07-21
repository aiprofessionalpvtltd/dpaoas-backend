const fs = require('fs');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const passService = require('../services/passes.service');


// Function to convert passVisitorData to a string for the PDF
function formatPDFContent(data) {
    // This is an example of formatting. Adjust it based on your data structure.
    let content = `Pass ID: ${data.pass.id}\nVisitors:\n`;
    data.visitor.forEach(v => {
        content += `Visitor ID: ${v.id}, Name: ${v.name}\n`;
    });
    return content;
}

// Function to generate a PDF
async function generatePDF(passId, outputPath) {
    try {
       const passVisitorData = await passService.getPDFData(passId);

        const formattedContent = formatPDFContent(passVisitorData);

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(outputPath));

        // Add formatted content to the PDF
        doc.fontSize(16).text(formattedContent);

        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}

// Example Usage
const passId = 123; // Replace with actual passId
const pdfOutputPath = __dirname + '/output.pdf';
generatePDF(passId, pdfOutputPath);

// // Function to generate a PDF
// async function generatePDF(getPDFData, outputPath) {
//   const doc = new PDFDocument();
//   doc.pipe(fs.createWriteStream(outputPath));

//   const passVisitorData = await getPDFData(getPDFData);
// console.log("dd-->", passVisitorData);


//   // Add content to the PDF
//   doc.fontSize(16).text(passVisitorData);

//   // Finalize the PDF
//   doc.end();
// }

// // Function to generate a QR code
// async function generateQRCode(content, outputPath, ) {
//   try {
//     await QRCode.toFile(outputPath, content);
//     console.log('QR Code generated successfully!');
//   } catch (error) {
//     console.error('Error generating QR Code:', error);
//   }
// }

// // Example content

// const pdfContent = 'Hello, this is a sample PDF content!';
// const qrCodeContent = 'https://example.com'; // Replace with your desired content

// // Output paths
// const pdfOutputPath = __dirname + '/output.pdf';
// const qrCodeOutputPath = __dirname + '/qrcode.png'

// // Generate PDF
// generatePDF(pdfContent, pdfOutputPath);

// // Generate QR code
// generateQRCode(qrCodeContent, qrCodeOutputPath);