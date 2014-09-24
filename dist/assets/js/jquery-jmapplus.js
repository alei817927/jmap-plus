/**
 * jVectorMap version 1.2.2
 *
 * Copyright 2011-2013, Kirill Lebedev
 * Licensed under the MIT license.
 *
 */
(function ($) {
  var apiParams = {
    set: {
      colors: 1,
      values: 1,
      backgroundColor: 1,
      scaleColors: 1,
      normalizeFunction: 1,
      focus: 1
    },
    get: {
      selectedRegions: 1,
      selectedMarkers: 1,
      mapObject: 1,
      regionName: 1
    }
  };

  $.fn.vectorMap = function (options) {
    var methodName, event,
      map = this.children('.jvectormap-container').data('mapObject');

    if (options === 'addMap') {
      jvm.WorldMap.maps[arguments[1]] = arguments[2];
    } else if ((options === 'set' || options === 'get') && apiParams[options][arguments[1]]) {
      methodName = arguments[1].charAt(0).toUpperCase() + arguments[1].substr(1);
      return map[options + methodName].apply(map, Array.prototype.slice.call(arguments, 2));
    } else {
      options = options || {};
      options.container = this;
      map = new jvm.WorldMap(options);
    }

    return this;
  };
})(jQuery);

/**
 * @namespace jvm Holds core methods and classes used by jVectorMap.
 */
var jvm = {

  /**
   * Inherits child's prototype from the parent's one.
   * @param {Function} child
   * @param {Function} parent
   */
  inherits: function (child, parent) {
    function temp() {
    }

    temp.prototype = parent.prototype;
    child.prototype = new temp();
    child.prototype.constructor = child;
    child.parentClass = parent;
  },

  /**
   * Mixes in methods from the source constructor to the target one.
   * @param {Function} target
   * @param {Function} source
   */
  mixin: function (target, source) {
    var prop;

    for (prop in source.prototype) {
      if (source.prototype.hasOwnProperty(prop)) {
        target.prototype[prop] = source.prototype[prop];
      }
    }
  },

  min: function (values) {
    var min = Number.MAX_VALUE,
      i;

    if (values instanceof Array) {
      for (i = 0; i < values.length; i++) {
        if (values[i] < min) {
          min = values[i];
        }
      }
    } else {
      for (i in values) {
        if (values[i] < min) {
          min = values[i];
        }
      }
    }
    return min;
  },

  max: function (values) {
    var max = Number.MIN_VALUE,
      i;

    if (values instanceof Array) {
      for (i = 0; i < values.length; i++) {
        if (values[i] > max) {
          max = values[i];
        }
      }
    } else {
      for (i in values) {
        if (values[i] > max) {
          max = values[i];
        }
      }
    }
    return max;
  },

  keys: function (object) {
    var keys = [],
      key;

    for (key in object) {
      keys.push(key);
    }
    return keys;
  },

  values: function (object) {
    var values = [],
      key,
      i;

    for (i = 0; i < arguments.length; i++) {
      object = arguments[i];
      for (key in object) {
        values.push(object[key]);
      }
    }
    return values;
  }
};

jvm.$ = jQuery;
/**
 * Basic wrapper for DOM element.
 * @constructor
 * @param {String} name Tag name of the element
 * @param {Object} config Set of parameters to initialize element with
 */
jvm.AbstractElement = function (name, config) {
  /**
   * Underlying DOM element
   * @type {DOMElement}
   * @private
   */
  this.node = this.createElement(name);

  /**
   * Name of underlying element
   * @type {String}
   * @private
   */
  this.name = name;

  /**
   * Internal store of attributes
   * @type {Object}
   * @private
   */
  this.properties = {};

  if (config) {
    this.set(config);
  }
};

/**
 * Set attribute of the underlying DOM element.
 * @param {String} name Name of attribute
 * @param {Number|String} config Set of parameters to initialize element with
 */
jvm.AbstractElement.prototype.set = function (property, value) {
  var key;

  if (typeof property === 'object') {
    for (key in property) {
      this.properties[key] = property[key];
      this.applyAttr(key, property[key]);
    }
  } else {
    this.properties[property] = value;
    this.applyAttr(property, value);
  }
};

/**
 * Returns value of attribute.
 * @param {String} name Name of attribute
 */
jvm.AbstractElement.prototype.get = function (property) {
  return this.properties[property];
};

/**
 * Applies attribute value to the underlying DOM element.
 * @param {String} name Name of attribute
 * @param {Number|String} config Value of attribute to apply
 * @private
 */
jvm.AbstractElement.prototype.applyAttr = function (property, value) {
  this.node.setAttribute(property, value);
};

jvm.AbstractElement.prototype.remove = function () {
  jvm.$(this.node).remove();
};
/**
 * Implements abstract vector canvas.
 * @constructor
 * @param {HTMLElement} container Container to put element to.
 * @param {Number} width Width of canvas.
 * @param {Number} height Height of canvas.
 */
jvm.AbstractCanvasElement = function (container, width, height) {
  this.container = container;
  this.setSize(width, height);
  this.rootElement = new jvm[this.classPrefix + 'GroupElement']();
  this.node.appendChild(this.rootElement.node);
  this.container.appendChild(this.node);
};

/**
 * Add element to the certain group inside of the canvas.
 * @param {HTMLElement} element Element to add to canvas.
 * @param {HTMLElement} group Group to add element into or into root group if not provided.
 */
jvm.AbstractCanvasElement.prototype.add = function (element, group) {
  group = group || this.rootElement;
  group.add(element);
  element.canvas = this;
};

/**
 * Create path and add it to the canvas.
 * @param {Object} config Parameters of path to create.
 * @param {Object} style Styles of the path to create.
 * @param {HTMLElement} group Group to add path into.
 */
jvm.AbstractCanvasElement.prototype.addPath = function (config, style, group) {
  var el = new jvm[this.classPrefix + 'PathElement'](config, style);

  this.add(el, group);
  return el;
};

/**
 * Create circle and add it to the canvas.
 * @param {Object} config Parameters of path to create.
 * @param {Object} style Styles of the path to create.
 * @param {HTMLElement} group Group to add circle into.
 */
jvm.AbstractCanvasElement.prototype.addCircle = function (config, style, group) {
  var el = new jvm[this.classPrefix + 'CircleElement'](config, style);

  this.add(el, group);
  return el;
};

jvm.AbstractCanvasElement.prototype.addLine = function (config, style, group) {
  var el = new jvm[this.classPrefix + 'PolyLineElement'](config, style);

  this.add(el, group);
  return el;
};
/**
 * Add group to the another group inside of the canvas.
 * @param {HTMLElement} group Group to add circle into or root group if not provided.
 */
jvm.AbstractCanvasElement.prototype.addGroup = function (parentGroup) {
  var el = new jvm[this.classPrefix + 'GroupElement']();

  if (parentGroup) {
    parentGroup.node.appendChild(el.node);
  } else {
    this.node.appendChild(el.node);
  }
  el.canvas = this;
  return el;
};
/**
 * Abstract shape element. Shape element represents some visual vector or raster object.
 * @constructor
 * @param {String} name Tag name of the element.
 * @param {Object} config Set of parameters to initialize element with.
 * @param {Object} style Object with styles to set on element initialization.
 */
jvm.AbstractShapeElement = function (name, config, style) {
  this.style = style || {};
  this.style.current = {};
  this.isHovered = false;
  this.isSelected = false;
  this.updateStyle();
};

/**
 * Set hovered state to the element. Hovered state means mouse cursor is over element. Styles will be updates respectively.
 * @param {Boolean} isHovered <code>true</code> to make element hovered, <code>false</code> otherwise.
 */
jvm.AbstractShapeElement.prototype.setHovered = function (isHovered) {
  if (this.isHovered !== isHovered) {
    this.isHovered = isHovered;
    this.updateStyle();
  }
};

/**
 * Set selected state to the element. Styles will be updates respectively.
 * @param {Boolean} isSelected <code>true</code> to make element selected, <code>false</code> otherwise.
 */
jvm.AbstractShapeElement.prototype.setSelected = function (isSelected) {
  if (this.isSelected !== isSelected) {
    this.isSelected = isSelected;
    this.updateStyle();
    jvm.$(this.node).trigger('selected', [isSelected]);
  }
};

/**
 * Set element's style.
 * @param {Object|String} property Could be string to set only one property or object to set several style properties at once.
 * @param {String} value Value to set in case only one property should be set.
 */
jvm.AbstractShapeElement.prototype.setStyle = function (property, value) {
  var styles = {};

  if (typeof property === 'object') {
    styles = property;
  } else {
    styles[property] = value;
  }
  jvm.$.extend(this.style.current, styles);
  this.updateStyle();
};


jvm.AbstractShapeElement.prototype.updateStyle = function () {
  var attrs = {};

  jvm.AbstractShapeElement.mergeStyles(attrs, this.style.initial);
  jvm.AbstractShapeElement.mergeStyles(attrs, this.style.current);
  if (this.isHovered) {
    jvm.AbstractShapeElement.mergeStyles(attrs, this.style.hover);
  }
  if (this.isSelected) {
    jvm.AbstractShapeElement.mergeStyles(attrs, this.style.selected);
    if (this.isHovered) {
      jvm.AbstractShapeElement.mergeStyles(attrs, this.style.selectedHover);
    }
  }
  this.set(attrs);
};

jvm.AbstractShapeElement.mergeStyles = function (styles, newStyles) {
  var key;

  newStyles = newStyles || {};
  for (key in newStyles) {
    if (newStyles[key] === null) {
      delete styles[key];
    } else {
      styles[key] = newStyles[key];
    }
  }
};
/**
 * Wrapper for SVG element.
 * @constructor
 * @extends jvm.AbstractElement
 * @param {String} name Tag name of the element
 * @param {Object} config Set of parameters to initialize element with
 */

jvm.SVGElement = function (name, config) {
  jvm.SVGElement.parentClass.apply(this, arguments);
};

jvm.inherits(jvm.SVGElement, jvm.AbstractElement);

jvm.SVGElement.svgns = "http://www.w3.org/2000/svg";

/**
 * Creates DOM element.
 * @param {String} tagName Name of element
 * @private
 * @returns DOMElement
 */
jvm.SVGElement.prototype.createElement = function (tagName) {
  return document.createElementNS(jvm.SVGElement.svgns, tagName);
};

/**
 * Adds CSS class for underlying DOM element.
 * @param {String} className Name of CSS class name
 */
jvm.SVGElement.prototype.addClass = function (className) {
  this.node.setAttribute('class', className);
};

/**
 * Returns constructor for element by name prefixed with 'VML'.
 * @param {String} ctr Name of basic constructor to return
 * proper implementation for.
 * @returns Function
 * @private
 */
jvm.SVGElement.prototype.getElementCtr = function (ctr) {
  return jvm['SVG' + ctr];
};

jvm.SVGElement.prototype.getBBox = function () {
  return this.node.getBBox();
};
jvm.SVGGroupElement = function () {
  jvm.SVGGroupElement.parentClass.call(this, 'g');
};

jvm.inherits(jvm.SVGGroupElement, jvm.SVGElement);

jvm.SVGGroupElement.prototype.add = function (element) {
  this.node.appendChild(element.node);
};
jvm.SVGCanvasElement = function (container, width, height) {
  this.classPrefix = 'SVG';
  jvm.SVGCanvasElement.parentClass.call(this, 'svg');
  jvm.AbstractCanvasElement.apply(this, arguments);
};

jvm.inherits(jvm.SVGCanvasElement, jvm.SVGElement);
jvm.mixin(jvm.SVGCanvasElement, jvm.AbstractCanvasElement);

jvm.SVGCanvasElement.prototype.setSize = function (width, height) {
  this.width = width;
  this.height = height;
  this.node.setAttribute('width', width);
  this.node.setAttribute('height', height);
};

jvm.SVGCanvasElement.prototype.applyTransformParams = function (scale, transX, transY) {
  this.scale = scale;
  this.transX = transX;
  this.transY = transY;
  this.rootElement.node.setAttribute('transform', 'scale(' + scale + ') translate(' + transX + ', ' + transY + ')');
};
jvm.SVGShapeElement = function (name, config, style) {
  jvm.SVGShapeElement.parentClass.call(this, name, config);
  jvm.AbstractShapeElement.apply(this, arguments);
};

jvm.inherits(jvm.SVGShapeElement, jvm.SVGElement);
jvm.mixin(jvm.SVGShapeElement, jvm.AbstractShapeElement);
jvm.SVGPathElement = function (config, style) {
  jvm.SVGPathElement.parentClass.call(this, 'path', config, style);
  this.node.setAttribute('fill-rule', 'evenodd');
};

jvm.inherits(jvm.SVGPathElement, jvm.SVGShapeElement);
jvm.SVGCircleElement = function (config, style) {
  jvm.SVGCircleElement.parentClass.call(this, 'circle', config, style);
};

jvm.inherits(jvm.SVGCircleElement, jvm.SVGShapeElement);
jvm.SVGPolyLineElement = function (config, style) {
  jvm.SVGPolyLineElement.parentClass.call(this, 'polyline', config, style);
};

jvm.inherits(jvm.SVGPolyLineElement, jvm.SVGShapeElement);
/**
 * Wrapper for VML element.
 * @constructor
 * @extends jvm.AbstractElement
 * @param {String} name Tag name of the element
 * @param {Object} config Set of parameters to initialize element with
 */

jvm.VMLElement = function (name, config) {
  if (!jvm.VMLElement.VMLInitialized) {
    jvm.VMLElement.initializeVML();
  }

  jvm.VMLElement.parentClass.apply(this, arguments);
};

jvm.inherits(jvm.VMLElement, jvm.AbstractElement);

/**
 * Shows if VML was already initialized for the current document or not.
 * @static
 * @private
 * @type {Boolean}
 */
jvm.VMLElement.VMLInitialized = false;

/**
 * Initializes VML handling before creating the first element
 * (adds CSS class and creates namespace). Adds one of two forms
 * of createElement method depending of support by browser.
 * @static
 * @private
 */

  // The following method of VML handling is borrowed from the
  // Raphael library by Dmitry Baranovsky.

jvm.VMLElement.initializeVML = function () {
  try {
    if (!document.namespaces.rvml) {
      document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
    }
    /**
     * Creates DOM element.
     * @param {String} tagName Name of element
     * @private
     * @returns DOMElement
     */
    jvm.VMLElement.prototype.createElement = function (tagName) {
      return document.createElement('<rvml:' + tagName + ' class="rvml">');
    };
  } catch (e) {
    /**
     * @private
     */
    jvm.VMLElement.prototype.createElement = function (tagName) {
      return document.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
    };
  }
  document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
  jvm.VMLElement.VMLInitialized = true;
};

/**
 * Returns constructor for element by name prefixed with 'VML'.
 * @param {String} ctr Name of basic constructor to return
 * proper implementation for.
 * @returns Function
 * @private
 */
jvm.VMLElement.prototype.getElementCtr = function (ctr) {
  return jvm['VML' + ctr];
};

/**
 * Adds CSS class for underlying DOM element.
 * @param {String} className Name of CSS class name
 */
jvm.VMLElement.prototype.addClass = function (className) {
  jvm.$(this.node).addClass(className);
};

/**
 * Applies attribute value to the underlying DOM element.
 * @param {String} name Name of attribute
 * @param {Number|String} config Value of attribute to apply
 * @private
 */
jvm.VMLElement.prototype.applyAttr = function (attr, value) {
  this.node[attr] = value;
};

/**
 * Returns boundary box for the element.
 * @returns {Object} Boundary box with numeric fields: x, y, width, height
 * @override
 */
jvm.VMLElement.prototype.getBBox = function () {
  var node = jvm.$(this.node);
  return {
    x: node.position().left / this.canvas.scale,
    y: node.position().top / this.canvas.scale,
    width: node.width() / this.canvas.scale,
    height: node.height() / this.canvas.scale
  };
};
jvm.VMLGroupElement = function () {
  jvm.VMLGroupElement.parentClass.call(this, 'group');

  this.node.style.left = '0px';
  this.node.style.top = '0px';
  this.node.coordorigin = "0 0";
};

jvm.inherits(jvm.VMLGroupElement, jvm.VMLElement);

jvm.VMLGroupElement.prototype.add = function (element) {
  this.node.appendChild(element.node);
};
jvm.VMLCanvasElement = function (container, width, height) {
  this.classPrefix = 'VML';
  jvm.VMLCanvasElement.parentClass.call(this, 'group');
  jvm.AbstractCanvasElement.apply(this, arguments);
  this.node.style.position = 'absolute';
};

jvm.inherits(jvm.VMLCanvasElement, jvm.VMLElement);
jvm.mixin(jvm.VMLCanvasElement, jvm.AbstractCanvasElement);

jvm.VMLCanvasElement.prototype.setSize = function (width, height) {
  var paths,
    groups,
    i,
    l;

  this.width = width;
  this.height = height;
  this.node.style.width = width + "px";
  this.node.style.height = height + "px";
  this.node.coordsize = width + ' ' + height;
  this.node.coordorigin = "0 0";
  if (this.rootElement) {
    paths = this.rootElement.node.getElementsByTagName('shape');
    for (i = 0, l = paths.length; i < l; i++) {
      paths[i].coordsize = width + ' ' + height;
      paths[i].style.width = width + 'px';
      paths[i].style.height = height + 'px';
    }
    groups = this.node.getElementsByTagName('group');
    for (i = 0, l = groups.length; i < l; i++) {
      groups[i].coordsize = width + ' ' + height;
      groups[i].style.width = width + 'px';
      groups[i].style.height = height + 'px';
    }
  }
};

jvm.VMLCanvasElement.prototype.applyTransformParams = function (scale, transX, transY) {
  this.scale = scale;
  this.transX = transX;
  this.transY = transY;
  this.rootElement.node.coordorigin = (this.width - transX - this.width / 100) + ',' + (this.height - transY - this.height / 100);
  this.rootElement.node.coordsize = this.width / scale + ',' + this.height / scale;
};
jvm.VMLShapeElement = function (name, config) {
  jvm.VMLShapeElement.parentClass.call(this, name, config);

  this.fillElement = new jvm.VMLElement('fill');
  this.strokeElement = new jvm.VMLElement('stroke');
  this.node.appendChild(this.fillElement.node);
  this.node.appendChild(this.strokeElement.node);
  this.node.stroked = false;

  jvm.AbstractShapeElement.apply(this, arguments);
};

jvm.inherits(jvm.VMLShapeElement, jvm.VMLElement);
jvm.mixin(jvm.VMLShapeElement, jvm.AbstractShapeElement);

jvm.VMLShapeElement.prototype.applyAttr = function (attr, value) {
  switch (attr) {
    case 'fill':
      this.node.fillcolor = value;
      break;
    case 'fill-opacity':
      this.fillElement.node.opacity = Math.round(value * 100) + '%';
      break;
    case 'stroke':
      if (value === 'none') {
        this.node.stroked = false;
      } else {
        this.node.stroked = true;
      }
      this.node.strokecolor = value;
      break;
    case 'stroke-opacity':
      this.strokeElement.node.opacity = Math.round(value * 100) + '%';
      break;
    case 'stroke-width':
      if (parseInt(value, 10) === 0) {
        this.node.stroked = false;
      } else {
        this.node.stroked = true;
      }
      this.node.strokeweight = value;
      break;
    case 'd':
      this.node.path = jvm.VMLPathElement.pathSvgToVml(value);
      break;
    default:
      jvm.VMLShapeElement.parentClass.prototype.applyAttr.apply(this, arguments);
  }
};
jvm.VMLPathElement = function (config, style) {
  var scale = new jvm.VMLElement('skew');

  jvm.VMLPathElement.parentClass.call(this, 'shape', config, style);

  this.node.coordorigin = "0 0";

  scale.node.on = true;
  scale.node.matrix = '0.01,0,0,0.01,0,0';
  scale.node.offset = '0,0';

  this.node.appendChild(scale.node);
};

jvm.inherits(jvm.VMLPathElement, jvm.VMLShapeElement);

jvm.VMLPathElement.prototype.applyAttr = function (attr, value) {
  if (attr === 'd') {
    this.node.path = jvm.VMLPathElement.pathSvgToVml(value);
  } else {
    jvm.VMLShapeElement.prototype.applyAttr.call(this, attr, value);
  }
};

jvm.VMLPathElement.pathSvgToVml = function (path) {
  var result = '',
    cx = 0, cy = 0, ctrlx, ctrly;

  path = path.replace(/(-?\d+)e(-?\d+)/g, '0');
  return path.replace(/([MmLlHhVvCcSs])\s*((?:-?\d*(?:\.\d+)?\s*,?\s*)+)/g, function (segment, letter, coords, index) {
    coords = coords.replace(/(\d)-/g, '$1,-')
      .replace(/^\s+/g, '')
      .replace(/\s+$/g, '')
      .replace(/\s+/g, ',').split(',');
    if (!coords[0]) coords.shift();
    for (var i = 0, l = coords.length; i < l; i++) {
      coords[i] = Math.round(100 * coords[i]);
    }
    switch (letter) {
      case 'm':
        cx += coords[0];
        cy += coords[1];
        return 't' + coords.join(',');
      case 'M':
        cx = coords[0];
        cy = coords[1];
        return 'm' + coords.join(',');
      case 'l':
        cx += coords[0];
        cy += coords[1];
        return 'r' + coords.join(',');
      case 'L':
        cx = coords[0];
        cy = coords[1];
        return 'l' + coords.join(',');
      case 'h':
        cx += coords[0];
        return 'r' + coords[0] + ',0';
      case 'H':
        cx = coords[0];
        return 'l' + cx + ',' + cy;
      case 'v':
        cy += coords[0];
        return 'r0,' + coords[0];
      case 'V':
        cy = coords[0];
        return 'l' + cx + ',' + cy;
      case 'c':
        ctrlx = cx + coords[coords.length - 4];
        ctrly = cy + coords[coords.length - 3];
        cx += coords[coords.length - 2];
        cy += coords[coords.length - 1];
        return 'v' + coords.join(',');
      case 'C':
        ctrlx = coords[coords.length - 4];
        ctrly = coords[coords.length - 3];
        cx = coords[coords.length - 2];
        cy = coords[coords.length - 1];
        return 'c' + coords.join(',');
      case 's':
        coords.unshift(cy - ctrly);
        coords.unshift(cx - ctrlx);
        ctrlx = cx + coords[coords.length - 4];
        ctrly = cy + coords[coords.length - 3];
        cx += coords[coords.length - 2];
        cy += coords[coords.length - 1];
        return 'v' + coords.join(',');
      case 'S':
        coords.unshift(cy + cy - ctrly);
        coords.unshift(cx + cx - ctrlx);
        ctrlx = coords[coords.length - 4];
        ctrly = coords[coords.length - 3];
        cx = coords[coords.length - 2];
        cy = coords[coords.length - 1];
        return 'c' + coords.join(',');
    }
    return '';
  }).replace(/z/g, 'e');
};
jvm.VMLCircleElement = function (config, style) {
  jvm.VMLCircleElement.parentClass.call(this, 'oval', config, style);
};

jvm.inherits(jvm.VMLCircleElement, jvm.VMLShapeElement);

jvm.VMLCircleElement.prototype.applyAttr = function (attr, value) {
  switch (attr) {
    case 'r':
      this.node.style.width = value * 2 + 'px';
      this.node.style.height = value * 2 + 'px';
      this.applyAttr('cx', this.get('cx') || 0);
      this.applyAttr('cy', this.get('cy') || 0);
      break;
    case 'cx':
      if (!value) return;
      this.node.style.left = value - (this.get('r') || 0) + 'px';
      break;
    case 'cy':
      if (!value) return;
      this.node.style.top = value - (this.get('r') || 0) + 'px';
      break;
    default:
      jvm.VMLCircleElement.parentClass.prototype.applyAttr.call(this, attr, value);
  }
};
/**
 * Class for vector images manipulations.
 * @constructor
 * @param {DOMElement} container to place canvas to
 * @param {Number} width
 * @param {Number} height
 */
jvm.VectorCanvas = function (container, width, height) {
  this.mode = window.SVGAngle ? 'svg' : 'vml';
  if (this.mode == 'svg') {
    this.impl = new jvm.SVGCanvasElement(container, width, height);
  } else {
    this.impl = new jvm.VMLCanvasElement(container, width, height);
  }
  return this.impl;
};
jvm.SimpleScale = function (scale) {
  this.scale = scale;
};

jvm.SimpleScale.prototype.getValue = function (value) {
  return value;
};
jvm.OrdinalScale = function (scale) {
  this.scale = scale;
};

jvm.OrdinalScale.prototype.getValue = function (value) {
  return this.scale[value];
};
jvm.NumericScale = function (scale, normalizeFunction, minValue, maxValue) {
  this.scale = [];

  normalizeFunction = normalizeFunction || 'linear';

  if (scale) this.setScale(scale);
  if (normalizeFunction) this.setNormalizeFunction(normalizeFunction);
  if (minValue) this.setMin(minValue);
  if (maxValue) this.setMax(maxValue);
};

jvm.NumericScale.prototype = {
  setMin: function (min) {
    this.clearMinValue = min;
    if (typeof this.normalize === 'function') {
      this.minValue = this.normalize(min);
    } else {
      this.minValue = min;
    }
  },

  setMax: function (max) {
    this.clearMaxValue = max;
    if (typeof this.normalize === 'function') {
      this.maxValue = this.normalize(max);
    } else {
      this.maxValue = max;
    }
  },

  setScale: function (scale) {
    var i;

    for (i = 0; i < scale.length; i++) {
      this.scale[i] = [scale[i]];
    }
  },

  setNormalizeFunction: function (f) {
    if (f === 'polynomial') {
      this.normalize = function (value) {
        return Math.pow(value, 0.2);
      };
    } else if (f === 'linear') {
      delete this.normalize;
    } else {
      this.normalize = f;
    }
    this.setMin(this.clearMinValue);
    this.setMax(this.clearMaxValue);
  },

  getValue: function (value) {
    var lengthes = [],
      fullLength = 0,
      l,
      i = 0,
      c;

    if (typeof this.normalize === 'function') {
      value = this.normalize(value);
    }
    for (i = 0; i < this.scale.length - 1; i++) {
      l = this.vectorLength(this.vectorSubtract(this.scale[i + 1], this.scale[i]));
      lengthes.push(l);
      fullLength += l;
    }

    c = (this.maxValue - this.minValue) / fullLength;
    for (i = 0; i < lengthes.length; i++) {
      lengthes[i] *= c;
    }

    i = 0;
    value -= this.minValue;
    while (value - lengthes[i] >= 0) {
      value -= lengthes[i];
      i++;
    }

    if (i == this.scale.length - 1) {
      value = this.vectorToNum(this.scale[i]);
    } else {
      value = (
        this.vectorToNum(
          this.vectorAdd(this.scale[i],
            this.vectorMult(
              this.vectorSubtract(this.scale[i + 1], this.scale[i]),
                (value) / (lengthes[i])
            )
          )
        )
        );
    }

    return value;
  },

  vectorToNum: function (vector) {
    var num = 0,
      i;

    for (i = 0; i < vector.length; i++) {
      num += Math.round(vector[i]) * Math.pow(256, vector.length - i - 1);
    }
    return num;
  },

  vectorSubtract: function (vector1, vector2) {
    var vector = [],
      i;

    for (i = 0; i < vector1.length; i++) {
      vector[i] = vector1[i] - vector2[i];
    }
    return vector;
  },

  vectorAdd: function (vector1, vector2) {
    var vector = [],
      i;

    for (i = 0; i < vector1.length; i++) {
      vector[i] = vector1[i] + vector2[i];
    }
    return vector;
  },

  vectorMult: function (vector, num) {
    var result = [],
      i;

    for (i = 0; i < vector.length; i++) {
      result[i] = vector[i] * num;
    }
    return result;
  },

  vectorLength: function (vector) {
    var result = 0,
      i;
    for (i = 0; i < vector.length; i++) {
      result += vector[i] * vector[i];
    }
    return Math.sqrt(result);
  }
};
jvm.ColorScale = function (colors, normalizeFunction, minValue, maxValue) {
  jvm.ColorScale.parentClass.apply(this, arguments);
};

jvm.inherits(jvm.ColorScale, jvm.NumericScale);

jvm.ColorScale.prototype.setScale = function (scale) {
  var i;

  for (i = 0; i < scale.length; i++) {
    this.scale[i] = jvm.ColorScale.rgbToArray(scale[i]);
  }
};

jvm.ColorScale.prototype.getValue = function (value) {
  return jvm.ColorScale.numToRgb(jvm.ColorScale.parentClass.prototype.getValue.call(this, value));
};

jvm.ColorScale.arrayToRgb = function (ar) {
  var rgb = '#',
    d,
    i;

  for (i = 0; i < ar.length; i++) {
    d = ar[i].toString(16);
    rgb += d.length == 1 ? '0' + d : d;
  }
  return rgb;
};

jvm.ColorScale.numToRgb = function (num) {
  num = num.toString(16);

  while (num.length < 6) {
    num = '0' + num;
  }

  return '#' + num;
};

jvm.ColorScale.rgbToArray = function (rgb) {
  rgb = rgb.substr(1);
  return [parseInt(rgb.substr(0, 2), 16), parseInt(rgb.substr(2, 2), 16), parseInt(rgb.substr(4, 2), 16)];
};
/**
 * Creates data series.
 * @constructor
 * @param {Object} params Parameters to initialize series with.
 * @param {Array} params.values The data set to visualize.
 * @param {String} params.attribute Numberic or color attribute to use for data visualization. This could be: <code>fill</code>, <code>stroke</code>, <code>fill-opacity</code>, <code>stroke-opacity</code> for markers and regions and <code>r</code> (radius) for markers only.
 * @param {Array} params.scale Values used to map a dimension of data to a visual representation. The first value sets visualization for minimum value from the data set and the last value sets visualization for the maximum value. There also could be intermidiate values. Default value is <code>['#C8EEFF', '#0071A4']</code>
 * @param {Function|String} params.normalizeFunction The function used to map input values to the provided scale. This parameter could be provided as function or one of the strings: <code>'linear'</code> or <code>'polynomial'</code>, while <code>'linear'</code> is used by default. The function provided takes value from the data set as an input and returns corresponding value from the scale.
 * @param {Number} params.min Minimum value of the data set. Could be calculated automatically if not provided.
 * @param {Number} params.min Maximum value of the data set. Could be calculated automatically if not provided.
 */
jvm.DataSeries = function (params, elements) {
  var scaleConstructor;

  params = params || {};
  params.attribute = params.attribute || 'fill';

  this.elements = elements;
  this.params = params;

  if (params.attributes) {
    this.setAttributes(params.attributes);
  }

  if (jvm.$.isArray(params.scale)) {
    scaleConstructor = (params.attribute === 'fill' || params.attribute === 'stroke') ? jvm.ColorScale : jvm.NumericScale;
    this.scale = new scaleConstructor(params.scale, params.normalizeFunction, params.min, params.max);
  } else if (params.scale) {
    this.scale = new jvm.OrdinalScale(params.scale);
  } else {
    this.scale = new jvm.SimpleScale(params.scale);
  }

  this.values = params.values || {};
  this.setValues(this.values);
};

jvm.DataSeries.prototype = {
  setAttributes: function (key, attr) {
    var attrs = key,
      code;

    if (typeof key == 'string') {
      if (this.elements[key]) {
        this.elements[key].setStyle(this.params.attribute, attr);
      }
    } else {
      for (code in attrs) {
        if (this.elements[code]) {
          this.elements[code].element.setStyle(this.params.attribute, attrs[code]);
        }
      }
    }
  },

  /**
   * Set values for the data set.
   * @param {Object} values Object which maps codes of regions or markers to values.
   */
  setValues: function (values) {
    var max = Number.MIN_VALUE,
      min = Number.MAX_VALUE,
      val,
      cc,
      attrs = {};

    if (!(this.scale instanceof jvm.OrdinalScale) && !(this.scale instanceof jvm.SimpleScale)) {
      if (!this.params.min || !this.params.max) {
        for (cc in values) {
          val = parseFloat(values[cc]);
          if (val > max) max = values[cc];
          if (val < min) min = val;
        }
        if (!this.params.min) {
          this.scale.setMin(min);
        }
        if (!this.params.max) {
          this.scale.setMax(max);
        }
        this.params.min = min;
        this.params.max = max;
      }
      for (cc in values) {
        val = parseFloat(values[cc]);
        if (!isNaN(val)) {
          attrs[cc] = this.scale.getValue(val);
        } else {
          attrs[cc] = this.elements[cc].element.style.initial[this.params.attribute];
        }
      }
    } else {
      for (cc in values) {
        if (values[cc]) {
          attrs[cc] = this.scale.getValue(values[cc]);
        } else {
          attrs[cc] = this.elements[cc].element.style.initial[this.params.attribute];
        }
      }
    }

    this.setAttributes(attrs);
    jvm.$.extend(this.values, values);
  },

  clear: function () {
    var key,
      attrs = {};

    for (key in this.values) {
      if (this.elements[key]) {
        attrs[key] = this.elements[key].element.style.initial[this.params.attribute];
      }
    }
    this.setAttributes(attrs);
    this.values = {};
  },

  /**
   * Set scale of the data series.
   * @param {Array} scale Values representing scale.
   */
  setScale: function (scale) {
    this.scale.setScale(scale);
    if (this.values) {
      this.setValues(this.values);
    }
  },

  /**
   * Set normalize function of the data series.
   * @param {Function|String} normilizeFunction.
   */
  setNormalizeFunction: function (f) {
    this.scale.setNormalizeFunction(f);
    if (this.values) {
      this.setValues(this.values);
    }
  }
};
/**
 * Contains methods for transforming point on sphere to
 * Cartesian coordinates using various projections.
 * @class
 */
jvm.Proj = {
  degRad: 180 / Math.PI,
  radDeg: Math.PI / 180,
  radius: 6381372,

  sgn: function (n) {
    if (n > 0) {
      return 1;
    } else if (n < 0) {
      return -1;
    } else {
      return n;
    }
  },

  /**
   * Converts point on sphere to the Cartesian coordinates using Miller projection
   * @param {Number} lat Latitude in degrees
   * @param {Number} lng Longitude in degrees
   * @param {Number} c Central meridian in degrees
   */
  mill: function (lat, lng, c) {
    return {
      x: this.radius * (lng - c) * this.radDeg,
      y: -this.radius * Math.log(Math.tan((45 + 0.4 * lat) * this.radDeg)) / 0.8
    };
  },

  /**
   * Inverse function of mill()
   * Converts Cartesian coordinates to point on sphere using Miller projection
   * @param {Number} x X of point in Cartesian system as integer
   * @param {Number} y Y of point in Cartesian system as integer
   * @param {Number} c Central meridian in degrees
   */
  mill_inv: function (x, y, c) {
    return {
      lat: (2.5 * Math.atan(Math.exp(0.8 * y / this.radius)) - 5 * Math.PI / 8) * this.degRad,
      lng: (c * this.radDeg + x / this.radius) * this.degRad
    };
  },

  /**
   * Converts point on sphere to the Cartesian coordinates using Mercator projection
   * @param {Number} lat Latitude in degrees
   * @param {Number} lng Longitude in degrees
   * @param {Number} c Central meridian in degrees
   */
  merc: function (lat, lng, c) {
    return {
      x: this.radius * (lng - c) * this.radDeg,
      y: -this.radius * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))
    };
  },

  /**
   * Inverse function of merc()
   * Converts Cartesian coordinates to point on sphere using Mercator projection
   * @param {Number} x X of point in Cartesian system as integer
   * @param {Number} y Y of point in Cartesian system as integer
   * @param {Number} c Central meridian in degrees
   */
  merc_inv: function (x, y, c) {
    return {
      lat: (2 * Math.atan(Math.exp(y / this.radius)) - Math.PI / 2) * this.degRad,
      lng: (c * this.radDeg + x / this.radius) * this.degRad
    };
  },

  /**
   * Converts point on sphere to the Cartesian coordinates using Albers Equal-Area Conic
   * projection
   * @see <a href="http://mathworld.wolfram.com/AlbersEqual-AreaConicProjection.html">Albers Equal-Area Conic projection</a>
   * @param {Number} lat Latitude in degrees
   * @param {Number} lng Longitude in degrees
   * @param {Number} c Central meridian in degrees
   */
  aea: function (lat, lng, c) {
    var fi0 = 0,
      lambda0 = c * this.radDeg,
      fi1 = 29.5 * this.radDeg,
      fi2 = 45.5 * this.radDeg,
      fi = lat * this.radDeg,
      lambda = lng * this.radDeg,
      n = (Math.sin(fi1) + Math.sin(fi2)) / 2,
      C = Math.cos(fi1) * Math.cos(fi1) + 2 * n * Math.sin(fi1),
      theta = n * (lambda - lambda0),
      ro = Math.sqrt(C - 2 * n * Math.sin(fi)) / n,
      ro0 = Math.sqrt(C - 2 * n * Math.sin(fi0)) / n;

    return {
      x: ro * Math.sin(theta) * this.radius,
      y: -(ro0 - ro * Math.cos(theta)) * this.radius
    };
  },

  /**
   * Converts Cartesian coordinates to the point on sphere using Albers Equal-Area Conic
   * projection
   * @see <a href="http://mathworld.wolfram.com/AlbersEqual-AreaConicProjection.html">Albers Equal-Area Conic projection</a>
   * @param {Number} x X of point in Cartesian system as integer
   * @param {Number} y Y of point in Cartesian system as integer
   * @param {Number} c Central meridian in degrees
   */
  aea_inv: function (xCoord, yCoord, c) {
    var x = xCoord / this.radius,
      y = yCoord / this.radius,
      fi0 = 0,
      lambda0 = c * this.radDeg,
      fi1 = 29.5 * this.radDeg,
      fi2 = 45.5 * this.radDeg,
      n = (Math.sin(fi1) + Math.sin(fi2)) / 2,
      C = Math.cos(fi1) * Math.cos(fi1) + 2 * n * Math.sin(fi1),
      ro0 = Math.sqrt(C - 2 * n * Math.sin(fi0)) / n,
      ro = Math.sqrt(x * x + (ro0 - y) * (ro0 - y)),
      theta = Math.atan(x / (ro0 - y));

    return {
      lat: (Math.asin((C - ro * ro * n * n) / (2 * n))) * this.degRad,
      lng: (lambda0 + theta / n) * this.degRad
    };
  },

  /**
   * Converts point on sphere to the Cartesian coordinates using Lambert conformal
   * conic projection
   * @see <a href="http://mathworld.wolfram.com/LambertConformalConicProjection.html">Lambert Conformal Conic Projection</a>
   * @param {Number} lat Latitude in degrees
   * @param {Number} lng Longitude in degrees
   * @param {Number} c Central meridian in degrees
   */
  lcc: function (lat, lng, c) {
    var fi0 = 0,
      lambda0 = c * this.radDeg,
      lambda = lng * this.radDeg,
      fi1 = 33 * this.radDeg,
      fi2 = 45 * this.radDeg,
      fi = lat * this.radDeg,
      n = Math.log(Math.cos(fi1) * (1 / Math.cos(fi2))) / Math.log(Math.tan(Math.PI / 4 + fi2 / 2) * (1 / Math.tan(Math.PI / 4 + fi1 / 2) )),
      F = ( Math.cos(fi1) * Math.pow(Math.tan(Math.PI / 4 + fi1 / 2), n) ) / n,
      ro = F * Math.pow(1 / Math.tan(Math.PI / 4 + fi / 2), n),
      ro0 = F * Math.pow(1 / Math.tan(Math.PI / 4 + fi0 / 2), n);

    return {
      x: ro * Math.sin(n * (lambda - lambda0)) * this.radius,
      y: -(ro0 - ro * Math.cos(n * (lambda - lambda0)) ) * this.radius
    };
  },

  /**
   * Converts Cartesian coordinates to the point on sphere using Lambert conformal conic
   * projection
   * @see <a href="http://mathworld.wolfram.com/LambertConformalConicProjection.html">Lambert Conformal Conic Projection</a>
   * @param {Number} x X of point in Cartesian system as integer
   * @param {Number} y Y of point in Cartesian system as integer
   * @param {Number} c Central meridian in degrees
   */
  lcc_inv: function (xCoord, yCoord, c) {
    var x = xCoord / this.radius,
      y = yCoord / this.radius,
      fi0 = 0,
      lambda0 = c * this.radDeg,
      fi1 = 33 * this.radDeg,
      fi2 = 45 * this.radDeg,
      n = Math.log(Math.cos(fi1) * (1 / Math.cos(fi2))) / Math.log(Math.tan(Math.PI / 4 + fi2 / 2) * (1 / Math.tan(Math.PI / 4 + fi1 / 2) )),
      F = ( Math.cos(fi1) * Math.pow(Math.tan(Math.PI / 4 + fi1 / 2), n) ) / n,
      ro0 = F * Math.pow(1 / Math.tan(Math.PI / 4 + fi0 / 2), n),
      ro = this.sgn(n) * Math.sqrt(x * x + (ro0 - y) * (ro0 - y)),
      theta = Math.atan(x / (ro0 - y));

    return {
      lat: (2 * Math.atan(Math.pow(F / ro, 1 / n)) - Math.PI / 2) * this.degRad,
      lng: (lambda0 + theta / n) * this.degRad
    };
  }
};
/**
 * Creates map, draws paths, binds events.
 * @constructor
 * @param {Object} params Parameters to initialize map with.
 * @param {String} params.map Name of the map in the format <code>territory_proj_lang</code> where <code>territory</code> is a unique code or name of the territory which the map represents (ISO 3166 alpha 2 standard is used where possible), <code>proj</code> is a name of projection used to generate representation of the map on the plane (projections are named according to the conventions of proj4 utility) and <code>lang</code> is a code of the language, used for the names of regions.
 * @param {String} params.backgroundColor Background color of the map in CSS format.
 * @param {Boolean} params.zoomOnScroll When set to true map could be zoomed using mouse scroll. Default value is <code>true</code>.
 * @param {Number} params.zoomMax Indicates the maximum zoom ratio which could be reached zooming the map. Default value is <code>8</code>.
 * @param {Number} params.zoomMin Indicates the minimum zoom ratio which could be reached zooming the map. Default value is <code>1</code>.
 * @param {Number} params.zoomStep Indicates the multiplier used to zoom map with +/- buttons. Default value is <code>1.6</code>.
 * @param {Boolean} params.regionsSelectable When set to true regions of the map could be selected. Default value is <code>false</code>.
 * @param {Boolean} params.regionsSelectableOne Allow only one region to be selected at the moment. Default value is <code>false</code>.
 * @param {Boolean} params.markersSelectable When set to true markers on the map could be selected. Default value is <code>false</code>.
 * @param {Boolean} params.markersSelectableOne Allow only one marker to be selected at the moment. Default value is <code>false</code>.
 * @param {Object} params.regionStyle Set the styles for the map's regions. Each region or marker has four states: <code>initial</code> (default state), <code>hover</code> (when the mouse cursor is over the region or marker), <code>selected</code> (when region or marker is selected), <code>selectedHover</code> (when the mouse cursor is over the region or marker and it's selected simultaneously). Styles could be set for each of this states. Default value for that parameter is:
 <pre>{
  initial: {
    fill: 'white',
    "fill-opacity": 1,
    stroke: 'none',
    "stroke-width": 0,
    "stroke-opacity": 1
  },
  hover: {
    "fill-opacity": 0.8
  },
  selected: {
    fill: 'yellow'
  },
  selectedHover: {
  }
}</pre>
 * @param {Object} params.markerStyle Set the styles for the map's markers. Any parameter suitable for <code>regionStyle</code> could be used as well as numeric parameter <code>r</code> to set the marker's radius. Default value for that parameter is:
 <pre>{
  initial: {
    fill: 'grey',
    stroke: '#505050',
    "fill-opacity": 1,
    "stroke-width": 1,
    "stroke-opacity": 1,
    r: 5
  },
  hover: {
    stroke: 'black',
    "stroke-width": 2
  },
  selected: {
    fill: 'blue'
  },
  selectedHover: {
  }
}</pre>
 * @param {Object|Array} params.markers Set of markers to add to the map during initialization. In case of array is provided, codes of markers will be set as string representations of array indexes. Each marker is represented by <code>latLng</code> (array of two numeric values), <code>name</code> (string which will be show on marker's label) and any marker styles.
 * @param {Object} params.series Object with two keys: <code>markers</code> and <code>regions</code>. Each of which is an array of series configs to be applied to the respective map elements. See <a href="jvm.DataSeries.html">DataSeries</a> description for a list of parameters available.
 * @param {Object|String} params.focusOn This parameter sets the initial position and scale of the map viewport. It could be expressed as a string representing region which should be in focus or an object representing coordinates and scale to set. For example to focus on the center of the map at the double scale you can provide the following value:
 <pre>{
  x: 0.5,
  y: 0.5,
  scale: 2
}</pre>
 * @param {Array|Object|String} params.selectedRegions Set initially selected regions.
 * @param {Array|Object|String} params.selectedMarkers Set initially selected markers.
 * @param {Function} params.onRegionLabelShow <code>(Event e, Object label, String code)</code> Will be called right before the region label is going to be shown.
 * @param {Function} params.onRegionOver <code>(Event e, String code)</code> Will be called on region mouse over event.
 * @param {Function} params.onRegionOut <code>(Event e, String code)</code> Will be called on region mouse out event.
 * @param {Function} params.onRegionClick <code>(Event e, String code)</code> Will be called on region click event.
 * @param {Function} params.onRegionSelected <code>(Event e, String code, Boolean isSelected, Array selectedRegions)</code> Will be called when region is (de)selected. <code>isSelected</code> parameter of the callback indicates whether region is selected or not. <code>selectedRegions</code> contains codes of all currently selected regions.
 * @param {Function} params.onMarkerLabelShow <code>(Event e, Object label, String code)</code> Will be called right before the marker label is going to be shown.
 * @param {Function} params.onMarkerOver <code>(Event e, String code)</code> Will be called on marker mouse over event.
 * @param {Function} params.onMarkerOut <code>(Event e, String code)</code> Will be called on marker mouse out event.
 * @param {Function} params.onMarkerClick <code>(Event e, String code)</code> Will be called on marker click event.
 * @param {Function} params.onMarkerSelected <code>(Event e, String code, Boolean isSelected, Array selectedMarkers)</code> Will be called when marker is (de)selected. <code>isSelected</code> parameter of the callback indicates whether marker is selected or not. <code>selectedMarkers</code> contains codes of all currently selected markers.
 * @param {Function} params.onViewportChange <code>(Event e, Number scale)</code> Triggered when the map's viewport is changed (map was panned or zoomed).
 */
jvm.WorldMap = function (params) {
  var map = this,
    e;

  this.params = jvm.$.extend(true, {}, jvm.WorldMap.defaultParams, params);

  if (!jvm.WorldMap.maps[this.params.map]) {
    throw new Error('Attempt to use map which was not loaded: ' + this.params.map);
  }

  this.mapData = jvm.WorldMap.maps[this.params.map];
  this.markers = {};
  this.regions = {};
  this.regionsColors = {};
  this.regionsData = {};

  this.lines = {};
  this.linesColors = {};
  this.linesData = {};

  this.container = jvm.$('<div>').css({width: '100%', height: '100%'}).addClass('jvectormap-container');
  this.params.container.append(this.container);
  this.container.data('mapObject', this);
  this.container.css({
    position: 'relative',
    overflow: 'hidden'
  });

  this.defaultWidth = this.mapData.width;
  this.defaultHeight = this.mapData.height;

  this.setBackgroundColor(this.params.backgroundColor);

  this.onResize = function () {
    map.setSize();
  };
  jvm.$(window).resize(this.onResize);

  for (e in jvm.WorldMap.apiEvents) {
    if (this.params[e]) {
      this.container.bind(jvm.WorldMap.apiEvents[e] + '.jvectormap', this.params[e]);
    }
  }

  this.canvas = new jvm.VectorCanvas(this.container[0], this.width, this.height);

  if (('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch)) {
    if (this.params.bindTouchEvents) {
      this.bindContainerTouchEvents();
    }
  } else {
    this.bindContainerEvents();
  }
  this.bindElementEvents();
  this.createLabel();
  if (this.params.zoomButtons) {
    this.bindZoomButtons();
  }
  this.createRegions();
  this.createLines();
  this.createMarkers(this.params.markers || {});

  this.setSize();

  if (this.params.focusOn) {
    if (typeof this.params.focusOn === 'object') {
      this.setFocus.call(this, this.params.focusOn.scale, this.params.focusOn.x, this.params.focusOn.y);
    } else {
      this.setFocus.call(this, this.params.focusOn);
    }
  }

  if (this.params.selectedRegions) {
    this.setSelectedRegions(this.params.selectedRegions);
  }
  if (this.params.selectedMarkers) {
    this.setSelectedMarkers(this.params.selectedMarkers);
  }

  if (this.params.series) {
    this.createSeries();
  }
};

jvm.WorldMap.prototype = {
  transX: 0,
  transY: 0,
  scale: 1,
  baseTransX: 0,
  baseTransY: 0,
  baseScale: 1,

  width: 0,
  height: 0,

  /**
   * Set background color of the map.
   * @param {String} backgroundColor Background color in CSS format.
   */
  setBackgroundColor: function (backgroundColor) {
    this.container.css('background-color', backgroundColor);
  },

  resize: function () {
    var curBaseScale = this.baseScale;
    if (this.width / this.height > this.defaultWidth / this.defaultHeight) {
      this.baseScale = this.height / this.defaultHeight;
      this.baseTransX = Math.abs(this.width - this.defaultWidth * this.baseScale) / (2 * this.baseScale);
    } else {
      this.baseScale = this.width / this.defaultWidth;
      this.baseTransY = Math.abs(this.height - this.defaultHeight * this.baseScale) / (2 * this.baseScale);
    }
    this.scale *= this.baseScale / curBaseScale;
    this.transX *= this.baseScale / curBaseScale;
    this.transY *= this.baseScale / curBaseScale;
  },

  /**
   * Synchronize the size of the map with the size of the container. Suitable in situations where the size of the container is changed programmatically or container is shown after it became visible.
   */
  setSize: function () {
    this.width = this.container.width();
    this.height = this.container.height();
    this.resize();
    this.canvas.setSize(this.width, this.height);
    this.applyTransform();
  },

  /**
   * Reset all the series and show the map with the initial zoom.
   */
  reset: function () {
    var key,
      i;

    for (key in this.series) {
      for (i = 0; i < this.series[key].length; i++) {
        this.series[key][i].clear();
      }
    }
    this.scale = this.baseScale;
    this.transX = this.baseTransX;
    this.transY = this.baseTransY;
    this.applyTransform();
  },

  applyTransform: function () {
    var maxTransX,
      maxTransY,
      minTransX,
      minTransY;

    if (this.defaultWidth * this.scale <= this.width) {
      maxTransX = (this.width - this.defaultWidth * this.scale) / (2 * this.scale);
      minTransX = (this.width - this.defaultWidth * this.scale) / (2 * this.scale);
    } else {
      maxTransX = 0;
      minTransX = (this.width - this.defaultWidth * this.scale) / this.scale;
    }

    if (this.defaultHeight * this.scale <= this.height) {
      maxTransY = (this.height - this.defaultHeight * this.scale) / (2 * this.scale);
      minTransY = (this.height - this.defaultHeight * this.scale) / (2 * this.scale);
    } else {
      maxTransY = 0;
      minTransY = (this.height - this.defaultHeight * this.scale) / this.scale;
    }

    if (this.transY > maxTransY) {
      this.transY = maxTransY;
    } else if (this.transY < minTransY) {
      this.transY = minTransY;
    }
    if (this.transX > maxTransX) {
      this.transX = maxTransX;
    } else if (this.transX < minTransX) {
      this.transX = minTransX;
    }

    this.canvas.applyTransformParams(this.scale, this.transX, this.transY);

    if (this.markers) {
      this.repositionMarkers();
    }
    if (this.lines) {
      this.reWidthLines();
    }
    if (this.labels) {
      this.repositionLabels();
    }

    this.container.trigger('viewportChange', [this.scale / this.baseScale, this.transX, this.transY]);
  },

  bindContainerEvents: function () {
    var mouseDown = false,
      oldPageX,
      oldPageY,
      map = this;

    this.container.mousemove(function (e) {
      if (mouseDown) {
        map.transX -= (oldPageX - e.pageX) / map.scale;
        map.transY -= (oldPageY - e.pageY) / map.scale;

        map.applyTransform();

        oldPageX = e.pageX;
        oldPageY = e.pageY;
      }
      return false;
    }).mousedown(function (e) {
      mouseDown = true;
      oldPageX = e.pageX;
      oldPageY = e.pageY;
      return false;
    });

    jvm.$('body').mouseup(function () {
      mouseDown = false;
    });

    if (this.params.zoomOnScroll) {
      this.container.mousewheel(function (event, delta, deltaX, deltaY) {
        var offset = jvm.$(map.container).offset(),
          centerX = event.pageX - offset.left,
          centerY = event.pageY - offset.top,
          zoomStep = Math.pow(1.3, deltaY);

        map.label.hide();

        map.setScale(map.scale * zoomStep, centerX, centerY);
        event.preventDefault();
      });
    }
  },

  bindContainerTouchEvents: function () {
    var touchStartScale,
      touchStartDistance,
      map = this,
      touchX,
      touchY,
      centerTouchX,
      centerTouchY,
      lastTouchesLength,
      handleTouchEvent = function (e) {
        var touches = e.originalEvent.touches,
          offset,
          scale,
          transXOld,
          transYOld;

        if (e.type == 'touchstart') {
          lastTouchesLength = 0;
        }

        if (touches.length == 1) {
          if (lastTouchesLength == 1) {
            transXOld = map.transX;
            transYOld = map.transY;
            map.transX -= (touchX - touches[0].pageX) / map.scale;
            map.transY -= (touchY - touches[0].pageY) / map.scale;
            map.applyTransform();
            map.label.hide();
            if (transXOld != map.transX || transYOld != map.transY) {
              e.preventDefault();
            }
          }
          touchX = touches[0].pageX;
          touchY = touches[0].pageY;
        } else if (touches.length == 2) {
          if (lastTouchesLength == 2) {
            scale = Math.sqrt(
                Math.pow(touches[0].pageX - touches[1].pageX, 2) +
                Math.pow(touches[0].pageY - touches[1].pageY, 2)
            ) / touchStartDistance;
            map.setScale(
                touchStartScale * scale,
              centerTouchX,
              centerTouchY
            );
            map.label.hide();
            e.preventDefault();
          } else {
            offset = jvm.$(map.container).offset();
            if (touches[0].pageX > touches[1].pageX) {
              centerTouchX = touches[1].pageX + (touches[0].pageX - touches[1].pageX) / 2;
            } else {
              centerTouchX = touches[0].pageX + (touches[1].pageX - touches[0].pageX) / 2;
            }
            if (touches[0].pageY > touches[1].pageY) {
              centerTouchY = touches[1].pageY + (touches[0].pageY - touches[1].pageY) / 2;
            } else {
              centerTouchY = touches[0].pageY + (touches[1].pageY - touches[0].pageY) / 2;
            }
            centerTouchX -= offset.left;
            centerTouchY -= offset.top;
            touchStartScale = map.scale;
            touchStartDistance = Math.sqrt(
                Math.pow(touches[0].pageX - touches[1].pageX, 2) +
                Math.pow(touches[0].pageY - touches[1].pageY, 2)
            );
          }
        }

        lastTouchesLength = touches.length;
      };

    jvm.$(this.container).bind('touchstart', handleTouchEvent);
    jvm.$(this.container).bind('touchmove', handleTouchEvent);
  },
  getType: function (baseVal) {
    if (baseVal.indexOf('jvectormap-region') > -1) {
      return 'region';
    }
    if (baseVal.indexOf('jvectormap-marker') > -1) {
      return 'marker';
    }
    if (baseVal.indexOf('jvectormap-line') > -1) {
      return 'line';
    }
  },
  getTypeObj: function (type, code) {
    switch (type) {
      case 'region':
        return this.regions[code];
      case 'line' :
        return this.lines[code];
      case 'marker' :
        return this.markers[code];
    }
  },
  bindElementEvents: function () {
    var map = this,
      mouseMoved;

    this.container.mousemove(function () {
      mouseMoved = true;
    });

    /* Can not use common class selectors here because of the bug in jQuery
     SVG handling, use with caution. */
    this.container.delegate("[class~='jvectormap-element']", 'mouseover mouseout', function (e) {
      var path = this;

      var baseVal = jvm.$(this).attr('class').baseVal ? jvm.$(this).attr('class').baseVal : jvm.$(this).attr('class');
      var type = map.getType(baseVal);
      var code = (type == 'region' || type == 'line') ? jvm.$(this).attr('data-code') : jvm.$(this).attr('data-index');
      var typeObj = map.getTypeObj(type, code);
      var element = typeObj.element;
      var labelText = map.getName(type, code);
      var labelShowEvent = jvm.$.Event(type + 'LabelShow.jvectormap'),
        overEvent = jvm.$.Event(type + 'Over.jvectormap');

      if (e.type == 'mouseover') {
        map.container.trigger(overEvent, [code]);
        if (!overEvent.isDefaultPrevented()) {
          element.setHovered(true);
        }
        if (!map.params.showRegionLabel || type !== 'region') {
          map.label.text(labelText);
          map.container.trigger(labelShowEvent, [map.label, code]);
          if (!labelShowEvent.isDefaultPrevented()) {
            map.label.show();
            map.labelWidth = map.label.width();
            map.labelHeight = map.label.height();
          }
        }
      } else {
        element.setHovered(false);
        map.label.hide();
        map.container.trigger(type + 'Out.jvectormap', [code]);
      }
    });

    /* Can not use common class selectors here because of the bug in jQuery
     SVG handling, use with caution. */
    this.container.delegate("[class~='jvectormap-element']", 'mousedown', function (e) {
      mouseMoved = false;
    });

    /* Can not use common class selectors here because of the bug in jQuery
     SVG handling, use with caution. */
    this.container.delegate("[class~='jvectormap-element']", 'mouseup', function (e) {
      var path = this,
        baseVal = jvm.$(this).attr('class').baseVal ? jvm.$(this).attr('class').baseVal : jvm.$(this).attr('class'),
        type = map.getType(baseVal),
        code = (type == 'region' || type == 'line') ? jvm.$(this).attr('data-code') : jvm.$(this).attr('data-index'),
        clickEvent = jvm.$.Event(type + 'Click.jvectormap');

      var typeObj = map.getTypeObj(type, code);
      var element = typeObj.element;
      if (!mouseMoved) {
        map.container.trigger(clickEvent, [code]);
        if ((type === 'region' && map.params.regionsSelectable) || (type === 'marker' && map.params.markersSelectable) || (type === 'line' && map.params.linesSelectable)) {
          if (!clickEvent.isDefaultPrevented()) {
            if (map.params[type + 'sSelectableOne']) {
              map.clearSelected(type + 's');
            }
            element.setSelected(!element.isSelected);
          }
        }
      }
    });
  },

  bindZoomButtons: function () {
    var map = this;

    jvm.$('<div/>').addClass('jvectormap-zoomin').text('+').appendTo(this.container);
    jvm.$('<div/>').addClass('jvectormap-zoomout').html('&#x2212;').appendTo(this.container);

    this.container.find('.jvectormap-zoomin').click(function () {
      map.setScale(map.scale * map.params.zoomStep, map.width / 2, map.height / 2);
    });
    this.container.find('.jvectormap-zoomout').click(function () {
      map.setScale(map.scale / map.params.zoomStep, map.width / 2, map.height / 2);
    });
  },

  createLabel: function () {
    var map = this;

    this.label = jvm.$('<div/>').addClass('jvectormap-label').appendTo(jvm.$('body'));

    this.container.mousemove(function (e) {
      var left = e.pageX - 15 - map.labelWidth,
        top = e.pageY - 15 - map.labelHeight;

      if (left < 5) {
        left = e.pageX + 15;
      }
      if (top < 5) {
        top = e.pageY + 15;
      }

      if (map.label.is(':visible')) {
        map.label.css({
          left: left,
          top: top
        });
      }
    });
  },

  setScale: function (scale, anchorX, anchorY, isCentered) {
    var zoomStep,
      viewportChangeEvent = jvm.$.Event('zoom.jvectormap');

    if (scale > this.params.zoomMax * this.baseScale) {
      scale = this.params.zoomMax * this.baseScale;
    } else if (scale < this.params.zoomMin * this.baseScale) {
      scale = this.params.zoomMin * this.baseScale;
    }

    if (typeof anchorX != 'undefined' && typeof anchorY != 'undefined') {
      zoomStep = scale / this.scale;
      if (isCentered) {
        this.transX = anchorX + this.defaultWidth * (this.width / (this.defaultWidth * scale)) / 2;
        this.transY = anchorY + this.defaultHeight * (this.height / (this.defaultHeight * scale)) / 2;
      } else {
        this.transX -= (zoomStep - 1) / scale * anchorX;
        this.transY -= (zoomStep - 1) / scale * anchorY;
      }
    }

    this.scale = scale;
    this.applyTransform();
    this.container.trigger(viewportChangeEvent, [scale / this.baseScale]);
  },

  /**
   * Set the map's viewport to the specific point and set zoom of the map to the specific level. Point and zoom level could be defined in two ways: using the code of some region to focus on or a central point and zoom level as numbers.
   * @param {Number|String|Array} scale|regionCode|regionCodes If the first parameter of this method is a string or array of strings and there are regions with the these codes, the viewport will be set to show all these regions. Otherwise if the first parameter is a number, the viewport will be set to show the map with provided scale.
   * @param {Number} centerX Number from 0 to 1 specifying the horizontal coordinate of the central point of the viewport.
   * @param {Number} centerY Number from 0 to 1 specifying the vertical coordinate of the central point of the viewport.
   */
  setFocus: function (scale, centerX, centerY) {
    var bbox,
      itemBbox,
      newBbox,
      codes,
      i;

    if (jvm.$.isArray(scale) || this.regions[scale]) {
      if (jvm.$.isArray(scale)) {
        codes = scale;
      } else {
        codes = [scale];
      }
      for (i = 0; i < codes.length; i++) {
        if (this.regions[codes[i]]) {
          itemBbox = this.regions[codes[i]].element.getBBox();
          if (itemBbox) {
            if (typeof bbox == 'undefined') {
              bbox = itemBbox;
            } else {
              newBbox = {
                x: Math.min(bbox.x, itemBbox.x),
                y: Math.min(bbox.y, itemBbox.y),
                width: Math.max(bbox.x + bbox.width, itemBbox.x + itemBbox.width) - Math.min(bbox.x, itemBbox.x),
                height: Math.max(bbox.y + bbox.height, itemBbox.y + itemBbox.height) - Math.min(bbox.y, itemBbox.y)
              };
              bbox = newBbox;
            }
          }
        }
      }
      this.setScale(
        Math.min(this.width / bbox.width, this.height / bbox.height),
        -(bbox.x + bbox.width / 2),
        -(bbox.y + bbox.height / 2),
        true
      );
    } else {
      scale = scale * this.baseScale;
      this.setScale(scale, -centerX * this.defaultWidth, -centerY * this.defaultHeight, true);
    }
  },

  getSelected: function (type) {
    var key,
      selected = [];

    for (key in this[type]) {
      if (this[type][key].element.isSelected) {
        selected.push(key);
      }
    }
    return selected;
  },

  /**
   * Return the codes of currently selected regions.
   * @returns {Array}
   */
  getSelectedRegions: function () {
    return this.getSelected('regions');
  },

  getSelectedLines: function () {
    return this.getSelected('lines');
  },
  /**
   * Return the codes of currently selected markers.
   * @returns {Array}
   */
  getSelectedMarkers: function () {
    return this.getSelected('markers');
  },

  setSelected: function (type, keys) {
    var i;

    if (typeof keys != 'object') {
      keys = [keys];
    }

    if (jvm.$.isArray(keys)) {
      for (i = 0; i < keys.length; i++) {
        this[type][keys[i]].element.setSelected(true);
      }
    } else {
      for (i in keys) {
        this[type][i].element.setSelected(!!keys[i]);
      }
    }
  },

  /**
   * Set or remove selected state for the regions.
   * @param {String|Array|Object} keys If <code>String</code> or <code>Array</code> the region(s) with the corresponding code(s) will be selected. If <code>Object</code> was provided its keys are  codes of regions, state of which should be changed. Selected state will be set if value is true, removed otherwise.
   */
  setSelectedRegions: function (keys) {
    this.setSelected('regions', keys);
  },

  setSelectedLines: function (keys) {
    this.setSelected('lines', keys);
  },
  /**
   * Set or remove selected state for the markers.
   * @param {String|Array|Object} keys If <code>String</code> or <code>Array</code> the marker(s) with the corresponding code(s) will be selected. If <code>Object</code> was provided its keys are  codes of markers, state of which should be changed. Selected state will be set if value is true, removed otherwise.
   */
  setSelectedMarkers: function (keys) {
    this.setSelected('markers', keys);
  },

  clearSelected: function (type) {
    var select = {},
      selected = this.getSelected(type),
      i;

    for (i = 0; i < selected.length; i++) {
      select[selected[i]] = false;
    }

    this.setSelected(type, select);
  },

  /**
   * Remove the selected state from all the currently selected regions.
   */
  clearSelectedRegions: function () {
    this.clearSelected('regions');
  },

  clearSelectedLines: function () {
    this.clearSelected('lines');
  },
  /**
   * Remove the selected state from all the currently selected markers.
   */
  clearSelectedMarkers: function () {
    this.clearSelected('markers');
  },

  /**
   * Return the instance of WorldMap. Useful when instantiated as a jQuery plug-in.
   * @returns {WorldMap}
   */
  getMapObject: function () {
    return this;
  },


  createRegions: function () {
    var key, map = this;

    var _selBind = function (e, isSelected) {
      map.container.trigger('regionSelected.jvectormap', [jvm.$(this).attr('data-code'), isSelected, map.getSelectedRegions()]);
    };
    for (key in this.mapData.paths) {
      var region = this.canvas.addPath({
        d: this.mapData.paths[key].path,
        "data-code": key
      }, jvm.$.extend(true, {}, this.params.regionStyle));
      jvm.$(region.node).bind('selected', _selBind);
      region.addClass('jvectormap-region jvectormap-element');
      this.regions[key] = {
        element: region,
        config: this.mapData.paths[key]
      };
      var _pos = this.mapData.paths[key].pos;
      if (this.params.showRegionLabel && _pos !== undefined && this.mapData.paths[key].name !== '') {
        if (this.labels === undefined) {
          this.labels = [];
        }
        this.labels[key] = jvm.$('<div/>').appendTo(jvm.$('body'));
        this.labels[key].css(this.params.labelsStyle);
        this.labels[key].text(this.mapData.paths[key].name);
      }
    }
    this.repositionLabels();
  },
  repositionLabels: function () {
    if (this.labels === undefined) {
      return;
    }
    for (var _key in this.labels) {
      var _posPoint;
      var _pos = this.mapData.paths[_key].pos;
      if (jvm.WorldMap.maps[this.params.map].projection) {
        _posPoint = this.latLngToPoint.apply(this, _pos || [0, 0]);
      } else {
        _posPoint = {
          x: _pos[0] * this.scale + this.transX * this.scale,
          y: _pos[1] * this.scale + this.transY * this.scale
        };
      }
      var _left = _posPoint.x - this.labels[_key].width() / 2;
      var _top = _posPoint.y - this.labels[_key].height() / 2;
      this.labels[_key].css({
        left: _left,
        top: _top
      });
      this.labels[_key].show();
    }
  },
  /**
   * Return the name of the region by region code.
   * @returns {String}
   */
  getName: function (type, code) {
    var _typeObj = this.getTypeObj(type, code);
    var _name = _typeObj === undefined ? '' : _typeObj.config.name || _typeObj.name;
    if (type == 'line') {
      return this.params.lines.lineNames[_name];
    }
    return _name;
  },
  createLines: function () {
    var key,
      line,
      map = this;
    if (this.params.lines === undefined || this.params.lines.lines === undefined) {
      return;
    }
    var _linesData = this.params.lines.lines;
    var _selBind = function (e, isSelected) {
      map.container.trigger('lineSelected.jvectormap', [jvm.$(this).attr('data-code'), isSelected, map.getSelectedLines()]);
    };
    for (key in _linesData) {
      line = this.canvas.addLine({
        points: _linesData[key].path,
        "data-code": key
      }, jvm.$.extend(true, {}, this.params.lineStyle));
      jvm.$(line.node).bind('selected', _selBind);
      line.addClass('jvectormap-line jvectormap-element');
      this.lines[key] = {
        element: line,
        config: _linesData[key]
      };
    }
  },
  createMarkers: function (markers) {
    var i,
      marker,
      point,
      markerConfig,
      markersArray,
      map = this;

    this.markersGroup = this.markersGroup || this.canvas.addGroup();

    if (jvm.$.isArray(markers)) {
      markersArray = markers.slice();
      markers = {};
      for (i = 0; i < markersArray.length; i++) {
        markers[i] = markersArray[i];
      }
    }

    var _selBind = function (e, isSelected) {
      map.container.trigger('markerSelected.jvectormap', [jvm.$(this).attr('data-index'), isSelected, map.getSelectedMarkers()]);
    };
    for (i in markers) {
      markerConfig = markers[i] instanceof Array ? {latLng: markers[i]} : markers[i];
      point = this.getMarkerPosition(markerConfig);
      if (point !== false) {
        marker = this.canvas.addCircle({
          "data-index": i,
          cx: point.x,
          cy: point.y
        }, jvm.$.extend(true, {}, this.params.markerStyle, {initial: markerConfig.style || {}}), this.markersGroup);
        marker.addClass('jvectormap-marker jvectormap-element');
        jvm.$(marker.node).bind('selected', _selBind);
        if (this.markers[i]) {
          this.removeMarkers([i]);
        }
        this.markers[i] = {element: marker, config: markerConfig};
      }
    }
  },

  repositionMarkers: function () {
    var i,
      point;

    for (i in this.markers) {
      point = this.getMarkerPosition(this.markers[i].config);
      if (point !== false) {
        this.markers[i].element.setStyle({cx: point.x, cy: point.y});
      }
    }

  },
  reWidthLines: function () {
    var i, line;
    for (i in this.lines) {
      this.lines[i].element.setStyle({'stroke-width': this.params.lineWidth / this.scale});
    }
  },

  getMarkerPosition: function (markerConfig) {
    if (jvm.WorldMap.maps[this.params.map].projection) {
      return this.latLngToPoint.apply(this, markerConfig.latLng || [0, 0]);
    } else {
      return {
        x: markerConfig.coords[0] * this.scale + this.transX * this.scale,
        y: markerConfig.coords[1] * this.scale + this.transY * this.scale
      };
    }
  },

  /**
   * Add one marker to the map.
   * @param {String} key Marker unique code.
   * @param {Object} marker Marker configuration parameters.
   * @param {Array} seriesData Values to add to the data series.
   */
  addMarker: function (key, marker, seriesData) {
    var markers = {},
      data = [],
      values,
      i;
    if (seriesData === undefined) {
      seriesData = [];
    }
    markers[key] = marker;

    for (i = 0; i < seriesData.length; i++) {
      values = {};
      values[key] = seriesData[i];
      data.push(values);
    }
    this.addMarkers(markers, data);
  },

  /**
   * Add set of marker to the map.
   * @param {Object|Array} markers Markers to add to the map. In case of array is provided, codes of markers will be set as string representations of array indexes.
   * @param {Array} seriesData Values to add to the data series.
   */
  addMarkers: function (markers, seriesData) {
    var i;

    seriesData = seriesData || [];

    this.createMarkers(markers);
    for (i = 0; i < seriesData.length; i++) {
      this.series.markers[i].setValues(seriesData[i] || {});
    }
  },

  /**
   * Remove some markers from the map.
   * @param {Array} markers Array of marker codes to be removed.
   */
  removeMarkers: function (markers) {
    var i;

    for (i = 0; i < markers.length; i++) {
      this.markers[ markers[i] ].element.remove();
      delete this.markers[ markers[i] ];
    }
  },

  /**
   * Remove all markers from the map.
   */
  removeAllMarkers: function () {
    var i,
      markers = [];

    for (i in this.markers) {
      markers.push(i);
    }
    this.removeMarkers(markers);
  },

  /**
   * Converts coordinates expressed as latitude and longitude to the coordinates in pixels on the map.
   * @param {Number} lat Latitide of point in degrees.
   * @param {Number} lng Longitude of point in degrees.
   */
  latLngToPoint: function (lat, lng) {
    var point,
      proj = jvm.WorldMap.maps[this.params.map].projection,
      centralMeridian = proj.centralMeridian,
      width = this.width - this.baseTransX * 2 * this.baseScale,
      height = this.height - this.baseTransY * 2 * this.baseScale,
      inset,
      bbox,
      scaleFactor = this.scale / this.baseScale;

    if (lng < (-180 + centralMeridian)) {
      lng += 360;
    }

    point = jvm.Proj[proj.type](lat, lng, centralMeridian);

    inset = this.getInsetForPoint(point.x, point.y);
    if (inset) {
      bbox = inset.bbox;

      point.x = (point.x - bbox[0].x) / (bbox[1].x - bbox[0].x) * inset.width * this.scale;
      point.y = (point.y - bbox[0].y) / (bbox[1].y - bbox[0].y) * inset.height * this.scale;

      return {
        x: point.x + this.transX * this.scale + inset.left * this.scale,
        y: point.y + this.transY * this.scale + inset.top * this.scale
      };
    } else {
      return false;
    }
  },

  /**
   * Converts cartesian coordinates into coordinates expressed as latitude and longitude.
   * @param {Number} x X-axis of point on map in pixels.
   * @param {Number} y Y-axis of point on map in pixels.
   */
  pointToLatLng: function (x, y) {
    var proj = jvm.WorldMap.maps[this.params.map].projection,
      centralMeridian = proj.centralMeridian,
      insets = jvm.WorldMap.maps[this.params.map].insets,
      i,
      inset,
      bbox,
      nx,
      ny;

    for (i = 0; i < insets.length; i++) {
      inset = insets[i];
      bbox = inset.bbox;

      nx = x - (this.transX * this.scale + inset.left * this.scale);
      ny = y - (this.transY * this.scale + inset.top * this.scale);

      nx = (nx / (inset.width * this.scale)) * (bbox[1].x - bbox[0].x) + bbox[0].x;
      ny = (ny / (inset.height * this.scale)) * (bbox[1].y - bbox[0].y) + bbox[0].y;

      if (nx > bbox[0].x && nx < bbox[1].x && ny > bbox[0].y && ny < bbox[1].y) {
        return jvm.Proj[proj.type + '_inv'](nx, -ny, centralMeridian);
      }
    }

    return false;
  },

  getInsetForPoint: function (x, y) {
    var insets = jvm.WorldMap.maps[this.params.map].insets,
      i,
      bbox;

    for (i = 0; i < insets.length; i++) {
      bbox = insets[i].bbox;
      if (x > bbox[0].x && x < bbox[1].x && y > bbox[0].y && y < bbox[1].y) {
        return insets[i];
      }
    }
  },

  createSeries: function () {
    var i,
      key;

    this.series = {
      markers: [],
      regions: [],
      lines: []
    };

    for (key in this.params.series) {
      for (i = 0; i < this.params.series[key].length; i++) {
        this.series[key][i] = new jvm.DataSeries(
          this.params.series[key][i],
          this[key]
        );
      }
    }
  },

  /**
   * Gracefully remove the map and and all its accessories, unbind event handlers.
   */
  remove: function () {
    this.label.remove();
    this.container.remove();
    jvm.$(window).unbind('resize', this.onResize);
  }
};

jvm.WorldMap.maps = {};
jvm.WorldMap.defaultParams = {
  map: 'world_mill_en',
  backgroundColor: '#505050',
  zoomButtons: true,
  zoomOnScroll: true,
  zoomMax: 8,
  zoomMin: 1,
  zoomStep: 1.6,
  lineWidth: 3,//默认line的宽度为3px，由于涉及到缩放，没有放到css里面配置
  regionsSelectable: false,
  markersSelectable: false,
  linesSelectable: false,
  bindTouchEvents: true,
  showRegionLabel: false,//显示label的时候就不显示悬浮提示了
  regionStyle: {
    initial: {
      fill: 'white',
      "fill-opacity": 1,
      stroke: 'none',
      "stroke-width": 0,
      "stroke-opacity": 1
    },
    hover: {
      "fill-opacity": 0.8
    },
    selected: {
      fill: 'yellow'
    },
    selectedHover: {
    }
  },
  lineStyle: {
    initial: {
      "fill-opacity": 0,
      stroke: 'red',
      "stroke-opacity": 1
    },
    hover: {
      stroke: 'black'
    },
    selected: {
      stroke: 'green'
    },
    selectedHover: {
    }
  },
  markerStyle: {
    initial: {
      fill: 'grey',
      stroke: '#505050',
      "fill-opacity": 1,
      "stroke-width": 1,
      "stroke-opacity": 1,
      r: 5
    },
    hover: {
      stroke: 'black',
      "stroke-width": 2
    },
    selected: {
      fill: 'blue'
    },
    selectedHover: {
    }
  },
  labelsStyle: {
    'position': 'absolute',
    '-webkit-border-radius': '3px',
    '-moz-border-radius': '3px',
    'color': 'black',
    'font-family': 'sans-serif, Verdana',
    'font-size': 'smaller'
  }
};
jvm.WorldMap.apiEvents = {
  onRegionLabelShow: 'regionLabelShow',
  onRegionOver: 'regionOver',
  onRegionOut: 'regionOut',
  onRegionClick: 'regionClick',
  onRegionSelected: 'regionSelected',
  onMarkerLabelShow: 'markerLabelShow',
  onMarkerOver: 'markerOver',
  onMarkerOut: 'markerOut',
  onMarkerClick: 'markerClick',
  onMarkerSelected: 'markerSelected',
  onViewportChange: 'viewportChange',
  onLineLabelShow: 'lineLabelShow',
  onLineOver: 'lineOver',
  onLineOut: 'lineOut',
  onLineClick: 'lineClick',
  onLineSelected: 'lineSelected'
};
