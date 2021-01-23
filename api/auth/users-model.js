const dbConfig = require('../../data/dbConfig');
const db = require('../../data/dbConfig');

function find() {
    return db('users');
}

function findById(id) {
    return db('users').where({ id }).first();
}

function findByUsername(username) {
    return db('users').where({ username }).first();
}

async function add(userData) {
    const [ newUserID ] = await db('users').insert(userData);

    if (!newUserID) {
        return Promise.resolve(null);
    }

    const newUser = await findById(newUserID);
    return Promise.resolve(newUser);
}

async function remove(id) {
    const [ delRecords ] = await db('users').where({ id }).del();

    if (!delRecords || delRecords <= 0) {
        return Promise.resolve(null);
    }

    return Promise.resolve(1);
}

module.exports = {
    find,
    findById,
    findByUsername,
    add,
    remove
}