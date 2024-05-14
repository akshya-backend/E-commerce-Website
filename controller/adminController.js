const category = require("../models/categories");
const Joi = require('joi');
const mongoose = require('mongoose');
const product = require('../models/product');
const Order = require("../models/order");
const getAdminPage=async(req,res)=>{
    res.render('admin/index')
    }
   
 const orderlist=async(req,res)=>{
        const allOrder=await Order.find({orderStatus:'Pending'}).populate('user').exec()
        res.render('admin/orderlist',{order:allOrder})
    }
 const getProductPage=async(req,res)=>{
    const list=await category.find({})
        res.render('admin/product',{category:list})
 }
 const getCategoryPage=async(req,res)=>{
    res.render('admin/category')
 }
 const deleteCategoryPage=async(req,res)=>{
    res.render('admin/deleteCategory')
}
const deleteProductPage=async(req,res)=>{
    res.render('admin/deleteProduct')
}
const editPage=async(req,res)=>{
    res.render('admin/getEditPage')
   }


const postProduct = async (req, res) => {
    try {
        const imageLinkSchema = Joi.string().uri();
        const list=await category.find({})

        // Extract data from request body
        const { productName, productPrice, imageLink, categoryId } = req.body;

        // Validate image link using Joi
        const { error } = imageLinkSchema.validate(imageLink);
        if (error) {
           return   res.render('admin/product', { error: 'Please Provide Valid Link',category:list });
        }
        const already = await product.findOne({ product_name: productName, category:list });
        if (already ) {
            console.log(already);
            return   res.render('admin/product', { error: 'Product is already exits ',category:list });
         }
        // Create a new product object
        const newProduct = new product({
            product_name: productName,
            product_price: productPrice,
            image: imageLink,
            category: categoryId,
        });

        // Save the product to the database
        await newProduct.save();

        // Render success message
        res.render('admin/product', { success: 'Product Successfully Added',category:list });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const postCategory = async (req, res) => {
    try {
        const { category_name, category_img } = req.body;
        const imageLinkSchema = Joi.string().uri();

        // Validate image link using Joi
        const { error } = imageLinkSchema.validate(category_img);
        if (error) {
            return res.render('admin/category', { error: 'Please provide a valid image link' });
        }

        // Check if the category name already exists
        const existingCategory = await category.findOne({ category_type: category_name });
        if (existingCategory) {
            return res.render('admin/category', { error: 'Category already exists' });
        }

        // Create a new category object
        const newCategory = new category({
            category_type: category_name,
            img: category_img
        });

        // Save the category to the database
        await newCategory.save();

        // Render success message
        res.render('admin/category', { success: 'Category Successfully Added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const postDeleteCategory=async(req,res)=>{
    try {
         const id =req.body.category_id;
         const isExist=await category.findById(id)
         if (!isExist) {
            return  res.render('admin/deleteCategory', { error:'Unable to Find the Category' });

         }
        await category.deleteOne({_id:id})
        return  res.render('admin/deleteCategory', { success:' Category Successfully  Removed' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


const postDeleteProduct=async(req,res)=>{
    try {
         const id =req.body.product_id;
         const isExist=await product.findById(id)
         if (!isExist) {
            return  res.render('admin/deleteProduct', { error:'Unable to Find the Product' });

         }
        await  product.deleteOne({_id:id})
        return  res.render('admin/deleteProduct', { success:' Product Successfully  Removed' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const orderStatusChanging = async (req, res) => {
    const { id } = req.body;
    try {
      const update = await Order.findByIdAndUpdate(id, { $set: { orderStatus: 'Delivered' } });
      if (!update) {
        return res.status(404).json({ status: false, message: "Order not found" });
      }
      res.status(200).json({ status: true, message: "Order Delivered" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }


const postEditPage = async (req, res) => {
    try {
        const id = req.body.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ status: false, message: "Invalid product ID" });
        }
        const productInfo = await product.findOne({ _id:id });
        if (productInfo) {
            res.status(200).json({ status: true, message:'Product Found', product: productInfo });
        } else {
            res.status(404).json({ status: false, message: "Product not found" });
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
}
const SaveChanges = async (req, res) => {
    const { id, productName, productPrice } = req.body;
    try {
        const productInfo = await product.findByIdAndUpdate(id, {
            $set: {
                product_name: productName, // Corrected field name
                product_price: productPrice
            }
        }, { new: true }); // To return the updated document

        if (!productInfo) {
            return res.status(404).json({ status: false, message: "Product not found" });
        }

        // Redirect to the admin page or send a success response
        res.render("admin/index",{success:"Product Info Updated  Successfuly "});
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
}


 module.exports ={
    getAdminPage,
    getProductPage, 
    getCategoryPage,
    deleteCategoryPage,
    deleteProductPage,
    postProduct,
    postCategory,
    postDeleteCategory,
    postDeleteProduct,
    orderlist,
    orderStatusChanging,
    editPage,
    postEditPage,
    SaveChanges
    
}
