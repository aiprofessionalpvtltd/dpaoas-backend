module.exports = app => {
    const Permissions = require("../controllers/permissions.controller");
  
    var router = require("express").Router();
  
    // Create a New Permission
    router.post("/create", Permissions.createPermission);
  
    // Retrieve All Permissions
     router.get("/", Permissions.findAllPermissions);

     // Assign Permission to Module
     router.put('/edit', Permissions.editPermission)

     app.use("/api/permissions", router);
    };