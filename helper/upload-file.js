const multer = require('multer')
const fs = require('fs')
const path = require('path')

const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const event_id = 1
    const publicDir = `./public`
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir)
    }
    const dir = `./public/events`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    const subDir = `./public/events/${event_id}`
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir)
    }
    cb(null, subDir)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const publicDir = `./public`
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir)
    }
    const dir = `./public/profile-picture`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    let id
    if (req.params.attendeeId) id = req.params.attendeeId
    if (req.user?.id) id = req.user.id
    if (req.body.username) id = req.body.username
    const subDir = `./public/profile-picture/${id}`
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir)
    }
    if (req.params.attendeeId) {
      const attendeeDir = `./public/profile-picture/${id}/attendee`
      if (!fs.existsSync(attendeeDir)) {
        fs.mkdirSync(attendeeDir)
      }
      cb(null, attendeeDir)
    } else if (req.params.senatorId) {
      const senatorDir = `./public/profile-picture/${id}/senator`
      if (!fs.existsSync(senatorDir)) {
        fs.mkdirSync(senatorDir)
      }
      cb(null, senatorDir)
    } else {
      const userDir = `./public/profile-picture/${id}/user`
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir)
      }
      fs.readdirSync(userDir).forEach((file) => {
        console.log(file)
        //TODO: to delete existing profilePicture
        // fs.rm(`${userDir}/${file}`, { recursive: true })
      })
      cb(null, userDir)
    }
  },
  filename: (req, file, cb) => {
    // fs.rm(dir, { recursive: true });
    const firstName = req.user ? req.user.first_name : req.body.first_name
    const lastName = req.user ? req.user.last_name : req.body.last_name
    const fileName = req.params.attendeeId
      ? `${path.basename(file.originalname)}`
      : `${firstName}_${lastName}${path.extname(file.originalname)}`
    cb(null, `${fileName}`)
  },
})

const senatorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const publicDir = `./public`
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir)
    }
    const dir = `./public/senator`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    const subDir = `./public/senator/${req.user.id}`
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir)
    }

    const routeDir = `./public/senator/${req.user.id}${req.url}`
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir)
    }
    cb(null, routeDir)
  },
  filename: (req, file, cb) => {
    // fs.rm(dir, { recursive: true });
    if (file) {
      const fileName = `${path.basename(file.originalname)}`

      cb(null, `${fileName}`)
    } else cb(null, null)
  },
})
const upload = multer({ storage: eventStorage })
const profileUpload = multer({ storage: profileStorage })
const senatorUpload = multer({ storage: senatorStorage })

exports.uploadFile = (name) =>
  name === 'profile'
    ? profileUpload.single('file')
    : name === 'senator'
    ? senatorUpload.single('file')
    : upload.single('file')

exports.uploadMultipleFiles = upload.array('file', 20)
