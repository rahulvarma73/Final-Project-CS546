const users = require("./users");

const constructorMethod = app => {
  app.use("/", users);

  app.use("*", (req, res) => {
    res.status(404).render('error',{message: "Page not found!", title: "404 Error"})
  });
};

module.exports = constructorMethod;