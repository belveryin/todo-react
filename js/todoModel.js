import utils from 'utils';
import store from 'store';

// Generic "model" object. You can use whatever
// framework you want. For this application it
// may not even be worth separating this logic
// out, but we do this to demonstrate one way to
// separate out parts of your application.
class TodoModel {
    constructor(key) {
        this.key = key;
        this.todos = store.getItems();
        this.onChanges = [];
    }

    subscribe(onChange) {
        this.onChanges.push(onChange);
    }

    inform() {
        this.onChanges.forEach(cb => cb())
    }

    addTodo(title) {
        store.createItem(title, this.todos.length).then(function(todo) {
            this.todos = this.todos.concat(todo);
            this.inform();
        }.bind(this));
    }

    toggleAll(checked) {
        // Note: it's usually better to use immutable data structures since they're
        // easier to reason about and React works very well with them. That's why
        // we use map() and filter() everywhere instead of mutating the array or
        // todo items themselves.
        // TODO: update with store abstraction
        this.todos = this.todos.map(todo => {
            return utils.extend({}, todo, {
                completed: checked
            });
        });

        this.inform();
    }

    toggle(todoToToggle) {
        // TODO: update with store abstraction
        this.todos = this.todos.map(todo => {
            return todo !== todoToToggle ?
                todo :
                utils.extend({}, todo, {
                    completed: !todo.completed
                });
        });

        this.inform();
    }

    destroy(todoToDestroy) {
        // TODO: update with store abstraction
        this.todos = this.todos.filter(todo => todo !== todoToDestroy);

        this.inform();
    }

    save(todoToSave, text) {
        // TODO: update with store abstraction
        this.todos = this.todos.map(todo => todo !== todoToSave ? todo : utils.extend({}, todo, { title: text }));

        this.inform();
    }

    clearCompleted() {
        // TODO: update with store abstraction
        this.todos = this.todos.filter(todo => !todo.completed);

        this.inform();
    }

    swap() {
        // TODO: update with store abstraction
        if (this.idxFrom !== this.idxTo && this.idxFrom !== undefined && this.idxTo !== undefined) {
            const itemFrom = this.todos[this.idxFrom];
            const itemTo = this.todos[this.idxTo];

            this.todos[this.idxFrom] = itemTo;
            this.todos[this.idxTo] = itemFrom;
            this.idxFrom = this.idxTo;

            this.inform();
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
