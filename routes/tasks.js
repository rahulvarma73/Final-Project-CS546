const express = require("express");
const router = express.Router();
const data = require("../data");
const helper = require("../helper_task");
const userData = data.userData;
const taskData = data.taskData;

const { ObjectId } = require("mongodb");
const xss = require('xss');

// AFTER PROJECT> ALL TASK LIST UNDER THOSE PROJECT
router.route("/:projectId").get(async (req, res) => {
  try {
    // if not logged in send him to login page

    // if (!req.session.user) {
    //   return res.render("users/userLogin", { title: "Login" });
    // }

    //   ERROR CHECKING
    const projectId = req.params.projectId;
    helper.idCheck(projectId);

    if (!ObjectId.isValid(projectId)) {
      return res.render("error", {
        message: "projectId  is not valid id",
        title: "Error",
      });
    }
    console.log(req.body.name);

    const project = await taskData.getProjectById(projectId);
    if (!project) {
      return res.render("error", {
        message: "projectId  is not valid id",
        title: "Error",
      });
    }
    //   GET ALL TASK BY PROJECT ID

    const allTask = await taskData.getAllTask(projectId);
    return res.render("tasks/taskList", {
      title: "All task",
      allTask: allTask,
      projectId: projectId,
    });
  } catch (error) {
    return res.render("error", {
      message: error,
      title: "Error",
    });
  }
});
router.route("/:projectId").post(async (req, res) => {
  try {
    // if not logged in send him to login page

    // if (!req.session.user) {
    //   return res.render("users/userLogin", { title: "Login" });
    // }

    //   ERROR CHECKING
    const projectId = req.params.projectId;
    helper.idCheck(projectId);

    if (!ObjectId.isValid(projectId)) {
      return res.render("error", {
        message: "projectId  is not valid id",
        title: "Error",
      });
    }
    const project = await taskData.getProjectById(projectId);
    if (!project) {
      return res.render("error", {
        message: "projectId  is not valid id",
        title: "Error",
      });
    }
    const allTask = xss(req.body.allTask);
    const pending = xss(req.body.pending);
    const completed = xss(req.body.completed);

    if (allTask == "true") {
      const allTask = await taskData.getAllTask(projectId);
      return res.render("tasks/taskList", {
        title: "All task",
        allTask: allTask,
        projectId: projectId,
      });
    }

    if (pending == "true") {
      const pending = await taskData.searchByStatus(projectId, "Pending");
      return res.render("tasks/taskList", {
        title: "All task",
        allTask: pending,
        projectId: projectId,
      });
    }

    if (completed == "true") {
      const completed = await taskData.searchByStatus(projectId, "Completed");
      return res.render("tasks/taskList", {
        title: "All task",
        allTask: completed,
        projectId: projectId,
      });
    }
  } catch (error) {}
});

// CREATE TASK
router
  .route("/create/:projectId")
  .get(async (req, res) => {
    try {
      // if not logged in send him to login page
      // if (!req.session.user) {
      //   return res.render("users/userLogin", { title: "Login" });
      // }

      //   ERROR CHECKING
      const projectId = req.params.projectId;
      helper.idCheck(projectId);

      if (!ObjectId.isValid(projectId)) {
        return res.render("error", {
          message: "projectId  is not valid id",
          title: "Error",
        });
      }

      const projectExist = await taskData.getProjectById(projectId);

      if (!projectExist) {
        return res.render("error", {
          message: "Project with this id doesnt exist",
          title: "Error",
        });
      }

      // return render task form
      return res.render("tasks/taskForm", {
        title: "Create task",
        projectId: projectId,
      });
    } catch (error) {
      return res.render("error", {
        message: error,
        title: "Error",
      });
    }
  })
  .post(async (req, res) => {
    try {
      // if not logged in send him to login page
      // if (!req.session.user) {
      //   return res.render("users/userLogin", { title: "Login" });
      // }

      //   ERROR CHECKING

      let projectId = req.params.projectId;
      helper.idCheck(projectId);
      projectId = projectId.trim();

      if (!ObjectId.isValid(projectId)) {
        return res.render("error", {
          message: "projectId  is not valid id",
          title: "Error",
        });
      }

      const projectExist = await taskData.getProjectById(projectId);

      if (!projectExist) {
        return res.render("error", {
          message: "Project with this id doesnt exist",
          title: "Error",
        });
      }

      var description = xss(req.body.description);

      helper.stringCheck("description", description);
      description = description.trim();

      var taskName = xss(req.body.taskName);
      helper.stringCheck("Task name", taskName);
      taskName = taskName.trim();

      // DO TASKNAME EXIST

      const allTask = await taskData.getProjectById(projectId);

      const task = allTask.tasks.filter((tasks) => tasks.taskName == taskName);

      if (task.length != 0) {
        return res.render("tasks/taskForm", {
          title: "Create task",
          projectId: projectId,
          taskName: taskName,
          description: description,
          error: "Task name already exist. Choose different taskname",
        });
      }

      await taskData.createTask(projectId, taskName, description);

      return res.redirect("/tasks/" + projectId);
    } catch (error) {
      return res.status(400).render("tasks/taskForm", {
        title: "Create task",
        projectId: projectId,
        taskName: taskName,
        description: description,
      });
    }
  });

// PARTICULAR TASK DESCRIPTION
router.route("/project/:taskid").get(async (req, res) => {
  try {
    // if not logged in send him to login page

    // if (!req.session.user) {
    //   return res.render("users/userLogin", { title: "Login" });
    // }

    // ERROR CHECKING

    const taskId = req.params.taskid;
    helper.idCheck(taskId);

    if (!ObjectId.isValid(taskId)) {
      return res.render("error", {
        message: "taskid  is not valid id",
        title: "Error",
      });
    }

    // get task by id
    const allTask = await taskData.getTask(taskId);

    const projectId = await taskData.getProjectId(taskId);

    const duration1 = allTask.duration;
    const array = duration1.split(" ");
    const num = array[0];
    let intNum = parseInt(num, 10);

    intNum = Math.floor(intNum / 60);
    const string = intNum + " minutes";

    return res.render("tasks/taskDetails", {
      title: "All task",
      taskName: allTask.taskName,
      description: allTask.description,
      duration: string,
      status: allTask.status,
      taskId: taskId,
      taskEndDate: allTask.taskEndDate,
      comment: allTask.comment,
      projectId: projectId,
    });
  } catch (error) {
    return res.render("error", {
      message: error,
      title: "Error",
    });
  }
});

router.route("/project/:taskid").post(async (req, res) => {
  try {
    // if not logged in send him to login page

    // if (!req.session.user) {
    //   return res.render("users/userLogin", { title: "Login" });
    // }

    // ERROR CHECKING

    const taskId = req.params.taskid;
    helper.idCheck(taskId);

    if (!ObjectId.isValid(taskId)) {
      return res.render("error", {
        message: "taskid  is not valid id",
        title: "Error",
      });
    }
    let start = xss(req.body.start);
    let stop = xss(req.body.stop);
    let finish = xss(req.body.finish);
    let error = "";

    if (start === "true") {
      await taskData.startTimer(taskId);
      start = "false";
      // get task by id
      const allTask = await taskData.getTask(taskId);

      const duration1 = allTask.duration;
      const array = duration1.split(" ");
      const num = array[0];
      let intNum = parseInt(num, 10);

      intNum = Math.floor(intNum / 60);
      const string = intNum + " minutes";

      return res.render("tasks/taskDetails", {
        title: "All task",
        taskName: allTask.taskName,
        description: allTask.description,
        duration: string,
        status: allTask.status,
        taskId: taskId,
        taskEndDate: allTask.taskEndDate,
        comment: allTask.comment,
      });
    }

    if (stop === "true") {
      await taskData.stopTimer(taskId);
      stop = "false";

      const allTask = await taskData.getTask(taskId);

      const duration1 = allTask.duration;
      const array = duration1.split(" ");
      const num = array[0];
      let intNum = parseInt(num, 10);

      intNum = Math.floor(intNum / 60);
      const string = intNum + " minutes";

      return res.render("tasks/taskDetails", {
        title: "All task",
        taskName: allTask.taskName,
        description: allTask.description,
        duration: string,
        status: allTask.status,
        taskId: taskId,
        taskEndDate: allTask.taskEndDate,
        comment: allTask.comment,
      });
    }

    if (finish === "true") {
      await taskData.finishTimer(taskId);
      await taskData.updateEndDate(taskId);
      finish = "false";

      const allTask = await taskData.getTask(taskId);

      return res.redirect("/tasks/project/" + taskId + "/comment");
    }
  } catch (error) {
    console.log(xss(req.body.taskEndDate), "task id is printitng");

    const duration1 = xss(req.body.duration);
    const array = duration1.split(" ");
    const num = array[0];
    let intNum = parseInt(num, 10);

    intNum = Math.floor(intNum / 60);
    const string = intNum + " minutes";
    return res.render("tasks/taskDetails", {
      title: "All task",
      taskName: xss(req.body.taskName),
      description: xss(req.body.description),
      duration: string,
      status: xss(req.body.status),
      taskId: xss(req.body.taskId),
      taskEndDate: xss(req.body.taskEndDate),
      comment: xss(req.body.comment),
      error: error,
    });
    // return res.render("error", {
    //   message: error,
    //   title: "Error",
    // });
  }
});

// UPDATE TASK
router
  .route("/project/:taskId/update")
  .get(async (req, res) => {
    try {
      // if not logged in send him to login page
      // if (!req.session.user) {
      //   return res.render("users/userLogin", { title: "Login" });
      // }

      //   ERROR CHECKING

      const taskId = req.params.taskId;
      helper.idCheck(taskId);
      if (!ObjectId.isValid(taskId)) {
        return res.render("error", {
          message: "projectId  is not valid id",
          title: "Error",
        });
      }
      const task = await taskData.getTask(taskId);

      return res.render("tasks/taskUpdate", {
        title: "Task details",
        taskName: task.taskName,
        description: task.description,
        taskId: taskId,
      });
    } catch (error) {
      return res.render("error", {
        message: error,
        title: "Error",
      });
    }
  })
  .post(async (req, res) => {
    try {
      // if not logged in send him to login page
      // if (!req.session.user) {
      //   return res.render("users/userLogin", { title: "Login" });
      // }

      //   ERROR CHECKING

      var taskId = req.params.taskId;
      helper.idCheck(taskId);
      if (!ObjectId.isValid(taskId)) {
        return res.render("error", {
          message: "taskid  is not valid id",
          title: "Error",
        });
      }
      const taskExisted = await taskData.getTask(taskId);
      console.log("task EXisted", taskId);

      var description = xss(req.body.description);

      helper.stringCheck("description", description);
      description = description.trim();

      var taskName = xss(req.body.taskName);
      helper.stringCheck("Task name", taskName);
      taskName = taskName.trim();

      // DO TASKNAME EXIST
      // GETTING PROJECT ID
      var projectId = await taskData.getProjectId(taskId);
      projectId = projectId.toString();
      console.log(projectId);
      // task existed empty
      // if (!taskExisted || (taskExisted.taskName == taskName))

      if (taskExisted) {
        if (!(taskExisted.taskName == taskName)) {
          console.log("if loop projectId", projectId);
          const allTask = await taskData.getProjectById(projectId);

          const task = allTask.tasks.filter(
            (tasks) => tasks.taskName == taskName
          );

          if (task.length != 0) {
            return res.render("tasks/taskUpdate", {
              title: "Update task",
              projectId: projectId,
              taskName: taskName,
              description: description,
              taskId: taskId,
              error: "Task name already exist. Choose different taskname",
            });
          }
        }
      }
      console.log(projectId, "projectid");
      const update = await taskData.updateTask(
        projectId,
        taskId,
        taskName,
        description
      );
      return res.redirect("/tasks/project/" + taskId);
    } catch (error) {
      console.log(projectId);
      return res.status(400).render("tasks/taskUpdate", {
        title: "update task",
        taskId: taskId,
        projectId: projectId,
        taskName: taskName,
        description: description,
        error: error,
      });
    }
  });

// not done
// delete task
router.route("/project/:taskId/delete").get(async (req, res) => {
  try {
    // if not logged in send him to login page

    // if (!req.session.user) {
    //   return res.render("users/userLogin", { title: "Login" });
    // }

    // ERROR CHECKING

    const taskId = req.params.taskId;
    helper.idCheck(taskId);
    if (!ObjectId.isValid(taskId)) {
      return res.render("error", {
        message: "taskid  is not valid id",
        title: "Error",
      });
    }
    const task = await taskData.getTask(taskId);

    const duration1 = task.duration;
    const array = duration1.split(" ");
    const num = array[0];
    let intNum = parseInt(num, 10);

    intNum = Math.floor(intNum / 60);
    const string = intNum + " minutes";

    return res.render("tasks/taskDelete", {
      title: "Delete task",
      taskId: task._id,
      taskName: task.taskName,
      description: task.description,
      duration: string,
      status: task.status,
    });

    // show task and render task delete then add button to delete and do delete operation in .POST
  } catch (error) {
    return res.render("error", {
      message: error,
      title: "Error",
    });
  }
});

router.route("/project/:taskId/delete").post(async (req, res) => {
  try {
    // if not logged in send him to login page

    // if (!req.session.user) {
    //   return res.render("users/userLogin", { title: "Login" });
    // }

    // ERROR CHECKING

    const taskId = req.params.taskId;
    helper.idCheck(taskId);
    if (!ObjectId.isValid(taskId)) {
      return res.render("error", {
        message: "taskid  is not valid id",
        title: "Error",
      });
    }
    const projectId = await taskData.getProjectId(taskId);

    await taskData.removeTask(taskId);

    return res.redirect("/tasks/" + projectId);
  } catch (error) {
    return res.render("error", {
      message: error,
      title: "Error",
    });
  }
});

// update comment
router.route("/project/:taskId/comment").get(async (req, res) => {
  try {
    // if not logged in send him to login page

    // if (!req.session.user) {
    //   return res.render("users/userLogin", { title: "Login" });
    // }

    // ERROR CHECKING

    const taskId = req.params.taskId;
    helper.idCheck(taskId);
    if (!ObjectId.isValid(taskId)) {
      return res.render("error", {
        message: "taskid  is not valid id",
        title: "Error",
      });
    }
    const task = await taskData.getTask(taskId);

    const duration1 = task.duration;
    const array = duration1.split(" ");
    const num = array[0];
    let intNum = parseInt(num, 10);

    intNum = Math.floor(intNum / 60);
    const string = intNum + " minutes";
    return res.render("tasks/taskComment", {
      title: "Comment task",
      taskId: task._id,
      taskName: task.taskName,
      description: task.description,
      duration: string,
      status: task.status,
      taskEndDate: task.taskEndDate,
    });
  } catch (error) {
    return res.render("error", {
      message: error,
      title: "Error",
    });
  }
});

router.route("/project/:taskId/comment").post(async (req, res) => {
  try {
    // if not logged in send him to login page

    // if (!req.session.user) {
    //   return res.render("users/userLogin", { title: "Login" });
    // }

    // ERROR CHECKING
    const comment = req.body.comment;

    const taskId = req.params.taskId;
    helper.idCheck(taskId);
    if (!ObjectId.isValid(taskId)) {
      return res.render("error", {
        message: "taskid  is not valid id",
        title: "Error",
      });
    }
    const task = await taskData.getTask(taskId);

    // comment task
    await taskData.updateComment(taskId, comment);
    return res.redirect("/tasks/project/" + taskId);
  } catch (error) {
    return res.render("error", {
      message: error,
      title: "Error",
    });
  }
});
module.exports = router;
