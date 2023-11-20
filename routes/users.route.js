module.exports = app => {
    const users = require("../controllers/users.controller");
    const isAuthenticated = require("../middleware/authToken");
    const checkPrivileges = require("../middleware/checkPrivilege")
    const paramsValidate = require('../middleware/validate');
    //const createUserValidation = require('../validation/userValidation');
    const { createUserValidation } = require('../validation');
    var router = require("express").Router();

    // Create a new User
    router.post("/create", isAuthenticated, checkPrivileges('View Users'), paramsValidate(createUserValidation), users.createUser);

    // Logins a user
    router.post("/login", users.loginUser);

    // Retrieve all Users
    // isAuthenticated, checkPrivileges("View Users")
    router.get("/", users.findAllUsers);

    // Retrieve Single User
    router.get("/:id", users.findSingleUser);

    // Updates the user
    router.put("/edit/:id", users.editUser)

    // Suspends/Deletes the user
    router.put("/delete/:id", users.suspendUser)

    app.use("/api/users",  router);
};