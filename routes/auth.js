const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, JWT_OPTIONS } = require("../config");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async (req, res, next)=>{
    try {
        const  {username, password} = req.body;
        if (!username || !password){
            return res.status(400).json({msg: "missing fields"});
        }
        if ((await User.authenticate(username, password))===true){
            await User.updateLoginTimestamp(username);
            const payload = {username};
            const token = jwt.sign(payload, SECRET_KEY, JWT_OPTIONS);
            return res.json({token});
        }else{
            return res.status(400).json({msg: "credentials aren't correct!"})
        }
    } catch (err) {
        return next(err);
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

 router.post("/register", async (req, res, next)=>{
     try {
        const {username, password, first_name, last_name, phone} = req.body;
        if (!username || !password || !first_name || !last_name || !phone){
            return res.status(400).json({msg: "all fields are required"});
        }

        const user = await User.register({username: username, password: password, first_name: first_name, last_name: last_name, phone: phone});
        if (!user){
            return res.status(400).json({msg: "registered unsuccessfully"});
        }

        await User.updateLoginTimestamp(user.username);
        const payload = {username};
        const token = jwt.sign(payload, SECRET_KEY, JWT_OPTIONS);
        return res.json({token});
     } catch (err) {
         return next(err);
     }
 })

 module.exports = router;