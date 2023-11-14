module.exports = app => {
    const Roles = require("../controllers/roles.controller");
  
    var router = require("express").Router();
  
    // Create a new Role
    router.post("/create", Roles.createRole);
  
    // Retrieve all Roles
     router.get("/", Roles.findAllRoles);

     // Assign a permssion to a role
     router.put("/edit",Roles.editRole);
  
    // // Retrieve all published Tutorials
    // router.get("/published", tutorials.findAllPublished);
  
    // // Retrieve a single Tutorial with id
    // router.get("/:id", tutorials.findOne);
  
    // // Update a Tutorial with id
    // router.put("/:id", tutorials.update);
  
    // // Delete a Tutorial with id
    // router.delete("/:id", tutorials.delete);
  
    // // Delete all Tutorials
    // router.delete("/", tutorials.deleteAll);
  
    app.use("/api/roles", router);
  };