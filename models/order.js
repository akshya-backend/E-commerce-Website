
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model and want to reference it
    required: true
  },
  items: [
    { _id:false,
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product', // Assuming you have a Product model and want to reference it
        required: true
      },
      productName: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number
      },
      subtotal: {
        type: Number,
        required: true
      }
    }
  ],
  total_price: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Delivered'],
    default: 'Pending'
  },

  paymentType: {
    type: String,
    enum: ['COD', 'CARD'],
    default: 'COD'
  },
  transactionId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
