const express = require("express");

const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");


// GET ALL + CREATE
router.route("/")
  .get(getProducts)
  .post(createProduct);


// GET SINGLE + UPDATE + DELETE
router.route("/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);


module.exports = router;