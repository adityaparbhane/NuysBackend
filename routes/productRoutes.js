const express = require('express')
const router = express.Router()
const multer = require('multer')
const productController = require('../controllers/productController')
const upload = require('../middleware/productImage')

router.post(
  '/new_product',
  upload.array('ProductImage', 12),
  productController.createProduct
)
router.get('/get_product', productController.getAllProducts)
router.get('/get_product/:id', productController.getProductById)
router.put(
  '/update_product/:id',
  upload.array('ProductImage', 12),
  productController.updateProduct
)
router.put(
  '/update_product_image/:id',
  upload.array('ProductImage', 12),
  productController.updateProductImage
)
router.delete('/remove_product/:id', productController.deleteProduct)
router.delete('/remove_product_image/:id', productController.removeProductImage) // New route to remove a particular image

module.exports = router
