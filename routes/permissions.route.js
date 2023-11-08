module.exports = app => {
    const Permissions = require("../controllers/permissions.controller");
  
    var router = require("express").Router();
  
    // Create a new Role
    router.post("/create", Permissions.create);
  
    // Retrieve all Roles
     router.get("/", Permissions.findAll);

     router.put('/edit', Permissions.editPermission)

     app.use("/api/permissions", router);
    };