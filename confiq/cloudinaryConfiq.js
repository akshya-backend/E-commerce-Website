const cloudinary = require('cloudinary').v2;

function configureCloudinary() {
    if (!process.env.cloudinary_cloud_name || !process.env.cloudinary_api_key || !process.env.cloudinary_api_secret) {
        throw new Error('Cloudinary configuration error: One or more environment variables are missing');
    }

    // Configure Cloudinary
    cloudinary.config({
        cloud_name: process.env.cloudinary_cloud_name,
        api_key: process.env.cloudinary_api_key,
        api_secret: process.env.cloudinary_api_secret
    });

    console.log('Cloudinary configured successfully');
}

try {
    configureCloudinary();
} catch (error) {
    console.error('Error configuring Cloudinary:', error.message);
    process.exit(1); 
}

module.exports = cloudinary;
