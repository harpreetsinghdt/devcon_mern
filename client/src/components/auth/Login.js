import React, { Fragment, useState } from 'react'
import { Link, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login } from '../../actions/auth';

const Login = ({ login, isAuthenticated }) => {
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	});

	const { email, password } = formData;

	const makeChange = e => setFormData({...formData, [e.target.name]: e.target.value});

	const makeSubmit = async e =>{
		e.preventDefault();
		login({ email, password });
	}

	// Redirect if logged in
	if(isAuthenticated){
		return <Navigate to="/dashboard" />
	}
	
	return (
		<Fragment>
			<section className="container">
				<h1 className="large text-primary">Sign In</h1>
				<p className="lead"><i className="fas fa-user"></i> Sign into Your Account</p>
				<form className="form" onSubmit={e=>makeSubmit(e)}>
					<div className="form-group">
						<input
							type="email"
							placeholder="Email Address"
							name="email"
							onChange={e=>makeChange(e)}
							required
						/>
					</div>
					<div className="form-group">
						<input
							type="password"
							placeholder="Password"
							name="password"
							onChange={e=>makeChange(e)}
						/>
					</div>
					<input type="submit" className="btn btn-primary" value="Login" />
				</form>
				<p className="my-1">
					Don't have an account? <Link to="/register">Sign Up</Link>
				</p>
			</section>
		</Fragment>
	)
}

Login.propTypes = {
	login: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool
};

const mapStateToProps = state =>({
	isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { login })(Login);