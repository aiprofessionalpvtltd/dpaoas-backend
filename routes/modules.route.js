module.exports = app => {
    const modules = require("../controllers/modules.controller");
  
    var router = require("express").Router();
  
    // Create a new Role
    router.post("/create", modules.createModule);
  
    // Retrieve all Roles
     router.get("/", modules.findAllModules);

     app.use("/api/modules", router);
    };