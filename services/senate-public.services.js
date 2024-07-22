const { makeRequest } = require('../helper/makeRequest')
//const publicUserQueries = require('../queries/public-user.queries')
const bcrypt = require('bcryptjs')
const db = require("../models");
const PublicUsers = db.publicUsers;

class SenatorPublicService {
  constructor(db, winston) {
    this.db = db
    this.winston = winston
  }
  /** Method for getting committee reports by memberId
   * @param  {} memberId
   */
  async getHansardData() {
    try {
      const result = await makeRequest(
        // this.winston,
        // this.db,
        'GET',
        `https://www.senate.gov.pk/en/getdata/hansard_json.php`,
        {},
        true,
      )
      this.winston.info(`response fetched successfully`)
      return result.map((record) => {
        record.summary_file = record.summary_file
          ? `https://www.senate.gov.pk/uploads/documents/debates/${record.summary_file}`
          : record.summary_file
        return record
      })
    } catch (error) {
      return []
    }
  }

  async getResolutionsData() {
    try {
      const result = await makeRequest(
        // this.winston,
        // this.db,
        'GET',
        `https://www.senate.gov.pk/en/getdata/resolutions_json.php`,
        {},
        true,
      )
      this.winston.info(`response fetched successfully`)
      return result.map((record) => {
        record.resolution_file = record.resolution_file
          ? `https://www.senate.gov.pk/uploads/documents/resolutions/${record.resolution_file}`
          : record.resolution_file
        return record
      })
    } catch (error) {
      return []
    }
  }

  async getBillsData() {
    try {
      const result = await makeRequest(
        // this.winston,
        // this.db,
        'GET',
        `https://www.senate.gov.pk/en/getdata/bills_json.php`,
        {},
        true,
      )
      this.winston.info(`response fetched successfully`)
      return result.map((record) => {
        record.bill_file = record.bill_file
          ? `https://www.senate.gov.pk/uploads/documents/${record.bill_file}`
          : record.bill_file
        return record
      })
    } catch (error) {
      return []
    }
  }

  async getOrdinancesData() {
    try {
      const result = await makeRequest(
        // this.winston,
        // this.db,
        'GET',
        `https://www.senate.gov.pk/en/getdata/ordinances_json.php`,
        {},
        true,
      )
      this.winston.info(`response fetched successfully`)
      return result.map((record) => {
        record.ordinance_file = record.ordinance_file
          ? `https://www.senate.gov.pk/uploads/documents/${record.ordinance_file}`
          : record.ordinance_file
        return record
      })
    } catch (error) {
      return []
    }
  }

  async getRulingsData() {
    try {
      const result = await makeRequest(
        // this.winston,
        // this.db,
        'GET',
        `https://www.senate.gov.pk/en/getdata/rulings_json.php`,
        {},
        true,
      )
      this.winston.info(`response fetched successfully`)
      return result.map((record) => {
        record.ruling_file = record.ruling_file
          ? `https://www.senate.gov.pk/uploads/documents/${record.ruling_file}`
          : record.ruling_file
        return record
      })
    } catch (error) {
      return []
    }
  }

  async getActsData() {
    try {
      const result = await makeRequest(
        // this.winston,
        // this.db,
        'GET',
        `https://www.senate.gov.pk/en/getdata/acts_json.php`,
        {},
        true,
      )
      this.winston.info(`response fetched successfully`)
      return result.map((record) => {
        record.act_file = record.act_file
          ? `https://www.senate.gov.pk/uploads/documents/${record.act_file}`
          : record.act_file
        return record
      })
    } catch (error) {
      return []
    }
  }

  async getPressReleasesData() {
    try {
      const result = await makeRequest(
        // this.winston,
        // this.db,
        'GET',
        `https://www.senate.gov.pk/en/getdata/press_releases_json.php`,
        {},
        true,
      )
      this.winston.info(`response fetched successfully`)
      return result.map((record) => {
        record.news_pic = record.news_pic
          ? `https://www.senate.gov.pk/uploads/images/news_pic/${record.news_pic}`
          : record.news_pic
        return record
      })
    } catch (error) {
      return []
    }
  }

  async getCurrentMembersData() {
    try {
      const result = await makeRequest(
        // this.winston,
        // this.db,
        'GET',
        `https://www.senate.gov.pk/en/getdata/current_members_json.php`,
        {},
        true,
      )
      this.winston.info(`response fetched successfully`)
      return result.map((record) => {
        record.member_pic = record.member_pic
          ? `https://www.senate.gov.pk/uploads/images/${record.member_pic}`
          : record.member_pic
        return record
      })
    } catch (error) {
      return []
    }
  }

  async getAllMembers() {
    try {
      const result = await makeRequest(
        'GET',
        `http://api.senate.gov.pk/api/members`,
        {},
        true,
      )
      //this.winston.info(`response fetched successfully`)
      return result
    } catch (error) {
      return []
    }
  }

  async getPublicPetition(refNumber, cnic) {
    const url = `http://publicpetition.senate.gov.pk/Ap_PetitionsDetailView.php?RefNo=${refNumber}&Nic=${cnic}`
    try {
      const result = await makeRequest(
        // this.winston,
        // this.db,
        'GET',
        url,
        {},
        true,
      )
      this.winston.info(
        `public petition by refNumber ${refNumber} and cnic ${cnic} fetched successfully, result ${result}`,
      )
      result.file_name = result.file_name
        ? `http://publicpetition.senate.gov.pk/uploads/petitions/${result.file_name}`
        : result.file_name

      return result
    } catch (error) {
      return {}
    }
  }

  async updatePassword(body) {
    const { email, password } = body
    // const publicUser = await this.db.execute(
    //   publicUserQueries.GET_PUBLIC_USER_BY_EMAIL,
    //   [email, email],
    // )
    const publicUser = await PublicUsers.findOne({ where: { email } });

    if (publicUser && publicUser.length === 0) {
      const error = new Error('Email not found')
      error.code = 404
      throw error
    }

    const hashPassword = bcrypt.hashSync(password, 10)
    console.log("hasso0o-------",hashPassword)

    await publicUser.update({ password: hashPassword });
  }

  async addPublicPetition(body) {
    const url = `http://publicpetition.senate.gov.pk/Ap_InsertData.php`
    try {
      const result = await makeRequest(
        // this.winston,
        // this.db,
        'POST',
        url,
        { data: body },
        true,
      )
      this.winston.info(`public petition added successfully, result ${result}`)
      return result
    } catch (error) {
      return {}
    }
  }
  async addPublicNotification(body) {
    const payload = { ...body }
    return this.db.execute(publicUserQueries.INSERT_Public_NOTIFICATION, [
      payload,
    ])
  }
  async getPublicNotification() {
    return this.db.execute(publicUserQueries.GET_ALL_PUBLIC_NOTIFICATION)
  }
}

module.exports = SenatorPublicService
