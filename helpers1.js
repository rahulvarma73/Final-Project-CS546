const { ObjectId } = require("mongodb");
function pname(name) {
  if (!name) throw "Error: name can't be empty";
  if (typeof name != "string") throw "Error: name should be string";
  name = name.trim();
  if (!name) throw "Error: name can't be just spaces";
  if (name.length < 3) throw "Error: name should be atleast 3 characters";
  for (let i = 0; i < name.length; i++) {
    if (
      (name.charCodeAt(i) >= 65 && name.charCodeAt(i) <= 90) ||
      (name.charCodeAt(i) >= 97 && name.charCodeAt(i) <= 122) ||
      (name.charCodeAt(i) >= 48 && name.charCodeAt(i) <= 57) ||
      name.charCodeAt(i) == 32
    ) {
    } else {
      throw "Error: only characters are allowed(A-Z and a-z and 0 - 9)";
    }
  }
  return name.toLowerCase();
}
function name(name) {
  if (!name) throw "Error: name can't be empty";
  if (typeof name != "string") throw "Error: name should be string";
  name = name.trim();
  if (!name) throw "Error: name can't be just spaces";
  if (name.length < 3) throw "Error: name should be atleast 3 characters";
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
// Function checks whether input is valid String or Not
function checkInputIsString(str) {
  if (!str) throw "Error: string should not be empty";
  //   check whether the input is string or not
  if (typeof str != "string") throw "Error: Input should be string";
  //   trim() function removes spaces at the ends
  str = str.trim();
  if (!str) throw "Error: string entered is just spaces";
  return str;
}

// Function checks whether input is valid ObjectId or Not
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

// gets current date
function getDate() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  today = mm + "/" + dd + "/" + yyyy;
  return today;
}

const validuseremail = (user) => {
  if (!user) throw "400Email is not provided!";
  user = user.trim();
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(user))
    throw "400You have entered an invalid email address!";
  return user.toLowerCase();
};

module.exports = {
  checkInputIsString: checkInputIsString,
  checkInputIsObjectId: checkInputIsObjectId,
  getDate: getDate,
  name: name,
  pname: pname,
  validuseremail: validuseremail,
};
