require('dotenv').config();
const collectionName = "users";
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    userName: String,
    email: String,
    password: String,
    createDate: Date,
    accountType: String,

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
    static async createUser(req) {
        try {
            const { password, email } = req.body;
            userSchema.userName = req.params.user;
            userSchema.password = password;
            userSchema.email = email;
            userSchema.createDate = new Date();
            userSchema.accountType = "user"
            const newUser = await User.create(userSchema);
            return newUser;
        }
        catch (e) {
            console.error(e);
            return { _id: -1 }
        }
    }

    static async readAll() {
        try {
            const results = await User.find();
            return results;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }

    static async readOne(user) {
        try {
            const results = await User.findOne({ userName: user });
            return results;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }

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