const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const BCRYPT_SALT = 12;
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    try {
        //This validation check needs to be inside the try catch even though it has 
        // no await code.
        //This is because the catch block at the bottom will not know what the error 
        // that is thrown within the if block will be if it happens OUTSIDE the try-catch
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const error = new Error('Validation failed. Data entered is invalid.')
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const email = req.body.email;
        const name = req.body.name;
        const password = req.body.password;

        const user = await User.findOne({email: email});
        if(user){
            const error = new Error('Email already exists.')
            error.statusCode = 422;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT);
        const newUser = new User({
            email: email,
            password: hashedPassword,
            name: name
        })

        const userSaveResult = await newUser.save();
        if(!userSaveResult){
            const error = new Error('Error occured saving User during Signup!');
            error.statusCode = 422;
            throw error;
        }
        res.status(201).json({
            message: 'New User created',
            userId: userSaveResult._id
        })
    } catch (error) {
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({email: email});
        if(!user){
            const error = new Error('Email does not exists.')
            error.statusCode = 401;
            throw error;
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            const error = new Error('Incorrect Email or Password.')
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({
            email: user.email,
            userId: user._id.toString()
        }, 
        'SomeSuperSecretThing', 
        {expiresIn: '1h'})
        res.status(200).json({
            token: token,
            userId: user._id.toString()
        })
        return;
        
    } catch (error) {
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
        return error;
    }
}