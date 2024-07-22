const db = require("../models");
const EventCalender = db.eventCalenders;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');


const EventCalenderService = {
    // Create A New ContactTemplate
    createEventCalender: async (req) => {
        try {

            const eventCalender = await EventCalender.create(req);

            return eventCalender;
        } catch (error) {
            throw { message: error.message || "Error Creating Event Calender" };

        }
    },

    // Retrieve All event Calenders by event Date
    findAllEventCalendersBYDate: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await EventCalender.findAndCountAll({
                offset,
                limit
            });

        // Create an array to store transformed data
        const transformedData = [];

        // Group events by event date
        rows.forEach(event => {
            const eventDate = event.eventDate.toISOString().slice(0, 10); // Extracting YYYY-MM-DD from the datetime

            if (event.status === 'active') {

            // Check if the date already exists in transformedData
            const existingDateIndex = transformedData.findIndex(item => item.calendar === eventDate);

            if (existingDateIndex !== -1) {
                // If the date already exists, push the event to its subarray
                transformedData[existingDateIndex].subarray.push({
                    country: event.countryName,
                    Title: event.title,
                    housetype: event.houseType,
                    electiontype: event.electionType,
                    description: event.description,
                    calendar: eventDate,
                    status: event.status,
                    eventTime: event.eventTime
                });
            } else {
                // If the date doesn't exist, create a new object with the date and subarray containing the event
                transformedData.push({
                    calendar: eventDate,
                    subarray: [{
                        country: event.countryName,
                        Title: event.title,
                        housetype: event.houseType,
                        electiontype: event.electionType,
                        description: event.description,
                        calendar: eventDate,
                        status: event.status,
                        eventTime: event.eventTime
                    }],
                });
            }
        }
        });

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, eventData: transformedData };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Event Calender");
        }
    },

      // Retrieve All event Calender Data
      findAllEventCalenders: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await EventCalender.findAndCountAll({
                offset,
                limit,
                order: [['id', 'DESC']],
            });

            console.log("rows: " + rows)

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, eventData: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All eventData");
        }
    },

    // Retrieve Single Event Calender Data
    findSingleEventCalender: async (eventCalenderId) => {
        try {
            const eventCalender = await EventCalender.findOne({
                where: { id: eventCalenderId },
            });
            if (!eventCalender) {
                throw ({ message: "Event Calender Data Not Found!" })
            }
            return eventCalender;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single event Calender Data" };
        }
    },

    // Update Event Calender
    updateEventCalender: async (req, eventCalenderId) => {
        try {

            await EventCalender.update(req.body, { where: { id: eventCalenderId } });

            // Fetch the updated contactTemplate after the update
            const updatedEventCalender = await EventCalender.findOne({
                where: { id: eventCalenderId },
            }, { raw: true });

            return updatedEventCalender;

        } catch (error) {
            throw { message: error.message || "Error Updating Event Calender Data" };
        }
    },

    // Delete Event Calender
    deleteEventCalender: async (req) => {
        try {

            const updatedData = {
                status: "inactive"
            }

            await EventCalender.update(updatedData, { where: { id: req } });

            // Fetch the updated ContactTemplate after the update
            const deletedEventCalender = await EventCalender.findByPk(req, { raw: true });

            return deletedEventCalender;


        } catch (error) {
            throw { message: error.message || "Error deleting Event Calender" };
        }
    }


}

module.exports = EventCalenderService