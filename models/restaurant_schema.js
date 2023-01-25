const { Schema, model } = require('mongoose');

//Restaurant schema created using MongoDB data sample
const restaurantSchema = Schema({
    address: {
        building: {
            type: String,
            required: [true, 'building field is required']
        },
        street: {
            type: String,
            required: [true, 'street field is required']
        },
        zipcode: {
            type: String,
            required: [true, 'zipcode field is required']
        }
    },
    borough: String,
    cuisine: {
        type: String,
        required: [true, 'cuisine field is required']
    },
    grades: [
        {
        date: {
            type: Date,
            //required: [true, 'date field is required']
        },
        grade: {
            type: String,
            //required: [true, 'grade field is required']
        },
        score: {
            type: Number,
            //required: [true, 'score field is required']
        }
    }],
    name: {
        type: String,
        required: [true, 'name field is required']
    },
    image_path: {
        type: String
    }
});

module.exports = model('Restaurant', restaurantSchema);