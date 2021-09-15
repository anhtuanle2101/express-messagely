/** User class for message.ly */
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ExpressError = require("../expressError");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    try {
      if (!username || !password || !first_name || !last_name || !phone){
        throw new ExpressError("All fields are required!", 400);
      }
      const hashedPassword = bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      const currentTime = new Date();

      const result = await db.query(`
        INSERT INTO users (username, password, first_name, last_name, phone, join_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username, password, first_name, last_name, phone)`
        , [username, hashedPassword, first_name, last_name, phone, currentTime]);
      const user = result.rows[0];
      return res.json(user);
    } catch (err) {
      return next(err);
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try {
      if (!username || !password){
        throw  new ExpressError("All fields are required!", 400);
      }
      const result = await db.query(`
        SELECT username, password FROM users
        WHERE username = $1
      `, [username])
      const user = result.rows[0];
      if (!user){
        throw new ExpressError("username is not found", 404);
      }
      if (bcrypt.compare(password, user.password)){
        return true;
      }else{
        return false;
      };
    } catch (err) {
      return next(err);
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    try {
      if (!username){
        throw new ExpressError("All fields are required!", 400);
      }
      const currentTime = new Date();
      const result = await db.query(`UPDATE users
        SET last_login_at = $1
        WHERE username = $2
        RETURNING username`,
        [currentTime, username]);
      const user = result.rows.username;
      if (!user){
        throw new ExpressError("username is not found", 404);
      }
      console.log("Login  Timestamp is updated!");
      return;
    } catch (err) {
      return next(err);
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}


module.exports = User;