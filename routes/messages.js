const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError");
const Message = require("../models/message");
const User = require("../models/user");
const {ensureCorrectUser, ensureLoggedIn} = require("../middleware/auth");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async (req, res, next)=>{
    try {
        const {id} = req.params;
        const message = await Message.get(id);
        if (message.from_user.username !== req.user.username || message.to_user.username !== req.user.username){
            throw new ExpressError("currently-logged-in users is either the to or from user", 400);
        }else{
            return res.json({message});
        }
    } catch (err) {
        return next(err);
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async (req, res, next)=>{
    try {
        
    } catch (err) {
        return next(err);
    }
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/


module.exports = router;