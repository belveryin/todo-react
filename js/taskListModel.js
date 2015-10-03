import utils from 'utils';
import store from 'store';
import _ from 'lodash';

/**
 * The model of the task list.
 */
class TaskListModel {
    constructor() {
        this.id;
        this.tasks;
        // List with the list of callbacks to call when there are changes on the model.
        this.onChanges = [];
        // Indexes saved to perform the swap operation.
        this.idxFrom;
        this.idxTo;
    }

    /**
     * Subscribe @onChange to be called when there are changes on the model.
     * @param   {Function}  onChange    A function to be called when there are changes in the model.
     */
    subscribe(onChange) {
        this.onChanges.push(onChange);
    }

    /**
     * Inform the subscribed callbacks when there are changes in the model.
     */
    inform() {
        this.onChanges.forEach(cb => cb())
    }

    /**
     * Set the list id.
     * @param   {number}    id  The id of the list.
     */
    setListId(id) {
        this.id = id;
    }

    /**
     * Set the tasks and inform the subscribed callbacks.
     * @param   {Object[]}  tasks  A list of tasks.
     */
    setTasks(tasks) {
        this.tasks = tasks;
        this.inform();
    }

    /**
     * Add task with given @title.
     * @param   {string}    title   The title of the task to be created.
     */
    addTask(title) {
        store.createTask(title).then(task => {
            this.tasks = this.tasks.concat(task);
            this.inform();
        });
    }

    /**
     * Change completed field of all the tasks to @checked.
     * @param   {boolean}   checked Value to set completed to.
     */
    toggleAll(checked) {
        // Note: it's usually better to use immutable data structures since they're
        // easier to reason about and React works very well with them. That's why
        // we use map() and filter() everywhere instead of mutating the array or
        // task themselves.
        const tasks = this.tasks.map(task => {
            return utils.extend(task, {
                completed: checked
            });
        });

        Promise.all(tasks.map(store.saveTask)).then(() => {
            this.tasks = tasks
            this.inform();
        });
    }

    /**
     * Change completed status of @taskToToggle to its opposite.
     * @param   {object}    taskToToggle    The task to toggle.
     */
    toggle(taskToToggle) {
        const taskToToggleToggled = utils.extend(taskToToggle, {
            completed: !taskToToggle.completed
        });

        store.saveTask(taskToToggleToggled).then(() => {
            this.tasks = this.tasks.map(task => {
                return task !== taskToToggle ?
                    task :
                    utils.extend(task, {
                        completed: !task.completed
                    });
            });

            this.inform();
        });
    }

    /**
     * Delete a task.
     * @param   taskToDelete    {Object}    Task to delete;
     */
    delete(taskToDelete) {
        store.deleteTask(taskToDelete).then(() => {
            this.tasks = this.tasks.filter(task => task !== taskToDelete);
            this.inform();
        });
    }

    /**
     * Save @title of @taskToSave.
     * @param   {Object}    taskToSave  Task to save @title into.
     * @param   {string}    title       Title to save into @taskToSave.
     */
    saveTitle(taskToSave, title) {
        const taskToSaveSaved = utils.extend(taskToSave, {
            title: title
        });

        store.saveTask(taskToSaveSaved).then(() => {
            this.tasks = this.tasks.map(task => task !== taskToSave ? task : taskToSaveSaved);
            this.inform();
        });
    }

    /**
     * Delete the completed tasks
     */
    clearCompleted() {
        Promise.all(this.tasks.filter(task => task.completed).map(store.deleteTask)).then(() => {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.inform();
        });
    }

    /**
     * Store the index to swap from.
     * @param   {number}    idxFrom The index to swap from.
     */
    setFrom(idxFrom) {
        this.idxFrom = idxFrom;
    }

    /**
     * Store the index to swap to.
     * @param   {number}    idxFrom The index to swap to.
     */
    setTo(idxTo) {
        this.idxTo = idxTo;
    }

    /**
     * Swap the elements form indexes this.idxFrom and this.idxTo.
     */
    swap() {
        if (this.idxFrom !== this.idxTo && this.idxFrom !== undefined && this.idxTo !== undefined) {
            const taskFrom = this.tasks[this.idxFrom];
            const taskTo = this.tasks[this.idxTo];

            this.tasks[this.idxFrom] = taskTo;
            this.tasks[this.idxTo] = taskFrom;
            this.idxFrom = this.idxTo;

            store.saveTaskPositions(_.pluck(this.tasks, 'id')).then(() => this.inform());
        }
        this.idxTo = undefined;
    }
}

export default TaskListModel;
