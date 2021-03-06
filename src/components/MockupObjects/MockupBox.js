'use strict';

var React = require('react/addons');
var update = require('react/lib/update');
var DragDropMixin = require('react-dnd').DragDropMixin;
var DropEffects = require('react-dnd').DropEffects;
var MockupActions = require('../../actions/MockupActionCreators');
var ObjectTypes = require('../../constants/ObjectTypes');

require('./MockupItem.scss');

var dragSource = {
  beginDrag(component) {
    return {
      effectAllowed: DropEffects.MOVE,
      item: component.props
    };
  }
};

var Box = React.createClass({
  mixins: [DragDropMixin],

  propTypes: {
    id: React.PropTypes.any.isRequired,
    left: React.PropTypes.number.isRequired,
    top: React.PropTypes.number.isRequired,
    styles: React.PropTypes.string
  },

  statics: {
    configureDragDrop(register) {
      register(ObjectTypes.BOX, { dragSource });
    }
  },

  render() {
    var { left, top, styles, children } = this.props;
    var selectHandler = () => { this.props.selectHandler(this.props); };
    var selectedClass = this.props.selected ? "MockupObject--selected" : "";

    return (
      <div className={"MockupObject MockupBox " + selectedClass}
        onClick={selectHandler} 
        {...this.dragSourceFor(ObjectTypes.BOX)} 
           style={{
              left,
              top,
              styles
           }}
      >
        {children}
      </div>
    );
  }
});

module.exports = Box;
