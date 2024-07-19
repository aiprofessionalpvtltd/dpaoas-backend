module.exports = app => {
    const permissions = require("../controllers/permissions.controller");
  
    var router = require("express").Router();
  
    // Create a New Permission
    router.post("/create", permissions.createPermission);
  
    // Retrieve All Permissions
     router.get("/", permissions.findAllPermissions);

     // Assign Permission to Module
     router.put('/edit', permissions.editPermission)

     app.use("/api/permissions", router);
    };