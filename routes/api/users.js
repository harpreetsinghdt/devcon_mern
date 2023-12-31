const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check , validationResult } = require("express-validator")
const User = require('../../models/User');

// @route GET api/users
// @desc Get all users
// @access  Public
router.get('/', async (req, res)=>{
	try {
		const users = await User.find().sort({date: -1});
		res.json(users);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
});

// @route POST api/users
// @desc Register User
// @access Public
router.post('/', 
	[
		check('name','Name is required!').notEmpty().escape(), 
		check('email','Please include a valid email!').isEmail().escape(),
		check('password',"Please enter password of specified length!").isLength({'min':6})
	], 
	async (req, res)=>{
		const errors = validationResult(req);
		console.log(errors);
		if(!errors.isEmpty()){
			return res.status(400).json({ errors: errors.array() })
		}

		const {name, email, password} = req.body;
		try{
			// See if the user exists
			let user = await User.findOne({email});
			if(user){
				return res.status(400).json({ errors: [{ msg: "User already exists!"}] });
			}
			
			// Get users gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm'
			})

			user = new User({
				name,
				email,
				avatar,
				password
			})

			//Encrypt password
			const salt = await bcrypt.genSalt(10);

			user.password = await bcrypt.hash(password, salt);

			await user.save();		
		
			//Return jsonwebtoken
			const payload = {
				user:{
					id: user.id
				}
			}

			jwt.sign(
				payload, 
				config.get('jwtSecret'),
				{ expiresIn: 3600000 },
				(err, token) => {
					if(err) throw err;
					res.json({token});
				}
			);

			// res.send('User registered');

		}catch(err){
			console.error(err.message);
			res.status(500).send("Server error");
		}

		// res.send('User Route');
	}
);

module.exports = router;
