const db = require("../models");
const ParliamentaryAffairsReports = db.parliamentaryAffairsReports;
const TenuresMinisters = db.tenuresMinisters;
const ParliamentaryYearsMna = db.parliamentaryYearsMna;
const Mnas = db.mnas;
const Ministries = db.ministries;
const { Op } = require("sequelize");

class ParliamentaryAffairsReportsService {
    async createReport(reportData) {
        return await ParliamentaryAffairsReports.create(reportData);
    }

    async findAllReports(currentPage, pageSize) {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await ParliamentaryAffairsReports.findAndCountAll({
                offset,
                limit,
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: TenuresMinisters,
                        as: 'tenuresMinisters',
                    },
                    {
                        model: ParliamentaryYearsMna,
                        as: 'parliamentaryYearsMna',
                    },
                    {
                        model: Mnas,
                        as: 'minister'
                    },
                    {
                        model: Ministries,
                        as: 'ministry'
                    }
                ],
                distinct: true
            });

            const totalPages = Math.ceil(count / pageSize);

            return { 
                count, 
                totalPages, 
                reports: rows 
            };
        } catch (error) {
            throw new Error(error.message || "Error fetching reports");
        }
    }

    async searchReports(searchQuery) {
        return await ParliamentaryAffairsReports.findAll({
            where: {
                [Op.or]: [
                    { description: { [Op.like]: `%${searchQuery}%` } }
                ]
            },
            include: [
                {
                    model: TenuresMinisters,
                    as: 'tenuresMinisters',
                },
                {
                    model: ParliamentaryYearsMna,
                    as: 'parliamentaryYearsMna',
                },
                {
                    model: Mnas,
                    as: 'minister'
                },
                {
                    model: Ministries,
                    as: 'ministry'
                }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async findSingleReport(id) {
        return await ParliamentaryAffairsReports.findByPk(id, {
            include: [
                {
                    model: TenuresMinisters,
                    as: 'tenuresMinisters',
                },
                {
                    model: ParliamentaryYearsMna,
                    as: 'parliamentaryYearsMna',
                },
                {
                    model: Mnas,
                    as: 'minister',
                },
                {
                    model: Ministries,
                    as: 'ministry'
                }
            ]
        });
    }

    async updateReport(id, updateData) {
        const report = await ParliamentaryAffairsReports.findByPk(id);
        if (!report) {
            throw new Error("Report not found");
        }
        return await report.update(updateData);
    }

    async deleteReport(id) {
        const report = await ParliamentaryAffairsReports.findByPk(id);
        if (!report) {
            throw new Error("Report not found");
        }
        await report.destroy();
        return report;
    }
}

module.exports = new ParliamentaryAffairsReportsService();
