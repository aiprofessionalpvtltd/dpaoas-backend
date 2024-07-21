const Roles = require('../models').roles; // Update with your actual model path
const roleService = require('../services/roles.service'); // Update with your actual service path
const roleController = require('../controllers/roles.controller'); // Update with your actual controller path

jest.mock('../models/roles.model'); // Mock the Roles model

describe('Role Controller', () => {
  describe('createRole', () => {
    it('should create a new role', async () => {
      // Arrange
      const req = { body: { name: 'TestRole', description: 'TestDescription', roleStatus: 'active' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      Roles.create.mockResolvedValue({
        id: 1,
        name: 'TestRole',
        description: 'TestDescription',
        roleStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      await roleController.createRole(req, res);

      // Assert
      expect(Roles.create).toHaveBeenCalledWith({
        name: 'TestRole',
        description: 'TestDescription',
        roleStatus: 'active',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'Role Created Successfully!',
        data: {
          id: 1,
          name: 'TestRole',
          description: 'TestDescription',
          roleStatus: 'active',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should handle errors when creating a role', async () => {
      // Arrange
      const req = { body: { name: 'TestRole', description: 'TestDescription', roleStatus: 'active' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      Roles.create.mockRejectedValue(new Error('Test error'));

      // Act
      await roleController.createRole(req, res);

      // Assert
      expect(Roles.create).toHaveBeenCalledWith({
        name: 'TestRole',
        description: 'TestDescription',
        roleStatus: 'active',
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'Test error',
      });
    });
  });
});
