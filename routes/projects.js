const express = require("express");
const router = express.Router();
const data = require("../data");
const helpers1 = require("../helpers1");
const userData = data.userData;
const clientData = data.clientData;
const projectData = data.projectData;
const validation = helpers1;

router
  .route("/create")
  .get(async (req, res) => {
    try {
      if (!req.session.user)
        return res.render("users/userLogin", { title: "Login" });
      let email = helpers1.validuseremail(req.session.user);
      const user = await userData.getUserByEmail(email);
      const user_Id = user._id;
      const allClients = await clientData.getAllClient(user_Id);
      let x = false;
      if (!allClients.length) {
        x = true;
      }
      return res.render("projects/createProject", {
        title: "Create Project",
        clients: allClients,
        x: x,
        userId: user_Id,
      });
    } catch (e) {}//<<<<<<<<<<<<<<< wHY emPTY atleast console log???????????????????????????????????????????????/
  })
  .post(async (req, res) => {
    try {
      if (!req.session.user)
        return res.render("users/userLogin", { title: "Login" });

      var projectName = req.body.projectName;
      var projectDescription = req.body.projectDescription;
      var clientName = req.body.clientName;
      projectName = helpers1.pname(projectName);
      projectDescription = helpers1.checkInputIsString(projectDescription);
      clientName = helpers1.checkInputIsString(clientName);
      let email = helpers1.validuseremail(req.session.user);
      var user = await userData.getUserByEmail(email);
      var user_Id = user._id;
      var allClients = await clientData.getAllClient(user_Id);
      await projectData.createProject(
        user._id,
        projectName,
        projectDescription,
        clientName
      );
     //   All projects
     return res.redirect("/projects/" + user_Id);
    } catch (error) {
      return res.status(400).render("projects/createProject", {
        title: "Create Project",
        pname: projectName,
        pdescription: projectDescription,
        clients: allClients,
        error: error,
        userId: user_Id,
        //<<<<<<<<<<< You need to get all clients list and send it again or select input will be empty!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //>>>>>>>> AND CHECK YOUR OTHER STATEMENTS TOOOOOOOO!!!!!! ESPECIALLY TRY CATCH, CONSOLE LOG ERRORS, SOME WERE LEFT OUT EMPTY IN CATCH(){} <<<<<<<<<<<<
      });
    }
  });

//   get all projects of user
router.route("/:userId").get(async (req, res) => {
  try {
    // if not logged in send him to login page
    if (!req.session.user) {
      return res.render("users/userLogin", { title: "Login" });
    }
    //   router validation
    validation.checkInputIsObjectId(req.params.userId);

    const allProjects = await projectData.getAllProjects(req.params.userId);
    // checking whether there are clients or not
    let x = false;
    if (!allProjects.length) {
      x = true;
    }
    // render HTML handlebar
    return res.render("projects/allProjects", {
      title: "All projects",
      projects: allProjects,
      x: x,
    });
  } catch (e) {
    // redirect to error page
  }
});

//  get project by Id
router.route("/project/:projectId").get(async (req, res) => {
  try {
    if (!req.session.user) {
      return res.render("users/userLogin", { title: "Login" });
    }
    //   router validation
    req.params.projectId = validation.checkInputIsObjectId(
      req.params.projectId
    );
    // get project by project ID
    const project = await projectData.getProjectById(req.params.projectId);
    // render HTML handlebar
    return res.render("projects/projectData", {
      title: "project Details",
      pname: project.projectName,
      pdescription: project.projectDescription,
      clientName: project.clientName,
      sDate: project.startDate,
      eDate: project.endDate,
      totalDuration: project.totalDuration,
      projectId: req.params.projectId,
    });
  } catch (e) {
    console.log(e);
  }
});

router.route("/delete/:projectId").get(async (req, res) => {
  try {
    if (!req.session.user) {
      return res.render("users/userLogin", { title: "Login" });
    }
    //   router validation
    req.params.projectId = validation.checkInputIsObjectId(
      req.params.projectId
    );

    const project = await projectData.getProjectById(req.params.projectId);

    return res.render("projects/deleteProject", {
      title: "Delete Project",
      pname: project.projectName,
      projectId: req.params.projectId,
    });
  } catch (e) {}
});
router.route("/delete/:projectId").post(async (req, res) => {
  try {
    // if not logged in send him to login page
    if (!req.session.user) {
      return res.render("users/userLogin", { title: "Login" });
    }
    //   router validation
    req.params.projectId = validation.checkInputIsObjectId(
      req.params.projectId
    );

    const user = await userData.getUserByEmail(req.session.user);
    let userId = user._id;
    const project = await projectData.getProjectById(req.params.projectId);

    const allClients = await projectData.deleteProject(req.params.projectId);

    // redirect to  AllClients page
    return res.redirect("/projects/" + userId);
  } catch (e) {
    // redirect to error page
  }
});

// edit project details
router.route("/project/:projectId/edit").get(async (req, res) => {
  try {
    if (!req.session.user)
      return res.render("users/userLogin", { title: "Login" });
    const user = await userData.getUserByEmail(req.session.user);
    const user_Id = user._id;
    // validation
    req.params.projectId = validation.checkInputIsObjectId(
      req.params.projectId
    );
    const project = await projectData.getProjectById(req.params.projectId);
    let clientName = project.clientName;
    const clients = await clientData.getAllClient(user_Id);
    let temp = {};
    for (let i = 0; i < clients.length; i++) {
      let name = clients[i].cfirstName + " " + clients[i].clastName;
      if (name == clientName) {
        temp = clients[i];
        clients.pop(clients[i]);
        clients.unshift(temp);
      }
    }

    return res.render("projects/updateProject", {
      title: "project Details",
      pname: project.projectName,
      pdescription: project.projectDescription,
      clients: clients,
      sDate: project.startDate,
      eDate: project.endDate,
      totalDuration: project.totalDuration,
      projectId: req.params.projectId,
    });
  } catch (error) {  
// router
//   .route('/:id') // <<<<<<<<<<<<<<<<<<<<<< I CREATED A ROUTER TO VIEW DETAILS OF COMPLETE PROJECT, geT
//   .get(async (req,res) => {
//     try{
//       // NOt COMPLETE DO VALIDATION OF ID AND HANDLE ERRORS, TESTING NEEDED!!!!!!!!!!!!
//       if (!req.session.user) {return res.render("users/userLogin", { title: "Login" });}
//       const pdata = await projectData.getProjectById(req.params.id);
//       return res.render("/projects/viewProject", {
//         pdata: pdata
//       })

//     }catch(error){
      console.error(error);
      return res
        .status(500)
        .render("error", { message: error.message || error, title: "Error" });      
    }
    //id is project id don't be confused. Use helpers Validation as reference if needed! <<<<<<<<<<<<<<<<<<<<<<<<<<<,,,,,
  // })
  // .post(async (req,res) => {
  //   return res.render("/projects/updateProject", {
  //     pdata: pdata //<<<<<<<< Updata variables accordingly after looking at updateProject.handleabar
  //   })
  // });//  <<<<<<<<<<<<<<<<<<<An UPdate project also needed!!>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
});
router.route("/project/:projectId/edit").post(async (req, res) => {
  //code here for POST
  try {
    if (!req.session.user)
      return res.render("users/userLogin", { title: "Login" });
    const user = await userData.getUserByEmail(req.session.user);
    const user_Id = user._id;
    req.params.projectId = helpers1.checkInputIsObjectId(req.params.projectId);
    var projectName = req.body.projectName;
    var projectDescription = req.body.projectDescription;
    var clientName = req.body.clientName;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var totalDuration = req.body.totalDuration;
    projectName = helpers1.pname(projectName);
    projectDescription = helpers1.checkInputIsString(projectDescription);
    clientName = helpers1.checkInputIsString(clientName);
    var clients = await clientData.getAllClient(user_Id);
    await projectData.updateProject(
      user_Id,
      req.params.projectId,
      projectName,
      projectDescription,
      clientName
    );
    return res.redirect("/projects/project/" + req.params.projectId);
  } catch (error) {
    return res.status(400).render("clients/clientprofileEdit", {
      pname: projectName,
      pdescription: projectDescription,
      clients: clients,
      startDate: startDate,
      endDate: endDate,
      totalDuration: totalDuration,
    });
  }
});

module.exports = router;
