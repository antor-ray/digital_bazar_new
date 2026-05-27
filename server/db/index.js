//for local connection
// import { Pool } from 'pg'
 
// const pool = new Pool();
 
// export const query = (text, params) => pool.query(text, params)



//for remote connection
const { Pool } = require("pg");

const pool = new Pool({
   connectionString: process.env.DATABASE_URL,
   ssl: {
      rejectUnauthorized: false,
   },
});

module.exports = pool;