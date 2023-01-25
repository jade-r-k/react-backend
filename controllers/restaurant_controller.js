const fs = require('fs');
const Restaurant = require('../models/restaurant_schema');

//Delete Image
const deleteImage = async (filename) => {

    if(process.env.STORAGE_ENGINE === 'S3'){
        const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3')
        const s3 = new S3Client({
            region: process.env.MY_AWS_REGION,
            credentials: {
                accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY
            }
        });

        try {
            const data = await s3.send(new DeleteObjectCommand({ Bucket: process.env.MY_AWS_BUCKET, Key: filename }));
            console.log("Success. Object deleted.", data);
        } 
        catch (err) {
            console.log("Error", err);
        }

    }
    else {
        let path = `public${process.env.STATIC_FILES_URL}${filename}`;
        fs.access(path, fs.F_OK, (err) => {
            if(err){
                console.error(err);
                return;
            }

            fs.unlink(path, (err) => {
                if(err) throw err;
                console.log(`${filename} was deleted`);
            });
        });
    }
};
// const deleteImage = (filename) => {
//     let path = `public${process.env.STATIC_FILES_URL}${filename}`;
//     fs.access(path, fs.F_OK, (err) => {
//         if(err){
//             console.error(err);
//             return;
//         }

//         fs.unlink(path, (err) => {
//             if(err) throw err;
//             console.log(`${filename} was deleted`);
//         });
//     });
// };

// GET All
const readData = (req, res) => {
    //Connect to DB and find all restaurants
    Restaurant.find().sort({_id:-1}).limit(50)
        .then((data) => {
            console.log(data);
            //if there is data respond OK and with data
            if(data.length > 0){
                res.status(200).json(data);
            }
            //if no data is found respond with error
            else{
                res.status(404).json("None found");
            }
        })
        //Server error
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });

    // res.status(200).json({
    //     "msg" : "All festivals retrieved",
    //     "data": data
    // });
};

//GET Single
const readOne = (req, res) => {

    let id = req.params.id;

    //Connect to DB and find one restaurant with :id
    Restaurant.findById(id)
        .then((data) => {
            if(data){
                let img = `${process.env.STATIC_FILES_URL}${data.image_path}`;
                data.image_path = img;
                res.status(200).json(data);
            }
            else {
                res.status(404).json({
                    "message": `restaurant with id: ${id} not found`
                });
            }
            
        })
        .catch((err) => {
            console.error(err);
            //if id is not valid respond with bad request
            if(err.name === 'CastError') {
                res.status(400).json({
                    "message": `Bad request, ${id} is not a valid id`
                });
            }
            //else it is server error
            else {
                res.status(500).json(err)
            }
            
            
        });


};

//POST Create One
const createData = (req, res) => {
    // console.log(req.body);
    let restaurantData = req.body;

    //Create image path
    if(req.file){
        restaurantData.image_path = process.env.STORAGE_ENGINE === 'S3' ? req.file.key : req.file.filename;
    }

    //Connect to DB and create a restaurant using the request body
    Restaurant.create(restaurantData)
    //if the data is processed respond with success
        .then((data) => {
            console.log('New restaurant Created!', data);
            res.status(201).json(data);
        })
        .catch((err) => {
            //if there is a validation error respond with the error
            if(err.name === 'ValidationError'){
                console.error('Validation Error!!', err);
                res.status(422).json({
                    "msg": "Validation Error",
                    "error" : err.message 
                });
            }
            else {
                console.error(err);
                res.status(500).json(err);
            }
        });

    
};

//PUT Edit One
const updateData = (req, res) => {

    let id = req.params.id;
    let body = req.body;
    let file = req.file;

    if(file){
        body.image_path = file.filename;
    }

    //Connect to DB and find one restaurant with :id and update using the request body
    Restaurant.findByIdAndUpdate(id, body, {
        new: true
    })
        .then((data) => {

            if(data){
                //delete old image
                deleteImage(data.image_path);
                
                res.status(201).json(data);
            }
            else {
                res.status(404).json({
                    "message": `Restaurant with id: ${id} not found`
                });
            }
            
        })
        .catch((err) => {
            if(err.name === 'ValidationError'){
                console.error('Validation Error!!', err);
                res.status(422).json({
                    "msg": "Validation Error",
                    "error" : err.message 
                });
            }
            else if(err.name === 'CastError') {
                res.status(400).json({
                    "message": `Bad request, ${id} is not a valid id`
                });
            }
            else {
                console.error(err);
                res.status(500).json(err);
            }
        });


};

//DEL Delete One
const deleteData = (req, res) => {

    let id = req.params.id;
    let imagePath = '';

    Restaurant.findById(id)
       .then((data) => {
            if(data){
                imagePath = data.image_path;
                return data.remove();
            }
            else {
                res.status(404).json({
                    "message": `Restaurant with id: ${id} not found`
                });
            }
       })
       .then((data) => {
            	console.log('Restaurant removed!');

                //delete image
                deleteImage(imagePath);

                res.status(200).json({
                    "message": `Restaurant with id: ${id} deleted successfully`
                });
       })
        .catch((err) => {
            console.error(err);
            if(err.name === 'CastError') {
                res.status(400).json({
                    "message": `Bad request, ${id} is not a valid id`
                });
            }
            else {
                res.status(500).json(err)
            } 
        });

    //Connect to DB and find one restaurant with :id and delete
    // Restaurant.deleteOne({ _id: id })
    //     .then((data) => {

    //         if(data.deletedCount){
    //             res.status(200).json({
    //                 "message": `Restaurant with id: ${id} deleted successfully`
    //             });
    //         }
    //         else {
    //             res.status(404).json({
    //                 "message": `Restaurant with id: ${id} not found`
    //             });
    //         }
            
    //     })
    //     .catch((err) => {
    //         console.error(err);
    //         if(err.name === 'CastError') {
    //             res.status(400).json({
    //                 "message": `Bad request, ${id} is not a valid id`
    //             });
    //         }
    //         else {
    //             res.status(500).json(err)
    //         } 
    //     });


};

module.exports = {
    readData,
    readOne,
    createData,
    updateData,
    deleteData
};