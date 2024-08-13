require('dotenv').config();
const collectionName = "users";
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    userName: String,
    firstName: String,
    lastName: String,
    createDate: Date,
    password: String,
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
            const results = await User.findOne();
            return results;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }
    static async findUserByEmail() {
        try {
            const user = await User.findOne({
                email: email
            })
            return user;
        } catch (e) {
            console.error(e)
            return null;
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