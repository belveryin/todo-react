import utils from 'utils';
import store from 'store';
import _ from 'lodash';

class TodoModel {
    constructor() {
        this.key;
        this.todos;
        this.onChanges = [];
    }

    subscribe(onChange) {
        this.onChanges.push(onChange);
    }

    inform() {
        this.onChanges.forEach(cb => cb())
    }

    setKey(key) {
        this.key = key;
    }

    setTodos(todos) {
        this.todos = todos;
        this.inform();
    }

    addTodo(title) {
        store.createItem(title, this.todos.length).then(todo => {
            this.todos = this.todos.concat(todo);
            this.inform();
        });
    }

    toggleAll(checked) {
        // Note: it's usually better to use immutable data structures since they're
        // easier to reason about and React works very well with them. That's why
        // we use map() and filter() everywhere instead of mutating the array or
        // todo items themselves.
        const todos = this.todos.map(todo => {
            return utils.extend({}, todo, {
                completed: checked
            });
        });

        Promise.all(todos.map(store.saveItem)).then(() => {
            this.todos = todos
            this.inform();
        });
    }

    toggle(todoToToggle) {
        const todoToToggleToggled = utils.extend({}, todoToToggle, {
            completed: !todoToToggle.completed
        });

        store.saveItem(todoToToggleToggled).then(() => {
            this.todos = this.todos.map(todo => {
                return todo !== todoToToggle ?
                    todo :
                    utils.extend({}, todo, {
                        completed: !todo.completed
                    });
            });

            this.inform();
        });
    }

    destroy(todoToDestroy) {
        store.deleteItem(todoToDestroy).then(() => {
            this.todos = this.todos.filter(todo => todo !== todoToDestroy);
            this.inform();
        });
    }

    save(todoToSave, text) {
        const todoToSaveSaved = utils.extend({}, todoToSave, {
            title: text
        });

        store.saveItem(todoToSaveSaved).then(() => {
            this.todos = this.todos.map(todo => todo !== todoToSave ? todo : todoToSaveSaved);
            this.inform();
        });
    }

    clearCompleted() {
        Promise.all(this.todos.filter(todo => todo.completed).map(store.deleteItem)).then(() => {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.inform();
        });
    }

    updateItems(todos) {
        this.todos = store.getItems();
        this.inform();
    }

    swap() {
        if (this.idxFrom !== this.idxTo && this.idxFrom !== undefined && this.idxTo !== undefined) {
            const itemFrom = this.todos[this.idxFrom];
            const itemTo = this.todos[this.idxTo];

            this.todos[this.idxFrom] = itemTo;
            this.todos[this.idxTo] = itemFrom;
            this.idxFrom = this.idxTo;

            store.saveItemPositions(_.pluck(this.todos, 'id')).then(() => this.inform());
        }
        this.idxTo = undefined;
    }

    setFrom(idxFrom) {
        this.todoCopy = this.todos.slice();

        this.idxFrom = idxFrom;
    }

    setTo(idxTo) {
        this.idxTo = idxTo;

        this.swap();
    }
}

export default TodoModel;
