const express = require("express");
const { getAdminPage, getProductPage, getCategoryPage, deleteCategoryPage, deleteProductPage, postProduct, postCategory, orderlist, orderStatusChanging, editPage, postEditPage, SaveChanges, postDeleteCategory, postDeleteProduct } = require("../controller/adminController");
const isAdmin = require("../middlerware/isAdmin");
const router = express.Router();

router.use(isAdmin);

router.get("/admin", getAdminPage);
router.get("/getProduct", getProductPage);
router.get("/getCategory", getCategoryPage);
router.get("/getDeleteProduct", deleteProductPage);
router.get("/getDeleteCategory", deleteCategoryPage);
router.post("/postProduct", postProduct);
router.post("/postCategory", postCategory);
router.post("/postDeleteCategory", postDeleteCategory);
router.post("/postDeleteProduct", postDeleteProduct);
router.get("/orderlists", orderlist);
router.put("/item-delivered", orderStatusChanging);
router.post('/edit-Product', postEditPage);
router.get('/getEditPage', editPage);
router.post('/postProductChanges', SaveChanges);
module.exports = router;
