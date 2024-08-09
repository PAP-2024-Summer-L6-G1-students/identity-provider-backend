const cors = require('cors');
const express = require('express');
const { connectMongoose } = require('./connect');
const Users = require('./models/Users');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

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
  try{
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
  try{
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
  }catch (error) {
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