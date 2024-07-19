const express = require('express');
const router = express.Router();
const eventCalenders = require("../controllers/eventCalenders.controller");
const { uploadFile } = require('../common/upload');

// Create a new event Calender
router.post("/", uploadFile("eventCalender"), eventCalenders.createEventCalender);

// Retrieve all event Calender
router.get("/by-event-date", eventCalenders.findAllEventCalendersBYDate);

// Retrieve all event Calender
router.get("/", eventCalenders.findAllEventCalenders);

// Retrieve Single event Calender by its ID
router.get("/:id", eventCalenders.findSingleEventCalender);

// Update event Calender
router.put("/update/:id", uploadFile("eventCalender"), eventCalenders.updateEventCalender)

// Suspend/Delete event Calender
router.delete("/delete/:id", eventCalenders.deleteEventCalender);

module.exports = router

