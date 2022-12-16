const mongoCollections = require("../config/mongoCollections");
const projects = mongoCollections.projects;
const userFunctions = require("./users");
const clientFunctions = require("./clients");
const users = mongoCollections.users;
const { ObjectId } = require("mongodb");
const helpers1 = require("../helpers1");
const helpers = require('../helpers');
const validname = helpers.validname;

const createProject = async (
  userId,
  projectName,
  projectDescription,
  clientName
) => {
  // userId = helpers1.name(userId);  <<<<<<Check Need to validate ids
  // projectName = helpers1.name(projectName);   <<<<<< CHeck Names should allow spaces for project names also numbers
  // // projectName = helpers1.name(projectName);

  // projectDescription = helpers1.name(projectDescription); <<<<<<Check all texts must be allowed!!!!!!!!!!!!!!!!!
  // projectDescription = validname(projectDescription);

    // >>>>>>>>>>>>>>>write a function thats gets  clientId from users dataBase<<<<<<<<<<<<<<<<

  const usersCollection = await users();
  // check whether user is present
  let userDetails = await userFunctions.getUserByID(userId);
  if (userDetails) {
    var clientId = await getClientIdByName(userId, clientName);
  } else {
    throw "Error: no user with that Id";
  }

  //   get current date
  let startDate = helpers1.getDate();

  //   it gets updated when user finishes project
  let endDate = "MM/DD/YYYY(Project not Finished)";

  //   gets updated when user finishes tasks

  let totalDuration = "0";

  let tasks = [];

  const projectsCollection = await projects();

  let createProject = {
    projectName: projectName,
    projectDescription: projectDescription,
    clientName: clientName,
    clientId: clientId,
    startDate: startDate,
    endDate: endDate,
    totalDuration: totalDuration,
    tasks: tasks,
  };

  const insertProject = await projectsCollection.insertOne(createProject);

  if (insertProject.insertedCount == 0) throw "Error: Could not add Project";

  const newId = insertProject.insertedId.toString();

  // update the projectId in the client (projectIds array)

  let updatedInfo = await usersCollection.updateOne(
    { "clients._id": ObjectId(clientId) },
    { $push: { "clients.$.projectIds": newId } }
  );
  if (updatedInfo.modifiedCount === 0) {
    throw "could not update client";
  }

  const project = await getProjectById(newId);

  return project;
};

const getProjectById = async (id) => {
  // checking valid objectId or not
  id = helpers1.checkInputIsObjectId(id);

  const projectsCollection = await projects();

  const project = await projectsCollection.findOne({ _id: ObjectId(id) });

  if (project == null) throw "No project with that Id";

  project._id = project._id.toString();

  return project;
};
// should look at it
const updateProject = async (
  userId,
  projectId,
  projectName,
  projectDescription,
  clientName
) => {
  userId = helpers1.checkInputIsObjectId(userId);
  projectId = helpers1.checkInputIsObjectId(projectId);

  projectName = helpers1.checkInputIsString(projectName);

  projectDescription = helpers1.checkInputIsString(projectDescription);

  clientName = helpers1.checkInputIsString(clientName);

  const projectsCollection = await projects();

  const project = await projectsCollection.findOne({
    _id: ObjectId(projectId),
  });

  if (project == null) throw "No project with that id";

  if (
    project.projectName == projectName &&
    project.projectDescription == projectDescription &&
    project.clientName == clientName
  ) {
    throw `Updated Information is same as past information`;
  }
  if (project.clientName != clientName) {
    const usersCollection = await users();
    // remove projectId from previous clients projectIds []array  as name is changed
    var prevClientId = await getClientIdByName(userId, project.clientName);
    let updatedInfo = await usersCollection.updateOne(
      { "clients._id": ObjectId(prevClientId) },
      { $pull: { "clients.$.projectIds": projectId } }
    );

    // push projectid into clients projectIds []array
    var newClientId = await getClientIdByName(userId, clientName);
    let updatedInfo2 = await usersCollection.updateOne(
      { "clients._id": ObjectId(newClientId) },
      { $push: { "clients.$.projectIds": projectId } }
    );
  }
  //    if client name changes then have to update in the users collection where i have to assign this project Id to new client **************
  if (project.clientName != clientName) {
    const updateProject = {
      projectName: projectName,
      projectDescription: projectDescription,
      clientName: clientName,
      clientId: newClientId,
    };
    const updatedInfo3 = await projectsCollection.updateOne(
      { _id: ObjectId(projectId) },
      { $set: updateProject }
    );
    if (updatedInfo3.modifiedCount === 0) {
      throw "could not update the project";
    }
  } else {
    const updateProject = {
      projectName: projectName,
      projectDescription: projectDescription,
      clientName: clientName,
    };
    const updatedInfo4 = await projectsCollection.updateOne(
      { _id: ObjectId(projectId) },
      { $set: updateProject }
    );
    if (updatedInfo4.modifiedCount === 0) {
      throw "could not update the project";
    }
  }

  return await getProjectById(projectId);
};

const deleteProject = async (id) => {
  id = helpers1.checkInputIsObjectId(id);
  const usersCollection = await users();
  const projectsCollection = await projects();
  const project = await projectsCollection.findOne({ _id: ObjectId(id) });

  const deleteProject = await projectsCollection.deleteOne({
    _id: ObjectId(id),
  });

  if (deleteProject.deletedCount === 0) {
    throw `could not delete project with id : ${id}`;
  }

  let updatedInfo = await usersCollection.updateOne(
    { "clients._id": ObjectId(project.clientId) },
    { $pull: { "clients.$.projectIds": id } }
  );
  if (updatedInfo.modifiedCount === 0) {
    throw "could not update project";
  }

  return `${project.projectName} has been successfully deleted!`;
};
const getAllProjects = async (userId) => {
  userId = helpers1.checkInputIsObjectId(userId);

  let user = await userFunctions.getUserByID(userId);
  let allClients = await clientFunctions.getAllClient(user._id);
  let allProjectIds = [];
  for (let i = 0; i < allClients.length; i++) {
    for (let j = 0; j < allClients[i].projectIds.length; j++) {
      allProjectIds.push(allClients[i].projectIds[j]);
    }
  }
  let allProjects = [];
  for (let i = 0; i < allProjectIds.length; i++) {
    let project = await getProjectById(allProjectIds[i]);
    allProjects.push(project);
  }
  return allProjects;
};
// get All projects by client name (need client information)
// should look at it
const getAllProjectsOfClient = async (userId, clientName) => {
  userId = helpers1.checkInputIsString(userId);
  let userDetails = await userFunctions.getUserByID(userId);
  if (userDetails) {
    var clientId = await getClientIdByName(userId, clientName);
    const projectsCollection = await projects();
    let allProjects = await projectsCollection
      .find({ clientId: clientId })
      .toArray();
    return allProjects;
  } else {
    throw "Error: no user with that Id";
  }
};
// should look at it
// search by project name ( need client information)
const getProjectByName = async (userId, projectName) => {
  userId = helpers1.checkInputIsString(userId);
  // projectName = helpers1.pname(projectName);
  const projectsCollection = await projects();
  // check whether it exists or not
  var project = await projectsCollection
    .find({ projectName: projectName })
    .toArray();
  if (!project) throw "no project by that name";
};
// should look at it
const getClientIdByName = async (userId, clientName) => {
  clientName = helpers1.checkInputIsString(clientName);
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
  createProject: createProject,
  getProjectById: getProjectById,
  deleteProject: deleteProject,
  updateProject: updateProject,
  getAllProjectsOfClient: getAllProjectsOfClient,
  getProjectByName: getProjectByName,
  getAllProjects: getAllProjects,
};
