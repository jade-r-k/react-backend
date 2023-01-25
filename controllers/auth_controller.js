const loginRequired = (req, res, next) => {
    if(req.user){
        next();
    } 
    else{
        res.status(401).json({
            msg: "Unauthorised user!!"
        })
    }
};

module.exports = {
    loginRequired
};