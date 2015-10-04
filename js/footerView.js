import React from 'react';
import utils from 'utils';
import classNames from 'classnames';
import config from 'config';

/**
 * React component with the view of the footer to filter the completed tasks.
 */
class FooterView extends React.Component {
    render() {
        const activeTaskWord = utils.pluralize(this.props.count, 'task');

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
                    <strong>{this.props.count}</strong> {activeTaskWord} left
                </span>
                <ul className="filters">
                    <li>
                        <a
                            href="#/"
                            className={cx({selected: nowShowing === config.STATUS.ALL_TASKS})}>
                                All
                        </a>
                    </li>
                    &nbsp;
                    <li>
                        <a
                            href="#/active"
                            className={cx({selected: nowShowing === config.STATUS.ACTIVE_TASKS})}>
                                Active
                        </a>
                    </li>
                    &nbsp;
                    <li>
                        <a
                            href="#/completed"
                            className={cx({selected: nowShowing === config.STATUS.COMPLETED_TASKS})}>
                                Completed
                        </a>
                    </li>
                </ul>
                {clearButton}
            </footer>
        );
    }
}

export default FooterView;
