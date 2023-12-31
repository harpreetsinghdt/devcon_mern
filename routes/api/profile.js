const express = require('express');
const request = require("request");
const router = express.Router();
const config = require('config');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
// const User = require('../../models/User');
const Post = require('../../models/Post');
const { check, validationResult } = require('express-validator');

// @route GET api/profile/me
// @desc Get current users profile 
// @access Private
router.get('/me', auth, async (req, res)=>{
	try{
		const profile = await Profile.findOne({ user: req.user.id}).populate('user', ['name', 'email','avatar']);
		if(!profile){
			return res.status(400).json({msg: 'There is no profile for this user'});
		}
		res.json(profile);

	}catch(err){
		console.error(err.message);
		res.status(500).send("Server Error");
	}
});

// @route POST api/profile
// @desc Create or update users profile 
// @access Private
router.post('/',
	[auth,
		[
			check('status', 'Status is required').not().isEmpty(),
			check('skills', 'Skills is required').not().isEmpty(),
		]
	],
	async (req, res)=>{
		const errors = validationResult(req);
		if(!errors.isEmpty()){
			return res.status(400).json({errors: errors.array()});
		}
		
		// destructure the request
    const {
      location,
      company,
      website,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      bio,
      status,
      githubusername,
      indeed,
      gender,
      // spread the rest of the fields we don't need to check
      ...rest
    } = req.body;
		
		// Build profile object
		const profileFields = {};
		profileFields.user = req.user.id;
		if(company) profileFields.company = company;
		if(website) profileFields.website = website;
		if(location) profileFields.location = location;
		if(bio) profileFields.bio = bio;
		if(gender) profileFields.gender = gender;
		if(status) profileFields.status = status;
		if(githubusername) profileFields.githubusername = githubusername;
		if(skills){
			profileFields.skills = skills.split(',').map(skill => skill.trim());
		}
		// console.log(skills.split(','));

		// Build social object
		profileFields.social = {};
		if(youtube) profileFields.social.youtube = youtube;
		if(twitter) profileFields.social.twitter = twitter;
		if(instagram) profileFields.social.instagram = instagram;
		if(linkedin) profileFields.social.linkedin = linkedin;
		if(facebook) profileFields.social.facebook = facebook;
		if(indeed) profileFields.social.indeed = indeed;
		console.log(profileFields);
		try{
			let profile = await Profile.findOne({ user: req.user.id});
			if(profile){
				// Update
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id},
					{ $set: profileFields },
					{ new: true }
				);
				console.log(profile);
				return res.json(profile);
			}

			// Create
			profile = new Profile(profileFields)
			await profile.save();
			res.json(profile);

		}catch(err){
			console.error(err.message);
			res.status(500).send("Server Error occured!");
		}
	}	
);

// @route GET api/profile
// @desc Get all profiles
// @access Public
router.get('/', async (req, res) => {
	try{
		const profiles = await Profile.find().populate('user', ['name', 'email', 'avatar']);
		res.send(profiles);
	}catch(err){
		console.error(err.message);
		res.status(500).send("Server Error!");
	}
});

// @route GET api/profile/user/:user_id
// @desc Get all profile by user id
// @access Public
router.get('/user/:user_id', async (req, res) => {
	try{
		const profile = await Profile.findOne({ user: req.params.user_id}).populate('user', ['name', 'email','avatar']);
		if(!profile){
			return res.status(400).send({ msg: "User profile not found!"});
		}
		res.send(profile);
	}catch(err){
		// console.log(err.message);
		if(err.kind ==  'ObjectId'){
			return res.status(400).send({ msg: "User profile not found!"});
		}
		res.status(500).send("Server Error!");
	}
});

// @route DELETE api/profile
// @desc Delete profile, user & posts
// @access Private
router.delete('/', auth, async (req, res) => {
	try{
		// Remove users posts
		await Post.deleteMany({ user: req.user.id});

		// Remove profile
		await Profile.findOneAndRemove({ user: req.user.id});

		// Remove user
		await User.findOneAndRemove({ _id: req.user.id });
		res.send({msg:"User deleted!"});
	}catch(err){
		console.error(err.message);
		res.status(500).send("Server Error!");
	}
});

// @route PUT api/profile/experience
// @desc 	Add profile experience
// @access Private
router.put('/experience', [ auth, [
		check('title', 'Title is required').not().isEmpty(),
		check('company', 'Company is required').not().isEmpty(),
		check('from', 'From date is required').not().isEmpty()
	]
], async (req, res) => {
	
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(400).json({ errors: errors.array()});
	}
// return console.log(req.body);
	const {
		title,
		company,
		location,
		from,
		to,
		current,
		description 
	} = req.body;
	
	const newExp = {
		title,
		company,
		location,
		from,
		to,
		current,
		description
	}

	try{
		const profile = await Profile.findOne({user:req.user.id});

		profile.experience.unshift(newExp);
		
		await profile.save();

		res.send(profile);

	}catch(err){
		console.error(err.message);
		res.status(500).send("Server Error!");
	}
});

// @route DELETE api/profile/experience/:exp_id
// @desc Delete experience from profile
// @access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try{
		const profile = await Profile.findOne({ user: req.user.id});
		
		// Get remove index
		const removeIndex = profile.experience.map(item=>item.id).indexOf(req.params.exp_id);
		// console.log(removeIndex);
		if(removeIndex>=0){
			profile.experience.splice(removeIndex, 1);
			await profile.save();
		}

		res.send(profile);
	}catch(err){
		console.error(err.message);
		res.status(500).send("Server Error!");
	}
});


// @route PUT api/profile/education
// @desc 	Add profile education
// @access Private
router.put('/education', [ auth, [
		check('school', 'School is required').not().isEmpty(),
		check('degree', 'Degree is required').not().isEmpty(),
		check('fieldofstudy', 'fieldofstudy date is required').not().isEmpty()
	]
], async (req, res) => {
	
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(400).json({ errors: errors.array()});
	}
// return console.log(req.body);
	const {
		school,
		degree,
		fieldofstudy,
		from,
		to,
		current,
		description 
	} = req.body;
	
	const newEdu = {
		school,
		degree,
		fieldofstudy,
		from,
		to,
		current,
		description
	}

	try{
		const profile = await Profile.findOne({user:req.user.id});

		profile.education.unshift(newEdu);
		
		await profile.save();

		res.send(profile);

	}catch(err){
		console.error(err.message);
		res.status(500).send("Server Error!");
	}
});

// @route DELETE api/profile/education/:edu_id
// @desc Delete education from profile
// @access Private
router.delete('/education/:edu_id', auth, async (req, res) => {
	try{
		const profile = await Profile.findOne({ user: req.user.id});
		
		// Get remove index
		const removeIndex = profile.education.map(item=>item.id).indexOf(req.params.edu_id);
		// console.log(removeIndex);
		if(removeIndex>=0){
			profile.education.splice(removeIndex, 1);
			await profile.save();
		}

		res.send(profile);
	}catch(err){
		console.error(err.message);
		res.status(500).send("Server Error!");
	}
});

// @route GET api/profile/github/:username
// @desc Get user repo from github
// @access Public
router.get("/github/:username",(req, res)=>{
	try{
		const options = {
			uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
			method: "GET",
			headers: {'user-agent': 'node.js'}
		};
		request(options, (error, response, body) => {
			if(error) console.error(error);
			
			if(response.statusCode !== 200){
				res.status(404).json({msg: 'No Github profile found!'});
			}

			res.json(JSON.parse(body));
		});

	}catch(err){
		console.log(err.message);
		res.status(500).send("Server Error!");
	}
});

module.exports = router;