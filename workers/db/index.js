const mongoose = require('mongoose')

const mongoUrl = process.env.MONGO_URL || `mongodb://localhost:27017/guru`
mongoose.connect(mongoUrl)
.then(() => console.log('|| MongoDB connected || '))
  .catch(err => console.error('MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const RequestSchema = new mongoose.Schema({
  userId: String,
  request: String,
  retries: Number
})


const User = mongoose.model('User', UserSchema)
const Request = mongoose.model('Request', RequestSchema)

module.exports = { User, Request }