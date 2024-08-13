const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, resetLink) {
    const msg = {
        to,
        from: 'BenjaminMadrid@digitalskillsforall.org',
        subject: 'Reset Your Password',
        text: 'Click the link below to reset your password.',
        html: `<a href="${resetLink}">Reset Password</a>`,
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent');
    } catch (error) {
        console.error(error);
        throw new Error('Failed to send email');
    }
}

module.exports = sendEmail;