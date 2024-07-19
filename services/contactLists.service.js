const db = require("../models");
const ContactLists = db.contactLists;
const ContactListUsers = db.contactListUsers;
const Users = db.users;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const ContactListsService = {

  // Create A New ContactList
  createContactList: async (req) => {

    try {
      // Create contact list
      const contactList = await ContactLists.create({
        listName: req.listName,
        listDescription: req.listDescription,
        fkUserId: req.fkUserId,
        isPublicList: req.isPublicList,
      });

      console.log("contactlist---->>", contactList);

      // Create associated contact list users
      const contactMembers = req.contactMembers.map(async (member) => {
        return await ContactListUsers.create({
          fkListId: contactList.id,
          fkMemberId: member.fkMemberId,
        });
      });

      // Wait for all contact list users to be created
      await Promise.all(contactMembers);

      console.log("contactMembers---->>", contactMembers);

      return { message: 'Contact list created successfully!' };
    } catch (error) {
      throw { message: error.message || "Error Creating ContactList" };
    }
  },

  // Retrieve All contactList
  findAllContactList: async (currentPage, pageSize) => {
    try {
      const offset = currentPage * pageSize;
      const limit = pageSize;

      const { count, rows } = await ContactLists.findAndCountAll({
        offset,
        limit,
        include: [
          {
            model: db.users,
            as: 'user',
            attributes: ['email', 'userStatus'],
            include: [
              {
                model: db.employees,
                as: 'employee',
                attributes: ['firstName', 'lastName', 'userName'],
              }
            ]
          },
          {
            model: db.contactListUsers,
            as: 'contactMembers',
            attributes: ['fkMemberId'],
            include: [
              {
                model: db.members,
                as: 'member',
                attributes: ['memberName', 'phoneNo', 'gender', 'electionType']
              }
            ]
          }
        ],
      });

      console.log("rows: " + rows)

      const totalPages = Math.ceil(count / pageSize);

      return { count, totalPages, contactList: rows };
    } catch (error) {
      throw new Error(error.message || "Error Fetching All contactList");
    }
  },

  // Retrieve Single contactList
  findSinlgeContactList: async (contactListId) => {
    try {
      const contactList = await ContactLists.findOne({
        where: { id: contactListId },
        include: [
          {
            model: db.users,
            as: 'user',
            attributes: ['email', 'userStatus'],
            include: [
              {
                model: db.employees,
                as: 'employee',
                attributes: ['firstName', 'lastName', 'userName'],
              }
            ]
          },
          {
            model: db.contactListUsers,
            as: 'contactMembers',
            attributes: ['fkMemberId'],
            include: [
              {
                model: db.members,
                as: 'member',
                attributes: ['memberName', 'phoneNo', 'gender', 'electionType']
              }
            ]
          }
        ],
      });
      if (!contactList) {
        throw ({ message: "contactList Not Found!" })
      }
      return contactList;
    }
    catch (error) {
      throw { message: error.message || "Error Fetching Single contactList" };
    }
  },

  // Update contactList
  updateContactList: async (req, contactListId) => {
    try {

      await ContactLists.update(req.body, { where: { id: contactListId } });

      // Update the associated contact list users
      if (req.body.contactMembers && Array.isArray(req.body.contactMembers)) {
        await ContactListUsers.destroy({
          where: {
            fkListId: contactListId,
          },
        });

        const contactMembers = req.body.contactMembers.map(async (member) => {
          return await ContactListUsers.create({
            fkListId: contactListId,
            fkMemberId: member.fkMemberId,
          });
        });

        // Wait for all contact list users to be created
        await Promise.all(contactMembers);
      }

      return { message: 'Contact list updated successfully!' };

    } catch (error) {
      throw { message: error.message || "Error Updating ContactTemplate" };
    }
  },

  // Delete contactList
  deleteContactList: async (req) => {
    try {

      const updatedData = {
        listActive: "inactive"
      }

      await ContactLists.update(updatedData, { where: { id: req } });

      // Fetch the updated contactList after the update
      const updatedContactList = await ContactLists.findByPk(req, { raw: true });

      return updatedContactList;


    } catch (error) {
      throw { message: error.message || "Error deleting ContactList" };
    }
  }


}

module.exports = ContactListsService