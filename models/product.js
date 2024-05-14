const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: true
    },
    product_price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category', 
        required: true
    },
    image:String
});

const product = mongoose.model("product", productSchema);

module.exports = product;
