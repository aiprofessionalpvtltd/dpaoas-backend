const userService = require("../services/users.service")

const userController = {
  // Creates A New User
createUser: async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
},

// Retrieves All Users
findAllUsers: async (req, res) => {
  try {
    const users = await userService.findAllUsers();
    res.send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
},

// Login's User
loginUser: async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip;

  try {
    const result = await userService.loginUser(email, password, ipAddress);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},
}
module.exports = userController;

