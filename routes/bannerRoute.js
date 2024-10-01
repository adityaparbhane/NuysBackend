const express = require('express')
const router = express.Router()
const multer = require('multer')

const bannerController = require('../controllers/bannerImgController')
const upload = require('../middleware/bannerImage')

router.post(
  '/new_banner',
  upload.array('BannerImage', 12), // Ensure the field name matches the form-data field name
  bannerController.createBanner
)
router.get('/get_banner', bannerController.getAllBanner)
router.put(
  '/update_banner/:id',
  upload.array('BannerImage', 12), // Ensure the field name matches the form-data field name
  bannerController.updateBannerImage
)
router.delete('/remove_banner/:id', bannerController.deleteBanner)

module.exports = router
