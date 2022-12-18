const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const projects = mongoCollections.projects;
const { ObjectId } = require("mongodb");
const helpers_client = require("../helpers_client");
const userFunctions = require("./users");
const projectFunctions = require("./projects");
const { getRounds } = require("bcryptjs");
// create client
const createClient = async (userId, cfirstName, clastName, gender, email) => {
  userId = helpers_client.checkInputIsObjectId(userId);

  cfirstName = helpers_client.name(cfirstName);

  clastName = helpers_client.name(clastName);

  if (!(gender === "Male" || gender === "Female" || gender === "Others"))
    throw `400Invalid gender input!`;

  email = helpers_client.validuseremail(email);

  const usersCollection = await users();
  // check whether user is present
  let userDetails = await userFunctions.getUserByID(userId);
  if (userDetails) {
    // if a new client have same mailId as other we have to throw error
    const searchEmail = await usersCollection.findOne({
      $and: [{ _id: ObjectId(userId) }, { "clients.email": email }],
    });
    if (searchEmail) {
      throw "Error: EmailId similar to other client";
    }
    const firstAndLastName = await usersCollection.findOne({
      $and: [
        { _id: ObjectId(userId) },
        { "clients.cfirstName": cfirstName },
        { "clients.clastName": clastName },
      ],
    });
    if (firstAndLastName) {
      throw "Error: Two clients can't have same Firstname and LastName";
    }
    let UniqueId = ObjectId();

    let createClient = {
      _id: UniqueId,
      cfirstName: cfirstName,
      clastName: clastName,
      gender: gender,
      email: email,
      projectIds: [],
    };
    let updatedInfo = await usersCollection.updateOne(
      { _id: ObjectId(userId) },
      { $push: { clients: createClient } }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw "could not update client";
    }

    // get client by ID
    const client = await getClientById(userId, UniqueId.toString());
    return client;
  } else {
    throw "Error: no user with that Id";
  }
};

// remove client
const removeClient = async (userId, clientId) => {
  // error checking
  userId = helpers_client.checkInputIsObjectId(userId);
  clientId = helpers_client.checkInputIsObjectId(clientId);

  const userCollection = await users();
  let userDetails = await userFunctions.getUserByID(userId);
  if (userDetails) {
    // delete clients projects from projects collection
    const projectsCollection = await projects();
    const delInfo = await projectsCollection.deleteMany({ clientId: clientId });

    const deleteInfo = await userCollection.updateOne(
      { _id: ObjectId(userId) },
      { $pull: { clients: { _id: ObjectId(clientId) } } }
    );

    if (deleteInfo.modifiedCount === 0) {
      throw "no client with that Id";
    }
    return { clientDeleted: true };
  } else {
    throw "Error: no user with that Id";
  }
};

// get all clients
const getAllClient = async (userId) => {
  // error checking
  userId = helpers_client.checkInputIsObjectId(userId);
  let userDetails = await userFunctions.getUserByID(userId);
  if (userDetails) {
    var clientDetails = userDetails.clients;
    return clientDetails;
  } else {
    throw "Error: No user with that Id";
  }
};

// update clients
const updateClient = async (
  userId,
  clientId,
  cfirstName,
  clastName,
  email,
  gender
) => {
  userId = helpers_client.checkInputIsObjectId(userId);
  clientId = helpers_client.checkInputIsObjectId(clientId);
  cfirstName = helpers_client.name(cfirstName);

  clastName = helpers_client.name(clastName);
  email = helpers_client.validuseremail(email);

  if (!(gender === "Male" || gender === "Female" || gender === "Others")) {
    throw `400Invalid gender input!`;
  }
  const usersCollection = await users();
  const getUser = await userFunctions.getUserByID(userId);
  if (getUser) {
    const checkClientWithSimilarChanges = await usersCollection.findOne({
      "clients._id": ObjectId(clientId),
    });
    if (!checkClientWithSimilarChanges) {
      throw "Error: can't find client with the Id";
    }
    // check whether current client fullname or email matches with other clients
    for (let i = 0; i < checkClientWithSimilarChanges.clients.length; i++) {
      if (checkClientWithSimilarChanges.clients[i]._id.toString() != clientId) {
        if (
          (checkClientWithSimilarChanges.clients[i].cfirstName == cfirstName &&
            checkClientWithSimilarChanges.clients[i].clastName == clastName) ||
          checkClientWithSimilarChanges.clients[i].email == email
        ) {
          throw "Error: FirstName and LastName can't be same as other client or email can't be same as other client";
        }
      }
    }
    // checking whether updated details are same previous details
    for (let i = 0; i < checkClientWithSimilarChanges.clients.length; i++) {
      if (checkClientWithSimilarChanges.clients[i]._id.toString() == clientId) {
        if (
          checkClientWithSimilarChanges.clients[i].cfirstName == cfirstName &&
          checkClientWithSimilarChanges.clients[i].clastName == clastName &&
          checkClientWithSimilarChanges.clients[i].email == email &&
          checkClientWithSimilarChanges.clients[i].gender == gender
        ) {
          throw "Error: details are same as previous";
        }
      }
    }

    let updatedInfo = await usersCollection.updateOne(
      { "clients._id": ObjectId(clientId) },
      {
        $set: {
          "clients.$.cfirstName": cfirstName,
          "clients.$.clastName": clastName,
          "clients.$.gender": gender,
          "clients.$.email": email,
        },
      }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw "could not update client";
    }

    // update client information in project collections
    const projectsCollection = await projects();
    let updatedInfo2 = await projectsCollection.updateMany(
      { clientId: clientId },
      {
        $set: {
          clientName: cfirstName + " " + clastName,
        },
      }
    );
  } else {
    throw "error: no user with that ID";
  }
};
// get client by Id
const getClientById = async (userId, clientId) => {
  userId = helpers_client.checkInputIsObjectId(userId);
  clientId = helpers_client.checkInputIsObjectId(clientId);

  const userCollection = await users();
  const getUser = await userFunctions.getUserByID(userId);
  if (getUser) {
    const getClient = await userCollection.findOne({
      $and: [{ _id: ObjectId(userId) }, { "clients._id": ObjectId(clientId) }],
    });
    if (!getClient) {
      throw "Error: no client with that Id";
    } else {
      for (let i = 0; i < getClient.clients.length; i++) {
        if (getClient.clients[i]._id == clientId) {
          return getClient.clients[i];
        }
      }
    }
  } else {
    throw "Error: no user with the Id";
  }
};
const getClientIdByName = async (userId, clientName) => {
  clientName = helpers_client.checkInputIsString(clientName);
  let splitName = clientName.split(" ");
  let cfirstName = splitName[0];
  let clastName = splitName[1];

  const usersCollection = await users();
  // check whether user is present
  let userDetails = await userFunctions.getUserByID(userId);

  userDetails = await usersCollection.findOne({
    $and: [
      { _id: ObjectId(userId) },
      { "clients.cfirstName": cfirstName },
      { "clients.clastName": clastName },
    ],
  });
  if (!userDetails) throw "no client with that name";
  for (let i = 0; i < userDetails.clients.length; i++) {
    if (
      userDetails.clients[i].cfirstName == cfirstName &&
      userDetails.clients[i].clastName == clastName
    ) {
      return userDetails.clients[i]._id.toString();
    }
  }
};
module.exports = {
  createClient: createClient,
  removeClient: removeClient,
  getAllClient: getAllClient,
  updateClient: updateClient,
  getClientById: getClientById,
};
