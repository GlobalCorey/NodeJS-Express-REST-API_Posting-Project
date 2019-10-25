const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://GLCorey:StormEnforcer1@cluster0-hdloo.mongodb.net/test-messages?retryWrites=true&w=majority';

const User = require('../models/user');
const Post = require('../models/post');
const FeedController = require('../controllers/feed');

describe('Feed Controller', function() {
    this.beforeEach(function(done) {
        mongoose.connect(MONGODB_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(result => {
           const user = new User({
               email: 'test@test.com',
               password: 'testing',
               name: 'Tester',
               posts: [],
               _id: '5c0f66b979af55031b34728a'
           })
           return user.save();
        })
        .then(() => {
            done();
        })
    });

    this.afterEach(function(done) {
        User.deleteMany({})
            .then(result => {
                return Post.deleteMany({});
            })
            .then(result => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            })
    })
    describe('getStatus', function(){
        it('should send a response with a valid user status for an existing user', function(done){
            const req = {userId: '5c0f66b979af55031b34728a'};
            const res = {
                statusCode: 500,
                userStatus: null,
                status: function(code){
                    this.statusCode = code;
                    return this;
                },
                json: function(data){
                    this.userStatus = data.status;
                }
            }
    
            FeedController.getStatus(req, res, ()=>{}).then(() => {
                expect(res.statusCode).to.be.equal(200);
                expect(res.userStatus).to.be.equal('New User Created');
                done();
            })
        })
    })

    describe('CreatePost', function(){
        it('should add a new post to the posts of the creator', function(done){
            const req = {
                body: {
                    title: 'Test Post',
                    content: 'Test post content',
                },
                file: {
                    path: '/some/test/imagePath'
                },
                userId: '5c0f66b979af55031b34728a'
            }
            const res = {
                // statusCode: 500,
                // post: null,
                // creator: {
                //     _id: null,
                //     name: null
                // },
                status: function(code){
                    // this.statusCode = code
                    //this needs to be returned.
                    //Because res.status() returns this, then .json({}) is
                    // called on the this object.
                    return this;
                },
                json: function(data){
                    // this.post = data.post,
                    // this.creator = data.creator
                }
            }

            FeedController.createPost(req, res, () => {}).then(result => {
                expect(result).to.have.property('posts');
                expect(result.posts).to.have.length(1);
                done();
            })
        })
    })
});
