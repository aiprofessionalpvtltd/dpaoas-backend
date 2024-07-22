const db = require("../models");
const Passes = db.passes
const PassVisitor = db.passVisitors;
const Visitor = db.visitors;
const Op = db.Sequelize.Op;
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const QRCode = require('qrcode');
const moment = require('moment');



const passService = {

    //Create A New Pass
    createPass: async (req) => {
        try {
            // Create the pass and save it in the database
            const pass = await Passes.create(req);
            return pass;
        } catch (error) {
            throw { message: error.message || "Error Creating Pass" };

        }
    },



    // Retrieve All Passes
    findAllPasses: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
      
            const { count, rows } = await Passes.findAndCountAll({
                offset,
                limit,
            });
      
            const totalPages = Math.ceil(count / pageSize);
      
            return { count, totalPages, passes: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Passes");
        }
    },

    // Search Pass
    searchPasses: async (searchQuery, queryOptions) => {
        try {
            if (searchQuery) {
                const dateFormats = ['DD-MM-YYYY', 'D-MM-YYYY', 'DD-M-YYYY', 'D-M-YYYY'];
                const parsedDate = moment(searchQuery, dateFormats, true);
                let whereCondition;

                if (parsedDate.isValid()) {
                    whereCondition = {
                        passDate: { [Op.like]: `%${searchQuery}%` }
                    };

                }
                // Check if the searchQuery is an integer (for 'id')
                else if (!isNaN(parseInt(searchQuery))) {

                    whereCondition = { id: { [Op.eq]: parseInt(searchQuery) } };
                } else {
                    // If it's a string, search in 'passDate' and 'requestedBy'

                    whereCondition = {
                        requestedBy: { [Op.like]: `%${searchQuery}%` }

                    };
                }

                queryOptions.where = whereCondition;
            }

            const passes = await Passes.findAll(queryOptions);
            return passes;
        } catch (error) {
            throw { message: error.message || "Error Creating Pass" };
        }
    },



    // Retrive Single Pass
    findSinglePass: async (req) => {
        try {
            const fetchedPass = await Passes.findByPk(req);
            return fetchedPass;
        } catch (error) {
            throw { message: error.message || "Error Fetching Pass!" }
        }
    },

    // Update Pass
    updatePass: async (req, passId) => {
        try {
            // Update the Visitor
            await Passes.update(req.body, { where: { id: passId } });
            const updatedPass = await Passes.findByPk(passId);
            return updatedPass;
        } catch (error) {
            throw { message: error.message || "Error Updating Pass!" }

        }
    },

    // Deleting Pass
    deletePass: async (passId) => {
        try {
            await Passes.findByPk(passId);
            const deletedData = {
                passStatus: "Inactive"
            }

            await Passes.update(deletedData, { where: { id: passId } })
            const deletedPass = await Passes.findByPk(passId);

            return deletedPass;
        } catch (error) {
            throw { message: error.message || "Error Deleting Visitor!" };
        }
    },
    // Get PDF Data
    getPDFData: async (passId) => {

        try {

            const pass = await Passes.findByPk(passId)
            const passVisitor = await PassVisitor.findAll({
                where: { passId: passId }
            })

            const visitorId = await passVisitor.map(passVisitor => passVisitor.visitorId);
            const visitor = await Visitor.findAll({
                where: { id: visitorId }
            })
            const passVisitorData = {
                pass,
                visitor
            }
            return passVisitorData

        } catch (error) {
            throw { message: error.message || "Error Getting PDF Data" };
        }

    },


    generatePDF: async (passVisitorData) => {
        try {
            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();

            // Embed a standard font
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);


            // Add a new page to the document
            const page = pdfDoc.addPage();

            // Define basic coordinates and styling
            const fontSize = 10;


            // Load image

            const logoImageBytes = await fs.readFile('./utils/logo.png');

            const logoImage = await pdfDoc.embedPng(logoImageBytes);

            // Add image to the page
            const yCoordinate = page.getHeight() - 50;

            // Add image to the page
            const imageWidth = 40;
            const imageHeight = (logoImage.height / logoImage.width) * imageWidth;
            page.drawImage(logoImage, {
                x: 100,
                y: yCoordinate - imageHeight,
                width: imageWidth,
                height: imageHeight,
            });

            // Add text to the page with a vertical gap
            const textOptions1 = { fontBold, color: rgb(0, 0, 0), size: fontSize, bold: true }
            const textOptions = { font, color: rgb(0, 0, 0), size: fontSize, };

            const verticalGap = 10; // Adjust the gap as needed
            page.drawText('SENATE OF PAKISTAN', { x: 210 + imageWidth + 10, y: yCoordinate - imageHeight + verticalGap + 20, font: fontBold, ...textOptions1 });
            page.drawText('IT DIRECTORATE', { x: 220 + imageWidth + 10, y: yCoordinate - imageHeight + verticalGap, font: fontBold, ...textOptions1 });

            // Date Text
            page.drawText('Date:', { x: 400 + imageWidth + 10, y: yCoordinate - imageHeight + verticalGap - 30, font: fontBold, ...textOptions1 });
            page.drawText(`${passVisitorData.pass.passDate}`, { x: 430 + imageWidth + 10, y: yCoordinate - imageHeight + verticalGap - 30, ...textOptions, })

            // Subject Text
            page.drawText("Subject", { x: 100, y: yCoordinate - imageHeight + verticalGap - 40, font: fontBold, ...textOptions1 });

            // From Text
            const fromDateParts = passVisitorData.pass.fromDate.split('-');
            const toDateParts = passVisitorData.pass.toDate.split('-');

            const fromDateString = `${fromDateParts[1]}-${fromDateParts[0]}-${fromDateParts[2]}`;
            const toDateString = `${toDateParts[1]}-${toDateParts[0]}-${toDateParts[2]}`;

            const fromDate = new Date(fromDateString);
            const toDate = new Date(toDateString);

            // Display 'From' and 'To' dates
            page.drawText('From:', { x: 100, y: yCoordinate - imageHeight + verticalGap - 70, font: fontBold, ...textOptions1 });
            page.drawText(`${passVisitorData.pass.fromDate}`, { x: 130, y: yCoordinate - imageHeight + verticalGap - 70, ...textOptions });

            page.drawText('To:', { x: 200, y: yCoordinate - imageHeight + verticalGap - 70, font: fontBold, ...textOptions1 });
            page.drawText(`${passVisitorData.pass.toDate}`, { x: 220, y: yCoordinate - imageHeight + verticalGap - 70, ...textOptions });

            // Calculate and display the number of days
            const timeDifference = toDate.getTime() - fromDate.getTime();
            const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

            page.drawText('Days:', { x: 300, y: yCoordinate - imageHeight + verticalGap - 70, font: fontBold, ...textOptions1 });
            page.drawText(`${daysDifference} days`, { x: 330, y: yCoordinate - imageHeight + verticalGap - 70, ...textOptions });


            page.drawText('Off Days:', { x: 400, y: yCoordinate - imageHeight + verticalGap - 70, font: fontBold, ...textOptions1 });
            page.drawText(`${passVisitorData.pass.allowOffDays}`, { x: 450, y: yCoordinate - imageHeight + verticalGap - 70, ...textOptions });
            // ... Other text and layout details similar to the above

            // Purpose
            page.drawText("Purpose: ", { x: 100, y: yCoordinate - imageHeight + verticalGap - 100, font: fontBold, ...textOptions1 });
            page.drawText(`${passVisitorData.pass.visitPurpose}`, { x: 140, y: yCoordinate - imageHeight + verticalGap - 100, ...textOptions });

            // Visit Type
            page.drawText("Visit Type:", { x: 100, y: yCoordinate - imageHeight + verticalGap - 130, font: fontBold, ...textOptions1 });
            page.drawText(`${passVisitorData.pass.remarks}`, { x: 150, y: yCoordinate - imageHeight + verticalGap - 130, ...textOptions });

            page.drawText("Organization:", { x: 250, y: yCoordinate - imageHeight + verticalGap - 130, font: fontBold, ...textOptions1 });
            page.drawText(`${passVisitorData.pass.companyName}`, { x: 310, y: yCoordinate - imageHeight + verticalGap - 130, ...textOptions });


            // Draw table for visitors
            // Add table borders
            // Assuming passVisitorData is available
            const visitors = passVisitorData.visitor;

            const tableX = 100;
            const tableY = yCoordinate - imageHeight + verticalGap - 180;
            const cellWidth = 100;
            const cellHeight = 20;
            const numRows = visitors.length + 1; // Number of rows equals the number of visitors plus one for the header
            const numCols = 4; // Fixed number of columns

            // Draw table borders
            for (let row = 0; row < numRows; row++) {
                for (let col = 0; col < numCols; col++) {
                    const x = tableX + col * cellWidth;
                    const y = tableY - row * cellHeight;
                    page.drawRectangle({
                        x,
                        y,
                        width: cellWidth,
                        height: cellHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1,
                    });
                }
            }



            // Add header text to the table cells    
            page.drawText('Sr No', { x: tableX + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
            page.drawText('Name', { x: tableX + cellWidth + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
            page.drawText('Cnic', { x: tableX + 2 * cellWidth + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
            page.drawText('Details', { x: tableX + 3 * cellWidth + 5, y: tableY + 5, font: fontBold, ...textOptions1 });

            // Add data to the table cells
            for (let row = 0; row < visitors.length; row++) {
                const visitor = visitors[row];

                page.drawText(`${row + 1}`, { x: tableX + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
                page.drawText(visitor.name, { x: tableX + cellWidth + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
                page.drawText(visitor.cnic, { x: tableX + 2 * cellWidth + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
                page.drawText(visitor.details, { x: tableX + 3 * cellWidth + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
            }

            // QR Code
            // Generate QR Code
            // const qrCodeImage = await QRCode.toDataURL(passVisitorData.pass.id.toString(), { width: 30 });
            const url = 'https://www.google.com'; // Replace this with your desired URL
            const qrCodeImage = await QRCode.toDataURL(url, { width: 30 });


            const qrImage = await pdfDoc.embedPng(qrCodeImage);
            const qrMargin = 10; // Adjust as needed for spacing
            const tableBottomY = tableY - numRows * cellHeight;
            const qrY = tableBottomY - qrMargin - 40; // Y-coordinate for QR code, with 50 as the height of QR

            const qrX = 100;
            // const qrY = yCoordinate - imageHeight + tableY;

            // Draw QR code image
            page.drawImage(qrImage, {
                x: qrX,
                y: qrY,
                width: 50,
                height: 50
            });
            //page.drawText(`${passVisitorData.pass.id}`, { x: 120, y: qrY - 10, ...textOptions });

            //Sigature
            page.drawText("Naveed Ashraf", { x: 400, y: tableBottomY - 30, ...textOptions1 });
            page.drawText("Assistant Director (IT)", { x: 400, y: tableBottomY - 40, ...textOptions1 });
            // Save the PDF to a file with a dynamic name
            const outputFileName = `output_${Date.now()}.pdf`;
            const pdfBytes = await pdfDoc.save();
            // Uncomment the line below if you want to save the PDF to a file
            // await fs.writeFile(outputFileName, pdfBytes);
            
            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error.message);
        }
    },

    // Get Visitors For A Pass
    getVisitors: async (passId) => {
        try {

            const passVisitor = await PassVisitor.findAll({
                where: { passId: passId }
            })
            const visitorId = passVisitor.map(passVisitor => passVisitor.visitorId);
            const visitor = await Visitor.findAll({
                where: { id: visitorId }
            })
            return visitor;
        } catch (error) {
            throw { message: error.message || "Error Getting Visitors For Pass" };
        }
    },

    // Get Duplicate Pass 
    getDuplicatePass: async (passId) => {
        try {

            const pass = await Passes.findOne({
                where: { id: passId },
                attributes: {
                    exclude: ['id', 'fromDate', 'toDate', 'updatedAt', 'createdAt'],
                }
            })

            const passVisitor = await PassVisitor.findAll({
                where: { passId: passId }
            })

            const visitorId = passVisitor.map(passVisitor => passVisitor.visitorId);
            const visitor = await Visitor.findAll({
                where: { id: visitorId },
                attributes: {
                    exclude: ['updatedAt', 'createdAt'],
                }

            })
            const passVisitorData = {
                pass,
                visitor
            }

            return passVisitorData
        } catch (error) {
            throw { message: error.message || "Error Getting Duplicate Pass" };
        }
    },


}

module.exports = passService
