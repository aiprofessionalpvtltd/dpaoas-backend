const express = require("express");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routers for each module
const rolesRouter = require("./routes/roles.route");
const leaveRouter = require("./routes/leave.route");
const usersRouter = require("./routes/users.route");
const permissionsRouter = require("./routes/permissions.route");
const modulesRouter = require("./routes/modules.route");
const departmentsRouter = require("./routes/departments.route");
const designationsRouter = require("./routes/designations.route");


app.use((err, req, res, next) => {
  console.log("error", err);
  if (err && err.error && err.error.isJoi) {
    console.log("errorssss", err);
    // we had a joi error, let's return a custom 400 json response
    res.status(400).json({
      type: err.type, // will be "query" here, but could be "headers", "body", or "params"
      message: err.error.toString()
    });
  } else {
    // pass on to another error handler
    next(err);
  }
});


// Use routers for each module
app.use("/api/roles", rolesRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/users", usersRouter);
app.use("/api/permissions", permissionsRouter);
app.use("/api/modules", modulesRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/designations", designationsRouter);




const PORT = process.env.LOCAL_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
