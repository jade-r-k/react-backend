const express = require('express');
const router = express.Router();

const { loginRequired } = require('../controllers/auth_controller');

const imageUpload = require('../utils/image_upload');

const { 
    readData, 
    readOne,
    createData,
    updateData,
    deleteData
  } = require('../controllers/restaurant_controller');

//restaurant routes for api url
//create, edit and delete require web token auth
router
    .get('/', readData)
    .get('/:id', readOne)
    .post('/', loginRequired, imageUpload.single('image'), createData)
    .put('/:id', loginRequired, imageUpload.single('image'), updateData)
    .delete('/:id', loginRequired, deleteData);

module.exports = router;