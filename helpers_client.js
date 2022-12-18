const { ObjectId } = require("mongodb");

function name(name) {
  if (!name) throw "Error: name can't be empty";
  if (typeof name != "string") throw "Error: name should be string";
  name = name.trim();
  if (!name) throw "Error: name can't be just spaces";

  for (let i = 0; i < name.length; i++) {
    if (
      (name.charCodeAt(i) >= 65 && name.charCodeAt(i) <= 90) ||
      (name.charCodeAt(i) >= 97 && name.charCodeAt(i) <= 122) ||
      name.charCodeAt(i) == 32
    ) {
    } else {
      throw "Error: only characters are allowed(A-Z and a-z)";
    }
  }
  return name.toLowerCase();
}

const validuseremail = (email) => {
  if (!email) throw "400Email is not provided!";
  email = email.trim();
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
    throw "400You have entered an invalid email address!";
  return email.toLowerCase();
};

function checkInputIsObjectId(str) {
  if (!str) throw "Error: string should not be empty";
  //   check whether the input is string or not
  if (typeof str != "string") throw "Error: Input should be string";
  //   trim() function removes spaces at the ends
  str = str.trim();
  if (!str) throw "Error: string entered is just spaces";
  if (!ObjectId.isValid(str)) throw "invalid object ID";
  return str;
}

function checkInputIsString(str) {
  if (!str) throw "Error: string should not be empty";
  //   check whether the input is string or not
  if (typeof str != "string") throw "Error: Input should be string";
  //   trim() function removes spaces at the ends
  str = str.trim();
  if (!str) throw "Error: string entered is just spaces";
  return str;
}

module.exports = {
  name: name,
  validuseremail: validuseremail,
  checkInputIsObjectId: checkInputIsObjectId,
  checkInputIsString: checkInputIsString,
};
