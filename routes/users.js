const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError");
const { ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/user");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", async (req, res, next)=>{
    try {
        const users = await User.all();
        return res.json({users});
    } catch (err) {
        return next(err);
    }
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async (req, res, next)=>{
    try {
        const {username} = req.params;
        const user = await User.get(username);
        if (!user){
            throw new ExpressError("user not found", 404);
        }else{
            return res.json({user});
        }
    } catch (err) {
        return next(err);
    }
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureCorrectUser, async (req, res, next)=>{
    try {
        const {username} = req.query;
        const user = await User.get(username);
        if (!user){
            throw new ExpressError("user not found", 404);
        }else{
            const messages = await User.messagesTo(user.username);
            if (!messages || messages.length==0){
                throw new ExpressError("no messages found", 404);
            }
            return res.json({messages});
        }
    } catch (err) {
        return next(err);
    }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", ensureCorrectUser, async (req, res, next)=>{
    try {
        const {username} = req.query;
        const user = await User.get(username);
        if (!user){
            throw new ExpressError("user not found", 404);
        }else{
            const messages = await User.messagesFrom(user.username);
            if (!messages || messages.length==0){
                throw new ExpressError("no messages found", 404);
            }
            return res.json({messages});
        }
    } catch (err) {
        return next(err);
    }
})

module.exports = router;
