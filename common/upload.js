const multer = require('multer');
const fs = require('fs');
const path = require('path');


const motionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const publicDir = `./public`;
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }
        const dir = `./public/motion`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        // Get current date and time
        const currentDate = new Date();
        const formattedDateTime = currentDate.toISOString().replace(/:/g, '-').replace(/\..+/, ''); // Format as 'YYYY-MM-DDTHH-MM-SS'

        const subDir = `./public/motion/${formattedDateTime}/`;
        if (formattedDateTime) {
            const attendeeDir = `./public/motion/${formattedDateTime}/`;
            if (!fs.existsSync(attendeeDir)) {
                fs.mkdirSync(attendeeDir);
            }
            cb(null, attendeeDir);
        } else {
            cb(null, subDir);
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const publicDir = `./public`;
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }
        const dir = `./public/file`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        let fileNumber
        if (req.params?.fileNumber) fileNumber = req.params.fileNumber;
        if (req.body?.fileNumber) fileNumber = req.body.fileNumber;

        const subDir = `./public/file/${fileNumber}`;
        if (fileNumber) {
            const caseDir = `./public/file/${fileNumber}`;
            if (!fs.existsSync(caseDir)) {
                fs.mkdirSync(caseDir);
            }
            cb(null, caseDir);
        } else {
            cb(null, subDir);
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});


const freshReceiptsStorage = multer.diskStorage({


    destination: (req, file, cb) => {
        const publicDir = `./public`;
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }
        const dir = `./public/freshReceipts(FRs)`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
       
        // let referenceNumber
        // console.log("Req Reference No", req.body.referenceNumber);
        // if (req.body?.referenceNumber) referenceNumber = req.body.referenceNumber;
        // console.log("Reference Number", referenceNumber)

        const currentDate = new Date();
        const formattedDateTime = currentDate.toISOString().replace(/:/g, '-').replace(/\..+/, ''); // Format as 'YYYY-MM-DDTHH-MM-SS'

        const subDir = `./public/freshReceipts(FRs)/${formattedDateTime}`;
        if (formattedDateTime) {
            const caseDir = `./public/freshReceipts(FRs)/${formattedDateTime}`;
            if (!fs.existsSync(caseDir)) {
                fs.mkdirSync(caseDir);
            }
            cb(null, caseDir);
        } else {
            cb(null, subDir);
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});


const casesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const publicDir = `./public`;
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }
        const dir = `./public/cases`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
       
        // let referenceNumber
        // console.log("Req Reference No", req.body.referenceNumber);
        // if (req.body?.referenceNumber) referenceNumber = req.body.referenceNumber;
        // console.log("Reference Number", referenceNumber)

        const currentDate = new Date();
        const formattedDateTime = currentDate.toISOString().replace(/:/g, '-').replace(/\..+/, ''); // Format as 'YYYY-MM-DDTHH-MM-SS'

        const subDir = `./public/cases/${formattedDateTime}`;
        if (formattedDateTime) {
            const caseDir = `./public/cases/${formattedDateTime}`;
            if (!fs.existsSync(caseDir)) {
                fs.mkdirSync(caseDir);
            }
            cb(null, caseDir);
        } else {
            cb(null, subDir);
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});



const resolutionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const publicDir = `./public`;
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }
        const dir = `./public/resolution`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        // Get current date and time
        const currentDate = new Date();
        const formattedDateTime = currentDate.toISOString().replace(/:/g, '-').replace(/\..+/, ''); // Format as 'YYYY-MM-DDTHH-MM-SS'

        const subDir = `./public/resolution/${formattedDateTime}`;
        if (formattedDateTime) {
            const attendeeDir = `./public/resolution/${formattedDateTime}`;
            if (!fs.existsSync(attendeeDir)) {
                fs.mkdirSync(attendeeDir);
            }
            cb(null, attendeeDir);
        } else {
            cb(null, subDir);
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});

const questionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const publicDir = `./public`;
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }
        const dir = `./public/question`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        // Get current date and time
        const currentDate = new Date();
        const formattedDateTime = currentDate.toISOString().replace(/:/g, '-').replace(/\..+/, ''); // Format as 'YYYY-MM-DDTHH-MM-SS'

        const subDir = `./public/question/${formattedDateTime}/`;
        if (formattedDateTime) {
            const questionDir = `./public/question/${formattedDateTime}/`;
            if (!fs.existsSync(questionDir)) {
                fs.mkdirSync(questionDir);
            }
            cb(null, questionDir);
        } else {
            cb(null, subDir);
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});


// const complaintsFromUserStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const publicDir = `./public`;
//         if (!fs.existsSync(publicDir)) {
//             fs.mkdirSync(publicDir);
//         }
//         const dir = `./public/issuedComplaints`;
//         if (!fs.existsSync(dir)) {
//             fs.mkdirSync(dir);
//         }
//         // Get current date and time
//         const currentDate = new Date();
//         const formattedDateTime = currentDate.toISOString().replace(/:/g, '-').replace(/\..+/, ''); // Format as 'YYYY-MM-DDTHH-MM-SS'

//         const subDir = `./public/issuedComplaints/${formattedDateTime}`;
//         if (formattedDateTime) {
//             const complaintDir = `./public/issuedComplaints/${formattedDateTime}`;
//             if (!fs.existsSync(complaintDir)) {
//                 fs.mkdirSync(complaintDir);
//             }
//             cb(null, complaintDir);
//         } else {
//             cb(null, subDir);
//         }
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${file.originalname}`);
//     },
// });

const complaintsResolvedFromResolverStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const publicDir = `./public`;
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }
        const dir = `./public/resolvedComplaints`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        // Get current date and time
        const currentDate = new Date();
        const formattedDateTime = currentDate.toISOString().replace(/:/g, '-').replace(/\..+/, ''); // Format as 'YYYY-MM-DDTHH-MM-SS'

        const subDir = `./public/resolvedComplaints/${formattedDateTime}`;
        if (formattedDateTime) {
            const complaintDir = `./public/resolvedComplaints/${formattedDateTime}`;
            if (!fs.existsSync(complaintDir)) {
                fs.mkdirSync(complaintDir);
            }
            cb(null, complaintDir);
        } else {
            cb(null, subDir);
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});

const inventoryBillStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const publicDir = `./public`;
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }
        const dir = `./public/inventoryInvoiceBills`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        // Get current date and time
        const currentDate = new Date();
        const formattedDateTime = currentDate.toISOString().replace(/:/g, '-').replace(/\..+/, ''); // Format as 'YYYY-MM-DDTHH-MM-SS'

        const subDir = `./public/inventoryInvoiceBills/${formattedDateTime}`;
        if (formattedDateTime) {
            const inventoryBillDir = `./public/inventoryInvoiceBills/${formattedDateTime}`;
            if (!fs.existsSync(inventoryBillDir)) {
                fs.mkdirSync(inventoryBillDir);
            }
            cb(null, inventoryBillDir);
        } else {
            cb(null, subDir);
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});


const motionUpload = multer({ storage: motionStorage });
const resolutionUpload = multer({ storage: resolutionStorage });
const questionUpload = multer({ storage: questionStorage })
// const complaintsFromUserUpload = multer({ storage: complaintsFromUserStorage})
const complaintsFromResolverUpload = multer({ storage: complaintsResolvedFromResolverStorage })
const inventoryBillUpload = multer({ storage: inventoryBillStorage })
const fileUpload = multer({ storage: fileStorage })
const freshReceiptUpload = multer({ storage: freshReceiptsStorage })
const casesUpload = multer({ storage: casesStorage })

exports.uploadFile = (name) =>
    name === 'motion'
        ? motionUpload.array('file', 10)
        : name === 'resolution'
            ? resolutionUpload.array('attachment', 10)
            : name === 'question'
                ? questionUpload.array('questionImage', 10)
                : name === 'complaintsFromResolver'
                    ? complaintsFromResolverUpload.single('complaintAttachmentFromResolver')
                    : name === 'invoiceBill'
                        ? inventoryBillUpload.single('invoiceAttachment')
                        : name === 'file'
                            ? fileUpload.single('attachment')
                            : name === 'freshReceipt'
                                ? freshReceiptUpload.array('freshReceipt', 10)
                                : name === 'case'
                                    ? casesUpload.any('sections', 20)
                                    : upload.single('file')


// exports.uploadMultipleFiles = upload.array('file', 20)