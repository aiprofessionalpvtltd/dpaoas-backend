const db = require("../models");
const ContactLists = db.contactLists;
const ContactListUsers = db.contactListUsers;
const SmsSents = db.smsSents;
const Members = db.members;
const Users = db.users;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');


const SmsSentService = {

    // SMS message sent to the user
    createSmsSent: async (msgText, RecieverNos, fkUserId, fkListId, isSent) => {

        try {
            const smsRecords = [];

            // Step 1: If RecieverNos is an array
            if (Array.isArray(RecieverNos)) {
                // Create separate entries for each RecieverNo
                for (const RecieverNo of RecieverNos) {
                    const smsRecord = await SmsSents.create({
                        msgText,
                        RecieverNo,
                        fkUserId,
                        fkListId,
                        isSent,
                    });

                    smsRecords.push(smsRecord);
                }
            }

            // console.log("smsRecords-->> ", smsRecords)
            // Step 2: If fkListId is provided, associate with contact list members
            if (fkListId) {
                const contactList = await ContactLists.findByPk(fkListId, {
                    include: [
                        {
                            model: ContactListUsers,
                            as: 'contactMembers',
                            attributes: ['fkMemberId'],
                            include: [
                                {
                                    model: Members,
                                    as: 'member',
                                    attributes: ['id'], // Add any other attributes you want to retrieve
                                },
                            ],
                        },
                    ],
                });

                if (contactList) {
                    // Check if the required fields are filled in the contact list
                    const contactMembers = contactList.contactMembers.map((member) => member.member.id);

                    // Associate SMS with contact list members
                    for (const fkMemberId of contactMembers) {
                        const smsRecord = await SmsSents.create({
                            msgText,
                            RecieverNo: RecieverNos[0], // Use the first RecieverNo for each member
                            fkUserId,
                            fkListId,
                            fkMemberId,
                            isSent,
                        });

                        // Add the newly created record to the list
                        smsRecords.push(smsRecord);
                    }
                }
            }

            console.log("smsRecords 1-->> ", smsRecords)

            //   // Step 3: Call third-party SMS API for each record
            //   const smsApiResponses = await Promise.all(
            //     smsRecords.map((smsRecord) => thirdPartySmsApi.sendSms(smsRecord.msgText, [smsRecord.RecieverNo]))
            //   );

            // // Step 4: Update each SMS record with the corresponding API response
            // await Promise.all(
            //     smsRecords.map(async (smsRecord, index) => {
            //         await smsRecord.update({ isSent: smsApiResponses[index].status });
            //     })
            // );

            return { message: 'SMS created and sent successfully!' };
        } catch (error) {
            throw new Error(error.message || 'Error creating SMS');
        }

    },

    // Retrieve All SMS
    findAllSmsSent: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await SmsSents.findAndCountAll({
                offset,
                limit,
                include: [
                    {
                        model: ContactLists,
                        as: 'contactList',
                        attributes: ['id', 'listName', 'listDescription', 'isPublicList', 'listActive'],
                        include: [
                            {
                                model: ContactListUsers,
                                as: 'contactMembers',
                                attributes: ['fkMemberId'],
                                include: [
                                    {
                                        model: Members,
                                        as: 'member',
                                        attributes: ['id', 'memberName', 'memberStatus', 'phoneNo'],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });

            console.log("rows: " + rows)

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, smsRecord: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All SMS");
        }
    },


}

module.exports = SmsSentService