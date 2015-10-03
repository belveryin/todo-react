import React from 'react';
import {Router} from 'director';
import TaskListModel from 'taskListModel';
import TaskView from 'taskView';
import FooterView from 'footerView';
import {CONST} from 'app';

require("../node_modules/todomvc-app-css/index.css");
require("../css/index.css");

/**
 * Class to render the whole task list.
 */
class TaskListView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    /**
     * Bind setState with the different statuses with the corresponding routes in the DOM manipulation phase.
     */
    componentDidMount() {
        const setState = this.setState;
        const router = Router({
            '/': setState.bind(this, {nowShowing: CONST.STATUS.ALL_TASKS}),
            '/active': setState.bind(this, {nowShowing: CONST.STATUS.ACTIVE_TASKS}),
            '/completed': setState.bind(this, {nowShowing: CONST.STATUS.COMPLETED_TASKS})
        });
        router.init('/');
    }

    /**
     * Watch on key down for the enter key to create a new task.
     * @param   {Event} event   The keydown event.
     */
    handleNewTaskKeyDown(event) {
        // If not enter key do not continue.
        if (event.keyCode !== CONST.ENTER_KEY) {
            return;
        }

        // Cancel the event to prevent further propagation.
        event.preventDefault();

        const val = React.findDOMNode(this.refs.newField).value.trim();

        // If the value is not empty create a new task and clear the new field input.
        if (val) {
            this.props.model.addTask(val);
            React.findDOMNode(this.refs.newField).value = '';
        }
    }

    /**
     * Toggle all the elements.
     * @param   {Event} event   Click event.
     */
    toggleAll(event) {
        const checked = event.target.checked;
        this.props.model.toggleAll(checked);
    }

    /**
     * Toggle @task.
     * @param   {Object}    task    The task to toggle.
     */
    toggle(task) {
        this.props.model.toggle(task);
    }

    /**
     * Delete @task.
     * @param   {Object}    task    The task to delete.
     */
    delete(task) {
        this.props.model.delete(task);
    }

    /**
     * Start editing @task.
     * @param   {Object}    task    The task to start editing.
     */
    edit(task) {
        this.setState({editing: task.id});
    }

    /**
     * Save @title to @task.
     * @param   {Object}    task    The task to save @title to.
     * @param   {string}    title   The title to save into @task.
     */
    saveTitle(task, title) {
        this.props.model.saveTitle(task, title);
        this.setState({editing: null});
    }

    /**
     * Cancel editing.
     */
    cancel() {
        this.setState({editing: null});
    }

    /**
     * Delete completed tasks
     */
    clearCompleted() {
        this.props.model.clearCompleted();
    }

    /**
     * Swap tasks previously set with setFrom and setTo.
     */
    swap() {
        this.props.model.swap();
    }

    /**
     * Save the index from where to do the swap.
     * @param   {number}    fromIdx The index to do the swap from.
     */
    setFrom(fromIdx) {
        this.props.model.setFrom(fromIdx);
    }

    /**
     * Save the index to where to do the swap.
     * @param   {number}    toIdx   The index to do the swap to.
     */
    setTo(toIdx) {
        this.props.model.setTo(toIdx);
    }

    render() {
        const tasks = this.props.model.tasks;

        // Filter the tasks to be shown by the status.
        const shownTasks = tasks.filter(task => {
            switch (this.state.nowShowing) {
                case CONST.STATUS.ACTIVE_TASKS:
                    return !task.completed;
                case CONST.STATUS.COMPLETED_TASKS:
                    return task.completed;
                default:
                    return true;
            }
        }, this);

        const taskViews = shownTasks.map(task => {
            return (
                <TaskView
                    draggable="true"
                    key={task.id}
                    task={task}
                    swap={this.swap.bind(this)}
                    setFrom={this.setFrom.bind(this)}
                    setTo={this.setTo.bind(this)}
                    onToggle={this.toggle.bind(this, task)}
                    onDelete={this.delete.bind(this, task)}
                    onEdit={this.edit.bind(this, task)}
                    editing={this.state.editing === task.id}
                    onSave={this.saveTitle.bind(this, task)}
                    onCancel={this.cancel.bind(this)}
                />
            );
        }, this);

        const activeTaskCount = tasks.reduce((accum, task) => task.completed ? accum : accum + 1, 0);
        const completedCount = tasks.length - activeTaskCount;

        let footer;
        if (activeTaskCount || completedCount) {
            footer =
                <FooterView
                    count={activeTaskCount}
                    completedCount={completedCount}
                    nowShowing={this.state.nowShowing}
                    onClearCompleted={this.clearCompleted.bind(this)}
                />;
        }

        let main;
        if (tasks.length) {
            main = (
                <section className="main">
                    <input
                        className="toggle-all"
                        type="checkbox"
                        onChange={this.toggleAll.bind(this)}
                        checked={activeTaskCount === 0}
                    />
                    <ul className="todo-list">
                        {taskViews}
                    </ul>
                </section>
            );
        }

        return (
            <div>
                <header className="header">
                    <h1>inbox</h1>
                    <input
                        ref="newField"
                        className="new-todo"
                        placeholder="What needs to be done?"
                        onKeyDown={this.handleNewTaskKeyDown.bind(this)}
                        autoFocus={true}
                    />
                </header>
                {main}
                {footer}
            </div>
        );
        return (<div></div>);
    }
}

export default TaskListView;
