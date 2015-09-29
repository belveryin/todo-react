import React from 'react';
import Utils from 'utils';
import classNames from 'classnames';
// TODO: unable to import with syntax: import {TodoModel, CONST} from 'app';
import app from 'app';

var TodoFooter = React.createClass({
    render: function () {
        var activeTodoWord = Utils.pluralize(this.props.count, 'item');
        var clearButton = null;

        if (this.props.completedCount > 0) {
            clearButton = (
                <button
                    className="clear-completed"
                    onClick={this.props.onClearCompleted}>
                    Clear completed
                </button>
            );
        }

        // Cache `classNames` since it'll be used often
        var cx = classNames;
        var nowShowing = this.props.nowShowing;
        return (
            <footer className="footer">
                <span className="todo-count">
                    <strong>{this.props.count}</strong> {activeTodoWord} left
                </span>
                <ul className="filters">
                    <li>
                        <a
                            href="#/"
                            className={cx({selected: nowShowing === app.CONST.STATUS.ALL_TODOS})}>
                                All
                        </a>
                    </li>
                    {' '}
                    <li>
                        <a
                            href="#/active"
                            className={cx({selected: nowShowing === app.CONST.STATUS.ACTIVE_TODOS})}>
                                Active
                        </a>
                    </li>
                    {' '}
                    <li>
                        <a
                            href="#/completed"
                            className={cx({selected: nowShowing === app.CONST.STATUS.COMPLETED_TODOS})}>
                                Completed
                        </a>
                    </li>
                </ul>
                {clearButton}
            </footer>
        );
    }
});

export default TodoFooter;
