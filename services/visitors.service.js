const db = require("../models");
const Visitor = db.visitors
const PassVisitor = db.passVisitors

const visitorService = {

  //Create A New Visitor
  createVisitor: async (req, passId) => {
    try {
      // Create the visitor and save it in the database
      const visitor = await Visitor.create(req);

      // Visitor Id
      const visitorId = visitor.id;
      const passVisitorData = {
        visitorId: visitorId,
        passId: passId
      }

      const passVisitor = await PassVisitor.create(passVisitorData)
      return passVisitor;
    } catch (error) {
      throw { message: error.message || "Error Creating Visitor" };

    }
  },

  // Create Duplicate Visitor
  createDuplicateVisitor: async (req, passId) => {
    try {
      // Assuming req.visitor is an array of visitor objects

      for (const visitorData of req) {
        let visitor;

        // Check if visitorData has an 'id' property
        if (visitorData.id) {
          // Find the existing visitor by id
          visitor = await Visitor.findOne({ where: { id: visitorData.id } });
          console.log("Visitor", visitor)

          // Log if visitor exists
          if (visitor) {
            console.log(`Visitor Exists: ${visitor.id}`);
          } else {
            console.log(`No visitor found with id: ${visitorData.id}`);
            // Handle the case where no visitor is found
            // You might want to continue, throw an error, or create a new visitor
          }
        } else {
          // Create a new visitor if no id is present
          visitor = await Visitor.create(visitorData);
          console.log(`New Visitor Created: ${visitor.id}`);
        }

        // Linking with passVisitor table
        const passVisitorData = {
          visitorId: visitor.id,
          passId: passId
        };
        const passVisitor = await PassVisitor.create(passVisitorData);
      }

      // You might want to return something here, e.g., a success message or the created data
    } catch (error) {
      throw { message: error.message || "Error Creating Duplicate Visitor" };
    }
  },

  // Retrieve All Visitors
  findAllVisitors: async (currentPage,pageSize) => {
    try {
      const offset = currentPage * pageSize;
      const limit = pageSize;

      const { count, rows } = await Visitor.findAndCountAll({
          offset,
          limit,
      });

      const totalPages = Math.ceil(count / pageSize);
      return { count, totalPages, visitors: rows };
  } catch (error) {
      throw new Error(error.message || "Error Fetching All Visitors");
  }
  },

  // Retrieve Single Visitor
  findSingleVisitor: async (req, res) => {
    try {
      const fetchedVisitor = await Visitor.findByPk(req);
      return fetchedVisitor;
    } catch (error) {
      throw { message: error.message || "Error Fetching Visitor!" }
    }
  },

  // Update the Visitor
  updateVisitor: async (req, visitorId) => {
    try {
      // Update the Visitor
      await Visitor.update(req.body, { where: { id: visitorId } });
      const updatedVisitor = await Visitor.findByPk(visitorId);
      return updatedVisitor;
    } catch (error) {
      throw { message: error.message || "Error Updating Visitor!" }

    }
  },

  // Delete the Visitor
  deleteVisitor: async (visitorId) => {
    try {
      await Visitor.findByPk(visitorId);
      const deletedData = {
        visitorStatus: "inactive"
      }

      await Visitor.update(deletedData, { where: { id: visitorId } })
      const updatedVisitor = await Visitor.findByPk(visitorId);

      return updatedVisitor;
    } catch (error) {
      throw { message: error.message || "Error Deleting Visitor!" };
    }
  }

}

module.exports = visitorService