const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  filename: function(req, file, cb) {
    const filename = `order_${uuidv4()}${file.originalname.slice(file.originalname.lastIndexOf('.'))}`;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
