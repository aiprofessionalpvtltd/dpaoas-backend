module.exports = app => {
    const Users = require("../controllers/users.controller");

    var router = require("express").Router();

    // Create a new User
    router.post("/create", Users.createUser);

    // Logins a user
    router.post("/login", Users.loginUser);

    // Retrieve all Users
    router.get("/", Users.findAllUsers);

    app.use("/api/users", router);
};