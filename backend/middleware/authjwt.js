const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
      return res.redirect(403, '/').send({//status(403).
        message: "No token provided!",
      });
    }
  
    jwt.verify(token, config.secret(), (err) => {if (err) {return res.redirect(401, '/').send({message: "Unauthorized!"})}})
    next()
  };

isAdmin = async (req, res, next) => {
    try {
       if (role == '1') return next()
  
      return res.status(403).send({
        message: "Require Admin Role!",
      });
    } catch (error) {
      return res.status(500).send({
        message: "Unable to validate User role!",
      });
    }
  };

isUser = async (req, res, next) => {
    try {
        if (role == '2') return next()
  
      return res.status(403).send({
        message: "Require Admin Role!",
      });
    } catch (error) {
      return res.status(500).send({
        message: "Unable to validate User role!",
      });
    }
};

const authJwt = {
    verifyToken,
    isAdmin,
    isUser
};
module.exports = authJwt;