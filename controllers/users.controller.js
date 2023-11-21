const userService = require("../services/users.service")
const logger = require('../common/winston');
const userController = {
  // Creates A New User
  createUser: async (req, res) => {
    try {
      const user = await userService.createUser(req.body);
      logger.info('User Created Successfully!');
      return res.status(200).send({
        success: true,
        message: "User Created Successfully!",
        data: user,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message,

      })
    }
  },

  // Retrieves All Users
  findAllUsers: async (req, res) => {
    try {
      const users = await userService.findAllUsers();
      logger.info("All Users Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "All Users Fetched Successfully!",
        data: users,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message,

      })
    }
  },

  // Login's User
  loginUser: async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip;

    try {
      const result = await userService.loginUser(email, password, ipAddress);
      logger.info("User Logged In Successfully!")
      return res.status(200).send({
        success: true,
        message: "User Logged In Successfully!",
        data: result,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message

      })
    }
  },
}
module.exports = userController;

