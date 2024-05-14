const mongoose = require("mongoose");
const { categories } = require("../Assets/categories.js");
const {  products } = require("../Assets/product.js");
const product = require("./product.js");

const schema_category = mongoose.Schema({
  category_type: String,
  img: String,
});

const category = mongoose.model("category", schema_category);

category.find().then(async (data) => {
  if (data.length === 0) {
    try {
      // Insert categories into the database
      const result = await category.insertMany(categories);
      console.log("Categories inserted successfully:", result);
      const updatedProducts = products.map((product, index) => ({
        ...product,
        category: result[index ]._id,
      }));
      const result2 = await product.insertMany(updatedProducts);
      console.log("Products inserted successfully:",result2);

    } catch (error) {
      console.error("Error inserting categories:", error);
    }
  }
});

module.exports = category;
