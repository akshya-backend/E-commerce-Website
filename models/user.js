const mongoose = require("mongoose");
const bcrypt=require('bcrypt');
const product = require("./product");
const userSchema = mongoose.Schema({
    profilePic: {
        type: String,
        default: "/images/default.svg" // Replace this with the default path or URL
    },
    name: { type: String, required: true },
    telephone: { type: String, required: true }, // Change to String to support leading zeros
    email: { type: String, required: true },
    address: { type: String, required: true },
    Dob: { type: Date, required: true }, // Use Date data type for Date of Birth
    gender: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    cart: {
        items: [{
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' }, // Assuming 'Product' is your product model
            productName: String,
            quantity: { type: Number, required: true },
            subtotal: Number,
        }],
        total_price: Number
    },
    order:[{
        _id:false,
        orderId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, 
        
    }]
});
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  });
  
  userSchema.methods.addToCart = async function (product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
        return cp.productId.toString() === product._id.toString();
    });

    if (cartProductIndex >= 0) {
        this.cart.items[cartProductIndex].quantity += 1;
        this.cart.items[cartProductIndex].subtotal =this.cart.items[cartProductIndex].quantity * product.product_price
    } else {
        // Otherwise, add new item to cart
        this.cart.items.push({
            productId: product._id,
            productName: product.product_name,
            quantity: 1,
            subtotal:  product.product_price // Assuming product has a 'price' field
        });
    }

    // Calculate total price of the cart
    this.cart.total_price = this.cart.items.reduce((total, item) => {
        return total + item.subtotal 
    }, 0);
    

    return await this.save();
};
// Decrease  quantity
userSchema.methods.decreaseQty = async function (id) {
    const findProduct = this.cart.items.find((item) => {
        return item.productId.toString() === id.toString();
    })

    if (findProduct) {
        const productInfo=await product.findById(id)
        findProduct.quantity -= 1;
        this.cart.total_price -= productInfo.product_price;
        await this.save();
    } else {
        throw new Error('Product not found in cart.');
    }
};

userSchema.methods.removeFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    this.cart.total_price = this.cart.items.reduce((total, item) => {
        return total + item.subtotal 
    }, 0);
    
     this.save();
     return  this.cart.total_price;

  };
  


const User = mongoose.model("User", userSchema);

module.exports = User;
