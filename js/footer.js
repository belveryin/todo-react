import React from 'react';
import utils from 'utils';
import classNames from 'classnames';
import {CONST} from 'app';

class TodoFooter extends React.Component {
    render() {
        const activeTodoWord = utils.pluralize(this.props.count, 'item');

        let clearButton = null;
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
        const cx = classNames;
        const nowShowing = this.props.nowShowing;
        return (
            <footer className="footer">
                <span className="todo-count">
                    <strong>{this.props.count}</strong> {activeTodoWord} left
                </span>
                <ul className="filters">
                    <li>
                        <a
                            href="#/"
                            className={cx({selected: nowShowing === CONST.STATUS.ALL_TODOS})}>
                                All
                        </a>
                    </li>
                    &nbsp;
                    <li>
                        <a
                            href="#/active"
                            className={cx({selected: nowShowing === CONST.STATUS.ACTIVE_TODOS})}>
                                Active
                        </a>
                    </li>
                    &nbsp;
                    <li>
                        <a
                            href="#/completed"
                            className={cx({selected: nowShowing === CONST.STATUS.COMPLETED_TODOS})}>
                                Completed
                        </a>
                    </li>
                </ul>
                {clearButton}
            </footer>
        );
    }
}

export default TodoFooter;
