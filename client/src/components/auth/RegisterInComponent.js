import React, { Fragment, useState } from 'react';
import axios from 'axios';

const Register = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		password2: ''
	});

	const { name, email, password, password2 } = formData;

	const makeChange = e => setFormData({...formData, [e.target.name]: e.target.value});

	const makeSubmit = async e =>{
		e.preventDefault();
		if(password!==password2){
			console.log('Password do not match!');
		}else{
			console.log(formData);

			const newUser = {
				name,
				email,
				password
			}

			try {
				const config = {
					headers:{
						'Content-Type':'application/json'
					}
				}
				const body = JSON.stringify(newUser);
				const res = await axios.post('/api/users', body, config);
				console.log(res.data);
			} catch (err) {
				console.log(err.response.data)
			}
		}
	}

	return (
		<Fragment>
			<section className="container">
				<h1 className="large text-primary">Sign Up</h1>
				<p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
				<form className="form" onSubmit={e=>makeSubmit(e)}>
					<div className="form-group">
						<input type="text" placeholder="Name" name="name" value={name} onChange={e=>makeChange(e)} required />
					</div>
					<div className="form-group">
						<input type="email" placeholder="Email Address" name="email" onChange={e=>makeChange(e)}/>
						<small className="form-text"
							>This site uses Gravatar so if you want a profile image, use a
							Gravatar email</small
						>
					</div>
					<div className="form-group">
						<input
							type="password"
							placeholder="Password"
							name="password"
							minLength="6" 
							onChange={e=>makeChange(e)}
						/>
					</div>
					<div className="form-group">
						<input
							type="password"
							placeholder="Confirm Password"
							name="password2"
							minLength="6" 
							onChange={e=>makeChange(e)}
						/>
					</div>
					<input type="submit" className="btn btn-primary" value="Register" />
				</form>
				<p className="my-1">
					Already have an account? <a href="login.html">Sign In</a>
				</p>
			</section>
		</Fragment>
	)
}

export default Register