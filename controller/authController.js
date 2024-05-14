const User = require('../models/user');
const jwt =require("jsonwebtoken");
const bcrypt=require("bcrypt")
const nodemailer=require('nodemailer')
const { signupSchema, loginSchema,passwordSchema } = require('../utilis/Joi_Validation');
// Controller function to render the login page
const getLogin = async (req, res) => {
  res.render("auth/login");
};

// Controller function to render the signup page
const getSignup = async (req, res) => {
  res.render("auth/signup");
};

// Controller function for handling signup form submission
const newRegistration = async (req, res) => {
  try {
      // Validate user input
      const { error } = signupSchema.validate(req.body);
      if (error) {
          return res.render("auth/signup", { error: error.details[0].message });
      }

      // Check if user already exists
      const { email } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.render("auth/signup", { error: "Email is already registered" });
      }

      // Create new user
      const newUser = await User.create(req.body);
      
      // Generate JWT token and set cookie
      const token = jwt.sign({ userId: newUser._id }, process.env.ACCESS_TOKEN_SECRET);
      res.cookie('token', token, {maxAge:7*24*60*60*1000},{ httpOnly: true, secure: true });
      
      // Redirect to homepage
      res.redirect("/");
  } catch (err) {
      console.error('Registration error:', err);
      res.render("auth/signup", { error: 'Internal Server Error' });
  }
};

// Controller function for logging out the user
const logout = (req, res) => {
  // Clear JWT token cookie
  res.clearCookie("token");
  
  // Redirect to homepage
  res.redirect("/");
};

// Controller function for handling login form submission
const postLogin = async (req, res) => {
  try {
      // Validate user input
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
          return res.render("auth/login", { error: error.details[0].message });
      }

      // Find user by email
      const { email, password } = value;
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.render("auth/login", { error: 'Invalid email or password' });
      }

      // Generate JWT token and set cookie
      const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET);
      res.cookie('token', token, {maxAge:7*24*60*60*1000},{ httpOnly: true, secure: true });
      
      // Redirect to homepage
      res.redirect('/');
  } catch (err) {
      console.error('Login error:', err);
      res.render("auth/login", { error: 'Internal Server Error' });
  }
};

// Forget Password
const forgetPassword =(req,res)=>{
  res.render("auth/forgetPassword")
}


// send link to user for password Change
const sendLink = async (req, res) => {
  const { email } = req.body;

  try {
      const userFound = await User.findOne({ email: email });

      if (userFound) {
          const userSecret = process.env.ACCESS_TOKEN_SECRET + userFound.password;
          const token = jwt.sign({ email: userFound.email }, userSecret, { expiresIn: '10m' });
          const resetLink = `http://localhost:${process.env.port}/getReset/${userFound._id}/${token}`;

          const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                  user: process.env.GMAIL_AC,
                  pass: process.env.GMAIL_PASSWORD
              }
          });

          const mailOptions = {
              from: process.env.GMAIL_AC,
              to: email,
              subject: "Password reset request",
              html: `Please click <a href="${resetLink}">here</a> to reset your password. This link is only valid for 10 min`,
          };

          await transporter.sendMail(mailOptions);

          // Password reset link sent successfully
          return res.status(200).json({ status: true, message: "Password Reset Link has been sent to your Email" });
      } else {
          // User not found
          return res.status(404).json({ status: false, message: "User not found. Please enter a correct email." });
      }
  } catch (error) {
      // Server error
      console.error("Error in forget:", error);
      return res.status(500).json({ status: false, message: "Server error" });
  }
};


// get Rest Password Page
 const getResetPassword=async(req,res)=>{
     res.render("auth/newPassword")
 }


 //post new Password
 const postResetPassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const userToken = req.params.token;
        const { pass1, pass2 } = req.body;

        // Validate pass1 and pass2 against the schema
        const { error } = passwordSchema.validate(pass1);
        if (error) {
            return res.render("auth/newPassword", { error: error.details[0].message });
        }
        if (pass1 !== pass2) {
            return res.render("auth/newPassword", { error: 'Passwords do not match' });
        }
        
        const existingUser = await User.findById(userId);
        

        if (!existingUser) {
            return res.render("auth/newPassword", { error: 'User not found' });
        }

        const secretPass = process.env.ACCESS_TOKEN_SECRET + existingUser.password;
        try {
            const decodedToken = jwt.verify(userToken, secretPass);

            // Check token expiration
            if (!decodedToken) {
                return res.render("auth/newPassword", { error: 'Token has expired' });
            }

            existingUser.password = pass1;
            const response = await existingUser.save();

            // Generate a new access token with extended expiration
            const newToken = jwt.sign({ UserId: existingUser._id }, process.env.ACCESS_TOKEN_SECRET);
            const istoken=req.cookies.token
            if (istoken) {
                res.clearCookie('token')
            }
            // Set the new token in a cookie

             res.render("auth/login",{sucess:'Pin Changed Successfully'});

        } catch (error) {
         res.render("auth/newPassword", { error: 'Invalid or expired token' });
        }
    } catch (error) {
         res.render("auth/newPassword", { error: 'Server error' });
    }
};

 

module.exports = { getLogin,
     getSignup,
     newRegistration, 
     logout, 
     postLogin ,
     forgetPassword,
     sendLink,
     getResetPassword,
     postResetPassword
    };


