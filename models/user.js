/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");
const ExpressError = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    if (!username || !password || !first_name || !last_name || !phone){
      throw new ExpressError("All fields are required!", 400);
    }
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const currentTime = new Date();
    const result = await db.query(`
      INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING username, password, first_name, last_name, phone`
      , [username, hashedPassword, first_name, last_name, phone, currentTime, currentTime]);
    
    const user = result.rows[0];
    return user;
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    if (!username || !password){
      throw new ExpressError("All fields are required!", 400);
    }
    const result = await db.query(`
      SELECT username, password FROM users
      WHERE username = $1
    `, [username])
    const user = result.rows[0];
    if (!user){
      return false;
    }
    if ((await bcrypt.compare(password, user.password))===true){
      return true;
    }else{
      return false;
    };
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
      const user = result.rows[0];
      if (!user){
        throw new ExpressError("username is not found", 404);
      }
      //console.log("Last login timestamp is updated!");
      return;
    } catch (err) {
      return err;
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    try {
      const result = await db.query(`
      SELECT username, first_name, last_name, phone FROM users`)
      const users = result.rows;
      return  users;
    } catch (err) {
      return err;
    }
   
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    try {
      const result = await db.query(`
      SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users
      WHERE username = $1`,
      [username]);
      const user = result.rows[0];
      if (!user){
        throw new ExpressError("username is not found", 404);
      }
      return user;
    } catch (err) {
      return  err;
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    try {
      const result = await db.query(`
        SELECT m.id, m.to_username as username, u2.first_name, u2.last_name, u2.phone, m.body, m.sent_at, m.read_at FROM messages m
        JOIN users u ON m.from_username = u.username
        JOIN users u2 ON m.to_username = u2.username
        WHERE u.username = $1`,
        [username]);
      const messages = result.rows;
      if (!messages){
        throw new ExpressError("message is not found", 404);
      }
      const output = [];
      for (let message of messages){
        output.push({
          id: message.id, 
          to_user:{username: message.username, first_name: message.first_name, last_name: message.last_name, phone: message.phone},
          body: message.body,
          sent_at: message.sent_at,
          read_at: message.read_at
        })
      }
      return output;
    } catch (err) {
      return err;
    }
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    try {
      const result = await db.query(`
        SELECT m.id, m.from_username as username, u2.first_name, u2.last_name, u2.phone, m.body, m.sent_at, m.read_at FROM messages m
        JOIN users u ON m.to_username = u.username
        JOIN users u2 ON m.from_username = u2.username
        WHERE u.username = $1`,
        [username]);
      const messages = result.rows;
      if (!messages){
        throw new ExpressError("message is not found", 404);
      }
      const output = [];
      for (let message of messages){
        output.push({
          id: message.id, 
          from_user:{username: message.username, first_name: message.first_name, last_name: message.last_name, phone: message.phone},
          body: message.body,
          sent_at: message.sent_at,
          read_at: message.read_at
        })
      }
      return output;
    } catch (err) {
      return err;
    }
   }
}


module.exports = User;