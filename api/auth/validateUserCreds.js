function validateUserCreds() {
    return function (req, res, next) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json("username and password required");
    }

    req.credentials = {
        username,
        password
    }
    next();
    }
}

module.exports = validateUserCreds;