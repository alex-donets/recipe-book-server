const Yup = require('yup');

const emailRegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const passwordRegExp = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{8,60}$/;

const signUpValidationSchema = Yup.object({
    fullName: Yup.string().max(50, 'Name should be no more than 50 characters').required('Name is required'),
    email: Yup.string().matches(emailRegExp, 'Please enter a valid email').required('Email is required'),
    password: Yup.string()
        .matches(passwordRegExp, 'Password must contain from 8 to 60 characters')
        .required('Password is required'),
    agreeTaC: Yup.boolean().oneOf([true], 'You must agree to the Terms and Conditions'),
});

const signInValidationSchema = Yup.object({
    email: Yup.string().matches(emailRegExp, 'Please enter a valid email').required('Please enter your email'),
    password: Yup.string().required('Please enter a password'),
});

const resetPassValidationSchema = Yup.object({
    email: Yup.string().matches(emailRegExp, 'Please enter a valid email').required('Email is required'),
});

const setPassValidationSchema = Yup.object({
    password: Yup.string()
        .matches(passwordRegExp, 'Password must contain from 8 to 60 characters')
        .required('Password is required'),
});

module.exports = {
    signUpValidationSchema,
    signInValidationSchema,
    resetPassValidationSchema,
    setPassValidationSchema
};
