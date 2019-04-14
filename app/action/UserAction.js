const _ = require("lodash");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

class UserAction {
  static generateJWT(username, email, id) {
    return jwt.sign({ username, email, id }, "asad", {
      expiresIn: "1h"
    });
  }

  static async create(req, res) {
    let { username, email, password } = req.body;

    password = CryptoJS.AES.encrypt(
      password,
      process.env.APP_KEY_SECRET
    ).toString();

    let query = `INSERT INTO users(username, email, password) VALUES("${username}","${email}","${password}")`;
    db.query(query, (err, result) => {
      if (err) {
        return res.send({
          condition: 0,
          message: "db error insert new user"
        });
      }
      return res.send({
        condition: 1,
        data: {
          id: result.insertId,
          username,
          email
        },
        token: UserAction.generateJWT(username, email, result.insertId)
      });
    });
  }

  static async login(req, res) {
    const { email, password } = req.body;
    if (email === "" || email === undefined) {
      return res.send({
        condition: 0,
        message: "Users validation failed: email: Path `email` is required."
      });
    }
    if (password === "" || password === undefined) {
      return res.send({
        condition: 0,
        message:
          "Users validation failed: password: Path `password` is required."
      });
    }

    let query = `SELECT * FROM users WHERE email="${email}"`;
    db.query(query, (err, result) => {
      if (err) console.log(err);

      if (result.length === 0)
        return res.send({ status: 0, messaeg: "user not found" });

      const decry = CryptoJS.AES.decrypt(
        result[0].password,
        process.env.APP_KEY_SECRET
      ).toString(CryptoJS.enc.Utf8);

      if (decry !== password) {
        return res.send({
          status: 0,
          message: "Wrong Password"
        });
      }

      return res.send({
        data: result[0],
        token: UserAction.generateJWT(result[0].username, email, result[0].id)
      });
    });
  }
}

module.exports = UserAction;
