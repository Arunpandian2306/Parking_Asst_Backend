var express = require('express');
var router = express.Router();
const connectToMongo = require('../query/db');
const { sendSuccess, sendError } = require('./ResponseModule')
const verifyToken = require('../JWT/auth')
router.get('/get-all/cars', verifyToken,async (req, res) => {
    try {
        const { page = 1, limit = 10, sortField = 'carname', sortOrder = 'asc' } = req.query;

        const db = await connectToMongo();
        const carsCollection = db.collection('cars');
        const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

        const totalCars = await carsCollection.countDocuments();

        const cars = await carsCollection.find({})
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .toArray();

        
        sendSuccess(res, {
            cars,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCars / limit),
                totalCars,
                limit: parseInt(limit)
            },
            sort: {
                field: sortField,
                order: sortOrder
            }

        });
    } catch (error) {
        console.error('Error retrieving car data:', error);
        sendError(res, 'Unable to retrieve data', error);
    }
});


router.post('/update/cars', verifyToken,async (req, res) => {
    try {
        const db = await connectToMongo();
        const carsCollection = db.collection('cars');
        const { carname, number, color } = req.body;
        if (!carname || !number || !color) {
            return sendError(res, 'All fields (carname, number, color) are required.');
        }
        const existingCar = await carsCollection.findOne({ number });
        if (existingCar) {
            return sendError(res, 'A car with this number already exists. Please use a different number.');
        }
        const newCar = { carname, number, color };
        const result = await carsCollection.insertOne(newCar);
        if (result.insertedId) {
            sendSuccess(res, { message: 'Car created successfully', car: newCar });
        } else {
            sendError(res, 'Error inserting car data');
        }
    } catch (error) {
        console.error('Error creating car data:', error);
        sendError(res, 'unable to insert');
    }
});



module.exports = router;