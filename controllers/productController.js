const db = require('../models/db')
const fs = require('fs')

const createProduct = async (req, res) => {
  try {
    const { ProductName, Category, Description, Price, Discount, Quantity } =
      req.body
    const productImages = req.files.map((file) => file.path)

    console.log('req.files:', req.files)
    console.log('ProductImages:', productImages)

    const sql =
      'INSERT INTO products (ProductName, ProductImage, Category, Description, Price, Discount, Quantity) VALUES (?, ?, ?, ?, ?, ?, ?)'
    const result = await db.queryAsync(sql, [
      ProductName,
      JSON.stringify(productImages),
      Category,
      Description,
      Price,
      Discount,
      Quantity,
    ])

    res
      .status(201)
      .json({ message: 'Product created successfully', id: result.insertId })
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({ error: 'Error creating product' })
  }
}

const getAllProducts = async (req, res) => {
  try {
    const sql = 'SELECT * FROM products'
    const results = await db.queryAsync(sql)
    res.status(200).json(results)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Error fetching products' })
  }
}

const getProductById = async (req, res) => {
  const { id } = req.params
  try {
    const sql = 'SELECT * FROM products WHERE id = ?'
    const result = await db.queryAsync(sql, [id])

    if (result.length === 0) {
      res.status(404).json({ error: 'Product not found' })
    } else {
      res.status(200).json(result[0])
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Error fetching product' })
  }
}

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const { ProductName, Category, Description, Price, Discount, Quantity } =
      req.body
    const productImages = req.files.map((file) => file.path)

    console.log('req.files:', req.files)
    console.log('ProductImages:', productImages)

    if (productImages.length === 0) {
      const sql =
        'UPDATE products SET ProductName = ?, Category = ?, Description = ?, Price = ?, Discount = ?, Quantity = ? WHERE id = ?'
      const result = await db.queryAsync(sql, [
        ProductName,
        Category,
        Description,
        Price,
        Discount,
        Quantity,
        id,
      ])

      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Product not found' })
      } else {
        res.status(200).json({ message: 'Product updated successfully' })
      }
    } else {
      const sql =
        'UPDATE products SET ProductName = ?, ProductImage = ?, Category = ?, Description = ?, Price = ?, Discount = ?, Quantity = ? WHERE id = ?'
      const result = await db.queryAsync(sql, [
        ProductName,
        JSON.stringify(productImages),
        Category,
        Description,
        Price,
        Discount,
        Quantity,
        id,
      ])

      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Product not found' })
      } else {
        res.status(200).json({ message: 'Product updated successfully' })
      }
    }
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({ error: 'Error updating product' })
  }
}

const updateProductImage = async (req, res) => {
  try {
    const { id } = req.params
    const { index } = req.body // Get the index of the image to update
    const productImages = req.files.map((file) => file.path)

    console.log('req.files:', req.files)
    console.log('ProductImages:', productImages)

    // Fetch the current product images
    const sqlFetch = 'SELECT ProductImage FROM products WHERE id = ?'
    const resultFetch = await db.queryAsync(sqlFetch, [id])

    if (resultFetch.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    let currentImages = JSON.parse(resultFetch[0].ProductImage || '[]')

    // Update the specific image
    currentImages[index] = productImages[0]

    const sqlUpdate = 'UPDATE products SET ProductImage = ? WHERE id = ?'
    const resultUpdate = await db.queryAsync(sqlUpdate, [
      JSON.stringify(currentImages),
      id,
    ])

    if (resultUpdate.affectedRows === 0) {
      res.status(404).json({ error: 'Product not found' })
    } else {
      res.status(200).json({ message: 'Product image updated successfully' })
    }
  } catch (error) {
    console.error('Error updating product image:', error)
    res.status(500).json({ error: 'Error updating product image' })
  }
}

const removeProductImage = async (req, res) => {
  try {
    const { id } = req.params
    const { index } = req.body // Get the index of the image to remove

    // Fetch the current product images
    const sqlFetch = 'SELECT ProductImage FROM products WHERE id = ?'
    const resultFetch = await db.queryAsync(sqlFetch, [id])

    if (resultFetch.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    let currentImages = JSON.parse(resultFetch[0].ProductImage || '[]')

    // Remove the specific image
    const removedImage = currentImages.splice(index, 1)

    // Delete the image file from the filesystem
    if (removedImage.length > 0) {
      fs.unlinkSync(removedImage[0])
    }

    const sqlUpdate = 'UPDATE products SET ProductImage = ? WHERE id = ?'
    const resultUpdate = await db.queryAsync(sqlUpdate, [
      JSON.stringify(currentImages),
      id,
    ])

    if (resultUpdate.affectedRows === 0) {
      res.status(404).json({ error: 'Product not found' })
    } else {
      res.status(200).json({ message: 'Product image removed successfully' })
    }
  } catch (error) {
    console.error('Error removing product image:', error)
    res.status(500).json({ error: 'Error removing product image' })
  }
}

const deleteProduct = async (req, res) => {
  const { id } = req.params
  try {
    const sql = 'DELETE FROM products WHERE id = ?'
    const result = await db.queryAsync(sql, [id])

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Product not found' })
    } else {
      res.status(204).send()
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ error: 'Error deleting product' })
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateProductImage,
  deleteProduct,
  removeProductImage,
}
