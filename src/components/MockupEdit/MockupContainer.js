'use strict';

var React = require('react/addons');
var update = require('react/lib/update');
var _ = require('underscore');
var DragDropMixin = require('react-dnd').DragDropMixin;

var ObjectTypes = require('../../constants/ObjectTypes');
var MockupActions = require('../../actions/MockupActionCreators');

var Box = require('../MockupObjects/MockupBox');
var Img = require('../MockupObjects/MockupImage');

function makeDropTarget(context, type) {
  return {
    acceptDrop: function(component, item) {
      var clientOffset = context.getCurrentOffsetFromClient();
      var totalOffset = {
        x: Math.round(clientOffset.x),
        y: Math.round(clientOffset.y)
      };
      var delta = context.getCurrentOffsetDelta();
      var relativeOffset = {
        x: Math.round(item.left + delta.x),
        y: Math.round(item.top + delta.y)
      };
      component.moveObject(item, type, totalOffset, relativeOffset);
    }
  };
}

var defaultStyle = "width: 640px; \
height: 480px;";

var Container = React.createClass({
  mixins: [DragDropMixin],

  getInitialState() {
    this.props.objects.boxes = this.props.objects.boxes || {};
    this.props.objects.imgs = this.props.objects.imgs || {};
    this.props.objects.canvas = this.props.objects.canvas || {
      styles: defaultStyle,
      type: "canvas"
    };
    return {
      objects: this.props.objects
    };
  },

  statics: {
    configureDragDrop(register, context) {
      register(ObjectTypes.BOX, {
        dropTarget: makeDropTarget(context, 'boxes')
      });
      register(ObjectTypes.IMAGE, {
        dropTarget: makeDropTarget(context, 'imgs')
      });
      register(ObjectTypes.PREVIEW, {
        dropTarget: makeDropTarget(context, 'imgs')
      });
    }
  },

  componentDidMount() {
    this.updateStyle();
  },

  componentDidUpdate() {
    this.updateStyle();
  },

  updateStyle() {
    var node = React.findDOMNode(this.refs.canvas);
    node.setAttribute("style", (node.getAttribute("style") || "") + this.state.objects.canvas.styles);
  },

  save() {
    MockupActions.update({
      id: this.props.id,
      data: {
        objects: JSON.stringify(this.state.objects)
      }
    });
  },

  moveObject(item, type, total, relative) {
    var id = item.id;
    var left, top, styles, method;
    // Item already at the container
    if (this.state.objects[type][id]) {
      method = "$merge";
      left = relative.x;
      top = relative.y;
      styles = item.styles;
    } else { // New item has been dragged
      method = "$set";
      id = _.uniqueId('object_') + Math.random();
      var container = this.getDOMNode();
      var containerOffset = container.getBoundingClientRect();
      left = total.x - containerOffset.left;
      top = total.y - containerOffset.top;
      styles = "z-index: 0;";
    }
    this.setState(
      update(this.state, {
        objects: {
          [type]: {
            [id]: {
              [method]: {
                left: left,
                top: top,
                styles: styles,
                path: item.path
              }
            }
          }
        }
      }), 
      this.save
    );
  },

  select(object) {
    MockupActions.selectObject({
      object: object,
      update: (param, value) => {
        // Delete an object from mockup
        if (param === 'remove') {
          var newState = this.state;
          delete newState.objects[object.type][object.id];
          this.setState(newState, this.save);
          return;
        }

        // Update property of an object
        if (object.id) {
          this.setState(
            update(this.state, {
              objects: {
                [object.type]: {
                  [object.id]: {
                    $merge: {
                      [param]: value
                    }
                  }
                }
              }
            }),
            this.save
          );
        } else {
          this.setState(
            update(this.state, {
              objects: {
                [object.type]: {
                  $merge: {
                    [param]: value
                  }
                }
              }
            }),
            this.save
          );
        }
      }
    });
  },

  render() {
    var boxes = this.state.objects.boxes || {};
    var selected = this.props.selectedObject ? this.props.selectedObject.data : {};
    var boxNodes = Object.keys(boxes).map(key => {
      var box = boxes[key];
      var { left, top, styles, title } = boxes[key];
      var selectHandler = this.select;

      return (
        <Box key={key}
             id={key}
             left={left}
             top={top}
             styles={styles}
             type="boxes"
             selected = { selected.id === key }
             selectHandler={selectHandler} >
          {title}
        </Box>
      );
    });

    var imgs = this.state.objects.imgs || {};
    var imgNodes = Object.keys(imgs).map(key => {
      var { left, top, styles, title, path } = imgs[key];
      var url = this.props.imageMap[path];
      var selectHandler = this.select;

      return (
        <Img key={key}
             id={key}
             left={left}
             top={top}
             styles={styles}
             path={path}
             url={url}
             type="imgs"
             selected = { selected.id === key }
             selectHandler={selectHandler}/>
      );
    });

    var supportedTypes = [ObjectTypes.BOX, ObjectTypes.IMAGE, ObjectTypes.PREVIEW];
    var selectedClass = selected.type === "canvas" ? "MockupContainer--selected" : "";
    var select = (e) => {
      if (e.target === this.getDOMNode()) {
        this.select(this.state.objects.canvas);
      }
    };

    return (
      <div {...this.dropTargetFor(...supportedTypes)} ref="canvas" className={"MockupContainer " + selectedClass} onClick={select}>
        {boxNodes}
        {imgNodes}
      </div>
    );
  }
});

module.exports = Container;
