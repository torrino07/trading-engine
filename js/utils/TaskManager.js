class TaskManager {
  constructor() {
    this.handlers = {};
  }

  registerHandler(taskIdentifier, handler) {
    this.handlers[taskIdentifier] = handler;
  }

  getHandler(taskIdentifier) {
    return this.handlers[taskIdentifier];
  }
}

module.exports = new TaskManager();
