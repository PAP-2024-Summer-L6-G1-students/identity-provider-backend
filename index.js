const cors = require('cors');
const express = require('express');
const { connectMongoose } = require('./connect');
const Users = require('./models/Users');
const app = express();
const port = process.env.PORT || 3002;
const sendEmail = require('./sendEmail')


app.use(cors());
app.use(express.json());

// 1. Generate a unique reset token for the forgot password request

// 2. Store the generated UUID along with the user ID in the ForgotPasswordRequestCollection

// 3. Send email to user with a password reset link, including the UUID as a parameter
// 4. Extract the uuid from the link on the reset password page
// 5. See if it exists in the ForgotPasswordRequest collection
// 6. After UUID is validated, retrieve the users ID associated from the ForgotPasswordRequest collection


app.post('/forgot-password', async(req, res) => {
  const user = await Users.findOne({ email: req.body.email }).exec();

  if(!user) {
    console.log("Couldn't find a user with that email address")
    res.status(400).json({});
  } else {
    const uuid = uuidv4();
    const newRequest = await ForgotPasswordRequest.createNew(req.body.email, uuid);

    if (newRequest.error) {
      console.log("Could not create request")
    }

    // Code to create reset link

    sendEmail(req.body.email, link)

  }

})







app.get('/', async (req, res) => {

  const results = await Users.readAll();
  res.send(results);
console.log(results)
  console.log("GET request received on home page");
});

//* ********************* Launching the server **************** */

const start = async () => {
  try {
      await connectMongoose();
      app.listen(port, () => console.log(`Server running on port ${port}...`));
  }
  catch (err) {
      console.error(err);
  }
}





start();