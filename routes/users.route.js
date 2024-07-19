const express = require('express');
const router = express.Router();

const users = require("../controllers/users.controller");
const isAuthenticated = require("../middleware/authToken");
const checkPrivileges = require("../middleware/checkPrivilege")
const paramsValidate = require('../middleware/validate');
//const createUserValidation = require('../validation/userValidation');



// Create a new User
// router.post("/create", paramsValidate(validateUser), users.createUser);

// Logins a user
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Logins User
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of user
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/login", users.loginUser);

// Retrieve all Users
// isAuthenticated, checkPrivileges("View Users")
router.get("/", users.findAllUsers);

// // Retrieve Single User
// router.get("/:id", isAuthenticated, checkPrivileges(),  users.findSingleUser);

// // Updates the user
// router.put("/edit/:id", isAuthenticated, checkPrivileges(), users.editUser)

// // Suspends/Deletes the user
// router.put("/delete/:id", isAuthenticated, checkPrivileges(), users.deleteUser)

module.exports = router;
