const idCheck = (id) => {
  
  if (!id) {
    throw "Id should not be empty";
  }

  if (typeof id !== "string") {
    throw " id is not string type";
  }

  if (id.trim() === "") {
    throw "id can not have blank spaces";
  }

  //   console.log("idCheck Ran successfully");
  //    for testing

  //   return true;
};

const stringCheck = (prop, str) => {
  if (!str) {
    console.log(typeof str);
    throw `${prop} input is Empty`;
  }

  if (typeof str != "string") {
    throw `${prop} input is not string type`;
  }

  if (str.trim() === "") {
    throw `${prop} input cannot be Empty spaces`;
  }

  //   console.log("String Check Ran successfully");
  //    for testing
};
module.exports = {
  idCheck,
  stringCheck,
};
