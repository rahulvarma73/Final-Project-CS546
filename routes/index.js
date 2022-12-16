const users = require("./users");
const clientRoutes = require("./clients");

const constructorMethod = (app) => {
  app.use("/", users);
  app.use("/clients", clientRoutes);

  app.use("*", (req, res) => {
    res
      .status(404)
      .render("error", { message: "Page not found!", title: "404 Error" });
  });
};

module.exports = constructorMethod;
