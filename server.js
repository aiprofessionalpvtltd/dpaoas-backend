const express = require("express");
require('dotenv').config();

//const cors = require("cors");

const app = express();

// var corsOptions = {
//   origin: "http://localhost:8081"
// };

// app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

require("./routes/roles.route")(app);
require("./routes/users.route")(app);
require("./routes/permissions.route")(app);
require("./routes/modules.route")(app);

// set port, listen for requests
const PORT = process.env.LOCAL_PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});