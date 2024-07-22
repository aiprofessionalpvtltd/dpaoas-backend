const eventCalenderService = require('../services/eventCalenders.service');
const logger = require('../common/winston');
const db = require("../models");
const EventCalender = db.eventCalenders;
const EventCalenderController = {

    // Create a new event Calender
    createEventCalender: async (req, res) => {
        try {
            console.log("req.body", req.body);
            const eventCalender = await eventCalenderService.createEventCalender(req.body);


            let imageObjects = [];
            if (req.files && req.files.length > 0) {
                imageObjects = req.files.map((file, index) => {
                    const path = file.destination.replace('./public/', '/public/') + file.originalname;
                    const id = index + 1;
                    return JSON.stringify({ id, path });
                });
            }

            const existingEventCalender = await EventCalender.findOne({ where: { id: eventCalender.id } });
            const existingImages = existingEventCalender ? existingEventCalender.file || [] : [];
            const updatedImages = [...existingImages, ...imageObjects];

            try {
                // Your code to update the database
                await EventCalender.update(
                    {
                        file: updatedImages,
                    },
                    {
                        where: { id: eventCalender.dataValues.id }
                    }
                );
                const updatedEventCalender = await EventCalender.findOne({ where: { id: eventCalender.id } });
                logger.info("Event Calender Created Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "Event Calender Created Successfully!",
                    data: updatedEventCalender,
                })
            } catch (error) {
                console.error("Error updating attachment:", error);
            }
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieves All event Calender
    findAllEventCalendersBYDate: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, eventData } = await eventCalenderService.findAllEventCalendersBYDate(currentPage, pageSize);

            logger.info("event Calender--->>", eventData)

            if (eventData.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All event Data by event Dates Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All event Data by event Dates Fetched Successfully!",
                    data: { eventData, totalPages, count }
                })
            }

        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })
        }
    },

    // Retrieves All event Calender
    findAllEventCalenders: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, eventData } = await eventCalenderService.findAllEventCalenders(currentPage, pageSize);

            logger.info("event Calender--->>", eventData)

            if (eventData.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All event Data Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All event Data Fetched Successfully!",
                    data: { eventData, totalPages, count }
                })
            }

        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })
        }
    },

    // Retrieve Single event Calender
    findSingleEventCalender: async (req, res) => {
        try {
            const eventCalenderId = req.params.id
            const eventCalender = await eventCalenderService.findSingleEventCalender(eventCalenderId);
            logger.info("Single event Calender Data Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single event Calender Data Fetched Successfully!",
                data: [eventCalender],
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Update the Event Calender
    updateEventCalender: async (req, res) => {
        try {
            const eventCalenderId = req.params.id;
            const eventCalender = await EventCalender.findByPk(eventCalenderId);
            if (!eventCalender) {
                return res.status(200).send({
                    success: false,
                    message: "Event Calender Data Not Found!"
                })
            }
            const updatedEventCalender = await eventCalenderService.updateEventCalender(req, eventCalenderId);
            if (updatedEventCalender) {
                if (req.files && req.files.length > 0) {

                    const newAttachmentObjects = req.files.map((file, index) => {
                        const path = file.destination.replace('./public/', '/public/') + file.originalname;
                        const id = index + 1;
                        return JSON.stringify({ id, path });
                    });

                    // Merge existing image objects with the new ones
                    const updatedImages = [...newAttachmentObjects];

                    await EventCalender.update(
                        {
                            file: updatedImages,
                        },
                        {
                            where: { id: eventCalenderId }
                        }
                    );
                }
                const updatedEventCalenderData = await EventCalender.findOne({ where: { id: eventCalenderId } });
                if (updatedEventCalenderData && updatedEventCalenderData.file) {
                    updatedEventCalenderData.file = updatedEventCalenderData.file.map(imageString => JSON.parse(imageString));
                }


                logger.info("Event Calender Updated Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "Event Calender Updated Successfully!",
                    data: updatedEventCalenderData,
                })
            }
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

      // Delets/Suspend the Event Calender
      deleteEventCalender: async (req, res) => {
        try {
          const eventCalenderId = req.params.id;
          const eventCalender = await EventCalender.findByPk(eventCalenderId);
          if (!eventCalender) {
            return res.status(200).send({
              success: false,
              message: "Event Calender Data Not Found!",
            })
          }
          const deletedEventCalender = await eventCalenderService.deleteEventCalender(eventCalenderId);

          logger.info("Event Calender Deleted Successfully!")
          return res.status(200).send({
            success: true,
            message: "Event Calender Deleted Successfully!",
            data: deletedEventCalender,
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

module.exports = EventCalenderController;