const express = require("express");
const router = express.Router();
const data = require("../data");
const helpers1 = require("../helpers1");
const userData = data.userData;
const clientData = data.clientData;
const validation = helpers1;
const xss = require('xss');

// create clients
router
  .route("/create")
  .get(async (req, res) => {
    try {
      if (!req.session.user)
        return res.render("users/userLogin", { title: "Login" });

      let email = helpers1.validuseremail(req.session.user);
      const user = await userData.getUserByEmail(email);
      var user_Id = user._id;
      return res.render("clients/createClient", {
        title: "Create Client",
        userId: user_Id,
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
      var userId = user._id;
      // validation
      var clientFirstName = req.body.clientFirstName;

      var clientLastName = req.body.clientLastName;

      var clientEmail = req.body.clientEmail;

      var clientGender = req.body.clientGender;
      clientFirstName = helpers1.name(clientFirstName);
      clientLastName = helpers1.name(clientLastName);
      clientEmail = helpers1.validuseremail(clientEmail);

      await clientData.createClient(
        userId,
        clientFirstName,
        clientLastName,
        clientGender,
        clientEmail
      );
      return res.redirect("/clients/" + userId);
    } catch (error) {
      return res.status(400).render("clients/createClient", {
        title: "Create Client",
        fname: clientFirstName,
        lname: clientLastName,
        email: clientEmail,
        error: error,
        userId: userId,
      });
    }
  });

// delete client
router.route("/delete/:clientId").get(async (req, res) => {
  try {
    if (!req.session.user) {
      return res.render("users/userLogin", { title: "Login" });
    }
    //   router validation
    req.params.clientId = validation.checkInputIsObjectId(req.params.clientId);
    const user = await userData.getUserByEmail(req.session.user);
    var userId = user._id;
    const getClient = await clientData.getClientById(
      user._id,
      req.params.clientId
    );
    return res.render("clients/deleteClient", {
      title: "Delete Client",
      fname: getClient.cfirstName,
      lname: getClient.clastName,
      clientId: req.params.clientId,
      userId: userId,
    });
  } catch (e) {
    return res.status(404).render("error", {
      message: "Page not found",
      title: "Error",
    });
  }
});
router.route("/delete/:clientId").post(async (req, res) => {
  try {
    // if not logged in send him to login page
    if (!req.session.user) {
      return res.render("users/userLogin", { title: "Login" });
    }
    const user = await userData.getUserByEmail(req.session.user);
    var userId = user._id;
    //   router validation
    req.params.clientId = validation.checkInputIsObjectId(req.params.clientId);

    const allClients = await clientData.removeClient(
      userId,
      req.params.clientId
    );

    // redirect to  AllClients page
    return res.redirect("/clients/" + userId);
  } catch (e) {
    return res.status(404).render("error", {
      message: "Page not found",
      title: "Error",
    });
  }
});

// home page for clientData
// get all clients by UserId
router.route("/:userId").get(async (req, res) => {
  try {
    // if not logged in send him to login page
    if (!req.session.user) {
      return res.render("users/userLogin", { title: "Login" });
    }
    //   router validation
    req.params.userId = validation.checkInputIsObjectId(req.params.userId);
    var userId = req.params.userId;
    const allClients = await clientData.getAllClient(req.params.userId);

    // checking whether there are clients or not
    let x = false;
    if (!allClients.length) {
      x = true;
    }
    // render HTML handlebar
    return res.render("clients/allClients", {
      title: "All Clients",
      clients: allClients,
      x: x,
      userId: userId,
    });
  } catch (e) {
    return res.status(404).render("error", {
      message: "Page not found",
      title: "Error",
    });
  }
});

// get client details
router.route("/client/:clientId").get(async (req, res) => {
  try {
    if (!req.session.user) {
      return res.render("users/userLogin", { title: "Login" });
    }
    //   router validation
    req.params.clientId = validation.checkInputIsObjectId(req.params.clientId);
    // get userId by email
    const user = await userData.getUserByEmail(req.session.user);
    var user_Id = user._id;
    const getClient = await clientData.getClientById(
      user_Id,
      req.params.clientId
    );
    // render HTML handlebar
    return res.render("clients/clientProfile", {
      title: "Client Details",
      fname: getClient.cfirstName,
      lname: getClient.clastName,
      email: getClient.email,
      gender: getClient.gender,
      clientId: req.params.clientId,
      userId: user_Id,
    });
  } catch (e) {
    return res.status(404).render("error", {
      message: "Page not found",
      title: "Error",
    });
  }
});

// edit client details
router.route("/client/:clientId/edit").get(async (req, res) => {
  try {
    if (!req.session.user)
      return res.render("users/userLogin", { title: "Login" });
    const user = await userData.getUserByEmail(req.session.user);
    var userId = user._id;
    // validation
    req.params.clientId = validation.checkInputIsObjectId(req.params.clientId);
    const client = await clientData.getClientById(userId, req.params.clientId);
    let gender = [];
    if (client.gender == "Male") {
      gender.push("Male");
      gender.push("Female");
      gender.push("Others");
    } else if (client.gender == "Female") {
      gender.push("Female");
      gender.push("Male");
      gender.push("Others");
    } else {
      gender.push("Others");
      gender.push("Male");
      gender.push("Female");
    }

    return res.render("clients/clientprofileEdit", {
      title: "client Details",
      fname: client.cfirstName.toString(),
      lname: client.clastName.toString(),
      email: client.email,
      clientId: req.params.clientId,
      userId: userId,
      gender: gender,
    });
  } catch (error) {
    return res.status(404).render("error", {
      message: "Page not found",
      title: "Error",
    });
  }
});
router.route("/client/:clientId/edit").post(async (req, res) => {
  //code here for POST
  try {
    if (!req.session.user)
      return res.render("users/userLogin", { title: "Login" });
    const user = await userData.getUserByEmail(req.session.user);
    var userId = user._id;
    var clientGender = req.body.clientGender;
    var gender = [];
    if (clientGender == "Male") {
      gender.push("Male");
      gender.push("Female");
      gender.push("Others");
    } else if (clientGender == "Female") {
      gender.push("Female");
      gender.push("Male");
      gender.push("Others");
    } else {
      gender.push("Others");
      gender.push("Male");
      gender.push("Female");
    }

    var clientFirstName = xss(req.body.clientFirstName);
    var clientLastName = xss(req.body.clientLastName);
    var clientEmail = xss(req.body.clientEmail);

    clientEmail = helpers1.validuseremail(clientEmail);
    clientLastName = helpers1.name(clientLastName);
    clientFirstName = helpers1.name(clientFirstName);

    await clientData.updateClient(
      user._id,
      req.params.clientId,
      clientFirstName,
      clientLastName,
      clientEmail,
      clientGender
    );
    return res.redirect("/clients/client/" + req.params.clientId);
  } catch (error) {
    return res.status(400).render("clients/clientprofileEdit", {
      title: "Client Details",
      fname: clientFirstName,
      lname: clientLastName,
      email: clientEmail,
      gender: gender,
      error: error,
      clientId: req.params.clientId,
      userId: userId,
    });
  }
});

module.exports = router;
