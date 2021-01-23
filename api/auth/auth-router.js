const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const validateUserCreds = require('./validateUserCreds');

const Users = require('./users-model');
const dbErrorMsg = { message: "There has been an error with the database" }

router.post('/register', validateUserCreds(), async (req, res) => {
  try {
    const isUsernameTaken = (await Users.findByUsername(req.credentials.username) ? true : false)

    if (isUsernameTaken) {
      return res.status(400).json("username taken")
    }

    const passwordHash = bcrypt.hashSync(req.credentials.password, process.env.SALT || 8);

    const newUser = await Users.add({ username: req.credentials.username, password: passwordHash });

    return res.status(201).json(newUser);
  } catch {
    res.status(500).json(dbErrorMsg);
  }
});

router.post('/login', validateUserCreds(), async (req, res) => {
  try {
    const user = await Users.findByUsername(req.credentials.username);

    if (!user) {
      return res.status(400).json("invalid credentials")
    }

    const isPasswordValid = bcrypt.compareSync(req.credentials.password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json("invalid credentials")
    }

    // Generate JWT -- setup additional JWT settings with an options obj in this call
    const token = jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET || "keepitsafe,keepitsecret");
    if (!token) {
      return res.status(500).json("please try again");
    }

    return res.status(200).json({
      message: `Welcome, ${user.username}`,
      token
    })

  } catch {
    res.status(500).json(dbErrorMsg);
  }

});

module.exports = router;
