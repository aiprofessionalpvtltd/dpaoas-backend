const db = require("../models");
const Divisions = db.divisions;
const Branches =db.branches
const Ministries = db.ministries
const FreshReceipts = db.freshReceipts
const FileDiaries = db.fileDiaries
const Files = db.newFiles
const FreshReceiptAttachments = db.freshReceiptsAttachments
const CaseAttachments = db.caseAttachments
const SectionCases = db.sectionsCases
const Op = db.Sequelize.Op;
const logger = require('../common/winston');


const fileDiariesService = {

    // Retrieve File Diaries Regarding to Incoming and Outgoing
    retrieveFileDiaries: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
    
            const [incomingFileDiaryResult, outGoingDiaryResult] = await Promise.all([
                FileDiaries.findAndCountAll({
                    where: { diaryType: "Incoming" },
                    include: [
                        {
                            model: FreshReceipts,
                            as: 'freshReceipts',
                        },
                    ],
                    offset,
                    limit,
                    order: [['id', 'ASC']],
                }),
                FileDiaries.findAndCountAll({
                    where: { diaryType: "Outgoing" },
                    include: [
                        {
                            model: FreshReceipts,
                            as: 'freshReceipts',
                        },
                    ],
                    offset,
                    limit,
                    order: [['id', 'DESC']],
                })
            ]);
    
            const { count: count1, rows: incomingFileDiary } = incomingFileDiaryResult;
            const { count: count2, rows: outGoingDiary } = outGoingDiaryResult;
    
            const totalPagesIncoming = Math.ceil(count1 / pageSize);
            const totalPagesOutgoing = Math.ceil(count2 / pageSize);
    
            return { 
                incoming: { count1, totalPages: totalPagesIncoming, fileDiaries: incomingFileDiary },
                outgoing: { count2, totalPages: totalPagesOutgoing, fileDiaries: outGoingDiary }
            };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All FRs");
        }
    }
    
    
}

module.exports = fileDiariesService
