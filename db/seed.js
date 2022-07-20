// grab our client with destructuring from the export in index.js
const { 
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getPostsByUser,
  getAllPosts,
  getUserById
} = require('./index');


async function createInitialUsers(){
  try {
    console.log("Starting to create users...");

    // const albert = await createUser({ username: 'albert', password: 'bertie99' });
    // console.log(albert);

    // const albertTwo = await createUser({ username: 'albert', password: 'imposter_albert' });
    // console.log(albertTwo);

    await createUser({ 
      username: 'albert', 
      password: 'bertie99',
      name: 'Al Bert',
      location: 'Sidney, Australia', 
    });

    await createUser({ 
      username: 'sandra', 
      password: '2sandy4me',
      name: 'Just Sandra',
      location: `Ain't telling`, 
    });

    await createUser({ 
      username: 'glamgal', 
      password: 'soglam',
      name: 'Joshua',
      location: `Upper East Side` 
    });


    console.log("Finished creating users!")

  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    await createPost({
      authorId: albert.id,
      title: "First Post",
      content: "This is my first post. I hope I love writing blogs as much as I love writing them."
    }); 

    await createPost({
      authorId: sandra.id,
      title: "How does this work",
      content: "Seriously tho how does it work lol"
    }); 

    await createPost({
      authorId: glamgal.id,
      title: "Living the Glam Life",
      content: "I am glam as glam as me."
    }); 

  } catch (error) {
    console.log("Error in createInitialPosts");
    throw error;
  }
}

// this function should call a query which drops all tables from out database
async function dropTables() {
  try {
    console.log("Starting to drop tables...")

    await client.query(`
      DROP TABLE IF EXISTS posts;
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
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      active BOOLEAN DEFAULT true
    );

    CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      "authorId" INTEGER REFERENCES users(id) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      active BOOLEAN DEFAULT true
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
    await createInitialPosts();
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
    console.log("Calling getAllUsers");
    const users = await getAllUsers();
    console.log("getAllUsers:", users);


    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY"
    });
    console.log("Result:", updateUserResult);

    console.log("Calling getAllPosts");
    const posts = await getAllPosts();
    console.log("Result: ", posts);

    console.log("Calling updatePost on posts[0]");
    const updatePostResult = await updatePost(posts[0].id, {
      title: "New Title",
      content: "Updated Content"
    });
    console.log("Result:", updatePostResult);

    console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert);

    console.log("Finished database test");
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

