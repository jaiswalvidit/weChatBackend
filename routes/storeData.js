//// routes/storeData.js

const express = require('express');
const router = express.Router();
const DataModel = require('../model/DataModel');

// Route to store data online
router.post('/storedata', async (req, res, next) => {
  try {
    const newData = req.body;
    const savedData = await DataModel.create(newData);
    res.status(201).json({message:
'Message added succesfuuly'
    ,user:savedData});
  } catch (error) {
    next(error);
  }
});

module.exports = router;
