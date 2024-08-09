const cors = require('cors');
const express = require('express');
const { connectMongoose } = require('./connect');
const Users = require('./models/Users');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Read all
app.get('/', async (req, res) => {
  const results = await Users.readAll();
  res.send(results);
  console.log("GET request received on home page");
});

// Read one
app.get('/:userName', async (req, res) => {
  const results = await Users.readOne(req.params.userName);
  res.send(results);
  console.log(results);
  console.log("GET request received on home page");
});

// Update route to update an existing message
// app.patch('/:user', async (req, res) => {
//   const {field, fieldUpdate} = req.body;
//   const results = await Users.update(req.params.user, field, fieldUpdate);
//   console.log(results);
//   res.sendStatus(200);
//   console.log(req.params.user, field, fieldUpdate)
//   console.log(`PATCH request received on ${req.params.user} route`)
//   //console.log(`Message with id ${req.params.id} updated`);
// });

app.patch('/:user', async (req, res) => {
  try {
    const { field, fieldUpdate } = req.body;

    // Validate required fields
    if (!field || fieldUpdate === undefined) {
      return res.status(400).json({ error: 'field and fieldUpdate are required' });
    }

    // Call the update method
    const result = await Users.update(req.params.user, field, fieldUpdate);

    // Check if the update was successful
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'User not found or no changes made' });
    }

    // Respond with success
    res.status(200).json({ message: 'Update successful', result });
    
    // Logging
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