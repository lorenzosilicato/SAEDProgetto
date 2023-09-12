const Pool = require('pg-pool');

//Inizializzazione pool per connessioni al Database
const pool = new Pool({
    user:'postgres',
    host:'localhost',
    database:'postgres',
    password:"lorenzo",
    port: 5432,
});


module.exports = pool;