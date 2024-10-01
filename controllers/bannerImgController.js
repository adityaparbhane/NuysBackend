const db = require('../models/db')
const fs = require('fs')

const createBanner = async (req, res) => {
  try {
    const { BannerName } = req.body
    const bannerImages = req.files ? req.files.map((file) => file.path) : []

    console.log('req.files:', req.files)
    console.log('BannerImages:', bannerImages)

    const sql =
      'INSERT INTO bannerimage (BannerName, BannerImage) VALUES (?, ?)'
    const result = await db.queryAsync(sql, [
      BannerName,
      JSON.stringify(bannerImages),
    ])

    res
      .status(201)
      .json({ message: 'Banner created successfully', id: result.insertId })
  } catch (error) {
    console.error('Error creating banner:', error)
    res.status(500).json({ error: 'Error creating banner' })
  }
}

const getAllBanner = async (req, res) => {
  try {
    const sql = 'SELECT * FROM bannerimage'
    const results = await db.queryAsync(sql)
    res.status(200).json(results)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Error fetching products' })
  }
}

const getBannerById = async (req, res) => {
  try {
    const { id } = req.params

    const sql = 'SELECT * FROM bannerimage WHERE id = ?'
    const results = await db.queryAsync(sql, [id])

    if (results.length === 0) {
      return res.status(404).json({ error: 'Banner not found' })
    }

    res.status(200).json(results[0])
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Error fetching product' })
  }
}

const updateBannerImage = async (req, res) => {
  try {
    const { id } = req.params
    const bannerImages = req.files ? req.files.map((file) => file.path) : []

    // Validate parameters
    if (!id) {
      return res.status(400).json({ error: 'ID parameter is required' })
    }
    if (bannerImages.length === 0) {
      return res.status(400).json({ error: 'BannerImage field is required' })
    }

    const sql = 'UPDATE bannerimage SET BannerImage = ? WHERE id = ?'
    await db.queryAsync(sql, [JSON.stringify(bannerImages), id])

    res.status(200).json({ message: 'Banner updated successfully' })
  } catch (error) {
    console.error('Error updating banner:', error)
    res.status(500).json({ error: 'Error updating banner' })
  }
}

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params

    const sql = 'DELETE FROM bannerimage WHERE id = ?'
    await db.queryAsync(sql, [id])

    res.status(200).json({ message: 'Banner deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ error: 'Error deleting product' })
  }
}

module.exports = {
  createBanner,
  getAllBanner,
  getBannerById,
  // updateProduct,
  updateBannerImage,
  deleteBanner,
  // removeProductImage,
}
