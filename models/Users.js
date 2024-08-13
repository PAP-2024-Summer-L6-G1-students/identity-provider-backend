require('dotenv').config();
const collectionName = "users";
const { Schema, model } = require('mongoose');

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
    avaliability: []

});

class UserClass {
    static async createNew(user) {
        try {
            const newUser = await User.create(user);
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
            const results = await User.findOne({userName: user});
            return results;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }

    // static async update(messageId, messageUpdate) {
    //     try {
    //         const result = await Message.updateOne({ _id: messageId }, messageUpdate);
    //         return result;
    //     }
    //     catch (e) {
    //         console.error(e);
    //         return {
    //             modifiedCount: 0,
    //             acknowledged: false
    //         }
    //     }
    // }
    // static async delete(messageId) {
    //     try {
    //         const result = await Message.deleteOne({ _id: messageId });
    //         return result;
    //     }
    //     catch (e) {
    //         console.error(e);
    //         return { deletedCount: 0 };
    //     }
    // }
}

userSchema.loadClass(UserClass);
const User = model('Users', userSchema, collectionName);
module.exports = User;