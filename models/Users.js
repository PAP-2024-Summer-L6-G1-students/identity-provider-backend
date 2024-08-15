require('dotenv').config();
const collectionName = "users";
const { Schema, model } = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const userSchema = new Schema({
    userName: String,
    email: String,
    password: String,
    createDate: Date,
    accountType: String,
    UUID: String,

    firstName: String,
    lastName: String,
    address: String,
    phone: Number,
    interests: [String],
    birthday: Date,
    avaliability: [],
    bio: String

});

class UserClass {
    //Create User
    static async createUser(userName, password) {
        try {
            userSchema.userName = userName;
            userSchema.password = password;
            userSchema.createDate = new Date();
            userSchema.accountType = "user"
            userSchema.UUID = uuidv4();
            const newUser = await User.create(userSchema);
            return newUser;
        }
        catch (e) {
            console.error(e);
            return { _id: -1 }
        }
    }

    //Return all users
    static async readAll() {
        try {
            const results = await User.find();
            return results;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    // Finds an existing user by username
    static async usernameExists(userName) {
        try {
          const existingUser = await User.findOne({userName}).exec();
          return existingUser !== null;
        }
        catch (e) {
          console.error(e);
          return false;
        }
    }

    //returns one user
    static async readOneByName(user) {
        try {
            const results = await User.findOne({ userName: user });
            return results;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }

    static async readOneByUUID(user) {
        try {
            const results = await User.findOne({ UUID: user });
            return results;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }

    //updates user
    static async update(user, field, fieldUpdate) {
        try {
            const updateObject = { [field]: fieldUpdate };
            const result = await User.updateOne({ userName: user }, updateObject);
            return result;
        }
        catch (e) {
            console.error(e);
            return {
                modifiedCount: 0,
                acknowledged: false
            }
        }
    }
    
    //deletes user
    static async delete(user) {
        try {
            const result = await User.deleteOne({ userName: user });
            return result;
        }
        catch (e) {
            console.error(e);
            return { deletedCount: 0 };
        }
    }
}

userSchema.loadClass(UserClass);
const User = model('Users', userSchema, collectionName);
module.exports = User;