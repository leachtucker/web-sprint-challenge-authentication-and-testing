require('dotenv').config(); // Use dotenv in scripts and remove this before deploying
const server = require('./api/server.js');


const PORT = process.env.PORT || 3300;
server.listen(PORT, () => {
  console.log(`\n=== Server listening on port ${PORT} ===\n`);
});
