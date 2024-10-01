const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const crypto = require('crypto')
const axios = require('axios')
exports.dotenv = require('dotenv').config()
const productsRoute = require('./routes/productRoutes')
const ordersRoute = require('./routes/orderRoutes')
const loginRoute = require('./routes/authRoute')
const adminRoute = require('./routes/userRoutes')
const bannerRoute = require('./routes/bannerRoute')
const db = require('./models/db') // Import the db module

const app = express()
const port = process.env.PORT || 9000

app.use('/uploads', express.static('uploads'))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(express.static(path.join(__dirname, 'build')))

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  })
)

let salt_key = process.env.SALT_KEY
let merchant_id = process.env.MERCHANT_ID

app.post('/order', async (req, res) => {
  try {
    console.log(req.body)

    const data = {
      merchantId: merchant_id,
      merchantTransactionId: req.body.paymentTransactionNo,
      merchantUserId: req.body.MUID,
      name: req.body.name,
      amount: req.body.amount * 100,
      redirectUrl: `https://nyus.5techg.com/status/?id=${req.body.paymentTransactionNo}`, //https://nyus.5techg.com
      redirectMode: 'POST',
      mobileNumber: req.body.contactNo,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    }

    console.log('data ', data.redirectUrl)

    const payload = JSON.stringify(data)
    const payloadMain = Buffer.from(payload).toString('base64')
    const keyIndex = 1
    const string = payloadMain + '/pg/v1/pay' + salt_key
    const sha256 = crypto.createHash('sha256').update(string).digest('hex')
    const checksum = sha256 + '###' + keyIndex

    const prod_URL = 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
    // "https://api.phonepe.com/apis/hermes/pg/v1/pay";

    const options = {
      method: 'POST',
      url: prod_URL,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      data: {
        request: payloadMain,
      },
    }

    try {
      console.log('Request options:', options)
    } catch (logError) {
      console.error('Error logging options:', logError)
    }

    axios
      .request(options)
      .then(function (response) {
        // console.log("response data", response)

        return res.json(response.data)
      })
      .catch(function (error) {
        console.error(error)
      })
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    })
  }
})

app.post('/status', async (req, res) => {
  const merchantTransactionId = req.query.id
  const merchantId = merchant_id

  const keyIndex = 1
  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key

  const sha256 = crypto.createHash('sha256').update(string).digest('hex')
  console.log('sha256 ', sha256)

  const checksum = sha256 + '###' + keyIndex
  console.log('checksum ', checksum)

  const options = {
    method: 'GET',
    url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    // "https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}",;
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': `${merchantId}`,
    },
  }

  console.log('Options ', options)

  axios
    .request(options)
    .then(async (response) => {
      console.log('Response received ', response.data)

      let updateStatus
      if (response.data.success === true) {
        updateStatus = 'payment_success'
        const url = `https://nuyseyewear.in/#/Order-confirm` //https://nuyseyewear.in/#/Order-confirm
        console.log('Redirecting url ', url)
        res.redirect(url)
      } else {
        updateStatus = 'payment_failure'
        const url = `https://nuyseyewear.in/#/Order-failed` //https://nuyseyewear.in/#/Order-failed
        console.log('Redirecting url ', url)
        res.redirect(url)
      }

      // Update the order status in the database
      const sql =
        'UPDATE orders SET payment_Status = ? WHERE paymentTransactionNo = ?'
      await db.queryAsync(sql, [updateStatus, merchantTransactionId])
    })
    .catch((error) => {
      console.error(error)
    })
})

// New endpoint to update payment status
app.post('/orders/update_status', async (req, res) => {
  const { paymentTransactionNo, status } = req.body

  try {
    const sql =
      'UPDATE orders SET payment_Status = ? WHERE paymentTransactionNo = ?'
    await db.queryAsync(sql, [status, paymentTransactionNo])

    res.status(200).send({
      message: 'Payment status updated successfully',
      success: true,
    })
  } catch (error) {
    console.error('Error updating payment status:', error)
    res.status(500).send({
      message: error.message,
      success: false,
    })
  }
})

app.use('/auth', loginRoute)
app.use('/admin', adminRoute)
app.use('/products', productsRoute)
app.use('/orders', ordersRoute)
app.use('/banner', bannerRoute)

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`)
})
