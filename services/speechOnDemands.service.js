const db = require("../models");
const SpeechOnDemands = db.speechOnDemands;
const Sessions = db.sessions;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');
const fs = require('fs').promises;
const moment = require('moment')
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');


const SpeechOnDemandService = {
    // Create A New speechOnDemand
    createSpeechOnDemands: async (req) => {
        try {

            const speechOnDemand = await SpeechOnDemands.create(req);

            return speechOnDemand;
        } catch (error) {
            console.log(error)
            throw { message: error.message || "Error Creating speechOnDemand" };

        }
    },

    // createP Profroma For speechOnDemand
    createProforma: async (speechOnDemand,memberName) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);


            let page = pdfDoc.addPage();
            let yCoordinate = page.getHeight() - 50;
            const textOptions = { font, color: rgb(0, 0, 0), size: 14 };
            const textOptions1 = { font, color: rgb(0, 0, 0,), size: 12 };
            const boldTextOptions = { ...textOptions, font: fontBold };
            const boldTextOptions1 = { ...textOptions1, font: fontBold };
            // Initial Session Information
            const verticalGap = 10;
            page.drawText('Serial No', { x: 450, y: yCoordinate + verticalGap, ...textOptions1 });
            const lineY = yCoordinate + verticalGap; // Adjust the value as needed to place the line appropriately

            const lineStartX = 500;
            const lineEndX = 550;

            const lineWidth = 1;
            const lineColor = rgb(0, 0, 0);
            page.drawLine({
                start: { x: lineStartX, y: lineY },
                end: { x: lineEndX, y: lineY },
                thickness: lineWidth,
                color: lineColor,
            });


            const logoImageBytes = await fs.readFile('./public/logo.png');

            const logoImage = await pdfDoc.embedPng(logoImageBytes);

            // Add image to the page
            const imageWidth = 70;
            //   const imageHeight = (logoImage.height / logoImage.width) * imageWidth;
            const imageHeight = 80;
            page.drawImage(logoImage, {
                x: 60,
                y: yCoordinate - 45,
                width: imageWidth,
                height: imageHeight,
            });



            page.drawText('SENATE SECRETARIAT', { x: 220, y: yCoordinate - 5, ...boldTextOptions });
            const lineY1 = yCoordinate - 9; // Adjust the value as needed to place the line appropriately

            const lineStartX1 = 220;
            const lineEndX1 = 370;

            const lineWidth1 = 1;
            const lineColor1 = rgb(0, 0, 0);
            page.drawLine({
                start: { x: lineStartX1, y: lineY1 },
                end: { x: lineEndX1, y: lineY1 },
                thickness: lineWidth1,
                color: lineColor1,
            });


            page.drawText('TELECASTING CELL', { x: 230, y: yCoordinate - 24, ...boldTextOptions });
            const lineY2 = yCoordinate - 28; // Adjust the value as needed to place the line appropriately

            const lineStartX2 = 230;
            const lineEndX2 = 370;

            const lineWidth2 = 1;
            const lineColor2 = rgb(0, 0, 0);
            page.drawLine({
                start: { x: lineStartX2, y: lineY2 },
                end: { x: lineEndX2, y: lineY2 },
                thickness: lineWidth2,
                color: lineColor2,
            });

            page.drawText('PROFORMA FOR PROVISION OF VIDEO SPEECH', { x: 130, y: yCoordinate - 70, ...boldTextOptions });
            const lineY3 = yCoordinate - 74; // Adjust the value as needed to place the line appropriately

            const lineStartX3 = 130;
            const lineEndX3 = 450;

            const lineWidth3 = 1;
            const lineColor3 = rgb(0, 0, 0);
            page.drawLine({
                start: { x: lineStartX3, y: lineY3 },
                end: { x: lineEndX3, y: lineY3 },
                thickness: lineWidth3,
                color: lineColor3,
            });

            page.drawText('Name', { x: 70, y: yCoordinate - 100, ...textOptions1 });
            page.drawText(`${memberName}`, { x: 230, y: yCoordinate - 95, ...textOptions1 });
            const lineY4 = yCoordinate - 100; // Adjust the value as needed to place the line appropriately

            const lineStartX4 = 230;
            const lineEndX4 = 530;

            const lineWidth4 = 1;
            const lineColor4 = rgb(0, 0, 0);
            page.drawLine({
                start: { x: lineStartX4, y: lineY4 },
                end: { x: lineEndX4, y: lineY4 },
                thickness: lineWidth4,
                color: lineColor4,
            });


            page.drawText('Session No & Date', { x: 70, y: yCoordinate - 140, ...textOptions1 });
            const lineY5 = yCoordinate - 140; // Adjust the value as needed to place the line appropriately

            const lineStartX5 = 230;
            const lineEndX5 = 530;

            const lineWidth5 = 1;
            const lineColor5 = rgb(0, 0, 0);
            if (speechOnDemand.fullSession === "Full Session") {
                page.drawText(`${speechOnDemand.session.sessionName} - (${speechOnDemand.fullSession})`, { x: 230, y: yCoordinate - 135, ...textOptions1 });
            } else {
                page.drawText(`${speechOnDemand.session.sessionName} - (${moment(speechOnDemand.date_from).format("YYYY-MM-DD")} To ${moment(speechOnDemand.date_to).format("YYYY-MM-DD")})`, { x: 230, y: yCoordinate - 135, ...textOptions1 });
            }

            page.drawLine({
                start: { x: lineStartX5, y: lineY5 },
                end: { x: lineEndX5, y: lineY5 },
                thickness: lineWidth5,
                color: lineColor5,
            });


            page.drawText('Order/Agenda Item/Detail', { x: 70, y: yCoordinate - 180, ...textOptions1 });
            const lineY6 = yCoordinate - 180; // Adjust the value as needed to place the line appropriately

            const lineStartX6 = 230;
            const lineEndX6 = 530;

            const lineWidth6 = 1;
            const lineColor6 = rgb(0, 0, 0);
            page.drawLine({
                start: { x: lineStartX6, y: lineY6 },
                end: { x: lineEndX6, y: lineY6 },
                thickness: lineWidth6,
                color: lineColor6,
            });


            // let maxWidth = 470;
            // page.drawText('Justification for other Members/ Ministers/ Advisors to PM and full session proceedings', { x: 70, y: yCoordinate - 220, maxWidth: maxWidth, wrap: true, ...textOptions1 });
            // page.drawText(`${speechOnDemand.justification}`, { x: 70, y: yCoordinate - 255, maxWidth: maxWidth, wrap: true, ...textOptions1 });

            // Constants and initial settings
            let maxWidth = 470;
            const lineHeight = 28; // Estimated line height, adjust based on your font size and line spacing
            const fontSize = 14; // Font size, used for rough calculation

            // Draw the title text with wrapping
            const titleText = 'Justification for other Members/ Ministers/ Advisors to PM and full session proceedings';
            page.drawText(titleText, {
                x: 70,
                y: yCoordinate - 220,
                maxWidth: maxWidth,
                wrap: true,
                ...boldTextOptions1
            });

            // Draw the dynamic justification text with wrapping
            const justificationText = `${speechOnDemand.justification}`;
            page.drawText(justificationText, {
                x: 70,
                y: yCoordinate - 255, // Adjust starting position based on the title text height
                maxWidth: maxWidth,
                wrap: true,
                ...textOptions1
            });

            // Calculate how many lines the justification will wrap into and draw lines under each
            // let justificationLines = Math.ceil(justificationText.length * (fontSize * 0.5) / maxWidth);
            // for (let i = 0; i < justificationLines; i++) {
            //     page.drawLine({
            //         start: { x: 70, y: yCoordinate - 255 - (i * lineHeight) },
            //         end: { x: 70 + maxWidth, y: yCoordinate - 255 - (i * lineHeight) },
            //         color: rgb(0, 0, 0),
            //         thickness: 1
            //     });
            // }

            const additionalText = "It is certified that to the best of my knowledge, the speech requested does not contain any expunjed remarks. The video provided will not be used for any kind of broadcast/commercial/Court matters";
            const additionalTextStartY = yCoordinate - 255 - (Math.ceil(justificationText.length * (fontSize * 0.5) / maxWidth) * lineHeight) - 20; // Start 
            //50 units below the last line of justification
            // Draw the additional text
            page.drawText(additionalText, {
                x: 110,
                y: additionalTextStartY,
                maxWidth: maxWidth,
                wrap: true,
                ...textOptions1
            });

            // page.drawText('It is certified that to the best of my knowledge, the speech requested does not contain any expunjed remarks. The video provided will not be used for any kind of broadcast/commercial/Court matters', { x: 110, y: yCoordinate - 340, maxWidth: maxWidth, wrap: true, ...textOptions1 });

            page.drawText('Signature', { x: 70, y: additionalTextStartY - 100, ...textOptions1 });
            const lineY7 = additionalTextStartY - 100; // Adjust the value as needed to place the line appropriately

            const lineStartX7 = 230;
            const lineEndX7 = 400;

            const lineWidth7 = 1;
            const lineColor7 = rgb(0, 0, 0);
            page.drawLine({
                start: { x: lineStartX7, y: lineY7 },
                end: { x: lineEndX7, y: lineY7 },
                thickness: lineWidth7,
                color: lineColor7,
            });

            page.drawText('Date of Request', { x: 70, y: additionalTextStartY - 140, ...textOptions1 });
            const lineY8 = additionalTextStartY - 140; // Adjust the value as needed to place the line appropriately

            const lineStartX8 = 230;
            const lineEndX8 = 400;

            const lineWidth8 = 1;
            const lineColor8 = rgb(0, 0, 0);
            page.drawLine({
                start: { x: lineStartX8, y: lineY8 },
                end: { x: lineEndX8, y: lineY8 },
                thickness: lineWidth8,
                color: lineColor8,
            });

            page.drawText('WhatsApp No.', { x: 70, y: additionalTextStartY - 180, ...textOptions1 });
            page.drawText(`${speechOnDemand.whatsapp_number}`, { x: 230, y: additionalTextStartY - 175, ...textOptions1 });
            const lineY9 = additionalTextStartY - 180; // Adjust the value as needed to place the line appropriately

            const lineStartX9 = 230;
            const lineEndX9 = 400;

            const lineWidth9 = 1;
            const lineColor9 = rgb(0, 0, 0);
            page.drawLine({
                start: { x: lineStartX9, y: lineY9 },
                end: { x: lineEndX9, y: lineY9 },
                thickness: lineWidth9,
                color: lineColor9,
            });

            let maxWidth2 = 80;
            page.drawText('Video Delivery on (Please tick one box)', { x: 70, y: additionalTextStartY - 220, maxWidth: maxWidth2, wrap: true, ...textOptions1 });

            page.drawText('DVD', { x: 200, y: additionalTextStartY - 220, ...textOptions1 });
            const rectangleWidth = 15; // Adjust as needed
            const rectangleHeight = 15; // Adjust as needed
            const borderColor = rgb(0, 0, 0); // Adjust color as needed
            const borderWidth = 2
            // const fillColor = rgb(255,255,255)

            // Draw the rectangle
            page.drawRectangle({
                x: 240, // Adjust the x-coordinate as needed
                y: additionalTextStartY - 225, // Adjust the y-coordinate as needed
                width: rectangleWidth,
                height: rectangleHeight,
                borderColor: borderColor,
                borderWidth: borderWidth
                //  fillColor: fillColor
            });

            if (speechOnDemand.delivery_on === 'DVD') {
                const startX = 240; // Starting X-coordinate of the tick inside the rectangle
                const startY = additionalTextStartY - 220; // Starting Y-coordinate of the tick inside the rectangle
                const tickPoints = [
                    { x: startX + 3, y: startY + rectangleHeight - 13 }, // Lower start point of tick
                    { x: startX + 6, y: startY + rectangleHeight - 18 }, // Middle point of tick
                    { x: startX + 12, y: startY + 10 } // Upper end point of tick
                ];

                // Draw tick mark
                page.drawLine({
                    start: tickPoints[0],
                    end: tickPoints[1],
                    thickness: 1,
                    color: rgb(0, 0, 0)
                });
                page.drawLine({
                    start: tickPoints[1],
                    end: tickPoints[2],
                    thickness: 1,
                    color: rgb(0, 0, 0)
                });
            }

            page.drawText('WhatsApp', { x: 280, y: additionalTextStartY - 220, ...textOptions1 });
            page.drawRectangle({
                x: 340, // Adjust the x-coordinate as needed
                y: additionalTextStartY - 225, // Adjust the y-coordinate as needed
                width: rectangleWidth,
                height: rectangleHeight,
                borderColor: borderColor,
                borderWidth: borderWidth
                //  fillColor: fillColor
            });

            if (speechOnDemand.delivery_on === 'WhatsApp') {
                const startX = 340; // Starting X-coordinate of the tick inside the rectangle
                const startY = additionalTextStartY - 220; // Starting Y-coordinate of the tick inside the rectangle
                const tickPoints = [
                    { x: startX + 3, y: startY + rectangleHeight - 13 }, // Lower start point of tick
                    { x: startX + 6, y: startY + rectangleHeight - 18 }, // Middle point of tick
                    { x: startX + 12, y: startY + 10 } // Upper end point of tick
                ];

                // Draw tick mark
                page.drawLine({
                    start: tickPoints[0],
                    end: tickPoints[1],
                    thickness: 1,
                    color: rgb(0, 0, 0)
                });
                page.drawLine({
                    start: tickPoints[1],
                    end: tickPoints[2],
                    thickness: 1,
                    color: rgb(0, 0, 0)
                });
            }


            let maxWidth1 = 60
            page.drawText('Other tools (Please Specify)', { x: 400, y: additionalTextStartY - 220, maxWidth: maxWidth1, wrap: true, ...textOptions1 });
            page.drawRectangle({
                x: 460, // Adjust the x-coordinate as needed
                y: additionalTextStartY - 225, // Adjust the y-coordinate as needed
                width: rectangleWidth,
                height: rectangleHeight,
                borderColor: borderColor,
                borderWidth: borderWidth
                //  fillColor: fillColor
            });

            // if (speechOnDemand.delivery_on === 'WhatsApp') {
            //     const startX = 460; // Starting X-coordinate of the tick inside the rectangle
            //     const startY = yCoordinate - 550; // Starting Y-coordinate of the tick inside the rectangle
            //     const tickPoints = [
            //         { x: startX + 3, y: startY + rectangleHeight - 13 }, // Lower start point of tick
            //         { x: startX + 6, y: startY + rectangleHeight - 18 }, // Middle point of tick
            //         { x: startX + 12, y: startY + 10 } // Upper end point of tick
            //     ];

            //     // Draw tick mark
            //     page.drawLine({
            //         start: tickPoints[0],
            //         end: tickPoints[1],
            //         thickness: 1,
            //         color: rgb(0, 0, 0)
            //     });
            //     page.drawLine({
            //         start: tickPoints[1],
            //         end: tickPoints[2],
            //         thickness: 1,
            //         color: rgb(0, 0, 0)
            //     });
            // }

            page.drawText('To,', { x: 70, y: additionalTextStartY - 300, ...textOptions1 });
            page.drawText('Secretary Senate,', { x: 90, y: additionalTextStartY - 320, ...textOptions1 });
            page.drawText('Senate Secretariat,', { x: 90, y: additionalTextStartY - 340, ...textOptions1 });
            page.drawText('Parliament House,', { x: 90, y: additionalTextStartY - 360, ...textOptions1 });
            page.drawText('Islamabad.', { x: 90, y: additionalTextStartY - 380, ...textOptions1 });
            const lineY10 = additionalTextStartY - 380; // Adjust the value as needed to place the line appropriately

            const lineStartX10 = 90;
            const lineEndX10 = 140;

            const lineWidth10 = 1;
            const lineColor10 = rgb(0, 0, 0);
            page.drawLine({
                start: { x: lineStartX10, y: lineY10 },
                end: { x: lineEndX10, y: lineY10 },
                thickness: lineWidth10,
                color: lineColor10,
            });

            const pdfBytes = await pdfDoc.save();
            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    },

    // Retrieve All speechOnDemands
    findAllSpeechOnDemands: async (currentPage, pageSize, isActive) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            let whereClause = {};

            if (isActive) {
                whereClause.isActive = isActive ? isActive : null;
            }



            const { count, rows } = await SpeechOnDemands.findAndCountAll({
                offset,
                limit,
                where: whereClause,
                order: [['id', 'DESC']],
                include: [
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName', 'calledBy'],
                    },
                    {
                        model: db.members,
                        as: 'member',
                        attributes: ['memberName'] // Include only the member name
                    }
                ],
            });

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, speechOnDemand: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All speechOnDemand");
        }
    },

    // Retrieve Single speechOnDemand
    findSinlgeSpeechOnDemands: async (speechOnDemandId) => {
        try {
            const speechOnDemand = await SpeechOnDemands.findOne({
                where: { id: speechOnDemandId },
                include: [
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName', 'calledBy'],
                    },
                ],
            });
            if (!speechOnDemand) {
                throw ({ message: "speechOnDemand Not Found!" })
            }
            return speechOnDemand;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single speechOnDemand" };
        }
    },

    // Retrieve all speechOnDemand by web_id
    findAllSpeechOnDemandsByWebId: async (webId) => {
        try {
            const speechOnDemand = await SpeechOnDemands.findAll({
                where: { web_id: webId },
                include: [
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName', 'calledBy'],
                    },
                ],
                order: [['createdAt', 'DESC']]
            });
            if (!speechOnDemand) {
                throw ({ message: "speechOnDemand Not Found!" })
            }
            return speechOnDemand;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching speechOnDemand" };
        }
    },

    // Retrieve Speech On Demand Stats
    getSpeechOnDemandsStats: async () => {
        try {

            const { count, rows } = await SpeechOnDemands.findAndCountAll()
            let waitingForApprovalData = [];
            let requestInProcessData = [];
            let deliveredData = [];

            rows.forEach(stat => {
                const status = stat.isActive;
                switch (status) {
                    case 'Waiting For Approval':
                        waitingForApprovalData.push(status);
                        break;
                    case 'Request In Process':
                        requestInProcessData.push(status);
                        break;
                    case 'Delivered':
                        deliveredData.push(status);
                        break;
                    default:
                        break;
                }
            });

            const stats = {
                waitingForApproval: waitingForApprovalData.length,
                requestInProcess: requestInProcessData.length,
                delivered: deliveredData.length,
                totalSpeeches: waitingForApprovalData.length + requestInProcessData.length + deliveredData.length,
            };

            return stats


        } catch (error) { throw new Error({ message: error.message }) }
    },

    // Update speechOnDemand
    updateSpeechOnDemand: async (req, speechOnDemandId) => {
        try {

            await SpeechOnDemands.update(req.body, { where: { id: speechOnDemandId } });

            // Fetch the updated speechOnDemand after the update
            const updatedSpeechOnDemand = await SpeechOnDemands.findOne({
                where: { id: speechOnDemandId },
                include: [
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName', 'calledBy'],
                    },
                ],
            }, { raw: true });

            return updatedSpeechOnDemand;

        } catch (error) {
            throw { message: error.message || "Error Updating speechOnDemand" };
        }
    },

    // Delete speechOnDemand
    deleteSpeechOnDemand: async (req) => {
        try {

            const updatedData = {
                isActive: "inactive"
            }

            await SpeechOnDemands.update(updatedData, { where: { id: req } });

            // Fetch the updated speechOnDemand after the update
            const updatedSpeechOnDemand = await SpeechOnDemands.findByPk(req, { raw: true });

            return updatedSpeechOnDemand;


        } catch (error) {
            throw { message: error.message || "Error deleting speechOnDemand" };
        }
    }


}

module.exports = SpeechOnDemandService