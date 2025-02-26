const parliamentaryAffairsReportsService = require('../services/parliamentaryAffairsReports.service');

class ParliamentaryAffairsReportsController {
    async createReport(req, res) {
        try {
            const report = await parliamentaryAffairsReportsService.createReport({
                ministerTenureId: req.body.ministerTenureId,
                ministerParliamentaryYearId: req.body.ministerParliamentaryYearId,
                ministerId: req.body.ministerId,
                ministryId: req.body.ministryId,
                description: req.body.description
            });

            res.status(201).json({
                success: true,
                message: "Report created successfully",
                data: report
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || "Some error occurred while creating the report."
            });
        }
    }

    async findAllReports(req, res) {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, reports } = await parliamentaryAffairsReportsService.findAllReports(currentPage, pageSize);

            if (reports.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "No data found on this page!"
                });
            }

            return res.status(200).json({
                success: true,
                message: "All reports fetched successfully!",
                data: { reports, totalPages, count }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || "Some error occurred while retrieving reports."
            });
        }
    }

    async searchReports(req, res) {
        try {
            const searchQuery = req.query.search || '';
            const reports = await parliamentaryAffairsReportsService.searchReports(searchQuery);
            res.json({
                success: true,
                data: reports
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || "Some error occurred while searching reports."
            });
        }
    }

    async findSingleReport(req, res) {
        try {
            const report = await parliamentaryAffairsReportsService.findSingleReport(req.params.id);
            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: "Report not found"
                });
            }
            res.json({
                success: true,
                data: report
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || "Error retrieving report."
            });
        }
    }

    async updateReport(req, res) {
        try {
            const report = await parliamentaryAffairsReportsService.updateReport(req.params.id, {
                ministerTenureId: req.body.ministerTenureId,
                ministerParliamentaryYearId: req.body.ministerParliamentaryYearId,
                ministerId: req.body.ministerId,
                ministryId: req.body.ministryId,
                description: req.body.description
            });

            res.json({
                success: true,
                message: "Report updated successfully",
                data: report
            });
        } catch (error) {
            if (error.message === "Report not found") {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: error.message || "Error updating report."
            });
        }
    }

    async deleteReport(req, res) {
        try {
            await parliamentaryAffairsReportsService.deleteReport(req.params.id);
            res.json({
                success: true,
                message: "Report deleted successfully"
            });
        } catch (error) {
            if (error.message === "Report not found") {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: error.message || "Error deleting report."
            });
        }
    }
}

module.exports = new ParliamentaryAffairsReportsController();
