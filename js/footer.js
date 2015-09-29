import React from 'react';
import Utils from 'utils';
import classNames from 'classnames';

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
        // var cx = React.addons.classSet;
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
        // TODO: replace 'all' with a constant
                            className={cx({selected: nowShowing === 'all'})}>
                                All
                        </a>
                    </li>
                    {' '}
                    <li>
                        <a
                            href="#/active"
        // TODO: replace 'active' with a constant
                            className={cx({selected: nowShowing === 'active'})}>
                                Active
                        </a>
                    </li>
                    {' '}
                    <li>
                        <a
                            href="#/completed"
        // TODO: replace 'completed' with a constant
                            className={cx({selected: nowShowing === 'completed'})}>
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
