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
        const {to_username, body} = req.body;
        const username = req.user.username; 
        const message = await Message.create({from_username: username, to_username:to_username, body:body});
        if (!message){
            throw new ExpressError("Bad request", 400);
        }
        return res.json({message});
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
router.post("/:id/read", ensureLoggedIn, async (req, res, next)=>{
    try {
        const {id} = req.body;
        const message = await Message.get(id);
        if (!message){
            throw ExpressError("Bad request", 400);
        }
        if (message.to_user.username !== req.user.username){
            throw new ExpressError("Only receipents of the message can mark read", 400);
        }
        
        return res.json({message: await Message.markRead(id)});

    } catch (err) {
        return next(err);
    }
})


module.exports = router;