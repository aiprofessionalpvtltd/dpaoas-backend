const jwt = require('jsonwebtoken')
const db = require("../models");
const Users = db.users;
require('dotenv').config();

module.exports = (req,res,next)=>
{
    const {authorization }= req.headers;
    //console.log(authorization);
     
    if(!authorization)
    {
        return res.status(401).send({
            error: "Invalid"
        });
    }
    const token = authorization.replace("Bearer ","");
    jwt.verify(token,process.env.JWT_SECRET, (err,payload)=>
    {
        if(err)
        {
           return res.status(401).json({error: "Invalid Token" +token});
        }

        const { _id } = payload;
       // Use Sequelize to find the user by ID
         Users.findByPk(_id).then((userData) => {
        if (!userData) {
          return res.status(401).json({ error: 'User not found' });
        }
  
        req.user = userData;
        next();
      });
    })
    //next();
}