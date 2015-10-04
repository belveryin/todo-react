import React from 'react';
import TaskListView from 'taskListView';
import TaskListModel from 'taskListModel';
import store from 'store';

require("../node_modules/todomvc-app-css/index.css");
require("../css/index.css");

// Created the model
const model = new TaskListModel();
// Render it
const render = () => {
    React.render(
        <TaskListView model={model}/>,
        document.getElementsByClassName('todoapp')[0]
    );
};
// Subscribe render to call it on model changes
model.subscribe(render);

// Subscribe the model to update it on store changes
store.subscribeListModel(model);
// Only when we get the data from the store we render the page
store.loadList().then(() => {
    render();
});
