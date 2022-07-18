// grab our client with destructuring from the export in index.js
const { 
  client,
  getAllUsers,
  createUser
} = require('./index');


async function createInitialUsers(){
  try {
    console.log("Starting to create users...");

    const albert = await createUser({ username: 'albert', password: 'bertie99' });
    console.log(albert);

    const albertTwo = await createUser({ username: 'albert', password: 'imposter_albert' });
    console.log(albertTwo);

    console.log("Finished creating users!")

  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

// this function should call a query which drops all tables from out database
async function dropTables() {
  try {
    console.log("Starting to drop tables...")

    await client.query(`
      DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!")
  } catch (error) {
    console.error("Error dropping tables!")
    throw error; // we pass the error up to the function that calls dropTables
  }
}

// this function should call a querty which creates all tables for our database
async function createTables() {
  try {
    console.log("Starting to build tables...")

    await client.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username varchar(255) UNIQUE NOT NULL,
      password varchar(255) NOT NULL
    );
    `);

    console.log("Finished building tables!")
  } catch (error) {
    console.error("Error building tables!")
    throw error; // we pass the error up to the function that calls createTables
  }
}


async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
  } catch (error) {
    console.error("redbuildDB error");
    throw error;
  // } finally {
  //   client.end();
  }
}

async function testDB() {
  try {
    // connect the client to the database, finally
    // client.connect();
    console.log("Starting to test database...");

    // queries are promises, so we can await them
    // const result = await client.query(`SELECT * FROM users;`);

    // for now, logging is a fine way to see what's up
    // console.log(result);

    // const { rows } = await client.query(`SELECT * FROM users;`);
    // console.log(rows);

    const users = await getAllUsers();
    console.log("getAllUsers:", users);

    console.log("Finished database test")
  } catch (error) {
    console.error("Error testing database!");
    throw error;
  // } finally {
  //   // it's important to close out the client connection
  //   client.end();
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());

