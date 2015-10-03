import React from 'react';
import {Router} from 'director';
import TodoModel from 'todoModel';
import TodoItem from 'todoItem';
import TodoFooter from 'footer';
import store from 'store';

require("../node_modules/todomvc-app-css/index.css");
require("../css/index.css");

export const CONST = {
    STATUS: {
        ALL_TODOS: 'all',
        ACTIVE_TODOS: 'active',
        COMPLETED_TODOS: 'completed'
    },
    ENTER_KEY: 13,
    ESCAPE_KEY: 27
};

export class TodoApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        const setState = this.setState;
        const router = Router({
            '/': setState.bind(this, {nowShowing: CONST.STATUS.ALL_TODOS}),
            '/active': setState.bind(this, {nowShowing: CONST.STATUS.ACTIVE_TODOS}),
            '/completed': setState.bind(this, {nowShowing: CONST.STATUS.COMPLETED_TODOS})
        });
        router.init('/');
    }

    handleNewTodoKeyDown(event) {
        if (event.keyCode !== CONST.ENTER_KEY) {
            return;
        }

        event.preventDefault();

        const val = React.findDOMNode(this.refs.newField).value.trim();

        if (val) {
            this.props.model.addTodo(val);
            React.findDOMNode(this.refs.newField).value = '';
        }
    }

    toggleAll(event) {
        const checked = event.target.checked;
        this.props.model.toggleAll(checked);
    }

    toggle(todoToToggle) {
        this.props.model.toggle(todoToToggle);
    }

    destroy(todo) {
        this.props.model.destroy(todo);
    }

    edit(todo) {
        this.setState({editing: todo.id});
    }

    save(todoToSave, text) {
        this.props.model.save(todoToSave, text);
        this.setState({editing: null});
    }

    cancel() {
        this.setState({editing: null});
    }

    clearCompleted() {
        this.props.model.clearCompleted();
    }

    swap() {
        this.props.model.swap();
    }

    setFrom(fromIdx) {
        this.props.model.setFrom(fromIdx);
    }

    setTo(toIdx) {
        this.props.model.setTo(toIdx);
    }

    render() {
        const todos = this.props.model.todos;

        const shownTodos = todos.filter(todo => {
            switch (this.state.nowShowing) {
                case CONST.STATUS.ACTIVE_TODOS:
                    return !todo.completed;
                case CONST.STATUS.COMPLETED_TODOS:
                    return todo.completed;
                default:
                    return true;
            }
        }, this);

        const todoItems = shownTodos.map(todo => {
            return (
                <TodoItem
                    draggable="true"
                    key={todo.id}
                    todo={todo}
                    swap={this.swap.bind(this)}
                    setFrom={this.setFrom.bind(this)}
                    setTo={this.setTo.bind(this)}
                    onToggle={this.toggle.bind(this, todo)}
                    onDestroy={this.destroy.bind(this, todo)}
                    onEdit={this.edit.bind(this, todo)}
                    editing={this.state.editing === todo.id}
                    onSave={this.save.bind(this, todo)}
                    onCancel={this.cancel.bind(this)}
                />
            );
        }, this);

        const activeTodoCount = todos.reduce((accum, todo) => todo.completed ? accum : accum + 1, 0);
        const completedCount = todos.length - activeTodoCount;

        let footer;
        if (activeTodoCount || completedCount) {
            footer =
                <TodoFooter
                    count={activeTodoCount}
                    completedCount={completedCount}
                    nowShowing={this.state.nowShowing}
                    onClearCompleted={this.clearCompleted.bind(this)}
                />;
        }

        let main;
        if (todos.length) {
            main = (
                <section className="main">
                    <input
                        className="toggle-all"
                        type="checkbox"
                        onChange={this.toggleAll.bind(this)}
                        checked={activeTodoCount === 0}
                    />
                    <ul className="todo-list">
                        {todoItems}
                    </ul>
                </section>
            );
        }

        return (
            <div>
                <header className="header">
                    <h1>todos</h1>
                    <input
                        ref="newField"
                        className="new-todo"
                        placeholder="What needs to be done?"
                        onKeyDown={this.handleNewTodoKeyDown.bind(this)}
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

const model = new TodoModel();
const render = () => {
    React.render(
        <TodoApp model={model}/>,
        document.getElementsByClassName('todoapp')[0]
    );
};
model.subscribe(render);

store.setListModel(model);
store.loadList().then(() => {
    render();
});
