// const userQueries = require('../queries/user.queries')
// const attendeeQueries = require('../queries/attendee.queries')
// const senatorQueries = require('../queries/senator.queries')
// const publicUserQueries = require('../queries/public-user.queries')
const bcrypt = require('bcryptjs')
// const AttendeeService = require('./attendee.service')
// const EventAttendeeService = require('./event-attendee.service')
// const PublicUserService = require('./public-user.service')
// const SenatorService = require('./senator.service')
const { makeRequest } = require('../helper/makeRequest')
const invalidPasswordMessage = 'Invalid password'
const { sendEmail } = require('../helper/send-email')
const { sendMessage } = require('../helper/send-message')
const emailNotFound = 'Email not found'
const { Op } = require('sequelize');
const db = require("../models");
const PublicUsers = db.publicUsers;
const {
  generateOnetimeToken,
  verifyOnetimeToken,
  generateSecret,
} = require('../helper/one-time-password')
const logger = require('../common/winston');
class AuthService {
  constructor(db, winston) {
    this.db = db
    this.winston = winston
  }

  /** Method for login username and password
   * @param  {} username
   * @param  {} password
   */
  async login(username, userPassword) {
    const [user] = await this.db.execute(userQueries.GET_USER_BY_EMAIL, [
      username,
    ])
    if (!user) {
      throw new Error('User not found')
    }
    const passwordIsValid = bcrypt.compareSync(userPassword, user.password)
    if (!passwordIsValid) {
      throw new Error(invalidPasswordMessage)
    }
    delete user.password

    return user
  }

  /** Method for signup
   * @param  {} body
   */
  async signup(body) {
    const { password, ...payload } = body
    const user = await this.db.execute(userQueries.GET_USER_BY_EMAIL, [
      body.email,
    ])
    if (user && user.length > 0) {
      throw new Error('user already exist')
    }
    const hashPassword = bcrypt.hashSync(password, 10)
    payload.password = hashPassword

    const result = await this.db.execute(userQueries.INSERT_USER, [payload])
    delete payload.password
    const userId = result.insertId
    const newUser = {
      id: userId,
      ...payload,
    }
    this.winston.info(`user signUp successfully ${userId}`)

    return newUser
  }

  /** Method for attendee login username and password
   * @param  {} username
   * @param  {} password
   */
  async attendeeLogin(username, userPassword) {
    const [attendee] = await this.db.execute(
      attendeeQueries.GET_ATTENDEE_BY_EMAIL,
      [username],
    )
    if (!attendee) {
      throw new Error('Attendee not found')
    }
    const passwordIsValid = bcrypt.compareSync(userPassword, attendee.password)
    if (!passwordIsValid) {
      throw new Error(invalidPasswordMessage)
    }
    delete attendee.password

    return attendee
  }

  /** Method for attendee signup
   * @param  {} body
   */
  async attendeeSignup(body) {
    const { password, event_id, ...payload } = body
    const attendee = await this.db.execute(
      attendeeQueries.GET_ATTENDEE_BY_EMAIL,
      [body.email],
    )
    if (attendee && attendee.length > 0) {
      try {
        await new EventAttendeeService(
          this.db,
          this.winston,
        ).createEventAttendee(event_id, attendee[0].id, { is_approved: false })
      } catch (error) {
        throw new Error('Attendee already registered for event')
      }

      return {
        event_id,
        ...attendee[0],
      }
    }
    const hashPassword = bcrypt.hashSync(password, 10)
    payload.password = hashPassword

    const result = await new AttendeeService(
      this.db,
      this.winston,
    ).createAttendee(event_id, payload)
    delete payload.password
    const userId = result.insertId
    const newAttendee = {
      id: userId,
      ...payload,
    }
    this.winston.info(`Attendee signUp successfully ${userId}`)
    return newAttendee
  }

  /** Method for senator login username and password
   * @param  {} email
   * @param  {} password
   */
  async senatorLogin(email, userPassword) {
    try {
      const payload = {
        Email: email,
        Password: userPassword,
      }
      console.log("payload--->", payload);
      const userRecord = await makeRequest(
        'POST',
        'api/members',
        {
          data: payload,
        },
      )
      logger.info(
        `senatorLogin: userRecord ${JSON.stringify(userRecord)}`,
      )

      // const profileResult = await this.getUserProfile(userRecord.websiteId)
      // userRecord.profile_picture = profileResult
      // const token = this.helperSendOTP(email, userRecord.contactNo)
      // return { userRecord, ...token }
      return this.helperSendOTP(email, userRecord.contactNo)
    } catch (error) {
      logger.error(
        `senatorLogin: Error occurred on senator Login ${error}`,
      )
      const [user] = await this.db.execute(
        senatorQueries.GET_SENATOR_BY_EMAIL,
        [email, email],
      )
      if (!user) {
        const error = new Error('Senator not found')
        error.code = 404
        throw error
      }
      const passwordIsValid = bcrypt.compareSync(userPassword, user.password)
      if (!passwordIsValid) {
        throw new Error(invalidPasswordMessage)
      }
      return this.helperSendOTP(email, user.phone)
      // user.memberId = user.id
      // user.memberName = user.first_name + ' ' + user.last_name
      // user.phoneNo = user.phone
      // user.imageUrl = user.profile_picture
      // user.websiteId = user.website_id
      // delete user.password
      // const token = this.helperSendOTP(email, user.phone)
      // return { user, ...token }
    }
  }

  /** Method for senator verify Email
   * @param  {} body
   */
  async verifySenator(body) {
    return this.sendOTP(body)
  }

  /** Method for public user verify
   * @param  {} body
   */
  async verifyPublicUser(body) {
    const { email, phone } = body
    // const publicUser = await this.db.execute(
    //   publicUserQueries.VERIFY_PUBLIC_USER_BY_EMAIL_AND_PHONE,
    //   [email, email, phone],
    // )
    const publicUser = await PublicUsers.findOne({ 
      where: { 
        [Op.and]: [{ email }, { phone }] 
      } 
    });
    if (
      publicUser 
      // && publicUser.length > 0
      // && publicUser[0].is_email_verify &&
      // publicUser[0].is_phone_verify
    ) {
      
      const error = new Error('You are already registered please login')
      error.code = 409
      throw error
    }else{
      return this.helperSendOTP(email, phone)
    }
    
  }

  /** Method for public User Forgot Password
   * @param  {} body
   */
  async publicUserForgotPassword(body) {
    const { email } = body
    // const publicUser = await this.db.execute(
    //   publicUserQueries.GET_PUBLIC_USER_BY_EMAIL,
    //   [email, email],
    // )
    const publicUser = await PublicUsers.findOne({ where: { email } });
    if (publicUser && publicUser.length === 0) {
      const error = new Error(emailNotFound)
      error.code = 404
      throw error
    }
    const secret = generateSecret()
    const token = generateOnetimeToken(secret)
    this.winston.info(`publicUserForgotPassword token ${token}`)
    this.winston.info(`publicUserForgotPassword emailSecretKey ${secret}`)
    sendEmail('ForgotPassword', { code: token }, email)
    return { emailSecretKey: secret }
  }

  /** Method for send OTP
   * @param  {} body
   */
  async sendOTP(body) {
    const { email } = body
    const payload = {
      Email: email,
    }
    try {
      const verifyEmail = await makeRequest(
        'POST',
        'validatemail',
        {
          data: payload,
        },
      )

      return this.helperSendOTP(email, verifyEmail.regContact)
    } catch (error) {
      logger.error(
        `OTP validate Email: Error occurred on validatemail ${error}`,
      )
      const [user] = await this.db.execute(
        senatorQueries.GET_SENATOR_BY_EMAIL,
        [email, email],
      )
      if (!user) {
        const error = new Error('Kindly enter official email')
        error.code = 404
        throw error
      }
      return this.helperSendOTP(email, user.phone)
    }
  }

  /** Method for public User Forgot Password
   * @param  {} body
   */
  async senatorForgotPassword(body) {
    const { email } = body
    // const senator = await this.db.execute(senatorQueries.GET_SENATOR_BY_EMAIL, [
    //   email,
    //   email,
    // ])
    // if (senator && senator.length === 0) {
    //   const error = new Error(emailNotFound)
    //   error.code = 404
    //   throw error
    // }
    const secret = generateSecret()
    const token = generateOnetimeToken(secret)
    logger.info(`senatorForgotPassword token ${token}`)
    logger.info(`senatorForgotPassword emailSecretKey ${secret}`)
    sendEmail('ForgotPassword', { code: token }, email)
    return { emailSecretKey: secret }
  }

  /** Method for senator signup
   * @param  {} body
   */
  async senatorSignup(body) {
    //todo: send api right now for temporary base

    const { password, ...payload } = body
    const { email } = body
    const senator = await this.db.execute(senatorQueries.GET_SENATOR_BY_EMAIL, [
      email,
      email,
    ])
    if (senator && senator.length > 0) {
      throw new Error('senator already registered for event')
    }

    const hashPassword = bcrypt.hashSync(password, 10)
    payload.password = hashPassword
    payload.is_email_verify = 1
    payload.is_phone_verify = 1
    const result = await new SenatorService(
      this.db,
      this.winston,
    ).createSenator(payload)
    delete payload.password
    const senatorId = result.insertId
    const newSenator = {
      id: senatorId,
      ...payload,
    }
    this.winston.info(`Senator signUp successfully ${senatorId}`)
    return newSenator
  }

  /** Method for public user signup
   * @param  {} body
   */
  async publicUserSignup(body) {
    const { password, ...payload } = body
    const { email } = body

    

    try {
      const publicUser = await PublicUsers.findOne({ where: { email } });
      if (publicUser) {
        throw new Error('public User already registered');
      }
  

      const hashPassword = bcrypt.hashSync(password, 10);
      payload.password = hashPassword;
      payload.is_email_verify = 1;
      payload.is_phone_verify = 1;

      
      const newUser = await PublicUsers.create(payload);
      delete payload.password;

      
      logger.info(`Public User signUp successfully ${newUser.id}`);
      
      return newUser;
    } catch (error) {
      throw error;
    }

    // const publicUser = await this.db.execute(
    //   publicUserQueries.GET_PUBLIC_USER_BY_EMAIL,
    //   [email, email],
    // )
    // if (publicUser && publicUser.length > 0) {
    //   throw new Error('public User already registered')
    // }

    // const hashPassword = bcrypt.hashSync(password, 10)
    // payload.password = hashPassword
    // payload.is_email_verify = 1
    // payload.is_phone_verify = 1
    // const result = await new PublicUserService(
    //   this.db,
    //   this.winston,
    // ).createPublicUser(payload)
    // delete payload.password
    // const publicUserId = result.insertId
    // const newPublicUser = {
    //   id: publicUserId,
    //   ...payload,
    // }
    // this.winston.info(`Public User signUp successfully ${publicUserId}`)
    // return newPublicUser
  }

  /** Method for public User login username and password
   * @param  {} email
   * @param  {} password
   */
  async publicUserLogin(email, userPassword) {
    // const [publicUser] = await this.db.execute(
    //   publicUserQueries.GET_PUBLIC_USER_BY_EMAIL,
    //   [email, email],
    // )
    const publicUser = await PublicUsers.findOne({ where: { email } });
    if (!publicUser) {
      const error = new Error('Public User not found')
      error.code = 404
      throw error
    }
    const passwordIsValid = bcrypt.compareSync(
      userPassword,
      publicUser.password,
    )
    if (!passwordIsValid) {
      throw new Error(invalidPasswordMessage)
    }
    delete publicUser.password
    return publicUser
  }

  /** Method for verify Token with secret
   * @param  {} emailToken
   * @param  {} emailSecret
   * @param  {} phoneToken
   * @param  {} phoneSecret
   */
  async verifyToken(
    emailToken,
    emailSecret,
    phoneToken,
    phoneSecret,
    action,
    payload,
  ) {
    logger.info(`verifyToken method executing`)
    const result = {}
    const verifyCode = {}

    if (!emailToken) {
      throw new Error('Email OTP cannot be empty');
    }
    if (emailToken) {
      const verify = verifyOnetimeToken(emailToken, emailSecret);
      logger.info(`emailToken ${emailToken} verifyToken: ${verify}`);
     
      if (verify) {
        result.message = 'Email Verified';
        result.emailVerify = true;
        verifyCode.emailVerify = result.emailVerify;
      } else {
        throw new Error('Email OTP is not valid');
      }
    } else {
      throw new Error('Email OTP is empty');
    }

   
    if (phoneToken) {
      const verify = verifyOnetimeToken(phoneToken, phoneSecret);
      logger.info(`phoneToken ${phoneToken} verifyToken: ${verify}`);
      console.log("verifyToken of phone-----------------", verify);
      if (verify) {
        result.message = result.message
          ? 'Email and Phone both verified'
          : 'Phone Verified';
        result.phoneVerify = true;
        verifyCode.phoneVerify = result.phoneVerify;
      } else {
        throw new Error('Phone OTP is not valid');
      }
    }

    
    if (verifyCode.emailVerify || verifyCode.phoneVerify) {
      if (action === 'senator_login') {
        const senatorResult = await this.getSenatorData(payload)
        result.senator = senatorResult
      }
    }

    return result
  }

  helperSendOTP(email, phone) {
    const data = {}
    if (email) {
      const emailSecretKey = generateSecret()
      const emailToken = generateOnetimeToken(emailSecretKey)
      logger.info(`emailToken ${emailToken}`)
      logger.info(`emailSecretKey ${emailSecretKey}`)
      sendEmail('VerifyEmail', { code: emailToken }, email)
      data.emailSecretKey = emailSecretKey
    }
    if (phone) {
      const phoneSecretKey = generateSecret()
      const phoneToken = generateOnetimeToken(phoneSecretKey)
      logger.info(`phoneToken ${phoneToken}`)
      logger.info(`phoneSecretKey ${phoneSecretKey}`)
      const message = `Use ${phoneToken} code to verify your account, valid for 5 minutes. Don't share the code with anyone`
      sendMessage(phone, message)
      data.phoneSecretKey = phoneSecretKey
    }
    return data
  }

  async getUserProfile(websiteId) {
    if (!websiteId) return null
    try {
      console.log('Getting user profile------->', websiteId)
      const userProfile = await makeRequest(
        'GET',
        `https://senate.gov.pk/en/getdata/memberpic_json.php?memberId=${websiteId}`,
        {},
        true,
      )
      this.winston.info(
        `senatorLogin: userProfile ${JSON.stringify(userProfile)}`,
      )
      if (userProfile && userProfile.length > 0 && userProfile[0].member_pic)
        return `https://www.senate.gov.pk/uploads/images/${userProfile[0].member_pic}`
    } catch (error) {
      this.winston.error(
        `senatorLogin: Error occurred on memberpic_json ${error}`,
      )
      return null
    }
  }
  async getSenatorData(payload) {
    const { email, password } = payload
    try {
      
      const userRecord = await makeRequest(
        'POST',
        'api/members',
        {
          data: {
            Email: email,
            Password: password,
          },
        },
      )
      logger.info(
        `senatorLogin: userRecord ${JSON.stringify(userRecord)}`,
      )
      if (!userRecord) throw new Error('Senator not found')
      const profileResult = await this.getUserProfile(userRecord.websiteId)
      userRecord.profile_picture = profileResult
      // const [isUserExist] = await this.db.execute(
      //   senatorQueries.GET_SENATOR_BY_ID,
      //   [userRecord.memberId],
      // )
      // if (!isUserExist) {
      //   const newSenatorPayload = {
      //     id: userRecord?.memberId,
      //     first_name: userRecord?.memberName.split(' ').slice(0, -1).join(' '),
      //     last_name: userRecord?.memberName.split(' ').slice(-1).join(' '),
      //     is_email_verify: 1,
      //     is_phone_verify: 1,
      //     is_active: 1,
      //     password,
      //     email,
      //     website_id: userRecord?.websiteId,
      //     profile_picture: userRecord?.profile_picture,
      //     phone: userRecord?.contactNo,
      //   }
      //   await this.db.execute(senatorQueries.INSERT_SENATOR, [
      //     newSenatorPayload,
      //   ])
      // }
      userRecord.id = userRecord?.id || userRecord?.memberId
      return userRecord
    } catch (error) {
      logger.info(`Error occurred while getSenatorData ${error}`)
      throw error
    }
  }
}

module.exports = AuthService
