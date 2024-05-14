// Import necessary modules
const cloudinary = require("../confiq/cloudinaryConfiq");
const User = require("../models/user");
const fs = require('fs');
const Order = require("../models/order");
const generateInvoicePDF = require("../Assets/pdfkit");
 const nodemailer =require('nodemailer')
 const path =require('path')



const profile = async (req, res) => {
  try {
      const user = req.user;
      const userData = await User.findById(user).select("-password").populate("order.orderId").exec();
      
      if (!userData) {
          throw new Error('User not found');
      }
       res.render("shop/profile", { user: userData });
  } catch (err) {
      console.error('Profile error:', err);
      res.redirect('/');
  }
};




// PUT endpoint to handle dynamic updates
const updateProfile= async (req, res) => {
  const userId = req.user;
  const { fieldId, fieldValue } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({  status:false,message: "User not found" });
    }

    // Update the corresponding field dynamically
    user[fieldId] = fieldValue;

    // Save the updated user
    await user.save();

    // Construct a custom success message
    const successMessage = `${fieldId} updated successfully`;
   
    return res.status(200).json({ status:true, message: successMessage, user });
  } catch (error) {
    console.error("Error updating user:", error.message);
    return res.status(500).json({status:false, message: "Internal server error" });
  }
}



const changePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({  status:false,message: "file  Image  not Received" });
        }

        const imageBuffer = req.file.buffer; // Get the buffer of the uploaded image

        // Find the user by ID and update the profile picture field
        const userId = req.user // Assuming you have user information stored in req.user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({  status:false,message: "User not found" });
        }
        const result = await cloudinary.uploader.upload(req.file.path);
        
        user.profilePic = result.secure_url;
         const savedUser=await user.save();

        // Delete the file from the filesystem
        fs.unlinkSync(req.file.path);

        return res.status(200).json({ status:true,message:'Profile Pic Changed Successfully', imageUrl: savedUser.profilePic });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        return res.status(500).json({status:false, message: "Internal server error" });
    }
};


const createInvoice=async(req,res)=>{
  try {
    const orderId = req.body.orderId;
    const order = await Order.findById(orderId).populate('user').populate('items.productId').exec();

    // Generate invoice PDF
    const doc = generateInvoicePDF(order);  
  const tempDir = path.join(__dirname, '..', 'Assets');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const tempFilePath = path.join('', 'invoice.pdf');

  
    // Pipe the PDF content to a writable stream
    const writeStream = fs.createWriteStream(tempFilePath);
    doc.pipe(writeStream);
    doc.end();

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
              auth: {
                  user: process.env.GMAIL_AC,
                  pass: process.env.GMAIL_PASSWORD
              }
    });

    // Send email with attached PDF
    const info = await transporter.sendMail({
        from: process.env.GMAIL_AC,
        to: order.user.email,
        subject: `Daily need store Invoice of order id ${order._id}`,
        text:`Daily need store Invoice of order id ${order._id}`,
        attachments: [{ path: tempFilePath }]
    });

    // Delete the temporary file after sending email
    fs.unlinkSync(tempFilePath);

    res.status(200).json({status:true,message:'Invoice sent successfully to your email.'});
} catch (error) {
    console.error('Error sending invoice:', error);
    res.status(200).json({status:false,message:'Failed to Sent Invoice.'});
}
   

}

module.exports = {updateProfile,changePic,profile,createInvoice}
 