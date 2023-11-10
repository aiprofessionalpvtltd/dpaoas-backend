module.exports = app => {
    const Modules = require("../controllers/modules.controller");
  
    var router = require("express").Router();
  
    // Create a new Role
    router.post("/create", Modules.createModule);
  
    // Retrieve all Roles
     router.get("/", Modules.findAllModules);

     app.use("/api/modules", router);
    };