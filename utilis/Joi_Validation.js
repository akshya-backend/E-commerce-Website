const Joi = require('joi');

const signupSchema = Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Name is required.',
    }),
    telephone: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required().messages({
      'string.pattern.base': 'Telephone number must be 10 digits long.',
      'any.required': 'Telephone number is required.',
    }),
    Dob: Joi.date().required().messages({
      'any.required': 'Date of birth is required.',
    }),
    gender: Joi.string().valid('Male', 'Female').required().messages({
      'any.only': 'Gender must be Male or Female.',
      'any.required': 'Gender is required.',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format.',
      'any.required': 'Email is required.',
    }),
    password: Joi.string().pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9]).{6,}$')).required().messages({
      'string.pattern.base': 'Password must contain letters and numbers',
      'any.required': 'Password is required.',
    }),
    address: Joi.string().required().messages({
      'any.required': 'Address is required.',
    }),
  });
  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const passwordSchema = Joi.string()
             .min(6)
             .pattern(/^(?=.*[0-9])(?=.*[a-zA-Z])/)
             .required()
             .messages({
                 'string.min': 'Password must be at least 6 characters long',
                 'string.pattern.base': 'Password must contain at least 1 number and 1 alphabet',
                 'any.required': 'Password is required'
             });
module.exports={loginSchema,signupSchema,passwordSchema}