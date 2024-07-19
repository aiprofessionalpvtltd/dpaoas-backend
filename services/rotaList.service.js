const db = require("../models");
const fs = require('fs-extra');
const Users = db.users;
const Employees = db.employees;
const Rota = db.rota
const FurtherAllotmentDays = db.furtherAllotmentDays
const Questions = db.questions;
const NoticeOfficeDiary = db.noticeOfficeDiary
const Sessions = db.sessions;
const Members = db.members;
const QuestionStatus = db.questionStatus;
const QuestionDiary = db.questionDiary
const Divisions = db.divisions;
const Groups = db.groups;
const GroupDivisions = db.groupsDivisions
const QuestionRevival = db.questionRevival
const Op = db.Sequelize.Op;
const dayjs = require('dayjs')
const moment = require('moment')
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const rotaListService = {
    // Create A New Rota List
    // createRotaList: async (req) => {
    //     try {
    //         await Rota.create({
    //             fkSessionId: req.fkSessionId,
    //             fkGroupId: req.fkGroupId,
    //             startDate: moment(req.startDate).format("YYYY-MM-DD"),
    //             endDate: moment(req.endDate).format("YYYY-MM-DD"),
    //             allotmentType: req.allotmentType,
    //         });

    //         // Define the exclusion days based on the allotment type
    //         const exclusionDays = {
    //             "Regular Days": [1], // Exclude Monday
    //             "Tuesday/Friday": [1, 3, 4], // Exclude Monday, Wednesday, Thursday
    //             "Wednesday/Friday": [1, 2, 4], // Exclude Monday, Tuesday, Thursday
    //             "Alternate Days": [2, 4] // Exclude Tuesday, Thursday
    //         };

    //         const excludedDays = exclusionDays[req.allotmentType] || [];

    //         const questions = await Questions.findAll({
    //             where: {
    //                 fkSessionId: req.fkSessionId,
    //                 fkGroupId: req.fkGroupId
    //             },
    //             include: [
    //                 {
    //                     model: NoticeOfficeDiary,
    //                     as: 'noticeOfficeDiary',
    //                     attributes: ['id', 'noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime'],
    //                     where: {
    //                         noticeOfficeDiaryDate: {
    //                             [db.Sequelize.Op.and]: [
    //                                 // Check if the date is within the specified range
    //                                 {
    //                                     [db.Sequelize.Op.between]: [req.startDate, req.endDate]
    //                                 },
    //                                 // Existing condition to exclude Monday, Wednesday, and Thursday
    //                                 db.Sequelize.where(
    //                                     db.Sequelize.fn('EXTRACT', db.Sequelize.literal('DOW FROM "noticeOfficeDiary"."noticeOfficeDiaryDate"')),
    //                                     {
    //                                         [db.Sequelize.Op.notIn]: excludedDays
    //                                     }
    //                                 ),
    //                                 // Existing condition for filtering dates greater than 13 days before current date
    //                                 {
    //                                     [db.Sequelize.Op.gt]: dayjs().subtract(13, 'day').format('YYYY-MM-DD')
    //                                 }
    //                             ]
    //                         }
    //                     }
    //                 },
    //                 {
    //                     model: Groups,
    //                     as: 'groups',
    //                     attributes: ['id', 'groupNameStarred', 'groupNameUnstarred']
    //                 }
    //             ],
    //             order: [
    //  [db.Sequelize.literal(`CASE WHEN "groups"."id" = ${req.fkGroupId} THEN 0 ELSE 1 END`), 'ASC'],
    //  [db.Sequelize.literal(`(5 + "groups"."id" - ${req.fkGroupId}) % 5`), 'ASC'] // Adjust '5' to your total number of groups if different
    //             ],
    //         });


    // const DateOfAnsweringFormat = new Date(question.noticeOfficeDiary.noticeOfficeDiaryDate.getTime() + (13 * 24 * 60 * 60 * 1000));
    // const DateOfAnswering = dayjs(DateOfAnsweringFormat).format('dddd, YYYY-MM-DD');

    // const Group = {
    //     groupId: question.groups.id,
    //     groupNameStarred: question.groups.groupNameStarred,
    //     groupNameUnstarred: question.groups.groupNameUnstarred
    // };

    // const groupsDivisions = await db.groupsDivisions.findAll({
    //     where: { fkGroupId: question.groups.id },
    //     attributes: ['id', 'fkDivisionId', 'fkGroupId']
    // });

    // const divisionIds = groupsDivisions.map(division => division.fkDivisionId);
    // const divisions = await Divisions.findAll({
    //     where: { id: divisionIds },
    //     attributes: ['id', 'divisionName']
    // });

    //                 return {
    // DateOfCreation: dayjs(question.noticeOfficeDiary.noticeOfficeDiaryDate).format('dddd, YYYY-MM-DD'),
    //                     DateOfAnswering,
    //                     Group,
    //                     Divisions: divisions
    //                 };

    //         return processedQuestions;
    //     } catch (error) {
    //         console.log(error)
    //         throw { message: error.message || "Error Creating ROTA List!" };
    //     }
    // },

    createRotaList: async (req) => {
        try {
            // Create a new Rota entry
            await Rota.create({
                fkSessionId: req.fkSessionId,
                fkGroupId: req.fkGroupId,
                startDate: moment(req.startDate).format("YYYY-MM-DD"),
                endDate: moment(req.endDate).format("YYYY-MM-DD"),
                allotmentType: req.allotmentType,
            });

            // Fetch all groups and sort them cyclically starting from fkGroupId
            const allGroups = await Groups.findAll({
                order: [
                    [db.Sequelize.literal(`CASE WHEN "groups"."id" = ${req.fkGroupId} THEN 0 ELSE 1 END`), 'ASC'],
                    [db.Sequelize.literal(`(5 + "groups"."id" - ${req.fkGroupId}) % 5`), 'ASC'] // Adjust '5' to your total number of groups if different
                ],
            });

            // Fetch Session Details
            const sessionDetails = await Sessions.findOne({
                where: { id: req.fkSessionId },
                attributes: ['id', 'sessionName']
            })

            // Calculate the exclusion days based on the allotment type
            const exclusionDays = {
                "Regular Days": [1, 6, 0], // Exclude Monday, Saturday, Sunday
                "Tuesday/Friday": [2, 5, 6, 0],
                "Wednesday/Friday": [3, 5, 6, 0],
                "Alternate Days": [3, 5, 6, 0]
            };

            const excludedDays = exclusionDays[req.allotmentType] || [];
            let dates = [];
            let currentDate = moment(req.startDate);
            let end = moment(req.endDate);
            let groupIndex = 0;  // Start at the first group (already sorted)

            while (currentDate <= end) {
                if (!excludedDays.includes(currentDate.day())) {
                    const group = allGroups[groupIndex % allGroups.length];
                    const groupsDivisions = await GroupDivisions.findAll({
                        where: { fkGroupId: group.id },
                        attributes: ['id', 'fkDivisionId', 'fkGroupId']
                    });
                    const divisionIds = groupsDivisions.map(division => division.fkDivisionId);
                    const divisions = await Divisions.findAll({
                        where: { id: divisionIds },
                        attributes: ['id', 'divisionName']
                    })

                    let dateOfAnswering = currentDate.clone().add(13, 'days');
                    // Adjust Date of Answering if it falls on an excluded day
                    while (excludedDays.includes(dateOfAnswering.day())) {
                        dateOfAnswering.add(1, 'days');  // Move to the next day
                    }

                    // Calculate the "Date of Answering" which is 13 days from the "Date of Creation"
                    dates.push({
                        DateOfCreation: currentDate.format("dddd, Do MMMM, YYYY"),
                        // DateOfAnswering: currentDate.clone().add(13, 'days').format("YYYY-MM-DD"),
                        DateOfAnswering: dateOfAnswering.format("dddd, Do MMMM, YYYY"),
                        Group: {
                            groupId: group.id,
                            groupNameStarred: group.groupNameStarred,
                            groupNameUnstarred: group.groupNameUnstarred
                        },
                        Divisions: divisions
                    });

                    // Increment group index to rotate to the next group for the next date
                    groupIndex++;
                }
                currentDate = currentDate.add(1, 'days');
            }
            return { sessionDetails, dates }

        } catch (error) {
            console.log(error)
            throw { message: error.message || "Error Creating ROTA List!" };
        }

    },

    // createRotaListPDF: async (req) => {
    //     try {
    //         const pdfDoc = await PDFDocument.create();
    //         const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    //         const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    //         const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

    //         const verticalGap = 10;
    //         const cellWidth = 70;
    //         const cellHeight = 20;
    //         const customColWidths = [50, 140, 60, 60, 60, 60, 60];

    //         // for (const party of attendance) {
    //         const page = pdfDoc.addPage();
    //         const yCoordinate = page.getHeight() - 50;

    //         page.drawText('Annexure', { x: 480, y: yCoordinate + verticalGap + 10, font: fontBold, font: fontItalic, size: 12 });
    //         page.drawText('PROVISIONAL ALLOTMENT OF DAYS TO MINISTRIES / DIVS OF THE FEDERAL GOVERNMENT', { x: 30, y: yCoordinate + verticalGap - 15, font: fontBold, size: 11 })
    //         page.drawText('FOR ANSWERING QUESTIONS DURING FEBRUARY-MARCH, 2024 SESSION (335 TH SESSION) OF', { x: 30, y: yCoordinate + verticalGap - 25, font: fontBold, size: 11 });
    //         page.drawText(`THE SENATE UNDER RULE 46 OF THE RULES OF PROCEDURE AND CONDUCT OF BUSINESS IN`, { x: 30, y: yCoordinate + verticalGap - 35, font: fontBold, size: 11 });
    //         page.drawText(`THE SENATE, 2012.`, { x: 30, y: yCoordinate + verticalGap - 45, font: fontBold, size: 11 });

    //         const tableX = 30;
    //         const tableY = yCoordinate + verticalGap - 90;


    //         const rectangleX = 30;
    //         const rectangleY = yCoordinate + verticalGap - 90;
    //         const rectangleWidth = 500;
    //         const rectangleHeight = 30;
    //         // Draw a rectangle
    //         page.drawRectangle({
    //             x: rectangleX,
    //             y: rectangleY,
    //             width: rectangleWidth,
    //             height: rectangleHeight,
    //             borderWidth: 1,
    //             opacity: 1.0,
    //             borderColor: rgb(0, 0, 0),
    //         });

    //         //Add header text to the table cells    
    //         page.drawText('Date of Answering', { x: tableX + 5, y: tableY + 8, size: 10 });
    //         page.drawText('Last Date Of Notices Of Questions', { x: tableX + customColWidths[0] + 75, y: tableY + 8, size: 10 });
    //         page.drawText('Ministries/Divs', { x: tableX + customColWidths[0] + customColWidths[1] + 180, y: tableY + 8, size: 10 });


    //         const outputFileName = `output_${Date.now()}.pdf`;
    //         const pdfBytes = await pdfDoc.save(outputFileName);

    //         return pdfBytes;
    //     } catch (error) {
    //         console.error('Error generating PDF:', error.message);
    //     }
    // },

    // Create Rota List For Further Allotment Of Days

    createRotaListPDF: async (rotaList, req) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
            const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

            const verticalGap = 10;
            const cellHeight = 20;
            //const customColWidths = [50, 140, 310]; // Adjusted for better layout
            const customColWidths = [50, 140, 60, 60, 60, 60, 60];
            let page = pdfDoc.addPage();
            const yCoordinate = page.getHeight() - 50;

            // Draw heading texts
            page.drawText('Annexure', { x: 480, y: yCoordinate + verticalGap + 10, font: fontItalic, size: 12 });
            const lineY = yCoordinate + verticalGap + 8; // Adjust the value as needed to place the line appropriately

            // Define the line's starting and ending x-coordinates
            const lineStartX = 480; // Same as the x-coordinate of the text
            const lineEndX = 530; // Define the desired line length (e.g., 100 units long)

            // Define line attributes such as width and color
            const lineWidth = 1; // Define the line width (adjust as needed)
            const lineColor = rgb(0, 0, 0); // Define the line color as black (adjust as needed)

            // Draw the line under the "Annexure" text
            page.drawLine({
                start: { x: lineStartX, y: lineY },
                end: { x: lineEndX, y: lineY },
                thickness: lineWidth,
                color: lineColor,
            });

            const startDate = req.startDate;
            const endDate = req.endDate;

            const startMoment = moment(startDate);
            const endMoment = moment(endDate);

            const startMonth = startMoment.format('MMMM');
            const endMonth = endMoment.format('MMMM');

            const titles = [
                'PROVISIONAL ALLOTMENT OF DAYS TO MINISTRIES / DIVS OF THE FEDERAL GOVERNMENT',
                `FOR ANSWERING QUESTIONS DURING ${startMonth}-${endMonth}, 2024 SESSION (${rotaList?.sessionDetails?.sessionName} TH SESSION) OF`,
                'THE SENATE UNDER RULE 46 OF THE RULES OF PROCEDURE AND CONDUCT OF BUSINESS IN',
                'THE SENATE, 2012.'
            ];
            titles.forEach((title, index) => {
                page.drawText(title, { x: 30, y: yCoordinate - 15 - 10 * index, font: fontBold, size: 11 });
            });
            const tableX = 30;
            const tableY = yCoordinate + verticalGap - 120;

            const rectangleX = 30;
            const rectangleY = yCoordinate + verticalGap - 120;
            const rectangleWidth = 500;
            const rectangleHeight = 30;
            // Draw a rectangle
            page.drawRectangle({
                x: rectangleX,
                y: rectangleY,
                width: rectangleWidth,
                height: rectangleHeight,
                borderWidth: 1,
                opacity: 1.0,
                borderColor: rgb(0, 0, 0),
            });

            let maxWidth = 80;
            let maxWidth1 = 200
            // Header titles
            const headers = ['Date of Answering', 'Last Date Of Notices Of Questions', 'Ministries/Divs'];
            headers.forEach((header, index) => {
                let offset = customColWidths.slice(0, index).reduce((a, b) => a + b, 0);
                offset += index * 70
                //console.log("Offset", offset)
                page.drawText(header, { x: tableX + offset + 5, y: tableY + 8, font: font, size: 10 });
            });
            // Initialize the vertical position
            let currentY = tableY - cellHeight;
            let pageCount = 1;

            // Iterate through each item in rotaList
            // rotaList.dates.forEach((item, index) => {
            //     // Initialize the text for the group name (groupNameStarred)
            //     let ministryText = '';

            //     let maxWidth1 = 200;

            //     // Initialize a variable to track the number of lines in the ministry text (initially set to 0 for group name)
            //     let numLines = 0;
            //     // Check if there are divisions in the item
            //     let lineHeight = font.heightAtSize(11);
            //     if (item.Divisions.length > 0) {
            //         // Initialize a variable to track the number of lines in the ministry text (initially set to 0 for group name)
            //         let numLines = 0;

            //         // Maximum width allowed for a line
            //         const maxWidthPerLine = 150;

            //         // Append each division on a new line
            //         item.Divisions.forEach((div, i) => {
            //             // Calculate the number of lines for the division text
            //             const divisionLines = Math.ceil(font.widthOfTextAtSize(div.divisionName, 11) / maxWidthPerLine);

            //             // Increment the line count based on the number of lines for this division
            //             numLines += divisionLines;

            //             // Append each division with a new line character
            //             ministryText += `\n${i + 1}. ${div.divisionName}`;
            //         });

            //         // Calculate total height for the divisions block

            //         const divisionsHeight = numLines * lineHeight;

            //         // Draw the divisions at the specified x and y coordinates
            //         page.drawText(ministryText, { x: tableX + customColWidths[0] + customColWidths[1] + 70, y: currentY - divisionsHeight, font: font, size: 11, maxWidth: maxWidth1 });

            //         // Adjust currentY after drawing the divisions
            //         currentY -= divisionsHeight;
            //     }

            //     if (currentY - 15 * lineHeight < 50) { // Adjust the threshold as needed
            //         // If not, add a new page
            //         page = pdfDoc.addPage();
            //         currentY = page.getHeight() - 50; // Reset currentY for the new page
            //         pageCount++; // Increment the page count
            //     }
            //     // Draw DateOfAnswering, DateOfCreation, and groupNameStarred on the same line
            //     page.drawText(item.DateOfAnswering, { x: tableX + 5, y: currentY + 8, maxWidth, font: font, size: 11 });
            //     page.drawText(item.DateOfCreation, { x: tableX + customColWidths[0] + 75, y: currentY + 8, maxWidth, font: font, size: 11 });
            //     page.drawText(item.Group.groupNameStarred, { x: tableX + customColWidths[0] + customColWidths[1] + 110, y: currentY + 30, font: fontBold, size: 12 });

            //     // Move currentY down by a 5-line gap
            //     currentY -= 15 * lineHeight;

            //     if (currentY - 15 * lineHeight < 50) { // Check if it's not the last entry
            //         // If not, add a new page
            //         page = pdfDoc.addPage();
            //         currentY = page.getHeight() - 50; // Reset currentY for the new page
            //         pageCount++; // Increment the page count
            //     }
            // });
            let lineHeight = font.heightAtSize(11);
            rotaList.dates.forEach((item, index) => {
                // Initialize the text for the group name (groupNameStarred)
                let ministryText = '';
            
                // Check if there are divisions in the item
                if (item.Divisions.length > 0) {
                    // Append each division on a new line
                    item.Divisions.forEach((div, i) => {
                        ministryText += `${i + 1}. ${div.divisionName}\n`;
                    });
                }
            
                // Calculate the height of ministryText
                const ministryTextHeight = font.heightAtSize(11) * ministryText.split('\n').length;
            
                // Calculate the maximum height among ministryText and the three texts drawn separately
                const maxTextHeight = Math.max(ministryTextHeight, 3 * lineHeight);
            
                // Check if there's enough space on the current page for the content
                if (currentY - maxTextHeight < 50 && index !== rotaList.dates.length - 1) { // Check if it's not the last entry
                    // Add a new page
                    page = pdfDoc.addPage();
                    currentY = page.getHeight() - 50; // Reset currentY for the new page
                    pageCount++; // Increment the page count
                }
            
                // Draw ministryText
                page.drawText(ministryText, { x: tableX + customColWidths[0] + customColWidths[1] + 70, y: currentY - 30, font: font, size: 11, maxWidth: maxWidth1 });
            
                // Draw DateOfAnswering, DateOfCreation, and groupNameStarred on the same line
                page.drawText(item.DateOfAnswering, { x: tableX + 5, y: currentY - 20, maxWidth, font: font, size: 11 });
                page.drawText(item.DateOfCreation, { x: tableX + customColWidths[0] + 75, y: currentY - 20, maxWidth, font: font, size: 11 });
                page.drawText(item.Group.groupNameStarred, { x: tableX + customColWidths[0] + customColWidths[1] + 110, y: currentY - 10, font: fontBold, size: 12 });
            
                // Move currentY down by the maximum height among ministryText and the three texts drawn separately
                currentY -= maxTextHeight + 15 * lineHeight; // Add 15 * lineHeight for the line spacing
            });
            

            // Save the document
            const outputFileName = `output_${Date.now()}.pdf`;
            const pdfBytes = await pdfDoc.save();

            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error.message);
        }
    },


    createFurtherAllotment: async (req) => {
        try {
            await FurtherAllotmentDays.create({
                fkSessionId: req.fkSessionId,
                fkGroupId: req.fkGroupId,
                startDate: req.startDate,
                endDate: req.endDate,
                allotmentType: req.allotmentType,
            });

            // Define the exclusion days based on the allotment type
            const allGroups = await Groups.findAll({
                order: [
                    [db.Sequelize.literal(`CASE WHEN "groups"."id" = ${req.fkGroupId} THEN 0 ELSE 1 END`), 'ASC'],
                    [db.Sequelize.literal(`(5 + "groups"."id" - ${req.fkGroupId}) % 5`), 'ASC'] // Adjust '5' to your total number of groups if different
                ],
            });

            // Fetch Session Details
            const sessionDetails = await Sessions.findOne({
                where: { id: req.fkSessionId },
                attributes: ['id', 'sessionName']
            })

            // Calculate the exclusion days based on the allotment type
            const exclusionDays = {
                "Regular Days": [1, 6, 0], // Exclude Monday, Saturday, Sunday
                "Tuesday/Friday": [2, 5, 6, 0],
                "Wednesday/Friday": [3, 5, 6, 0],
                "Alternate Days": [3, 5, 6, 0]
            };

            const excludedDays = exclusionDays[req.allotmentType] || [];
            let dates = [];
            let currentDate = moment(req.startDate);
            let end = moment(req.endDate);
            let groupIndex = 0;  // Start at the first group (already sorted)

            while (currentDate <= end) {
                if (!excludedDays.includes(currentDate.day())) {
                    const group = allGroups[groupIndex % allGroups.length];
                    const groupsDivisions = await GroupDivisions.findAll({
                        where: { fkGroupId: group.id },
                        attributes: ['id', 'fkDivisionId', 'fkGroupId']
                    });
                    const divisionIds = groupsDivisions.map(division => division.fkDivisionId);
                    const divisions = await Divisions.findAll({
                        where: { id: divisionIds },
                        attributes: ['id', 'divisionName']
                    })

                    // Calculate the "Date of Answering" which is 13 days from the "Date of Creation"
                    dates.push({
                        DateOfCreation: currentDate.format("YYYY-MM-DD"),
                        DateOfAnswering: currentDate.clone().add(13, 'days').format("YYYY-MM-DD"),
                        Group: {
                            groupId: group.id,
                            groupNameStarred: group.groupNameStarred,
                            groupNameUnstarred: group.groupNameUnstarred
                        },
                        Divisions: divisions
                    });

                    // Increment group index to rotate to the next group for the next date
                    groupIndex++;
                }
                currentDate = currentDate.add(1, 'days');
            }
            return { sessionDetails, dates }

        } catch (error) {
            throw { message: error.message || "Error Creating Further Allotment Of Days!" };
        }
    },



}

module.exports = rotaListService