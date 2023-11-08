module.exports = app => {
    const Users = require("../controllers/users.controller");

    var router = require("express").Router();

    // Create a new Role
    router.post("/create", Users.create);

    router.post("/login", Users.login);

    // Retrieve all Roles
    router.get("/", Users.findAll);

    app.use("/api/users", router);
};