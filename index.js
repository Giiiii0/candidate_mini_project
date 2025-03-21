const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const cors = require('cors');
const { schema } = require('./schema');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Set up GraphQL endpoint
app.use('/graphql', createHandler({ schema }));

// Basic home route
app.get('/', (req, res) => {
  res.send('AAVE Positions API - Use GraphQL endpoint at /graphql');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`GraphQL endpoint available at http://localhost:${port}/graphql`);
});
