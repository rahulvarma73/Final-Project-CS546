const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const static = express.static(__dirname + "/public");

const configRoutes = require("./routes");

const exphbs = require("express-handlebars");

const Handlebars = require("handlebars");

const session = require("express-session");

app.use(
  session({
    name: "AuthCookie",
    secret: "some secret string!",
    resave: false,
    saveUninitialized: true,
  })
);

// // 4. One which will deny all users access to the /admin path.
// app.use("/admin", function(request, response, next) {
//     // If we had a user system, we could check to see if we could access /admin

//     console.log(
//       "Someone is trying to get access to /admin! We're stopping them!"
//     );
//     response.status(403).send("You cannot access /admin");
//   });

app.use("/home", (req, res, next) => {
  if (req.method === "GET" && !req.session.user) {
    return res
      .status(403)
      .render("error", { message: "user is not logged in", title: "Error" });
  }
  next();
});

app.use((req, res, next) => {
  let auth = "";
  if (!req.session.user) {
    auth = "Non-";
  }
  console.log(
    `[${new Date().toUTCString()}]: ${req.method} ${
      req.originalUrl
    } (${auth}Authenticated User)`
  );
  next();
});

const handlebarsInstance = exphbs.create({
  defaultLayout: "main",
  // Specify helpers which are only registered on this instance.
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === "number")
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

      return new Handlebars.SafeString(JSON.stringify(obj));
    },
  },
});

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};

app.use("/public", static);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

app.engine("handlebars", handlebarsInstance.engine);
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});

//testing
// try {
//   const userData = require('./data/users')

//   userData.createUser("User","One","User1@gmail.com","Male","Hello1!")

// } catch (error) {
//   console.error(error);

// }
