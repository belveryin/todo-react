import WunderlistSDK from '../dist/wunderlist.sdk.js';

/**
 * Class that abstracts the interaction with the data source, in this case wunderlist.
 */
class Store {
    constructor() {
        this.listId;
        this.listPositionRevision;
        // Store the instance of WunderlistAPI to avoid recreating it whenever we want to use it.
        // TODO: get accessToken and clientID from the frontend.
        this.WunderlistAPI = new WunderlistSDK({
            accessToken: '19431da9c0b70263ba036e2b33fe1fa71b4687af4573fab141ecab879e35',
            clientID: '68d45e76b1b6bd0c9d63'
        });
        this.listModel;
    }

    /**
     * Get the tasks from the default list (this.listId).
     * @private
     * @param   {boolean}   completed   If true returns the list of the completed tasks.
     * @returns {Promise}               A Promise that when resolved passes an array with the fetched tasks.
     */
    _getListTasks(completed) {
        return new Promise((resolve, reject) => {
            this.WunderlistAPI.http.tasks.forList(this.listId, completed).done(function(tasksData, statusCode) {
                resolve(tasksData);
            }).fail(function(resp, code) {
                console.error(resp, code);
                reject();
            });
        });
    }

    /**
     * Get the position of the uncompleted tasks on the list.
     * @private
     * @returns {Promise} A Promise that when resolved passes an array with the sorted tasks ids.
     */
    _getTaskPositions() {
        return new Promise((resolve, reject) => {
            this.WunderlistAPI.http.task_positions.forList(this.listId).done((tasksPositions, statusCode) => {
                this.listPositionRevision = tasksPositions[0].revision;

                resolve(tasksPositions[0].values);
            }).fail((resp, code) => {
                console.error(resp, code);
                reject();
            });
        });
    }

    /**
     * Get all tasks (uncompleted and completed) and sort them.
     * @private
     * @returns {Promise} That when resolved passes the sorted array of tasks.
     */
    _getAllTasks() {
        // Get tasks, completed tasks and the position of the first ones on the list.
        return Promise.all([this._getListTasks(false), this._getListTasks(true), this._getTaskPositions()]).then((res) => {
            let tasks = res[0];
            let completedTasks = res[1];
            const taskPositions = res[2];

            tasks = tasks.sort((todoA, todoB) => {
                return taskPositions.indexOf(todoA.id) - taskPositions.indexOf(todoB.id);
            });

            return tasks.concat(completedTasks);
        }).catch((error) => {
            console.error(error);
        });
    }

    /**
     * Subscribes to the 'update' messages from the WunderlistAPI socket and updates the whole list when received.
     * @private
     */
    _watchAndUpdateOnListChanges() {
        this.WunderlistAPI.bindTo(this.WunderlistAPI.restSocket, 'event', (data) => {
            if (data && data.operation === 'update') {
                this._getAllTasks().then((tasks) => this.listModel.setTasks(tasks));
            }
        });
    }

    /**
     * Subscribe the model to update it when changes are received from the websocket.
     * @param {TaskListModel}   listModel   The model to subscribe.
     */
    subscribeListModel(listModel) {
        this.listModel = listModel;
    }

    /**
     * Loads the list data (first list id and tasks of that list) and returns an array of sorted tasks (uncompleted and completed).
     * @returns {Promise} A Promise that when resolved passes an array of tasks.
     */
    loadList() {
        return new Promise((resolve, reject) => {
            // Initialize the wunderlist API and wait till its done.
            this.WunderlistAPI.initialized.done(() => {
                // Load all the lists.
                this.WunderlistAPI.http.lists.all().done((lists) => {
                    // Save the id of the first list (Inbox).
                    this.listId = lists[0].id;

                    // Get the tasks of the first list.
                    this._getAllTasks().then((tasks) => {
                        // Start watching for changes.
                        this._watchAndUpdateOnListChanges();

                        // Initialize the model with the list id and the tasks.
                        this.listModel.setListId(this.listId);
                        this.listModel.setTasks(tasks);

                        resolve()
                    });

                }).fail((resp, error) => {
                    console.error('there was a problem');
                    reject();
                });
            });
        });
    }

    /**
     * Create a task with the given @title.
     * @param   {string}    title   The title of the task to create.
     * @returns {Promise}           A Promise that when resolved passes the just created task.
     */
    createTask(title) {
        return new Promise((resolve, reject) => {
            this.WunderlistAPI.http.tasks.create({
                list_id: this.listId,
                title: title
            }).done((taskData, statusCode) => {
                resolve(taskData);
            }).fail((resp, error) => {
                console.error('there was a problem');
                reject();
            });
        });
    }

    /**
     * Save the given task.
     * @param   {Object}    task    The task to save.
     * @returns {Promise}           A Promise that when resolved doesn't pass anything.
     */
    saveTask(task) {
        return new Promise((resolve, reject) => {
            this.WunderlistAPI.http.tasks.update(task.id, task.revision, {
                title: task.title,
                completed: task.completed
            }).done((taskData, statusCode) => {
                resolve();
            }).fail((resp, error) => {
                console.error('there was a problem');
                reject();
            });
        });
    }

    /**
     * Deletes the given task.
     * @param   {Object}    task    The task to save.
     * @returns {Promise}           A Promise that when resolved doesn't pass anything.
     */
    deleteTask(task) {
        return new Promise((resolve, reject) => {
            this.WunderlistAPI.http.tasks.deleteID(task.id, task.revision).always(() => resolve());
        });
    }

    /**
     * Saves the position of the tasks.
     * @param   {number[]}  sortedIds   The sorted list of the tasks ids.
     * @returns {Promise}               A Promise that when resolved doesn't pass anything.
     */
    saveTaskPositions(sortedIds) {
        return new Promise((resolve, reject) => {
            this.WunderlistAPI.http.task_positions.update(this.listId, this.listPositionRevision, { values: sortedIds }).done((taskPositionsData, statusCode) => {
                // Update the list position revision.
                this.listPositionRevision = taskPositionsData.revision;
                resolve();
            }).fail((resp, code) => {
                reject();
            });
        });
    }
}

export default new Store();
