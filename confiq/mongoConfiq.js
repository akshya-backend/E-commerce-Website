// mongoose.js

const mongoose = require('mongoose');

// Connect to MongoDB
async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); 
    }
}

module.exports = {connectToDatabase}
