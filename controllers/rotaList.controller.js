const rotaListService = require("../services/rotaList.service")
const db = require("../models")
const Rota = db.rota
const Questions = db.questions
const QuestionRevival = db.questionRevival
const QuestionInList = db.questionQuestionLists
const QuestionInSupList = db.questionSupplementaryLists
const path = require('path');
const fs = require('fs');

const logger = require('../common/winston');

const rotaController = {

    // Create Rota List
    createRotaList: async (req, res) => {
        try {
            logger.info(`rotaListController : createRotaList body ${JSON.stringify(req.body)}`)
            const rotaList = await rotaListService.createRotaList(req.body)
            const rotaListOutput = await rotaListService.createRotaListPDF(rotaList,req.body)
            logger.info("ROTA List Created Successfully!")
            const buffer = Buffer.from(rotaListOutput);
            const fileName = `output_${Date.now()}.pdf`;
            const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');

            if (!fs.existsSync(pdfDirectory)) {
                fs.mkdirSync(pdfDirectory, { recursive: true });
            }

            const filePathh = path.join(pdfDirectory, fileName);
            fs.writeFileSync(filePathh, buffer);

            // Provide a link
            const fileLink = `/assets/${fileName}`;

            return res.status(200).send({
                success: true,
                message: "ROTA List Created Successfully!",
                data: { rotaList, fileLink },
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Create Rota List For Further Allotment Of Days
    createFurtherAllotment: async (req,res) => {
        try {
            logger.info(`rotaListController : createFurtherAllotment body ${JSON.stringify(req.body)}`)
            const furtherAllotmentDays = await rotaListService.createFurtherAllotment(req.body)
            const rotaListOutput = await rotaListService.createRotaListPDF(furtherAllotmentDays,req.body)

            logger.info("ROTA List For Further Allotment Of Days Created Successfully!")
            const buffer = Buffer.from(rotaListOutput);
            const fileName = `output_${Date.now()}.pdf`;
            const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');

            if (!fs.existsSync(pdfDirectory)) {
                fs.mkdirSync(pdfDirectory, { recursive: true });
            }

            const filePathh = path.join(pdfDirectory, fileName);
            fs.writeFileSync(filePathh, buffer);

            // Provide a link
            const fileLink = `/assets/${fileName}`;


            return res.status(200).send({
                success: true,
                message: "ROTA List For Further Allotment Of Days Created Successfully!",
                data: {furtherAllotmentDays,fileLink},
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    }

}

module.exports = rotaController