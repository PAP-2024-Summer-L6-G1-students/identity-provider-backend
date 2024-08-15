const cors = require('cors');
const express = require('express');
const { connectMongoose } = require('./connect');
const Users = require('./models/Users');
const ForgotPasswordRequest = require('./models/ForgotPasswordRequest');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 3002;
const sendEmail = require('./sendEmail')
const { v4: uuidv4 } = require("uuid");

app.use(cors());
app.use(express.json());


// Reads information of all users
app.get('/', async (req, res) => {
  const results = await Users.readAll();
  res.send(results);
  console.log("GET request received on home page");
});

// Reads information of specific user
app.get('/:userName', async (req, res) => {
  try {
    const results = await Users.readOne(req.params.userName);
    res.send(results);
    console.log(results);
    console.log(`GET request received on ${req.body.params} page`);
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ error: 'An error occurred while finding user' });
  }
});

// Update route to update an existing message
app.patch('/:user', async (req, res) => {
  try {
    const { field, fieldUpdate } = req.body;

    // Validate required fields
    if (!field || fieldUpdate === undefined) {
      return res.status(400).json({ error: 'field and fieldUpdate are required' });
    }
    if (field === "interests" || "avaliability") {
      if (!Array.isArray(fieldUpdate)) {
        return res.status(400).json({ error: 'array field required' });
      }
    }
    const result = await Users.update(req.params.user, field, fieldUpdate);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'User not found or no changes made' });
    }
    res.status(200).json({ message: 'Update successful', result });
    console.log(`PATCH request received on ${req.params.user} route`);

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating the user' });
  }
});

// Post route to post a new message
app.post('/create/:user', async (req, res) => {
  try {
    const { password, email } = req.body;
    if (!password || email === undefined) {
      return res.status(400).json({ error: 'password and email are required' });
    }

    const results = await Users.createUser(req);
    res.sendStatus(201);

    console.log(`New user created
  username: ${results.userName}
  password: ${results.password}
  email: ${results.email}`);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'An error occurred while creating user' });
  }
});

// Delete route to delete an existing user
app.delete('/delete/:user', async (req, res) => {
  try {
    const user = await Users.findOne({ userName: req.params.user });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const result = await Users.deleteOne({ userName: req.params.user });
    if (result.deletedCount === 0) {
      // Handle the case where the delete operation didn't actually remove any document
      return res.status(500).json({ error: 'Failed to delete user' });
    }
    res.sendStatus(200);
    console.log("DELETE request received on /delete/:user route");
    console.log(`User with username ${req.params.user} deleted`);

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'An error occurred while deleting user' });
  }
});

// Route for forgot password requeset
app.post('/forgot-password', async (req, res) => {
  try {
      console.log(req.body)
      const user = await Users.findOne({ email: req.body.email }).exec();
      console.log(user)
      if (!user) {
          console.log("Couldn't find a user with that email address");
          return res.status(404).json({ error: "User not found with that email address" });
      }

      const uuid = uuidv4();
      const newRequest = await ForgotPasswordRequest.createNew(req.body.email, uuid);
      console.log(newRequest)
      if (newRequest.error) {
          console.log("Could not create password reset request");
          return res.status(500).json({ error: "Internal Server Error: Unable to create password reset request" });
      }

      const link = `http://localhost:5173/reset-password/${uuid}`;
      await sendEmail(req.body.email, link);

      return res.status(200).json({ message: "Password reset link sent successfully" });
  } catch (error) {
      console.error("Error processing forgot password request:", error);
      return res.status(500).json({ error: "Internal Server Error: Something went wrong" });
  }
});


// Route to reset your password
app.patch('/reset-password/:uuid', async (req, res) => {
  try {
    console.log("Hello!")
    const request = await ForgotPasswordRequest.findOne({ uuid: req.params.uuid });
    
    if (!request) {
      return res.status(400).json({ error: "Reset token is invalid" });
    }

    const user = await Users.findOne({ email: request.email });
    console.log(user);
    if (!user) {
      return res.status(404).json({ error: "Coudln't find user" });
    }
    

    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: "New password is required" });
    }
    user.password = password;

    await user.save();

    await ForgotPasswordRequest.deleteOne({ uuid: req.params.uuid });

    return res.status(200).json({ message: `Password reset succesfully${password}`});
  } catch (error) {
    console.error("Error processing password reset:", error);
    return res.status(500).json({ error: "Internal Server Error: Something went wrong" });
  }
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