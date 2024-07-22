const { makeRequest } = require('../helper/makeRequest')
const axios = require('axios');
// const senatorQueries = require('../queries/senator.queries')
class SenatorAppService {
  constructor(db, winston) {
    this.db = db
    this.winston = winston
  }
  /** Method for getting Latest News
   */
  async getLatestNews() {
    //todo: get Latest News
    return
  }

  async getLegislative() {
    //todo: get legislative business
    return
  }

  async getSessionNumbers() {
    try {
      const result = await makeRequest(this.winston, this.db, 'GET', 'sessions')
      this.winston.info(
        `get session numbers response fetched successfully ${result}`,
      )
      return result
    } catch (error) {
      return []
    }
  }

  /** Method for getting non legislative business
   */
  async getNonLegislative() {
    //todo: get non legislative business
    return
  }
  /** Method for getting committee notices
   * @param  {} timePeriod
   */
  async getCommitteeMeetings(timePeriod) {
    console.log("getCommitteeMeetings---->", timePeriod);
    let url = 'https://www.senate.gov.pk/en/getdata'
    switch (timePeriod) {
      case 'Weekly':
        url = `${url}/allmeetings_weekly_json.php`
        break
      case 'Monthly':
        url = `${url}/allmeetings_monthly_json.php`
        break
      case 'Daily':
        url = `${url}/allmeetings_daily_json.php`
        break
      default:
        url = `${url}/allmeetings_daily_json.php`

        break
    }
    try {
      console.log("url--->>", url)
      const result = await makeRequest(
        'GET',
        url,
        {},
        true
      )
      //this.winston.info(`get committee meeting response fetched successfully`)
      console.log("result--->", result)
      return result
        .map((record) => {
          record.file_name = record.file_name
            ? `https://senate.gov.pk/uploads/documents/${record.file_name}`
            : record.file_name
          return record
        })
        .sort((a, b) => {
          return new Date(a.meeting_date) - new Date(b.meeting_date)
        })
    } catch (error) {
      return []
    }
  }
  /** Method for getting committee notices by memberId
   * @param  {} memberId
   * @param  {} timePeriod
   */
  async getCommitteeMeetingsByMember(memberId, timePeriod) {
    console.log("memberId, timePeriod", memberId, timePeriod);
    let url = `https://www.senate.gov.pk/en/getdata`
    // https://www.senate.gov.pk/en/getdata/ownmeetings_weekly_json.php?memberId=914
    // https://www.senate.gov.pk/en/getdata/ownmeetings_monthly_json.php?memberId=982
    // https://www.senate.gov.pk/en/getdata/ownmeetings_daily_json.php?memberId=914
    switch (timePeriod) {
      case 'Weekly':
        url = `${url}/ownmeetings_weekly_json.php?memberId=${memberId}`
        break
      case 'Monthly':
        url = `${url}/ownmeetings_monthly_json.php?memberId=${memberId}`
        break
      case 'Daily':
        url = `${url}/ownmeetings_daily_json.php?memberId=${memberId}`
        break
      default:
        break
    }
    try {
      const result = await makeRequest(
        'GET',
        url,
        {},
        true,
      )
      console.log("resu----", result)
      // logger.info(
      //   `get committee meeting by specific memberId ${memberId} response fetched successfully,result ${result}`,
      // )
      return result
        .map((record) => {
          record.file_name = record.file_name
            ? `https://senate.gov.pk/uploads/documents/${record.file_name}`
            : record.file_name
          return record
        })
        .sort((a, b) => {
          return new Date(a.meeting_date) - new Date(b.meeting_date)
        })
    } catch (error) {
      return []
    }
  }

  /** Method for getting committee reports
   */
  async getCommitteeReports() {
    try {
      const result = await makeRequest(
        'GET',
        'https://www.senate.gov.pk/en/getdata/report_json.php',
        {},
        true,
      )
      console.log("results", result)
     // logger.info(`get committee reports response fetched successfully`)
      return result.map((record) => {
        record.file_name = record.file_name
          ? `https://senate.gov.pk/uploads/documents/${record.file_name}`
          : record.file_name
        return record
      })
    } catch (error) {
      return []
    }
  }

  /** Method for getting committee reports by memberId
   * @param  {} memberId
   */
  async getCommitteeReportsByMember(memberId) {
    try {
      const result = await makeRequest(
        'GET',
        `https://www.senate.gov.pk/en/getdata/ownreports_json.php?memberId=${memberId}`,
        {},
        true,
      )
     
      console.log("resdfsd@@@@@@@", result)
      return result.map((record) => {
        record.file_name = record.file_name
          ? `https://senate.gov.pk/uploads/documents/${record.file_name}`
          : record.file_name
        return record
      })
    } catch (error) {
      return []
    }
  }

  /** Method for getting questionsAnswers
   */
  async getQuestionsAnswers() {
    try {
      const result = await makeRequest(
        'GET',
        'https://www.senate.gov.pk/en/getdata/questions_json.php',
        {},
        true,
      )
      console.log("result----->", result)
      this.winston.info(`get questions response fetched successfully`)
      return result.map((record) => {
        record.question_filepath = record.question_filepath
          ? `https://senate.gov.pk/uploads/documents/questions/${record.question_filepath}`
          : record.question_filepath
        return record
      })
    } catch (error) {
      return []
    }
  }

  /** Method for getting Session Agenda
   */
  async getSessionAgenda() {
    //todo: get questionsAnswers
    const name = 'Azam Nazaeer Tarar'
    return [
      {
        question: 'Discussion on Education policy',
        name,
        date: '2022-08-15',
      },
      {
        question: 'Discussion on Health policies',
        name,
        date: '2022-05-26',
      },
      {
        question: 'Discussion on Finance policy',
        name,
        date: '2022-05-20',
      },
      {
        question: 'Discussion on Infrastructure policy',
        name,
        date: '2022-05-20',
      },
    ]
  }
  // /** Method for creating new Speech on demand
  //  * @param  {} userId
  //  * @param  {} payload
  //  */
  // async addSpeechOnDemand(userId, body) {
  //   const insertPayload = {
  //     senator_id: userId,
  //     session_no: body.session_no,
  //     date_to: new Date(body.date_to),
  //     date_from: new Date(body.date_from),
  //     justification: body.justification,
  //     delivery_on: body.delivery_on,
  //     is_certified: body.is_certified,
  //     whatsapp_number: body.whatsapp_number,
  //   }
  //   const result = await this.db.execute(
  //     senatorQueries.INSERT_SENATOR_SPEECH_DEMAND,
  //     [insertPayload],
  //   )
  //   return { id: result.insertId, ...insertPayload }
  // }
  /** Method for getting order of the day
   */
  async getOrderOfDay() {
    try {
      const result = await makeRequest(
        'GET',
        'https://www.senate.gov.pk/en/getdata/order_of_day_json.php',
        {},
        true,
      )
      this.winston.info(`get order of the day response fetched successfully`)
      return result.map((record) => {
        record.proceeding_file = record.proceeding_file
          ? `https://senate.gov.pk/uploads/documents/${record.proceeding_file}`
          : record.proceeding_file
        return record
      })
    } catch (error) {
      return []
    }
  }
  // /** Method for getting speech on demand
  //  */
  // async getSpeechOnDemand(senatorId) {
  //   return this.db.execute(senatorQueries.GET_SENATOR_SPEECH_DEMAND, [
  //     senatorId,
  //   ])
  // }


 /** Method for getting senate publications
   */
 async getSenatePublications() {
  try {
    const result = await makeRequest(
      'GET',
      `https://www.senate.gov.pk/en/getdata/publication_json.php`,
      {},
      true,
    )
    this.winston.info(`get publication response fetched successfully`)
    return result.map((record) => {
      record.image = record.image
        ? `https://senate.gov.pk/uploads/documents/${record.image}`
        : record.image
      record.file_name_pdf_en = record.file_name_pdf_en
        ? `https://senate.gov.pk/uploads/documents/${record.file_name_pdf_en}`
        : record.file_name_pdf_en
      return record
    })
  } catch (error) {
    return []
  }
}

  /** Method for getting senate press release
   */
  async getSenatePressRelease(memberId) {
    try {
      const result = await makeRequest(
        'GET',
        `https://www.senate.gov.pk/en/getdata/ownpressreleases_json.php?memberId=${memberId}`,
        {},
        true,
      )
     // console.log("result---------", result)
      // logger.info(
      //   `get own press release_json response fetched successfully`,
      // )
      return result.map((record) => {
        record.picture = record.picture
          ? `https://senate.gov.pk/uploads/images/news_pic/${record.picture}`
          : record.image
        return record
      })
    } catch (error) {
      return []
    }
  }

  /** Method for getting parliamentary friendship groups by memberId
    *@param  {} memberId

   */
  async getParliamentaryFriendshipByMember(memberId) {
    try {
      const result = await makeRequest(
        'GET',
        `https://www.senate.gov.pk/en/getdata/friendship_json.php?memberId=${memberId}`,
        {},
        true,
      )
      this.winston.info(
        `get parliamentary friendship by memberId ${memberId} response fetched successfully`,
      )
      return result
    } catch (error) {
      return []
    }
  }

  /** Method for getting parliamentary friendship groups
   */
  async getParliamentaryFriendship() {
    try {
      const result = await makeRequest(
        'GET',
        `https://www.senate.gov.pk/en/getdata/friendship_gp_json.php`,
        {},
        true,
      )
      this.winston.info(`get parliamentary friendship fetched successfully`)
      return result
    } catch (error) {
      return []
    }
  }

  /** Method for getting parliamentary friendship groups
   */
  async getMembersByCountryId(countryId) {
    try {
      const result = await makeRequest(
        'GET',
        `https://www.senate.gov.pk/en/getdata/friendship_gp_memberlist_json.php?countryId=${countryId}`,
        {},
        true,
      )
      this.winston.info(
        `get all members fetched by countryId ${countryId} successfully`,
      )
      return result.map((record) => {
        record.pic = record.pic
          ? `https://www.senate.gov.pk/uploads/images/${record.pic}`
          : record.pic
        return record
      })
    } catch (error) {
      return []
    }
  }
}

module.exports = SenatorAppService
