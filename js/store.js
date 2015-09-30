import WunderlistSDK from '../dist/wunderlist.sdk.js';
import _ from 'lodash';

const store = {};

(function() {
    let listId;
    let items;
    let taskRevision = 0;

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
                        const tasksOrder = res[2];
                        const todos = _.flatten(res.slice(0, 1));

                        items = todos.map(function(todo) {
                            return {
                                id: todo.id,
                                title: todo.title,
                                completed: todo.completed
                            };
                        }).sort(function(todoA, todoB) {
                            return res[2].indexOf(todoA.id) - res[2].indexOf(todoB);
                        });

                        resolve();
                    }).catch(function(error) {
                        console.error(error);
                        resolve();
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
                resolve({
                    id: taskData.id,
                    title: taskData.title,
                    completed: taskData.completed
                });
            }).fail(function(resp, error) {
                console.error('there was a problem');
                resolve();
            });
        });
    };

    store.saveItem = (item) => {
        return new Promise(function(resolve, reject) {
            WunderlistAPI.http.tasks.update(item.id, taskRevision, {
                title: item.title,
                completed: item.completed
            }).done(function(taskData, statusCode){
                resolve();
            }).fail(function(resp, error) {
                console.error('there was a problem');
                resolve();
            });
        });
    };

    store.deleteItem = (item) => {
        return new Promise(function(resolve, reject) {
            WunderlistAPI.http.tasks.deleteID(item.id, taskRevision).always(function(resp, statusCode){
                resolve();
            });
        });
    };
})();

export default store;
