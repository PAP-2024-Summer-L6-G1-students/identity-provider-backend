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
  const results = await Users.readOne(req.params.userName);
  res.send(results);
  console.log(results);
  console.log("GET request received on home page");
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
    
    console.log(req.params.user, field, fieldUpdate);
    console.log(`PATCH request received on ${req.params.user} route`);

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating the user' });
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