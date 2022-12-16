const {ObjectId} = require('mongodb');

const validuseremail = (user) => {
    if(!user) throw "400Email is not provided!"
    user = user.trim()
    if (! /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(user)) throw "400You have entered an invalid email address!"
    return user.toLowerCase();
}

const validpassword = (password) => {
    if(!password) throw `400No password was provided!`;
    if(password.includes(" ")) throw `400passwords can't have spaces!`;
    if(password.length < 6) throw `400passwords must be at least 6 characters long!`;
    if(! /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)) throw `400passwords must have atleast one special character!`;
    if(! /[A-Z]/.test(password)) throw `400passwords must have atleast one capital alphabet!`;
    if(! /[0-9]/.test(password)) throw `400passwords must have atleast one number!`;
    return password;
}

const validname = (name) => {
    if(!name) throw `400First name and Last name are required!`
    name = name.trim()
    if(name.length === 0) throw `400Names cannot be empty spaces!`
    if(! /[a-zA-Z]+/.test(name)) throw `400Names should have at least one alphabet each!`
    return name
}

const validId = (id) => {
    if (!id) throw 'Error: Invalid Id';
    if (typeof id !== 'string') {id = id.toString()}
    if (!ObjectId.isValid(id)) throw 'Error: Invalid object ID';
}


module.exports = {
    validuseremail,
    validpassword,
    validname,
    validId
}