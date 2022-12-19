const mongoCollections = require("../config/mongoCollections");
const projects = mongoCollections.projects;
const { ObjectId } = require("mongodb");

const helper = require("../helper_task");

const createTask = async (
  projectid,
  taskName,
  description,
  taskStartTime,
  taskStartDate,
  taskEndTime,
  taskEndDate,
  duration,
  status,
  comment
) => {
  // error checking

  //project id
  {
    helper.idCheck(projectid);

    if (!ObjectId.isValid(projectid)) {
      throw "Porject id is not valid id";
    }

    projectid = projectid.trim();
  }

  // task Name and description
  {
    helper.stringCheck("Task name", taskName);
    taskName = taskName.trim();

    // DO TASKNAME EXIST

    const allTask = await getProjectById(projectid);

    const task = allTask.tasks.filter((tasks) => tasks.taskName == taskName);

    if (task.length != 0) {
      throw "Task name already exist. Choose different taskname";
    }

    helper.stringCheck("description", description);
    description = description.trim();
  }

  // task start time
  taskStartTime = "";
  // if (typeof taskStartTime != "string") {
  //   throw "taskStartTime input is not string type";
  // }

  //task start date
  const presentStartTime = getTime();
  taskStartDate = presentStartTime.currentDate;
  if (typeof taskStartDate != "string") {
    throw "taskStartDate input is not string type";
  }

  // task end time
  taskEndTime = "";
  // if (typeof taskEndTime != "string") {
  //   throw "taskEndTime input is not string type";
  // }

  // task End date
  taskEndDate = "";
  // if (typeof taskEndDate != "string") {
  //   throw "taskEndDate input is not string type";
  // }

  // duration
  duration = "0 minutes";

  // status
  status = "Pending";

  // comment
  comment = "";

  // create Task here

  // for creating random id
  const id = ObjectId();
  let newTask = {
    _id: id,
    taskName: taskName,
    description: description,
    taskStartTime: taskStartTime,
    taskStartDate: taskStartDate,
    taskEndTime: taskEndTime,
    taskEndDate: taskEndDate,
    duration: duration,
    status: status,
    comment: comment,
  };

  const projectcollection = await projects();
  const updateInfo = await projectcollection.updateOne(
    { _id: { $eq: ObjectId(projectid) } },
    { $push: { tasks: newTask } }
  );

  if (!updateInfo.matchedCount) {
    throw "Project doesnt exist";
  }

  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw "Update failed";

  console.log("Create Task is successfully Implemented");
};

const removeTask = async (taskid) => {
  // error checking
  helper.idCheck(taskid);

  if (!ObjectId.isValid(taskid)) {
    throw "taskid  is not valid id";
  }
  // removce task
  const projectCollection = await projects();
  const deleteInfo = await projectCollection.updateOne(
    { "tasks._id": ObjectId(taskid) },
    { $pull: { tasks: { _id: ObjectId(taskid) } } }
  );

  if (!deleteInfo.matchedCount && !deleteInfo.modifiedCount) {
    throw "task id doesnt exist";
  }
  console.log("successfully task deleted");
};

// done completely
const getAllTask = async (projectId) => {
  // error checking
  helper.idCheck(projectId);

  if (!ObjectId.isValid(projectId)) {
    throw "projectId  is not valid id";
  }

  // get all task

  const projectCollection = await projects();
  const project = await projectCollection.findOne({ _id: ObjectId(projectId) });
  if (!project) {
    throw "project doesnt exist";
  }

  const allTask = project.tasks;
  return allTask;
};

// GET PROJECT BY ID

const getProjectById = async (projectId) => {
  // error checking
  helper.idCheck(projectId);

  if (!ObjectId.isValid(projectId)) {
    throw "projectId  is not valid id";
  }

  const projectCollection = await projects();
  const project = await projectCollection.findOne({ _id: ObjectId(projectId) });
  if (!project) {
    throw "project doesnt exist";
  }

  return project;
};
// // work for update task later on

const updateTask = async (projectid, taskid, taskName, description) => {
  // error checking
  // task id
  helper.idCheck(taskid);

  if (!ObjectId.isValid(taskid)) {
    throw "taskid  is not valid id";
  }

  const Task = getTask(taskid);
  if (!Task) {
    throw "taskid doesnt exist";
  }

  // task name
  // task description

  helper.stringCheck("Task name", taskName);
  taskName = taskName.trim();

  // DO TASKNAME EXIST
  if (Task) {
    if (Task.taskName == taskName) {
      const allTask = await getProjectById(projectid);

      const task = allTask.tasks.filter((tasks) => tasks.taskName == taskName);

      if (task.length != 0) {
        throw "Task name already exist. Choose different taskname";
      }
    }
  }
  helper.stringCheck("description", description);
  description = description.trim();
  // update task programs start here
  let newTask = {
    taskName: taskName,
    description: description,
  };

  const projectCollection = await projects();
  const updateInfo = await projectCollection.updateOne(
    { "tasks._id": ObjectId(taskid) },
    {
      $set: {
        "tasks.$.taskName": newTask.taskName,
        "tasks.$.description": newTask.description,
      },
    }
  );

  if (updateInfo.matchedCount == 0) {
    throw "task doesnt exist";
  }
  if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
    throw "Update failed";
  }
  console.log("updatedtask ran successfully");
  await getTask(taskid);
  // return task by id
};

// get task by task id
const getTask = async (taskid) => {
  console.log("get task running");
  helper.idCheck(taskid);

  if (!ObjectId.isValid(taskid)) {
    throw "taskid  is not valid id";
  }

  const projectCollection = await projects();

  const alltask = await projectCollection.findOne({
    "tasks._id": ObjectId(taskid),
  });
  // returns whole project

  if (!alltask) {
    throw " task  with this taskID doesnt exist";
  }

  const task = alltask.tasks.filter((tasks) => tasks._id == taskid);

  const tasks = task[0];

  return tasks;
};

const getProjectId = async (taskid) => {
  helper.idCheck(taskid);

  if (!ObjectId.isValid(taskid)) {
    throw "taskid  is not valid id";
  }

  const projectCollection = await projects();

  const alltask = await projectCollection.findOne({
    "tasks._id": ObjectId(taskid),
  });
  const projectid = alltask._id;
  return projectid;
};
// search by task name
// pending error checking
const searchTaskName = async (taskName) => {
  const projectCollection = await projects();
  const alltask = await projectCollection.findOne({
    "tasks.taskName": taskName,
  });
  return alltask.tasks.filter((task) => task.taskName == taskName); // ask group return project or task ????
  // return alltask
};

// search by status
// Pending _ error checking
const searchByStatus = async (projectid, status) => {
  const newStatus = status.charAt(0).toUpperCase() + status.slice(1);

  const allTask = await getAllTask(projectid);
  // console.log(allTask);
  return allTask.filter((task) => task.status == newStatus);
};

// ----------------------- HELPERS --------------------------------------------

// start task (to update task start time and task start date)
// returns startdate and starttime in object. have access by instance.currentDate and instance.currentTime,etc.
const getTime = () => {
  const date = new Date();

  const timeStamp = date.getTime(); // returns in milli seconds
  const currentDate = date.toLocaleDateString();
  const currentTime = date.toLocaleTimeString();
  const dateObject = {
    timeStamp: date,
    currentDate: currentDate,
    currentTime: currentTime,
  };
  return dateObject; //call by instance.currentDate,instance.currentTime,instance.timeStamp
};

// START TIMER AND STOP TIMER
const startTimer = async (taskid) => {
  // ERROR CHECKING
  helper.idCheck(taskid);

  if (!ObjectId.isValid(taskid)) {
    throw "taskid  is not valid id";
  }
  // do task exist
  const task = await getTask(taskid); // if task doesnt exist getTASK FUCNTION WILL THROW ERROR

  if (!task) {
    throw "task doesnt exist";
  }

  // GETTING TIME
  const present = getTime();
  const time = present.timeStamp;

  if (task.status == "Completed") {
    throw " Task is already finished.";
  }
  if (task.taskStartTime) {
    throw "Timer is already started";
  }

  // GETTING PROJECTS  AND UPDATE THE TIME IN START TIME
  const projectCollection = await projects();
  const updateInfo = await projectCollection.updateOne(
    { "tasks._id": ObjectId(taskid) },
    { $set: { "tasks.$.taskStartTime": time } }
  );

  if (updateInfo.matchedCount == 0) {
    throw "task doesnt exist";
  }

  if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
    throw "Update failed";
  }
  console.log("task start time updated successfully successfully");
};

const stopTimer = async (taskid) => {
  // ERROR CHECKING
  helper.idCheck(taskid);

  if (!ObjectId.isValid(taskid)) {
    throw "taskid  is not valid id";
  }
  // do task exist
  const task = await getTask(taskid); // if task doesnt exist getTASK FUCNTION WILL THROW ERROR

  if (!task) {
    throw "task doesnt exist";
  }

  if (task.status == "Completed") {
    throw " Task is already finished.";
  }

  if (!task.taskStartTime) {
    throw "timer is already paused";
  }

  //  START TIME
  const date1 = new Date(task.taskStartTime);
  console.log(date1);

  // GETTING present end TIME
  const present = getTime();
  const date2 = new Date(present.timeStamp);
  var res = Math.abs(date1 - date2) / 1000;
  // get total days between two dates
  var days = Math.floor(res / 86400) * 24 * 60 * 60;
  console.log(days);

  // get hours
  var hours = (Math.floor(res / 3600) % 24) * 60 * 60;
  console.log(hours);

  // get minutes
  var minutes = (Math.floor(res / 60) % 60) * 60;
  console.log(minutes);

  var seconds = res % 60;
  console.log(seconds);

  let total = days + hours + minutes + seconds;

  // total = Math.floor(total / 60);  //{{{{{{{{{{{{{{{{{change back}}}}}}}}}}}}}}}}}

  // returned minute - total is in minute form
  console.log(total);

  if (task.duration == "0 minutes" || task.duration == "NaN minutes ") {
    let string = "";
    string = total + " seconds"; //{{{{{{{{{{{{{{{{{{{seconds to minutes}}}}}}}}}}}}}}}}}}}

    await updateDuration(taskid, string);
    console.log("if running");
  } else {
    let string = task.duration;
    let splittedDuration = string.split(" ");
    const num = parseInt(splittedDuration[0], 10);
    console.log(num, total);
    let lastduration = num + total;
    console.log(typeof num, typeof total, lastduration);
    lastduration = lastduration.toString();
    console.log("last DUration", typeof lastduration, lastduration);

    string = lastduration + " seconds"; //{{{{{{{{{{{{{{{{{{{{{{seconds to minutes}}}}}}}}}}}}}}}}}}}}}}
    console.log(string);

    await updateDuration(taskid, string);
    console.log("else running");
  }

  // GETTING PROJECTS  AND UPDATE THE TIME IN START TIME to
  const projectCollection = await projects();
  const updateInfo = await projectCollection.updateOne(
    { "tasks._id": ObjectId(taskid) },
    { $set: { "tasks.$.taskStartTime": "" } }
  );

  if (updateInfo.matchedCount == 0) {
    throw "task doesnt exist";
  }

  if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
    throw "Update failed";
  }
  console.log("task start time updated successfully");
};

const finishTimer = async (taskId) => {
  // ERROR CHECKING
  helper.idCheck(taskId);

  if (!ObjectId.isValid(taskId)) {
    throw "taskId  is not valid id";
  }
  // do task exist
  const task = await getTask(taskId); // if task doesnt exist getTASK FUCNTION WILL THROW ERROR

  if (!task) {
    throw "task doesnt exist";
  }

  if (task.taskStartTime) {
    throw "timer is Running, cant use finish button";
  }
  if (task.status == "Completed") {
    throw " Task is already finished.";
  }

  await updateStatus(taskId);
  await updateEndDate(taskId);
};

// UPDATE STATUS
// updateStatus is used to update the status forexample. if its pending then it will change to completed. and vice versA
// pending
const updateStatus = async (taskid) => {
  // error handling
  helper.idCheck(taskid);

  if (!ObjectId.isValid(taskid)) {
    throw "taskid  is not valid id";
  }
  // do task exist
  const task = await getTask(taskid); // if task doesnt exist getTASK FUCNTION WILL THROW ERROR

  // CHECKING THE TASK.STATUS
  let status = "";
  if (task.status == "Pending") {
    status = "Completed";
  } else {
    status = "Pending";
  }

  // UDPATING STATUS
  const projectCollection = await projects();
  const updateInfo = await projectCollection.updateOne(
    { "tasks._id": ObjectId(taskid) },
    { $set: { "tasks.$.status": status } }
  );

  if (updateInfo.matchedCount == 0) {
    throw "task doesnt exist";
  }

  if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
    throw "Update failed";
  }
  console.log("UPDATE STATUS ran successfully");
};

// UPDATE END DATE
const updateEndDate = async (taskid) => {
  // error handling
  helper.idCheck(taskid);

  if (!ObjectId.isValid(taskid)) {
    throw "taskid  is not valid id";
  }
  // do task exist
  const task = await getTask(taskid); // if task doesnt exist getTASK FUCNTION WILL THROW ERROR

  // get present date
  const currentTimeStamp = getTime();
  const currentdate = currentTimeStamp.currentDate;

  // UDPATING END DATE
  const projectCollection = await projects();
  const updateInfo = await projectCollection.updateOne(
    { "tasks._id": ObjectId(taskid) },
    { $set: { "tasks.$.taskEndDate": currentdate } }
  );

  if (updateInfo.matchedCount == 0) {
    throw "task doesnt exist";
  }

  if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
    throw "Update failed";
  }
  console.log("UPDATE END DATE ran successfully");
};

// UPDATE DURATION
const updateDuration = async (taskid, duration) => {
  // error handling
  helper.idCheck(taskid);

  if (!ObjectId.isValid(taskid)) {
    throw "taskid  is not valid id";
  }
  // do task exist
  const task = await getTask(taskid); // if task doesnt exist getTASK FUCNTION WILL THROW ERROR

  // UDPATING END DATE
  const projectCollection = await projects();
  const updateInfo = await projectCollection.updateOne(
    { "tasks._id": ObjectId(taskid) },
    { $set: { "tasks.$.duration": duration } }
  );

  if (updateInfo.matchedCount == 0) {
    throw "task doesnt exist";
  }

  if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
    throw "Update failed";
  }

  await updateProjectDuration(taskid);
  console.log("UPDATE duration ran successfully");
};

// ADD COMMENT
const updateComment = async (taskid, comment) => {
  helper.idCheck(taskid);

  if (!ObjectId.isValid(taskid)) {
    throw "taskid  is not valid id";
  }
  // do task exist
  const task = await getTask(taskid); // if task doesnt exist getTASK FUCNTION WILL THROW ERROR

  if (!comment) {
    throw "comment should contain one character";
  }
  // UDPATING END DATE
  const projectCollection = await projects();
  const updateInfo = await projectCollection.updateOne(
    { "tasks._id": ObjectId(taskid) },
    { $set: { "tasks.$.comment": comment } }
  );

  if (updateInfo.matchedCount == 0) {
    throw "task doesnt exist";
  }

  if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
    throw "Update failed";
  }
  console.log("UPDATE comment ran successfully");
};

//ADD TOTAL DURATION TO PROJECT
const updateProjectDuration = async (taskid) => {
  // error handling
  helper.idCheck(taskid);

  if (!ObjectId.isValid(taskid)) {
    throw "taskid  is not valid id";
  }
  // do task exist
  const task = await getTask(taskid); // if task doesnt exist getTASK FUCNTION WILL THROW ERROR

  const projectCollection = await projects();

  const alltask = await projectCollection.findOne({
    "tasks._id": ObjectId(taskid),
  });
  const tasks = alltask.tasks;
  var sum = 0;
  for (let x of tasks) {
    console.log(x);
    let duration = x.duration;
    const array = duration.split(" ");
    const number = parseInt(array[0], 10);
    sum = sum + number;
  }
  console.log(sum); //have to update this
  const duration = sum + " minutes";
  const updateInfo = await projectCollection.updateOne(
    { "tasks._id": ObjectId(taskid) },
    { $set: { totalDuration: duration } }
  );

  if (updateInfo.matchedCount == 0) {
    throw "task doesnt exist";
  }

  if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
    throw "Update failed";
  }
  console.log("UPDATE duration ran successfully");
};

module.exports = {
  createTask,
  removeTask,
  getAllTask,
  getProjectById,
  updateStatus,
  getTask,
  getProjectId,
  searchTaskName,
  searchByStatus,
  updateTask,
  getTime,
  startTimer,
  stopTimer,
  updateEndDate,
  updateDuration,
  updateComment,
  finishTimer,
  updateProjectDuration,
};
