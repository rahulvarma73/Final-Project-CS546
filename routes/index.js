const users = require("./users");
const clientRoutes = require("./clients");
const projectRoutes = require("./projects");
const taskRoutes = require("./tasks");

const constructorMethod = (app) => {
  app.use("/", users);
  app.use("/clients", clientRoutes);
  app.use("/projects", projectRoutes);
  app.use("/tasks", taskRoutes);

  app.use("*", (req, res) => {
    res
      .status(404)
      .render("error", { message: "Page not found!", title: "404 Error" });
  });
};

module.exports = constructorMethod;
