const category = require("../models/categories")
const Order = require("../models/order")
const order = require("../models/order")
const product = require("../models/product")
const User = require("../models/user")
const nodemailer=require("nodemailer")
const stripe = require('stripe')(process.env.stripeKey,{ apiVersion: '2024-04-10' });


// get mainPage 
const index=async (req,res)=>{
const user=req.user
const categoriesList=await category.find({})
if (!user) {
     res.render("shop/index",{Category:categoriesList,isAdmin:false,isAuth:false})
}else{
    const findUser=await User.findById(user)
    let qty=findUser.cart.items.length
    let isAdmin;
    findUser.role === 'admin' ? isAdmin=true:isAdmin=false
     res.render("shop/index",{Category:categoriesList,isAdmin,isAuth:true,cartQTY:qty})

}
}
 
// get contactus Page
const getContact=async(req,res)=>{
    res.render('shop/contactUs')
} 

const postContact=async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            res.render('shop/contactUs', { error: 'All Field Required' });
        }

        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.GMAIL_AC,
                pass: process.env.GMAIL_PASSWORD 
            }
        });

        // Setup email data with unicode symbols
        let mailOptions = {
            from: process.env.GMAIL_AC,
            to:  process.env.GMAIL_AC,
            subject: `New message from ${name}: ${subject}`,
            text: message, 
            html: `<p>${message}</p>` 
        }
        let info = await transporter.sendMail(mailOptions);
       
        res.render('shop/contactUs', { success: 'Message sent successfully!' });
    } catch (error) {
        console.error(error);
        res.render('shop/contactUs', { error: 'Error occurred while sending email.' });
    }
}

const showProducts = async (req, res) => {
    try {
      let userId = req.user;
      const categoryId = req.params.id;
  
      const productsData = await product
        .find({ category: categoryId })
        .populate('category')
        .exec();
  
      // Check if the user is authenticated
      const isAuth = userId ? true : false;
  
      // Check if the authenticated user is an admin
      const userInfo = userId ? await User.findById(userId) : null;
      const isAdmin = userInfo?.role == 'admin'?true : false;
      res.render("shop/product", {
        products: productsData,
        user: userInfo,
        isAuth: isAuth,
        isAdmin: isAdmin
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).send("An error occurred while fetching products");
    }
  };
  

  const addProductToCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status:false, message: 'Please login to add items to the cart' });
        }

        const  productId  = req.params.id
        const loggedInUser = await User.findById(req.user);
        const productToAdd = await product.findById(productId);
        const result = await loggedInUser.addToCart(productToAdd);
        res.status(200).json({status:true, message: 'Product added to cart successfully',result });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ error: 'An error occurred while adding product to cart' });
    }
};

//  get cart
const getcart=async(req,res)=>{
    try {
        const userId=req.user
        if (!userId) {
            res.render("auth/login",{error:"Please login To Access Order Page"})
        }
        // Find the user in the database and populate their cart with product details
        const userInfo = await User.findById(userId).populate('cart.items.productId').exec();
        
        // Render the cart view with the user's cart data
        res.render('shop/cart',{user:userInfo});
      } catch (err) {
        console.log(err)
        res.status(500).send('Error retrieving user cart');
      }
}

const decreaseQty = async (req, res) => {
    try {
        const userId = req.user;
        const productId = req.params.id;

        // Ensure userId and productId are valid before proceeding
        if (!userId || !productId) {
            return res.status(400).json({ error: "Invalid user ID or product ID." });
        }

        // Find the user by ID
        const userInfo = await User.findById(userId);

        // Check if user info exists
        if (!userInfo) {
            return res.status(404).json({ error: "User not found." });
        }

        // Decrease quantity for the specified product
        await userInfo.decreaseQty(productId);

        // Optionally, send a success response
        res.status(200).json({ message: "Quantity decreased successfully." });
    } catch (error) {
        // Handle any unexpected errors
        console.error("Error in decreaseQty:", error);
        res.status(500).json({ error: "An unexpected error occurred." });
    }
};

const removeFromCart= async (req, res) => {
    try {
        const userId = req.user;
        const productId = req.params.id;

        // Ensure userId and productId are valid before proceeding
        if (!userId || !productId) {
            return res.status(400).json({ status:false,message: "Invalid user ID or product ID." });
        }
        const userInfo = await User.findById(userId);
        if (!userInfo) {
            return res.status(404).json({ status:false,message: "User not found." });
        }
        const result = await userInfo.removeFromCart(productId);
        res.status(200).json({status:true, message: "Item Removed Successfully" ,totalPrice:result});
    } catch (error) {
        // Handle any unexpected errors
        console.error("Error in decreaseQty:", error);
        res.status(500).json({ status:false,message: "An unexpected error occurred." });
    }
};



const postOrder = async (req, res) => {
    try {
        const userId  = req.user
        const { token, paymentType } = req.body;

        if (!userId)
            return res.status(400).json({ status: false, message: 'Internal Error. Please refresh the page.' });

        const userInfo = await User.findById(userId).populate('cart.items.productId');
        if (!userInfo)
            return res.status(404).json({ status: false, message: 'User not found.' });

        const items = userInfo.cart.items.map(({ productId, productName, quantity, subtotal }) => ({
            productId: productId._id,
            productName,
            quantity,
            price: productId.product_price,
            subtotal,
        }));

        const newOrder = new order({
            user: userId,
            items,
            total_price: userInfo.cart.total_price,
            paymentType: paymentType ? 'COD' : 'CARD'
        });

         const Order=await newOrder.save();

        if (paymentType) {
            userInfo.cart = {};
            userInfo.order.push({orderId:Order._id})
            await userInfo.save();

        } else {
            const charge = await stripe.charges.create({
                amount: 500,
                currency: 'USD',
                source: token,
                description: `Order Id is ${Order._id}`
            });

            userInfo.cart = {};
            newOrder.transactionId = charge.id;
            userInfo.order.push({orderId:Order._id})

            await newOrder.save();
            await userInfo.save();

        }

        return res.status(200).json({ status: true, message: 'Order Successfully Placed' });
    } catch (error) {
        console.error('Error placing order:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
}


const search=async(req,res)=>{
    try {
        let userId = req.user;
        const productName = req.body.productName;
        const productsData = await product
        .find({ product_name: { $regex: new RegExp(productName, 'i') } })
        .populate('category')
        .exec();
    
        // Check if the user is authenticated
        const isAuth = userId ? true : false;
    
        // Check if the authenticated user is an admin
        const userInfo = userId ? await User.findById(userId) : null;
        const isAdmin = userInfo?.role == 'admin'?true : false;
        res.render("shop/product", {
          products: productsData,
          user: userInfo,
          isAuth: isAuth,
          isAdmin: isAdmin
        });
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("An error occurred while fetching products");
      }
}
 const orderCancel=async(req,res)=>{
    try {
        const { orderId } = req.body;

        // Find order by orderId and delete
        const deletedOrder = await Order.findOneAndDelete({ _id: orderId });

        if (!deletedOrder) {
            return res.status(404).json({status:false, message: "Order not found" });
        }

        // Remove order reference from user's order array
        await User.updateMany({ 'order.orderId': orderId }, { $pull: { 'order': { orderId: orderId } } });

        return res.status(200).json({status:true, message: "Order cancelled successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status:false,  message: "Internal server error" });
    }
 }
   

    



module.exports ={
    index,
    getContact,
    postContact,
    showProducts,
    showProducts,
    addProductToCart,
    getcart,
    decreaseQty,
    removeFromCart,
    postOrder,
    search,
    orderCancel
    }
    
