const Pool = require('pg-pool');

const pool = new Pool({
    user:'postgres',
    host:'localhost',
    database:'postgres',
    password:"lorenzo",
    port: 5432,
});


module.exports = pool;