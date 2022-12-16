const userData = require("./users");
const projectData = require("./projects");
const clientData = require("./clients");
const { Collection } = require("mongodb");

module.exports = {
  userData: userData,
  projectData: projectData,
  clientData: clientData,
};
