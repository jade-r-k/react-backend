const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

//port
const port = 3000;

//use env file
require('dotenv').config();

//connect to db
require('./utils/db')();

//accept json
app.use(express.json());

app.use(express.static('public'));

//CORS
var cors = require('cors');

app.use(cors());

//auth
app.use((req, res, next) => {
    if(req.headers?.authorization?.split(' ')[0] === 'Bearer'){
        jwt.verify(req.headers.authorization.split(' ')[1], process.env.APP_KEY, (err, decoded) => {
            if(err) req.user = undefined;
            
            req.user = decoded;
            next();
        });
    }
    else {
        req.user = undefined;
        next();
    }
});

app.use((req, res, next) => {
    console.log("USER: ");
    console.log(req.user);
    next();
});

//routes
app.use('/api/users', require('./routes/users'));
app.use('/api/restaurants', require('./routes/restaurants'));

//Check server is running
app.listen(port, () => {
    console.log(`Restaurant app listening on port ${port}`);
});