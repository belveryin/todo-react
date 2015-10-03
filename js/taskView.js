import React from 'react';
import utils from 'utils';
import classNames from 'classnames';
import {CONST} from 'app';

/**
 * React component for a task view.
 */
class TaskView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.prevTitle;
    }

    /**
     * Save the data to the model.
     * @param   {Event} event   On keydown event.
     */
    handleSubmit(event) {
        const val = this.state.editText.trim();
        if (val !== this.prevTitle) {
            this.props.onSave(val);
            this.setState({editText: val});
            this.prevTitle = val;
        } else if (!val) {
            this.props.onDelete();
        } else {
            this.props.onCancel();
        }
    }

    /**
     * Start editing a task.
     */
    handleEdit() {
        this.props.onEdit();
        this.setState({editText: this.props.task.title});
        this.prevTitle = this.props.task.title;
    }

    /**
     * On key down. Cancel editing if it is the scape key and save to the model if it is the enter key.
     * @param   {Event} event   On keydown event.
     */
    handleKeyDown(event) {
        if (event.which === CONST.ESCAPE_KEY) {
            this.setState({editText: this.props.task.title});
            this.props.onCancel(event);
        } else if (event.which === CONST.ENTER_KEY) {
            this.handleSubmit(event);
        }
    }

    handleChange(event) {
        this.setState({editText: event.target.value});
    }

    /**
     * Safely manipulate the DOM after updating the state when invoking
     * `this.props.onEdit()` in the `handleEdit` method above.
     * For more info refer to notes at https://facebook.github.io/react/docs/component-api.html#setstate
     * and https://facebook.github.io/react/docs/component-specs.html#updating-componentdidupdate
     */
    componentDidUpdate(prevProps) {
        if (!prevProps.editing && this.props.editing) {
            const node = React.findDOMNode(this.refs.editField);
            node.focus();
            node.setSelectionRange(node.value.length, node.value.length);
        }
    }

    /**
     * Start drag event.
     * @param   {Event} event   Drag event.
     */
    dragStart(event) {
        event.dataTransfer.effectAllowed = 'move';

        // Firefox requires calling dataTransfer.setData
        // for the drag to properly work
        event.dataTransfer.setData("text/html", event.currentTarget);

        this.props.setFrom(utils.indexOfChild(event.currentTarget));
    }

    /**
     * Drag over event.
     * @param   {Event} event   Drag event.
     */
    dragOver(event) {
        event.preventDefault();

        this.props.setTo(utils.indexOfChild(event.currentTarget));
        this.props.swap();
    }

    render() {
        return (
            <li className={classNames({
                    completed: this.props.task.completed,
                    editing: this.props.editing
                })}
                /* Add drag and drop handling */
                draggable="true"
                onDragStart={this.dragStart.bind(this)}
                onDragOver={this.dragOver.bind(this)}>
                <div className="view">
                    <input
                        className="toggle"
                        type="checkbox"
                        checked={this.props.task.completed}
                        onChange={this.props.onToggle}
                    />
                    {/* Change label for span to be able to drag in Firefox */}
                    <span onDoubleClick={this.handleEdit.bind(this)}>
                        {this.props.task.title}
                    </span>
                    <button className="destroy" onClick={this.props.onDelete} />
                </div>
                <input
                    ref="editField"
                    className="edit"
                    value={this.state.editText}
                    onBlur={this.handleSubmit.bind(this)}
                    onChange={this.handleChange.bind(this)}
                    onKeyDown={this.handleKeyDown.bind(this)}
                />
            </li>
        );
    }
}

export default TaskView;
