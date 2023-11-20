module.exports = app => {
    const deparments = require("../controllers/departments.controller");
  
    var router = require("express").Router();
  
    // Create a new Department
    router.post("/create", deparments.createDepartment);
  
    // Retrieve all Departments
     router.get("/", deparments.findAllDepartments);

     // Single Department
     router.get("/:id", deparments.findSinlgeDepartment);

     // Update Department
     router.put("/update/:id", deparments.updateDepartment)

     // Suspend/Delete Department
     router.put("/delete/:id", deparments.suspendDepartment);
  
  
    app.use("/api/departments", router);
  };