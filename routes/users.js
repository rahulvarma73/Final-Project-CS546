//require express, express router and bcrypt as shown in lecture code
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const data = require("../data");
const { userData, projectData } = require("../data");
const { checkUser } = require("../data/users");
const { getAllProjects } = require("../data/projects");
const { getAllProjectsBasedOnSearch } = require("../data/projects");
const dataUsers = data.userData;
const helpers1 = require("../helpers1");

router.route("/").get(async (req, res) => {
  //code here for GET
  try {
    if (!req.session.user)
      return res.render("users/userLogin", { title: "Login" });
    return res.redirect("/home");
  } catch (error) {
    res.render("error", { message: error.message || error, title: "Error" });
  }
});

router
  .route("/register")
  .get(async (req, res) => {
    //code here for GET
    try {
      if (req.session.user) return res.redirect("/home");
      return res.render("users/userRegister", { title: "Sign-Up" });
    } catch (error) {
      res.render("error", { message: error.message || error, title: "Error" });
    }
  })
  .post(async (req, res) => {
    //code here for POST
    try {
      let result = await dataUsers.createUser(
        req.body.userFirstName,
        req.body.userLastName,
        req.body.userEmail,
        req.body.userGender,
        req.body.passwordInput
      );
      if (result.insertedUser) {
        return res.redirect("/");
      }
      return res
        .status(500)
        .render("error", { message: "Internal Server Error", title: "Error" });
    } catch (error) {
      error = error.message || error;
      if (error.startsWith("400")) {
        return res.status(400).render("users/userRegister", {
          error: error.substring(3),
          title: "Sign-Up",
        });
      }
      return res.render("error", { message: error, title: "Error" });
    }
  });

router.route("/login").post(async (req, res) => {
  //code here for POST
  try {
    const result = await dataUsers.checkUser(
      req.body.userEmail,
      req.body.passwordInput
    );
    if (result.authenticatedUser) {
      req.session.user = req.body.userEmail.toLowerCase().trim();
      const user = await userData.getUserByEmail(req.session.user);
      req.session.userId = user._id;
      console.log(user._id, req.session.userId);
      return res.redirect("/home");
    }
  } catch (error) {
    error = error.message || error;
    if (error.startsWith("400")) {
      return res.status(400).render("users/userLogin", {
        error: error.substring(3),
        title: "Login",
      });
    }
    return res.render("error", { message: error, title: "Error" });
  }
});

router.route("/home").get(async (req, res) => {
  //code here for GET
  if (req.session.user) {
    let user = await userData.getUserByEmail(req.session.user);
    let pdata = false;
    try {
      pdata = await getAllProjects(user._id);
      if (pdata.length === 0) {
        pdata = false;
      }
    } catch (error) {
      console.log(error.message || error);
    }

    return res.render("home", {
      title: "Home",
      user: req.session.user,
      date: new Date().toUTCString(),
      userId: user._id,
      pdata: pdata,
    });
  }

  return res
    .status(400)
    .render("error", { message: "User not logged in!", title: "Error" });
});
router.route("/home").post(async (req, res) => {
  //code here for GET
  if (req.session.user) {
    let user = await userData.getUserByEmail(req.session.user);
    let pdata = false;
    try {
      if (!req.body.searchInput) {
        pdata = await getAllProjects(user._id);
        if (pdata.length === 0) {
          pdata = false;
        }
      } else {
        pdata = await getAllProjectsBasedOnSearch(
          user._id,
          req.body.searchInput
        );
        if (pdata.length === 0) {
          pdata = false;
        }
      }
    } catch (error) {
      console.log(error.message || error);
    }

    return res.render("home", {
      title: "Home",
      user: req.session.user,
      date: new Date().toUTCString(),
      userId: user._id,
      pdata: pdata,
      searchInput: req.body.searchInput,
    });
  }

  return res
    .status(400)
    .render("error", { message: "User not logged in!", title: "Error" });
});

router.route("/user/profile").get(async (req, res) => {
  try {
    if (!req.session.user)
      return res.render("users/userLogin", { title: "Login" });
    const user = await userData.getUserByEmail(req.session.user);
    return res.render("users/userprofile", {
      title: "My Details",
      fname: user.userFirstName,
      lname: user.userLastName,
      email: user.email,
      gender: user.gender,
      userId: req.session.userId,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .render("error", { message: error.message || error, title: "Error" });
  }
});

router
  .route("/user/profile/edit")
  .get(async (req, res) => {
    try {
      if (!req.session.user)
        return res.render("users/userLogin", { title: "Login" });
      const user = await userData.getUserByEmail(req.session.user);
      return res.render("users/userprofileEdit", {
        title: "My Details",
        fname: user.userFirstName.toString(),
        lname: user.userLastName.toString(),
        email: user.email,
        userId: req.session.userId,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .render("error", { message: error.message || error, title: "Error" });
    }
  })
  .post(async (req, res) => {
    //code here for POST
    let user = {};
    try {
      if (!req.session.user)
        return res.render("users/userLogin", { title: "Login" });
      user = await userData.getUserByEmail(req.session.user);
      await dataUsers.updateUserByID(
        user._id,
        req.body.userFirstName,
        req.body.userLastName,
        req.body.userGender,
        req.body.passwordInput
      );
      return res.redirect("/user/profile");
    } catch (error) {
      error = error.message || error;
      if (error.startsWith("400")) {
        return res.status(400).render("users/userprofileEdit", {
          title: "My Details",
          fname: user.userFirstName.toString(),
          lname: user.userLastName.toString(),
          email: user.email,
          error: error.substring(3),
          userId: req.session.userId,
        });
      }
      return res.render("error", { message: error, title: "Error" });
    }
  });

router
  .route("/user/delete")
  .get(async (req, res) => {
    if (!req.session.user)
      return res.render("users/userLogin", { title: "Login" });
    return res.render("users/userDelete", {
      title: "Account Deletion",
      email: req.session.user,
      userId: req.session.userId,
    });
  })
  .post(async (req, res) => {
    try {
      if (!req.session.user)
        return res.render("users/userLogin", { title: "Login" });
      const result = await dataUsers.checkUser(
        req.session.user,
        req.body.passwordInput
      );
      if (result.authenticatedUser) {
        const user = await userData.getUserByEmail(req.session.user);
        await userData.deleteUserByID(user._id);

        req.session.destroy();
        return res.render("users/logout", {
          message:
            "We're sorry to see you go, hope you come back soon. \nAccount deleted and logged out!",
          title: "Deleted!",
        });
      }
    } catch (error) {
      error = error.message || error;
      if (error.startsWith("400")) {
        return res.status(400).render("users/userDelete", {
          title: "Account Deletion",
          email: req.session.user,
          error: error.substring(3),
          userId: req.session.userId,
        });
      }
      return res.render("error", { message: error, title: "Error" });
    }
  });

router.route("/logout").get(async (req, res) => {
  //code here for GET
  req.session.destroy();
  return res.render("users/logout", {
    message: "Logged out!",
    title: "Logged out",
  });
});

router.route("/statistics").get(async (req, res) => {
  try {
    if (!req.session.user)
      return res.render("users/userLogin", { title: "Login" });
    let email = helpers1.validuseremail(req.session.user);
    const user = await userData.getUserByEmail(email);
    var userId = user._id;
    userId = helpers1.checkInputIsObjectId(userId);
    let allProjects = await projectData.getAllProjects(userId);
    let projectsArray = [];
    let durationArray = [];
    let x = false;
    if (!allProjects.length) {
      x = true;
    } else {
      for (let i = 0; i < allProjects.length; i++) {
        projectsArray.push(allProjects[i].projectName);
        durationArray.push(allProjects[i].totalDuration);
      }
      for (let i = 0; i < durationArray.length; i++) {
        let index = durationArray[i].indexOf(" ");
        let numberStr = durationArray[i].substr(0, index);
        let number = parseFloat(numberStr);
        durationArray[i] = number;
      }
      let minValue = Math.min(...durationArray);
      let maxValue = Math.max(...durationArray);
      let minProject = projectsArray[durationArray.indexOf(minValue)];
      let maxProject = projectsArray[durationArray.indexOf(maxValue)];
      return res.render("statistics", {
        title: "Statistics Page",
        projectsArray: projectsArray,
        durationArray: durationArray,
        maxProject: maxProject,
        minProject: minProject,
        x: x,
      });
    }
  } catch (e) {
    return res.status(404).render("error", {
      message: "Page not found",
      title: "Error",
    });
  }
});

module.exports = router;
