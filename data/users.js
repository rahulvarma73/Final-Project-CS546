const mongoCollections = require("../config/mongoCollections");
const user_collection = mongoCollections.users;
const check = require('../helpers')
const bcrypt = require('bcryptjs');
const { ObjectId } = require("mongodb");

const createUser = async (firstName, lastName, user, gender, password) => {
    firstName = check.validname(firstName)
    lastName = check.validname(lastName)
    user = check.validuseremail(user)
    if (!(gender === "Male" || gender === "Female" || gender === "Others")) throw `400Invalid gender input!`
    password = check.validpassword(password)
  


  const users = await user_collection();
  const dup = await users.findOne({email: user.toLowerCase()})
  if(dup) throw `There's already a user with email "${user.toLowerCase()}"`
  // console.log(password);
  let hash = await bcrypt.hash(password,12)
  const insertInfo = await users.insertOne({
    userFirstName: firstName,
    userLastName: lastName,
    email: user.toLowerCase(),
    gender: gender,
    hashedPassword: hash,
    clients: []
  })
  if (insertInfo.acknowledged ) return {insertedUser: true}
  return {insertedUser: false}
};

const checkUser = async (user, password) => { 
  if(!user || !password) throw `Missing inputs!`
  user = check.validuseremail(user);
  password = check.validpassword(password);
  const users = await user_collection();
  const userObj = await users.findOne({email: user})
  if(userObj && userObj.hashedPassword && await bcrypt.compare(password, userObj.hashedPassword)) return {authenticatedUser: true}
  throw "400Could not find a user with given email and password combination!"
};

const getUserByID = async (id) => {
    check.validId(id)
    const users = await user_collection();
    const user = await users.findOne({_id: ObjectId(id)})
    if (user === null) throw `No user with user id: ${id} found! Only pass id as strings!`
    user._id = user._id.toString();
    return user
};

const getUserByEmail = async (email) => {
  email = check.validuseremail(email)
  const users = await user_collection();
  const user = await users.findOne({email: email})
  if (user === null) throw `No user with email: ${email} found!`
  user._id = user._id.toString();
  return user
};

const deleteUserByID = async (id) => {
    id = id.toString()
    let user = await getUserByID(id)
    const users = await user_collection();
    const delInfo = await users.deleteOne({_id: ObjectId(id)})
    if (delInfo.deletedCount === 0) throw `Could not delete user with ID of ${id}`
    return user
};

const updateUserByID = async (id, firstName, lastName, gender, password) => {
    firstName = check.validname(firstName)
    lastName = check.validname(lastName)
    // user = check.validuseremail(user)
    if(!(gender === "Male" || gender === "Female" || gender === "Others")) throw `400Invalid gender input!`
  
    id = id.toString()
    let user = await getUserByID(id);
  const users = await user_collection();

  let hash = ""
  if(!password || password.trim().length === 0) {
    hash = user.hashedPassword
  } else {
    password = check.validpassword(password)
    hash = await bcrypt.hash(password,12)
  }
  const updatedata = {
    $set: {
        userFirstName: firstName,
        userLastName: lastName,
        email: user.email,
        gender: gender,
        hashedPassword: hash,
        clients: user.clients
    }
}
  const updateInfo = await users.updateOne({_id: ObjectId(id)},updatedata)
  return await getUserByID(id)
};

module.exports = {
  createUser,
  checkUser,
  deleteUserByID,
  updateUserByID,
  getUserByEmail
};