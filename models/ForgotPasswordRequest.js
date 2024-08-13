const { Schema, model } = require('mongoose');

const forgotPasswordRequestSchema = new Schema({
    uuid: String,
    email: String
});

class ForgotPasswordRequestClass {
    static async createNew(email, uuid) { 
        try {
            const newRequest = await ForgotPasswordRequest.create({ uuid, email });
            return newRequest;
        } catch (e) {
            console.error(e);
            return { error: 'Error creating password reset request.' };
        }
    }
    static async readAll() {
        try {
            const results = await ForgotPasswordRequest.findOne();
            return results;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }
}

forgotPasswordRequestSchema.loadClass(ForgotPasswordRequestClass);
const ForgotPasswordRequest = model('ForgotPasswordRequest', forgotPasswordRequestSchema);
module.exports = ForgotPasswordRequest;