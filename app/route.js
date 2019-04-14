const userAction = require("./action/UserAction");

module.exports = function(app) {
  app.post("/register", userAction.create);
  app.post("/login", userAction.login);
};
