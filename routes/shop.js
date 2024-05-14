const express = require("express");
const { index, getContact, postContact, showProducts, addProductToCart, getcart, decreaseQty, removeFromCart, postOrder, search, orderCancel } = require("../controller/shopController.js");
const router = express.Router();

router.get("/",index);
router.get("/contactUs",getContact);
router.post("/postContact",postContact);
router.get("/product/:id",showProducts)
router.post("/add-to-cart/:id",addProductToCart)
router.get("/getcart",getcart)
router.put("/decrease-qty/:id",decreaseQty)
router.put("/remove-From-cart/:id",removeFromCart)
router.post("/checkout",postOrder)
router.post("/search",search)
router.delete("/orderCancel",orderCancel)
module.exports = router;
