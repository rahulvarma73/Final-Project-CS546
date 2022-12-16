const express = require("express");
const router = express.Router();
const data = require("../data");
const helpers1 = require("../helpers1");
const userData = data.userData;
const clientData = data.clientData;
const validation = helpers1;

// create clients
router
  .route("/create")
  .get(async (req, res) => {
    try {
      if (!req.session.user)
        return res.render("users/userLogin", { title: "Login" });

      let email = helpers1.validuseremail(req.session.user);
      const user = await userData.getUserByEmail(email);
      const user_Id = user._id;
      return res.render("clients/createClient", {
        title: "Create Client",
      });
    } catch (e) {}
  })
  .post(async (req, res) => {
    try {
      if (!req.session.user)
        return res.render("users/userLogin", { title: "Login" });
      // validation
      var clientFirstName = req.body.clientFirstName;

      var clientLastName = req.body.clientLastName;

      var clientEmail = req.body.clientEmail;

      var clientGender = req.body.clientGender;
      clientFirstName = helpers1.name(clientFirstName);
      clientLastName = helpers1.name(clientLastName);
      clientEmail = helpers1.validuseremail(clientEmail);
      var user = await userData.getUserByEmail(req.session.user);
      let userId = user._id;
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
    const getClient = await clientData.getClientById(
      user._id,
      req.params.clientId
    );
    return res.render("clients/deleteClient", {
      title: "Delete Client",
      fname: getClient.cfirstName,
      lname: getClient.clastName,
      clientId: req.params.clientId,
    });
  } catch (e) {}
});
router.route("/delete/:clientId").post(async (req, res) => {
  try {
    // if not logged in send him to login page
    if (!req.session.user) {
      return res.render("users/userLogin", { title: "Login" });
    }
    //   router validation
    req.params.clientId = validation.checkInputIsObjectId(req.params.clientId);
    const user = await userData.getUserByEmail(req.session.user);
    let userId = user._id;

    const allClients = await clientData.removeClient(
      userId,
      req.params.clientId
    );

    // redirect to  AllClients page
    return res.redirect("/clients/" + userId);
  } catch (e) {
    // redirect to error page
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
    });
  } catch (e) {
    // redirect to error page
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
    const user_Id = user._id;
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
    });
  } catch (e) {
    console.log(e);
  }
});

// edit client details
router.route("/client/:clientId/edit").get(async (req, res) => {
  try {
    if (!req.session.user)
      return res.render("users/userLogin", { title: "Login" });
    const user = await userData.getUserByEmail(req.session.user);
    const user_Id = user._id;
    // validation
    req.params.clientId = validation.checkInputIsObjectId(req.params.clientId);
    const client = await clientData.getClientById(user_Id, req.params.clientId);

    return res.render("clients/clientprofileEdit", {
      title: "client Details",
      fname: client.cfirstName.toString(),
      lname: client.clastName.toString(),
      email: client.email,
      clientId: req.params.clientId,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .render("error", { message: error.message || error, title: "Error" });
  }
});
router.route("/client/:clientId/edit").post(async (req, res) => {
  //code here for POST
  try {
    if (!req.session.user)
      return res.render("users/userLogin", { title: "Login" });

    var clientFirstName = req.body.clientFirstName;
    var clientLastName = req.body.clientLastName;
    var clientEmail = req.body.clientEmail;
    var clientGender = req.body.clientGender;
    clientEmail = helpers1.validuseremail(clientEmail);
    clientLastName = helpers1.name(clientLastName);
    clientFirstName = helpers1.name(clientFirstName);
    var user = await userData.getUserByEmail(req.session.user);

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
      error: error,
      clientId: req.params.clientId,
    });
  }
});

module.exports = router;
