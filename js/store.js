import WunderlistSDK from '../dist/wunderlist.sdk.js';
import _ from 'lodash';

const store = {};

(function() {
    let listId;
    let listPositionRevision;
    let items;

    // Returns an instance of the Wunderlist SDK setup with the correct client ID and user access token
    // and sets up a single WebSocket connection for REST over socket proxying
    const WunderlistAPI = new WunderlistSDK({
        accessToken: '19431da9c0b70263ba036e2b33fe1fa71b4687af4573fab141ecab879e35',
        clientID: '68d45e76b1b6bd0c9d63'
    });

    function getListTasks(completed) {
        return new Promise(function (resolve, reject) {
            WunderlistAPI.http.tasks.forList(listId, completed).done(function(tasksData, statusCode) {
                resolve(tasksData);
            }).fail(function(resp, code) {
                console.error(resp, code);
                resolve([]);
            });
        });
    }

    function getTaskPositions() {
        return new Promise(function (resolve, reject) {
            WunderlistAPI.http.task_positions.forList(listId).done(function(tasksPositions, statusCode) {
                listPositionRevision = tasksPositions[0].revision;

                resolve(tasksPositions[0].values);
            }).fail(function(resp, code) {
                console.error(resp, code);
                resolve([]);
            });
        });
    }

    store.onListLoad = function() {
        return new Promise(function (resolve, reject) {
            WunderlistAPI.initialized.done(function () {
                WunderlistAPI.http.lists.all().done(function(lists) {
                    listId = lists[0].id;

                    Promise.all([getListTasks(false), getListTasks(true), getTaskPositions()]).then(function(res) {
                        const taskPositions = res[2];
                        const todos = _.flatten(res.slice(0, 2));

                        items = todos.sort(function(todoA, todoB) {
                            return taskPositions.indexOf(todoA.id) - taskPositions.indexOf(todoB.id);
                        });

                        resolve();
                    }).catch(function(error) {
                        console.error(error);
                        resolve();
                    });

                    WunderlistAPI.bindTo(WunderlistAPI.restSocket, 'event', function (data) {
                        console.log('ws', data);
                    });

                }).fail(function(resp, error) {
                    console.error('there was a problem');
                    resolve();
                });
            });
        });
    };

    store.getListId = () => listId;
    store.getItems = () => items;

    store.createItem = (title, idx) => {
        return new Promise(function(resolve, reject) {
            WunderlistAPI.http.tasks.create({
                list_id: listId,
                title: title
            }).done(function(taskData, statusCode){
                resolve(taskData);
            }).fail(function(resp, error) {
                console.error('there was a problem');
                reject();
            });
        });
    };

    store.saveItem = (item) => {
        return new Promise(function(resolve, reject) {
            WunderlistAPI.http.tasks.update(item.id, item.revision, {
                title: item.title,
                completed: item.completed
            }).done(function(taskData, statusCode){
                resolve();
            }).fail(function(resp, error) {
                console.error('there was a problem');
                reject();
            });
        });
    };

    store.deleteItem = (item) => {
        return new Promise(function(resolve, reject) {
            WunderlistAPI.http.tasks.deleteID(item.id, item.revision).always(() => resolve());
        });
    };

    store.saveItemPositions = (sortedIds) => {
        return new Promise(function(resolve, reject) {
            WunderlistAPI.http.task_positions.update(listId, listPositionRevision, { values: sortedIds }).done(function (taskPositionsData, statusCode) {
                listPositionRevision = taskPositionsData.revision;
                resolve();
            }).fail(function (resp, code) {
                reject();
            });
        });
    };
})();

export default store;
