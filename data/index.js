const userData = require("./users");
const projectData = require("./projects");
const clientData = require("./clients");
const { Collection } = require("mongodb");

// async function main() {
//   try {
//     const ans = await projectData.getAllProjects("63893d40502d9fbbdd64b5b0");
//     // const ans = await clientData.removeClient(
//     //   "63893d40502d9fbbdd64b5b0",
//     //   "navven kumar"
//     // );
//     // const ans = await projectData.updateProject(
//     //   "63893d40502d9fbbdd64b5b0",
//     //   "638d19beb7a9b3c59bd98378",
//     //   "website3",
//     //   "website3 description",
//     //   "navven kumar"
//     // );
//     // const ans = await projectData.createProject(
//     //   "63893d40502d9fbbdd64b5b0",
//     //   "website5",
//     //   "website5 description",
//     //   "jithu kumar"
//     // );
//     // const ans = await projectData.deleteProject("638d022e04dd38010e18b605");
//     // const ans = await clientData.createClient(
//     //   "63893d40502d9fbbdd64b5b0",
//     //   "jithu",
//     //   "kumar",
//     //   "Male",
//     //   "jithu@gmail.com"
//     // );

//     // const ans = await clientData.getAllClient("63893eb6b4f12b308b0ebe13");
//     // // const ans = await clientData.createClient(
//     // //   "63893d40502d9fbbdd64b5b0",
//     // //   "rakesh",
//     // //   "varma",
//     // //   "Male",
//     // //   "rakesh12345@gmail.com"
//     // // );
//     // const ans = await clientData.updateClient(
//     //   "63893d40502d9fbbdd64b5b0",
//     //   "638a629b5196450b292b1dc8",
//     //   "jithu",
//     //   "kumar",
//     //   "Male"
//     // );
//     console.log(ans);
//   } catch (e) {
//     console.log(e);
//   }

//   // const ans = userData.createUser(
//   //   "abhi",
//   //   "reddy",
//   //   "abhireddy@gmail.com",
//   //   "Male",
//   //   "Abhireddy@2001"
//   // );
//   // const ans = await clientData.updateClient(
//   //   "63893f6a9be0be5dc4d6f56e",
//   //   "kallu",
//   //   "varma",
//   //   "Male"
//   // );
// }
// main();
module.exports = {
  userData: userData,
  projectData: projectData,
  clientData: clientData,
};
