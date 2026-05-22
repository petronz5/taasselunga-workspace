const { Pool } = require("pg");

//Creo UNA connessione condivisa al database PostgreSQL,
//così da evitare di duplicare la configurazione PostgreSQL e centralizzare la connessione

const pool = new Pool({
    //Host del container/database PostgreSQL
    host: process.env.DB_HOST || "localhost",

    //Num Porta PostgreSQL
    port: Number(process.env.DB_PORT || 5434),

    //Nome database
    database: process.env.DB_NAME || "postgres",

    //Username PostgreSQL
    user: process.env.DB_USER || "root",

    //Password PostgreSQL
    password: process.env.DB_PASSWORD || "password",
});

// Esporto il pool per usarlo nel resto del microservizio
module.exports = pool;