module.exports = app => {
    const designations = require("../controllers/designations.controller");
  
    var router = require("express").Router();
  
    // Create a new Designation
    router.post("/create", designations.createDesignation);
  
    // Retrieve all Designation
     router.get("/", designations.findAllDesignations);

     // Retrive Single Designation
     router.get("/:id", designations.findSinlgeDesignation);

     // Updating Designation
     router.put("/update/:id", designations.updateDesignation);

     // Suspend/Delete Designation
     router.put("/delete/:id", designations.suspendDesignation);
  
  
    app.use("/api/designations", router);
  };