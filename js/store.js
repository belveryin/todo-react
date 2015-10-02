import WunderlistSDK from '../dist/wunderlist.sdk.js';
import _ from 'lodash';

const store = {};
class Store {
    constructor() {
        this.listId;
        this.listPositionRevision;
        this.items;
        this.WunderlistAPI = new WunderlistSDK({
            accessToken: '19431da9c0b70263ba036e2b33fe1fa71b4687af4573fab141ecab879e35',
            clientID: '68d45e76b1b6bd0c9d63'
        });
    }

    getListTasks(completed) {
        return new Promise((resolve, reject) => {
            this.WunderlistAPI.http.tasks.forList(this.listId, completed).done(function(tasksData, statusCode) {
                resolve(tasksData);
            }).fail(function(resp, code) {
                console.error(resp, code);
                resolve([]);
            });
        });
    }

    getTaskPositions() {
        return new Promise((resolve, reject) => {
            this.WunderlistAPI.http.task_positions.forList(this.listId).done((tasksPositions, statusCode) => {
                this.listPositionRevision = tasksPositions[0].revision;

                resolve(tasksPositions[0].values);
            }).fail((resp, code) => {
                console.error(resp, code);
                resolve([]);
            });
        });
    }

    getAllTasks() {
        return Promise.all([this.getListTasks(false), this.getListTasks(true), this.getTaskPositions()]).then((res) => {
            const taskPositions = res[2];
            const todos = _.flatten(res.slice(0, 2));

            this.items = todos.sort((todoA, todoB) => {
                return taskPositions.indexOf(todoA.id) - taskPositions.indexOf(todoB.id);
            });

            return this.items;
        }).catch((error) => {
            console.error(error);
        });
    }

    onListLoad() {
        return new Promise((resolve, reject) => {
            this.WunderlistAPI.initialized.done(() => {
                this.WunderlistAPI.http.lists.all().done((lists) => {
                    this.listId = lists[0].id;

                    this.getAllTasks().then(() => resolve());

                    this.WunderlistAPI.bindTo(this.WunderlistAPI.restSocket, 'event', (data) => {
                        if (data && data.operation === 'update') {
                            console.log('ws', data);
                        }
                    });
                }).fail((resp, error) => {
                    console.error('there was a problem');
                    reject();
                });
            });
        });
    }

    getListId() {
        return this.listId
    }

    getItems() {
        return this.items
    }

    createItem(title, idx) {
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

    saveItem(item) {
        return new Promise((resolve, reject) => {
            this.WunderlistAPI.http.tasks.update(item.id, item.revision, {
                title: item.title,
                completed: item.completed
            }).done((taskData, statusCode) => {
                resolve();
            }).fail((resp, error) => {
                console.error('there was a problem');
                reject();
            });
        });
    }

    deleteItem(item) {
        return new Promise((resolve, reject) => {
            this.WunderlistAPI.http.tasks.deleteID(item.id, item.revision).always(() => resolve());
        });
    }

    saveItemPositions(sortedIds) {
        return new Promise((resolve, reject) => {
            this.WunderlistAPI.http.task_positions.update(this.listId, this.listPositionRevision, { values: sortedIds }).done((taskPositionsData, statusCode) => {
                this.listPositionRevision = taskPositionsData.revision;
                resolve();
            }).fail((resp, code) => {
                reject();
            });
        });
    }
}

export default new Store();
