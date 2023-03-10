const express = require("express");
const router = express.Router();
const data = require("../data");
const helpers1 = require("../helpers1");
const userData = data.userData;
const clientData = data.clientData;
const projectData = data.projectData;
const validation = helpers1;
const xss = require('xss');

router
  .route("/create")
  .get(async (req, res) => {
    try {
      if (!req.session.user)
        return res.render("users/userLogin", { title: "Login" });
      let email = helpers1.validuseremail(req.session.user);
      const user = await userData.getUserByEmail(email);
      var userId = user._id;
      const allClients = await clientData.getAllClient(userId);
      let x = false;
      if (!allClients.length) {
        x = true;
      }
      return res.render("projects/createProject", {
        title: "Create Project",
        clients: allClients,
        x: x,
        userId: userId,
      });
    } catch (e) {
      return res.status(500).render("error", {
        message: "internal Server error",
        title: "Error",
      });
    }
  })
  .post(async (req, res) => {
    try {
      if (!req.session.user)
        return res.render("users/userLogin", { title: "Login" });
      var user = await userData.getUserByEmail(req.session.user);
      var user_Id = user._id;
      var projectName = xss(req.body.projectName);
      var projectDescription = xss(req.body.projectDescription);
      var clientName = xss(req.body.clientName);
      var allClients = await clientData.getAllClient(user_Id);
      projectName = helpers1.pname(projectName);
      projectDescription = helpers1.checkInputIsString(projectDescription);
      clientName = helpers1.checkInputIsString(clientName);
      let email = helpers1.validuseremail(req.session.user);

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
      userId: req.params.userId,
    });
  } catch (e) {
    return res.status(404).render("error", {
      message: "Page not found",
      title: "Error",
    });
  }
});

//  get project by Id
router.route("/project/:projectId").get(async (req, res) => {
  try {
    if (!req.session.user) {
      return res.render("users/userLogin", { title: "Login" });
    }
    let user = await userData.getUserByEmail(req.session.user);
    var userId = user._id;
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
      userId: userId,
    });
  } catch (e) {
    return res.status(404).render("error", {
      message: "Page not found",
      title: "Error",
    });
  }
});

router.route("/delete/:projectId").get(async (req, res) => {
  try {
    if (!req.session.user) {
      return res.render("users/userLogin", { title: "Login" });
    }
    let user = await userData.getUserByEmail(req.session.user);
    var userId = user._id;
    //   router validation
    req.params.projectId = validation.checkInputIsObjectId(
      req.params.projectId
    );

    const project = await projectData.getProjectById(req.params.projectId);

    return res.render("projects/deleteProject", {
      title: "Delete Project",
      pname: project.projectName,
      projectId: req.params.projectId,
      userId: userId,
    });
  } catch (e) {
    return res.status(404).render("error", {
      message: "Page not found",
      title: "Error",
    });
  }
});
router.route("/delete/:projectId").post(async (req, res) => {
  try {
    // if not logged in send him to login page
    if (!req.session.user) {
      return res.render("users/userLogin", { title: "Login" });
    }
    const user = await userData.getUserByEmail(req.session.user);
    var userId = user._id;
    //   router validation
    req.params.projectId = validation.checkInputIsObjectId(
      req.params.projectId
    );

    const project = await projectData.getProjectById(req.params.projectId);

    const allClients = await projectData.deleteProject(req.params.projectId);

    // redirect to  AllClients page
    return res.redirect("/projects/" + userId);
  } catch (e) {
    return res.status(404).render("error", {
      message: "Page not found",
      title: "Error",
    });
  }
});

// edit project details
// edit project details
router.route("/project/:projectId/edit").get(async (req, res) => {
  try {
    if (!req.session.user)
      return res.render("users/userLogin", { title: "Login" });
    const user = await userData.getUserByEmail(req.session.user);
    var user_Id = user._id;
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
        clients.splice(i, 1);
        clients.unshift(temp);
        break;
      }
    }
    // no two projects will have same name
    return res.render("projects/updateProject", {
      title: "project Details",
      pname: project.projectName,
      pdescription: project.projectDescription,
      clients: clients,
      sDate: project.startDate,
      eDate: project.endDate,
      totalDuration: project.totalDuration,
      projectId: req.params.projectId,
      userId: user_Id,
    });
  } catch (error) {
    return res.status(404).render("error", {
      message: "Page not found",
      title: "Error",
    });
  }
});
router.route("/project/:projectId/edit").post(async (req, res) => {
  //code here for POST
  try {
    if (!req.session.user)
      return res.render("users/userLogin", { title: "Login" });
    const user = await userData.getUserByEmail(req.session.user);
    var user_Id = user._id;
    req.params.projectId = helpers1.checkInputIsObjectId(req.params.projectId);
    const project = await projectData.getProjectById(req.params.projectId);
    var projectName = xss(req.body.projectName);
    var projectDescription = xss(req.body.projectDescription);
    var clientName = xss(req.body.clientName);
    var startDate = project.startDate;
    var endDate = project.endDate;
    var totalDuration = project.totalDuration;
    var clients = await clientData.getAllClient(user_Id);
    projectName = helpers1.pname(projectName);
    projectDescription = helpers1.checkInputIsString(projectDescription);
    clientName = helpers1.checkInputIsString(clientName);

    await projectData.updateProject(
      user_Id,
      req.params.projectId,
      projectName,
      projectDescription,
      clientName
    );
    return res.redirect("/projects/project/" + req.params.projectId);
  } catch (error) {
    return res.status(400).render("projects/updateProject", {
      pname: projectName,
      pdescription: projectDescription,
      clients: clients,
      sDate: startDate,
      eDate: endDate,
      totalDuration: totalDuration,
      error: error,
      projectId: req.params.projectId,
      userId: user_Id,
    });
  }
});

router.route("/project/:projectId/complete").get(async (req, res) => {
  try {
    if (!req.session.user) {
      return res.render("users/userLogin", { title: "Login" });
    }
    let user = await userData.getUserByEmail(req.session.user);
    var userId = user._id;
    //   router validation
    req.params.projectId = validation.checkInputIsObjectId(
      req.params.projectId
    );

    const project = await projectData.getProjectById(req.params.projectId);

    return res.render("projects/projectComplete", {
      title: "Project Complete",
      pname: project.projectName,
      projectId: req.params.projectId,
      userId: userId,
    });
  } catch (e) {
    return res.status(404).render("error", {
      message: "Page not found",
      title: "Error",
    });
  }
});

router.route("/project/:projectId/complete").post(async (req, res) => {
  try {
    // if not logged in send him to login page
    if (!req.session.user) {
      return res.render("users/userLogin", { title: "Login" });
    }
    const user = await userData.getUserByEmail(req.session.user);
    let userId = user._id;
    //   router validation
    req.params.projectId = validation.checkInputIsObjectId(
      req.params.projectId
    );

    const project = await projectData.getProjectById(req.params.projectId);

    let updateEndDate = await projectData.setEndDate(req.params.projectId);

    // redirect to  AllClients page
    return res.redirect("/");
  } catch (e) {
    return res.status(404).render("error", {
      message: "Page not found",
      title: "Error",
    });
  }
});

module.exports = router;
