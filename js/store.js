import WunderlistSDK from '../dist/wunderlist.sdk.js';
import config from 'config';

/**
 * Class that abstracts the interaction with the data source, in this case wunderlist.
 */
class Store {
    constructor() {
        this.listId;
        this.listPosition = {};
        this.taskRevisions = {};
        // Store the instance of WunderlistAPI to avoid recreating it whenever we want to use it.
        this.WunderlistAPI = new WunderlistSDK({
            accessToken: config.AUTH.ACCESS_TOKEN,
            clientID: config.AUTH.CLIENT_ID
        });
        this.listModel;
    }

    /**
     * Save task revisions from @tasks.
     * @params  {Object[]}  tasks   The tasks to store the revisions from.
     */
    _updateTaskRevisions(tasks) {
        tasks.forEach((task) => this.taskRevisions[task.id] = task.revision);
    }

    /**
     * Checks if the @revision from @id is valid checking in the list position and tasks revisions.
     * @param   {number}    id          The id to check @revision.
     * @param   {number}    revision    The revision to check.
     * @returns {boolean}               True if the revision is valid, false if not.
     */
    _isValidRevision(id, revision) {
        return this.listPosition.id === id && this.listPosition.revision === revision || this.taskRevisions[id] === revision;
    }

    /**
     * Get the tasks from the default list (this.listId).
     * @private
     * @param   {boolean}   completed   If true returns the list of the completed tasks.
     * @returns {Promise}               A Promise that when resolved passes an array with the fetched tasks.
     */
    _getListTasks(completed) {
        return new Promise((resolve, reject) => {
            this.WunderlistAPI.http.tasks.forList(this.listId, completed).done((tasksData, statusCode) => {
                this._updateTaskRevisions(tasksData);
                resolve(tasksData);
            }).fail((resp, code) => {
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
                this.listPosition.id = tasksPositions[0].id;
                this.listPosition.revision = tasksPositions[0].revision;

                resolve(tasksPositions[0].values);
            }).fail((resp, code) => {
                console.error(resp, code);
                reject();
            });
        });
    }

    /**
     * Sort @tasks according to the ids in @positions.
     * @param   {Object[]}  tasks       The tasks to be sorted.
     * @param   {number[]}  positions   An array with the sorted ids.
     * @returns {Object[]}              The sorted tasks.
     */
    _sortTasks(tasks, positions) {
        return tasks.sort((todoA, todoB) => {
            let aIdx = positions.indexOf(todoA.id);
            let bIdx = positions.indexOf(todoB.id);

            if (aIdx === -1) {
                aIdx = tasks.length - 1;
            }
            if (bIdx === -1) {
                bIdx = tasks.length - 1;
            }
            return aIdx - bIdx;
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
            const completedTasks = res[1];
            const taskPositions = res[2];

            tasks = this._sortTasks(tasks, taskPositions);

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
        this.WunderlistAPI.bindTo(this.WunderlistAPI.restSocket, 'event', (msg) => {
            if (msg && msg.operation === 'update' && !this._isValidRevision(msg.subject.id, msg.subject.revision)) {
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

                        resolve();
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
                this.taskRevisions[taskData.id] = taskData.revision;
                resolve(taskData);
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
            // Increment this.listPosition.revision just in case there is a new saveTaskPositions before this.listPosition.revision is updated in the then().
            this.WunderlistAPI.http.task_positions.update(this.listPosition.id, this.listPosition.revision++, { values: sortedIds }).done((taskPositionsData, statusCode) => {
                // Update the list position revision.
                this.listPosition.revision = taskPositionsData.revision;
                resolve();
            }).fail((resp, code) => {
                reject();
            });
        });
    }
}

export default new Store();
