/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(2);

	// Brushes
	__webpack_require__(3);
	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(7);
	__webpack_require__(8);



/***/ }),
/* 1 */
/***/ (function(module, exports) {

	/* globals THREE */
	window.BinaryManager = function (buffer) {
	  this.dataview = new DataView(buffer);
	  this.offset = 0;
	  this.isLittleEndian = true;
	};

	window.BinaryManager.prototype = {
	  // READER
	  readQuaternion: function () {
	    return new THREE.Quaternion(
	      this.readFloat(),
	      this.readFloat(),
	      this.readFloat(),
	      this.readFloat()
	    );
	  },
	  readVector3: function () {
	    return new THREE.Vector3(
	      this.readFloat(),
	      this.readFloat(),
	      this.readFloat()
	    );
	  },
	  readString: function () {
	    var length = this.dataview.getUint8(this.offset++, true);
	    var output = '';
	    for (var i = 0; i < length; i++) {
	      output += String.fromCharCode(this.dataview.getUint8(this.offset++, true));
	    }
	    return output;
	  },
	  readColor: function () {
	    return new THREE.Color(
	      this.readFloat(),
	      this.readFloat(),
	      this.readFloat()
	    );
	  },
	  readFloat: function () {
	    var output = this.dataview.getFloat32(this.offset, true);
	    this.offset += 4;
	    return output;
	  },
	  readUint32: function () {
	    var output = this.dataview.getUint32(this.offset, true);
	    this.offset += 4;
	    return output;
	  },
	  readUint16: function () {
	    var output = this.dataview.getUint16(this.offset, true);
	    this.offset += 2;
	    return output;
	  },
	  readUint8: function () {
	    var output = this.dataview.getUint8(this.offset, true);
	    this.offset++;
	    return output;
	  },
	  // WRITER
	  writeVector: function (value) {
	    this.writeFloat32Array(value.toArray());
	  },
	  writeColor: function (value) {
	    this.writeFloat32Array(value.toArray());
	  },
	  writeString: function (value) {
	    this.writeUint8(value.length);
	    for (var i = 0; i < value.length; i++) {
	      this.writeUint8(value.charCodeAt(i));
	    }
	  },
	  writeUint8: function (value) {
	    this.dataview.setUint8(this.offset, value, this.isLittleEndian);
	    this.offset ++;
	  },
	  writeUint16: function (value) {
	    this.dataview.setUint16(this.offset, value, this.isLittleEndian);
	    this.offset += 2;
	  },
	  writeUint32: function (value) {
	    this.dataview.setUint32(this.offset, value, this.isLittleEndian);
	    this.offset += 4;
	  },
	  writeFloat32: function (value) {
	    this.dataview.setFloat32(this.offset, value, this.isLittleEndian);
	    this.offset += 4;
	  },
	  writeFloat32Array: function (value) {
	    for (var i = 0; i < value.length; i++) {
	      this.writeFloat32(value[i]);
	    }
	  },
	  getDataView: function () {
	    return this.dataview;
	  }
	};


/***/ }),
/* 2 */
/***/ (function(module, exports) {

	AFRAME.registerComponent('a-painter-loader', {
	  schema: {src: {type: 'asset'}},
	  brushes: {},
	  strokes: [],
	  getUsedBrushes: function () {
	    return Object.keys(AFRAME.BRUSHES)
	      .filter(function (name) { return AFRAME.BRUSHES[name].used; });
	  },

	  getBrushByName: function (name) {
	    return AFRAME.BRUSHES[name];
	  },

	  tick: function (time, delta) {
	    if (!this.strokes.length) { return; }
	    for (var i = 0; i < this.strokes.length; i++) {
	      this.strokes[i].tick(time, delta);
	    }
	  },

	  update: function (oldData) {
	    var src = this.data.src;
	    if (!oldData.src === src) { return; }
	    this.loadFromUrl(src, true);
	  },

	  addNewStroke: function (brushName, color, size) {
	    var Brush = this.getBrushByName(brushName);
	    if (!Brush) {
	      var newBrushName = Object.keys(AFRAME.BRUSHES)[0];
	      Brush = AFRAME.BRUSHES[newBrushName];
	      console.warn('Invalid brush name: `' + brushName + '` using `' + newBrushName + '`');
	    }

	    Brush.used = true;
	    var stroke = new Brush();
	    stroke.brush = Brush;
	    stroke.init(color, size);
	    this.strokes.push(stroke);

	    var entity = document.createElement('a-entity');
	    entity.className = "a-stroke";
	    this.el.appendChild(entity);
	    entity.setObject3D('mesh', stroke.object3D);
	    stroke.entity = entity;

	    return stroke;
	  },

	  loadJSON: function (data) {
	    if (data.version !== VERSION) {
	      console.error('Invalid version: ', data.version, '(Expected: ' + VERSION + ')');
	    }

	    for (var i = 0; i < data.strokes.length; i++) {
	      var strokeData = data.strokes[i];
	      var brush = strokeData.brush;

	      var stroke = this.addNewStroke(
	        data.brushes[brush.index],
	        new THREE.Color().fromArray(brush.color),
	        brush.size
	      );

	      for (var j = 0; j < strokeData.points.length; j++) {
	        var point = strokeData.points[j];

	        var position = new THREE.Vector3().fromArray(point.position);
	        var orientation = new THREE.Quaternion().fromArray(point.orientation);
	        var pressure = point.pressure;
	        var timestamp = point.timestamp;

	        var pointerPosition = this.getPointerPosition(position, orientation);
	        stroke.addPoint(position, orientation, pointerPosition, pressure, timestamp);
	      }
	    }
	  },

	  loadBinary: function (buffer) {
	    var binaryManager = new BinaryManager(buffer);
	    var magic = binaryManager.readString();
	    if (magic !== 'apainter') {
	      console.error('Invalid `magic` header');
	      return;
	    }

	    var version = binaryManager.readUint16();
	    if (version !== VERSION) {
	      console.error('Invalid version: ', version, '(Expected: ' + VERSION + ')');
	    }

	    var numUsedBrushes = binaryManager.readUint8();
	    var usedBrushes = [];
	    for (var b = 0; b < numUsedBrushes; b++) {
	      usedBrushes.push(binaryManager.readString());
	    }

	    var numStrokes = binaryManager.readUint32();

	    for (var l = 0; l < numStrokes; l++) {
	      var brushIndex = binaryManager.readUint8();
	      var color = binaryManager.readColor();
	      var size = binaryManager.readFloat();
	      var numPoints = binaryManager.readUint32();

	      var stroke = this.addNewStroke(usedBrushes[brushIndex], color, size);

	      for (var i = 0; i < numPoints; i++) {
	        var position = binaryManager.readVector3();
	        var orientation = binaryManager.readQuaternion();
	        var pressure = binaryManager.readFloat();
	        var timestamp = binaryManager.readUint32();

	        stroke.addPoint(position, orientation, position, pressure, timestamp);
	      }
	    }
	  },

	  loadFromUrl: function (url, binary) {
	    var self = this;
	    var loader = new THREE.FileLoader(this.manager);
	    loader.crossOrigin = 'anonymous';
	    if (binary === true) { loader.setResponseType('arraybuffer'); }

	    loader.load(url, function (buffer) {
	      if (binary === true) {
	        self.loadBinary(buffer);
	      } else {
	        self.loadJSON(JSON.parse(buffer));
	      }
	    });
	  }

	});/* globals AFRAME THREE BinaryManager */

	var VERSION = 1;

	AFRAME.BRUSHES = {};

	AFRAME.registerBrush = function (name, definition, options) {
	  var proto = {};

	  // Format definition object to prototype object.
	  Object.keys(definition).forEach(function (key) {
	    proto[key] = {
	      value: definition[key],
	      writable: true
	    };
	  });

	  if (AFRAME.BRUSHES[name]) {
	    throw new Error('The brush `' + name + '` has been already registered. ' +
	                    'Check that you are not loading two versions of the same brush ' +
	                    'or two different brushes of the same name.');
	  }

	  var BrushInterface = function () {};

	  var defaultOptions = {
	    spacing: 0,
	    maxPoints: 0
	  };

	  BrushInterface.prototype = {
	    options: Object.assign(defaultOptions, options),
	    reset: function () {},
	    tick: function (timeoffset, delta) {},
	    addPoint: function (position, orientation, pointerPosition, pressure, timestamp) {},
	    getJSON: function (system) {
	      var points = [];
	      for (var i = 0; i < this.data.points.length; i++) {
	        var point = this.data.points[i];
	        points.push({
	          'orientation': point.orientation.toArray().toNumFixed(6),
	          'position': point.position.toArray().toNumFixed(6),
	          'pressure': point.pressure.toNumFixed(6),
	          'timestamp': point.timestamp
	        });
	      }

	      return {
	        brush: {
	          index: system.getUsedBrushes().indexOf(this.brushName),
	          color: this.data.color.toArray().toNumFixed(6),
	          size: this.data.size.toNumFixed(6)
	        },
	        points: points
	      };
	    },
	    getBinary: function (system) {
	      // Color = 3*4 = 12
	      // NumPoints   =  4
	      // Brush index =  1
	      // ----------- = 21
	      // [Point] = vector3 + quat + pressure + timestamp = (3+4+1+1)*4 = 36

	      var bufferSize = 21 + (36 * this.data.points.length);
	      var binaryManager = new BinaryManager(new ArrayBuffer(bufferSize));
	      binaryManager.writeUint8(system.getUsedBrushes().indexOf(this.brushName));  // brush index
	      binaryManager.writeColor(this.data.color);    // color
	      binaryManager.writeFloat32(this.data.size);   // brush size

	      // Number of points
	      binaryManager.writeUint32(this.data.points.length);

	      // Points
	      for (var i = 0; i < this.data.points.length; i++) {
	        var point = this.data.points[i];
	        binaryManager.writeFloat32Array(point.position.toArray());
	        binaryManager.writeFloat32Array(point.orientation.toArray());
	        binaryManager.writeFloat32(point.pressure);
	        binaryManager.writeUint32(point.timestamp);
	      }
	      return binaryManager.getDataView();
	    }
	  };

	  function wrapInit (initMethod) {
	    return function init (color, brushSize) {
	      this.object3D = new THREE.Object3D();
	      this.data = {
	        points: [],
	        size: brushSize,
	        prevPosition: null,
	        prevPointerPosition: null,
	        numPoints: 0,
	        color: color.clone()
	      };
	      initMethod.call(this, color, brushSize);
	    };
	  }

	  function wrapAddPoint (addPointMethod) {
	    return function addPoint (position, orientation, pointerPosition, pressure, timestamp) {
	      if ((this.data.prevPosition && this.data.prevPosition.distanceTo(position) <= this.options.spacing) ||
	          this.options.maxPoints !== 0 && this.data.numPoints >= this.options.maxPoints) {
	        return;
	      }
	      if (addPointMethod.call(this, position, orientation, pointerPosition, pressure, timestamp)) {
	        this.data.numPoints++;
	        this.data.points.push({
	          'position': position.clone(),
	          'orientation': orientation.clone(),
	          'pressure': pressure,
	          'timestamp': timestamp
	        });

	        this.data.prevPosition = position.clone();
	        this.data.prevPointerPosition = pointerPosition.clone();
	      }
	    };
	  }

	  var NewBrush = function () {};
	  NewBrush.prototype = Object.create(BrushInterface.prototype, proto);
	  NewBrush.prototype.brushName = name;
	  NewBrush.prototype.constructor = NewBrush;
	  NewBrush.prototype.init = wrapInit(NewBrush.prototype.init);
	  NewBrush.prototype.addPoint = wrapAddPoint(NewBrush.prototype.addPoint);
	  AFRAME.BRUSHES[name] = NewBrush;

	  // console.log('New brush registered `' + name + '`');
	  NewBrush.used = false; // Used to know which brushes have been used on the drawing
	  return NewBrush;
	};



/***/ }),
/* 3 */
/***/ (function(module, exports) {

	/* globals AFRAME THREE */
	(function () {
	  var line = {

	    init: function (color, brushSize) {
	      this.idx = 0;
	      this.geometry = new THREE.BufferGeometry();
	      this.vertices = new Float32Array(this.options.maxPoints * 3 * 3);
	      this.normals = new Float32Array(this.options.maxPoints * 3 * 3);
	      this.uvs = new Float32Array(this.options.maxPoints * 2 * 2);

	      this.geometry.setDrawRange(0, 0);
	      this.geometry.addAttribute('position', new THREE.BufferAttribute(this.vertices, 3).setDynamic(true));
	      this.geometry.addAttribute('uv', new THREE.BufferAttribute(this.uvs, 2).setDynamic(true));
	      this.geometry.addAttribute('normal', new THREE.BufferAttribute(this.normals, 3).setDynamic(true));

	      var mesh = new THREE.Mesh(this.geometry, this.getMaterial());
	      mesh.drawMode = THREE.TriangleStripDrawMode;

	      mesh.frustumCulled = false;
	      mesh.vertices = this.vertices;

	      this.object3D.add(mesh);
	    },

	    getMaterial: function () {
	      var map = this.materialOptions.map;
	      var type = this.materialOptions.type;

	      var defaultOptions = {};
	      var defaultTextureOptions = {};
	      if (map) {
	        defaultTextureOptions = {
	          map: map,
	          transparent: true,
	          alphaTest: 0.5
	        };
	      }

	      if (type === 'shaded') {
	        defaultOptions = {
	          color: this.data.color,
	          roughness: 0.75,
	          metalness: 0.25,
	          side: THREE.DoubleSide
	        };
	      } else {
	        defaultOptions = {
	          color: this.data.color,
	          side: THREE.DoubleSide
	        };
	      }

	      var options = Object.assign(defaultOptions, defaultTextureOptions, this.materialOptions);
	      delete options.type;

	      if (type === 'shaded') {
	        return new THREE.MeshStandardMaterial(options);
	      } else {
	        return new THREE.MeshBasicMaterial(options);
	      }
	    },
	    addPoint: function (position, orientation, pointerPosition, pressure, timestamp) {
	      var uv = 0;
	      for (i = 0; i < this.data.numPoints; i++) {
	        this.uvs[ uv++ ] = i / (this.data.numPoints - 1);
	        this.uvs[ uv++ ] = 0;

	        this.uvs[ uv++ ] = i / (this.data.numPoints - 1);
	        this.uvs[ uv++ ] = 1;
	      }

	      var direction = new THREE.Vector3();
	      direction.set(1, 0, 0);
	      direction.applyQuaternion(orientation);
	      direction.normalize();

	      var posA = pointerPosition.clone();
	      var posB = pointerPosition.clone();
	      var brushSize = this.data.size * pressure;
	      posA.add(direction.clone().multiplyScalar(brushSize / 2));
	      posB.add(direction.clone().multiplyScalar(-brushSize / 2));

	      this.vertices[ this.idx++ ] = posA.x;
	      this.vertices[ this.idx++ ] = posA.y;
	      this.vertices[ this.idx++ ] = posA.z;

	      this.vertices[ this.idx++ ] = posB.x;
	      this.vertices[ this.idx++ ] = posB.y;
	      this.vertices[ this.idx++ ] = posB.z;

	      this.computeVertexNormals();
	      this.geometry.attributes.normal.needsUpdate = true;
	      this.geometry.attributes.position.needsUpdate = true;
	      this.geometry.attributes.uv.needsUpdate = true;

	      this.geometry.setDrawRange(0, this.data.numPoints * 2);

	      return true;
	    },

	    computeVertexNormals: function () {
	      var pA = new THREE.Vector3();
	      var pB = new THREE.Vector3();
	      var pC = new THREE.Vector3();
	      var cb = new THREE.Vector3();
	      var ab = new THREE.Vector3();

	      for (var i = 0, il = this.idx; i < il; i++) {
	        this.normals[ i ] = 0;
	      }

	      var pair = true;
	      for (i = 0, il = this.idx; i < il; i += 3) {
	        if (pair) {
	          pA.fromArray(this.vertices, i);
	          pB.fromArray(this.vertices, i + 3);
	          pC.fromArray(this.vertices, i + 6);
	        } else {
	          pA.fromArray(this.vertices, i + 3);
	          pB.fromArray(this.vertices, i);
	          pC.fromArray(this.vertices, i + 6);
	        }
	        pair = !pair;

	        cb.subVectors(pC, pB);
	        ab.subVectors(pA, pB);
	        cb.cross(ab);
	        cb.normalize();

	        this.normals[ i ] += cb.x;
	        this.normals[ i + 1 ] += cb.y;
	        this.normals[ i + 2 ] += cb.z;

	        this.normals[ i + 3 ] += cb.x;
	        this.normals[ i + 4 ] += cb.y;
	        this.normals[ i + 5 ] += cb.z;

	        this.normals[ i + 6 ] += cb.x;
	        this.normals[ i + 7 ] += cb.y;
	        this.normals[ i + 8 ] += cb.z;
	      }

	      /*
	      first and last vertice (0 and 8) belongs just to one triangle
	      second and penultimate (1 and 7) belongs to two triangles
	      the rest of the vertices belongs to three triangles

	        1_____3_____5_____7
	        /\    /\    /\    /\
	       /  \  /  \  /  \  /  \
	      /____\/____\/____\/____\
	      0    2     4     6     8
	      */

	      // Vertices that are shared across three triangles
	      for (i = 2 * 3, il = this.idx - 2 * 3; i < il; i++) {
	        this.normals[ i ] = this.normals[ i ] / 3;
	      }

	      // Second and penultimate triangle, that shares just two triangles
	      this.normals[ 3 ] = this.normals[ 3 ] / 2;
	      this.normals[ 3 + 1 ] = this.normals[ 3 + 1 ] / 2;
	      this.normals[ 3 + 2 ] = this.normals[ 3 * 1 + 2 ] / 2;

	      this.normals[ this.idx - 2 * 3 ] = this.normals[ this.idx - 2 * 3 ] / 2;
	      this.normals[ this.idx - 2 * 3 + 1 ] = this.normals[ this.idx - 2 * 3 + 1 ] / 2;
	      this.normals[ this.idx - 2 * 3 + 2 ] = this.normals[ this.idx - 2 * 3 + 2 ] / 2;

	      this.geometry.normalizeNormals();
	    }
	  };

	  var lines = [
	    {
	      name: 'flat',
	      materialOptions: {
	        type: 'flat'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_flat.gif'
	    },
	    {
	      name: 'smooth',
	      materialOptions: {
	        type: 'shaded'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_smooth.gif'
	    },
	    {
	      name: 'squared-textured',
	      materialOptions: {
	        type: 'textured',
	        textureSrc: 'https://aframe.io/a-painter/brushes/squared_textured.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_squared_textured.gif'
	    },
	    {
	      name: 'line-gradient',
	      materialOptions: {
	        type: 'textured',
	        textureSrc: 'https://aframe.io/a-painter/brushes/line_gradient.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_line_gradient.gif'
	    },
	    {
	      name: 'silky-flat',
	      materialOptions: {
	        type: 'textured',
	        textureSrc: 'https://aframe.io/a-painter/brushes/silky_flat.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_silky_flat.gif'
	    },
	    {
	      name: 'silky-textured',
	      materialOptions: {
	        type: 'textured',
	        textureSrc: 'https://aframe.io/a-painter/brushes/silky_textured.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_silky_textured.gif'
	    },
	    {
	      name: 'lines1',
	      materialOptions: {
	        type: 'textured',
	        textureSrc: 'https://aframe.io/a-painter/brushes/lines1.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_lines1.gif'
	    },
	    {
	      name: 'lines2',
	      materialOptions: {
	        type: 'textured',
	        textureSrc: 'https://aframe.io/a-painter/brushes/lines2.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_lines2.gif'
	    },
	    {
	      name: 'lines3',
	      materialOptions: {
	        type: 'textured',
	        textureSrc: 'https://aframe.io/a-painter/brushes/lines3.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_lines3.gif'
	    },
	    {
	      name: 'lines4',
	      materialOptions: {
	        type: 'textured',
	        textureSrc: 'https://aframe.io/a-painter/brushes/lines4.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_lines4.gif'
	    },
	    {
	      name: 'lines5',
	      materialOptions: {
	        type: 'textured',
	        textureSrc: 'https://aframe.io/a-painter/brushes/lines5.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_lines5.gif'
	    },
	    {
	      name: 'line-grunge1',
	      materialOptions: {
	        type: 'textured',
	        textureSrc: 'https://aframe.io/a-painter/brushes/line_grunge1.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_line_grunge1.gif'
	    },
	    {
	      name: 'line-grunge2',
	      materialOptions: {
	        type: 'textured',
	        textureSrc: 'https://aframe.io/a-painter/brushes/line_grunge2.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_line_grunge2.gif'
	    },
	    {
	      name: 'line-grunge3',
	      materialOptions: {
	        type: 'textured',
	        textureSrc: 'https://aframe.io/a-painter/brushes/line_grunge3.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_line_grunge3.gif'
	    }
	  ];

	  var textureLoader = new THREE.TextureLoader();

	  for (var i = 0; i < lines.length; i++) {
	    var definition = lines[i];
	    if (definition.materialOptions.textureSrc) {
	      definition.materialOptions.map = textureLoader.load(definition.materialOptions.textureSrc);
	      delete definition.materialOptions.textureSrc;
	    }
	    AFRAME.registerBrush(definition.name, Object.assign({}, line, {materialOptions: definition.materialOptions}), {thumbnail: definition.thumbnail, maxPoints: 3000});
	  }
	})();


/***/ }),
/* 4 */
/***/ (function(module, exports) {

	/* global AFRAME THREE */
	(function () {
	  var stamp = {

	    init: function (color, brushSize) {
	      this.idx = 0;
	      this.geometry = new THREE.BufferGeometry();
	      this.vertices = new Float32Array(this.options.maxPoints * 3 * 3 * 2);
	      this.normals = new Float32Array(this.options.maxPoints * 3 * 3 * 2);
	      this.uvs = new Float32Array(this.options.maxPoints * 2 * 3 * 2);

	      this.geometry.setDrawRange(0, 0);
	      this.geometry.addAttribute('position', new THREE.BufferAttribute(this.vertices, 3).setDynamic(true));
	      this.geometry.addAttribute('uv', new THREE.BufferAttribute(this.uvs, 2).setDynamic(true));
	      this.geometry.addAttribute('normal', new THREE.BufferAttribute(this.normals, 3).setDynamic(true));

	      var mesh = new THREE.Mesh(this.geometry, this.getMaterial());
	      this.currAngle = 0;
	      this.subTextures = 1;
	      this.angleJitter = 0;
	      this.autoRotate = false;

	      if (this.materialOptions['subTextures'] !== undefined) {
	        this.subTextures = this.materialOptions['subTextures'];
	      }
	      if (this.materialOptions['autoRotate'] === true) {
	        this.autoRotate = true;
	      }
	      if (this.materialOptions['angleJitter'] !== undefined) {
	        this.angleJitter = this.materialOptions['angleJitter'];
	        this.angleJitter = this.angleJitter * 2 - this.angleJitter;
	      }

	      mesh.frustumCulled = false;
	      mesh.vertices = this.vertices;
	      this.object3D.add(mesh);
	    },

	    getMaterial: function () {
	      var map = this.materialOptions.map;
	      var type = this.materialOptions.type;
	      if (type === 'shaded') {
	        return new THREE.MeshStandardMaterial({
	          color: this.data.color,
	          side: THREE.DoubleSide,
	          map: map,
	          transparent: true,
	          alphaTest: 0.5,
	          roughness: 0.75,
	          metalness: 0.25
	        });
	      }
	      return new THREE.MeshBasicMaterial({
	        color: this.data.color,
	        side: THREE.DoubleSide,
	        map: map,
	        transparent: true,
	        alphaTest: 0.5
	      });
	    },

	    addPoint: function (position, rotation, pointerPosition, pressure, timestamp) {
	      // brush side
	      var pi2 = Math.PI / 2;
	      var dir = new THREE.Vector3();
	      dir.set(1, 0, 0);
	      dir.applyQuaternion(rotation);
	      dir.normalize();

	      // brush normal
	      var axis = new THREE.Vector3();
	      axis.set(0, 1, 0);
	      axis.applyQuaternion(rotation);
	      axis.normalize();

	      var brushSize = this.data.size * pressure / 2;
	      var brushAngle = Math.PI / 4 + Math.random() * this.angleJitter;

	      if (this.autoRotate) {
	        this.currAngle += 0.1;
	        brushAngle += this.currAngle;
	      }

	      var a = pointerPosition.clone().add(dir.applyAxisAngle(axis, brushAngle).clone().multiplyScalar(brushSize));
	      var b = pointerPosition.clone().add(dir.applyAxisAngle(axis, pi2).clone().multiplyScalar(brushSize));
	      var c = pointerPosition.clone().add(dir.applyAxisAngle(axis, pi2).clone().multiplyScalar(brushSize));
	      var d = pointerPosition.clone().add(dir.applyAxisAngle(axis, pi2).multiplyScalar(brushSize));

	      var nidx = this.idx;
	      // triangle 1
	      this.vertices[ this.idx++ ] = a.x;
	      this.vertices[ this.idx++ ] = a.y;
	      this.vertices[ this.idx++ ] = a.z;

	      this.vertices[ this.idx++ ] = b.x;
	      this.vertices[ this.idx++ ] = b.y;
	      this.vertices[ this.idx++ ] = b.z;

	      this.vertices[ this.idx++ ] = c.x;
	      this.vertices[ this.idx++ ] = c.y;
	      this.vertices[ this.idx++ ] = c.z;

	      // triangle 2

	      this.vertices[ this.idx++ ] = c.x;
	      this.vertices[ this.idx++ ] = c.y;
	      this.vertices[ this.idx++ ] = c.z;

	      this.vertices[ this.idx++ ] = d.x;
	      this.vertices[ this.idx++ ] = d.y;
	      this.vertices[ this.idx++ ] = d.z;

	      this.vertices[ this.idx++ ] = a.x;
	      this.vertices[ this.idx++ ] = a.y;
	      this.vertices[ this.idx++ ] = a.z;

	      // normals
	      for (var i = 0; i < 6; i++) {
	        this.normals[ nidx++ ] = axis.x;
	        this.normals[ nidx++ ] = axis.y;
	        this.normals[ nidx++ ] = axis.z;
	      }

	      // UVs
	      var uv = this.data.numPoints * 6 * 2;

	      // subTextures?
	      var Umin = 0;
	      var Umax = 1;
	      if (this.subTextures > 1) {
	        var subt = Math.floor(Math.random() * this.subTextures);
	        Umin = 1.0 / this.subTextures * subt;
	        Umax = Umin + 1.0 / this.subTextures;
	      }
	      // triangle 1 uv
	      this.uvs[ uv++ ] = Umin;
	      this.uvs[ uv++ ] = 1;
	      this.uvs[ uv++ ] = Umin;
	      this.uvs[ uv++ ] = 0;
	      this.uvs[ uv++ ] = Umax;
	      this.uvs[ uv++ ] = 0;

	      // triangle2 uv
	      this.uvs[ uv++ ] = Umax;
	      this.uvs[ uv++ ] = 0;
	      this.uvs[ uv++ ] = Umax;
	      this.uvs[ uv++ ] = 1;
	      this.uvs[ uv++ ] = Umin;
	      this.uvs[ uv++ ] = 1;

	      this.geometry.attributes.normal.needsUpdate = true;
	      this.geometry.attributes.position.needsUpdate = true;
	      this.geometry.attributes.uv.needsUpdate = true;

	      this.geometry.setDrawRange(0, this.data.numPoints * 6);

	      return true;
	    }
	  };

	  var stamps = [
	    {
	      name: 'dots',
	      materialOptions: {
	        type: 'shaded',
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_dots.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_stamp_dots.gif',
	      spacing: 0.01
	    },
	    {
	      name: 'squares',
	      materialOptions: {
	        type: 'shaded',
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_squares.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_stamp_squares.gif',
	      spacing: 0.01
	    },
	    {
	      name: 'column',
	      materialOptions: {
	        type: 'shaded',
	        autoRotate: true,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_column.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_stamp_column.gif',
	      spacing: 0.01
	    },
	    {
	      name: 'gear1',
	      materialOptions: {
	        type: 'shaded',
	        angleJitter: Math.PI * 2,
	        subTextures: 2,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_gear.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_stamp_gear.gif',
	      spacing: 0.05
	    },
	    {
	      name: 'grunge1',
	      materialOptions: {
	        type: 'shaded',
	        angleJitter: Math.PI * 2,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_grunge1.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/stamp_grunge1.png',
	      spacing: 0.02
	    },
	    {
	      name: 'grunge2',
	      materialOptions: {
	        type: 'shaded',
	        angleJitter: Math.PI * 2,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_grunge2.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/stamp_grunge2.png',
	      spacing: 0.02
	    },
	    {
	      name: 'grunge3',
	      materialOptions: {
	        type: 'shaded',
	        angleJitter: Math.PI * 2,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_grunge3.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/stamp_grunge3.png',
	      spacing: 0.02
	    },
	    {
	      name: 'grunge4',
	      materialOptions: {
	        type: 'shaded',
	        angleJitter: Math.PI * 2,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_grunge4.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/stamp_grunge4.png',
	      spacing: 0.02
	    },
	    {
	      name: 'grunge5',
	      materialOptions: {
	        type: 'shaded',
	        angleJitter: Math.PI * 2,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_grunge5.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_stamp_grunge5.gif',
	      spacing: 0.02
	    },
	    {
	      name: 'leaf1',
	      materialOptions: {
	        type: 'shaded',
	        angleJitter: Math.PI,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_leaf1.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/stamp_leaf1.png',
	      spacing: 0.03
	    },
	    {
	      name: 'leaf2',
	      materialOptions: {
	        type: 'shaded',
	        angleJitter: 60 * Math.PI / 180.0,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_leaf2.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_stamp_leaf2.gif',
	      spacing: 0.03
	    },
	    {
	      name: 'leaf3',
	      materialOptions: {
	        type: 'shaded',
	        angleJitter: 60 * Math.PI / 180.0,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_leaf3.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_stamp_leaf3.gif',
	      spacing: 0.03
	    },
	    {
	      name: 'fur1',
	      materialOptions: {
	        type: 'shaded',
	        angleJitter: 40 * Math.PI / 180.0,
	        subTextures: 2,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_fur1.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/stamp_fur1.png',
	      spacing: 0.01
	    },
	    {
	      name: 'fur2',
	      materialOptions: {
	        type: 'shaded',
	        angleJitter: 10 * Math.PI / 180.0,
	        subTextures: 3,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_fur2.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/stamp_fur2.png',
	      spacing: 0.01
	    },
	    {
	      name: 'grass',
	      materialOptions: {
	        type: 'shaded',
	        angleJitter: 10 * Math.PI / 180.0,
	        subTextures: 3,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_grass.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_stamp_grass.png',
	      spacing: 0.03
	    },
	    {
	      name: 'bush',
	      materialOptions: {
	        type: 'shaded',
	        subTextures: 2,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_bush.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_stamp_bush.gif',
	      spacing: 0.04
	    },
	    {
	      name: 'star',
	      materialOptions: {
	        type: 'shaded',
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_star.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_stamp_star.png',
	      spacing: 0.06
	    },
	    {
	      name: 'snow',
	      materialOptions: {
	        type: 'shaded',
	        angleJitter: Math.PI * 2,
	        textureSrc: 'https://aframe.io/a-painter/brushes/stamp_snow.png'
	      },
	      thumbnail: 'https://aframe.io/a-painter/brushes/thumb_stamp_snow.png',
	      spacing: 0.06
	    }
	  ];

	  var textureLoader = new THREE.TextureLoader();
	  for (var i = 0; i < stamps.length; i++) {
	    var definition = stamps[i];
	    if (definition.materialOptions.textureSrc) {
	      definition.materialOptions.map = textureLoader.load(definition.materialOptions.textureSrc);
	      delete definition.materialOptions.textureSrc;
	    }
	    AFRAME.registerBrush(definition.name, Object.assign({}, stamp, {materialOptions: definition.materialOptions}), {thumbnail: definition.thumbnail, spacing: definition.spacing, maxPoints: 3000});
	  }

	  /*
	  - type: <'flat'|'shaded'>
	    Flat: constant, just color. Shaded: phong shading with subtle speculars
	  - autoRotate: <true|false>
	    The brush rotates incrementally at 0.1rad per point
	  - angleJitter: <r:float>
	    The brush rotates randomly from -r to r
	  - subTextures: <n:int>
	    textureSrc is divided in n horizontal pieces, and the brush picks one randomly on each point
	  */
	})();


/***/ }),
/* 5 */
/***/ (function(module, exports) {

	/* globals AFRAME THREE */
	AFRAME.registerBrush('spheres',
	  {
	    init: function (color, width) {
	      // Initialize the material based on the stroke color
	      this.material = new THREE.MeshStandardMaterial({
	        color: this.data.color,
	        roughness: 0.5,
	        metalness: 0.5,
	        side: THREE.DoubleSide,
	        shading: THREE.FlatShading
	      });
	      this.geometry = new THREE.IcosahedronGeometry(1, 0);
	    },
	    // This function is called every time we need to add a point to our stroke
	    // It should returns true if the point is added correctly, false otherwise.
	    addPoint: function (position, orientation, pointerPosition, pressure, timestamp) {
	      // Create a new sphere mesh to insert at the given position
	      var sphere = new THREE.Mesh(this.geometry, this.material);

	      // The scale is determined by the trigger preassure
	      var sca = this.data.size / 2 * pressure;
	      sphere.scale.set(sca, sca, sca);
	      sphere.initialScale = sphere.scale.clone();

	      // Generate a random phase to be used in the tick animation
	      sphere.phase = Math.random() * Math.PI * 2;

	      // Set the position of the sphere to match the controller positoin
	      sphere.position.copy(pointerPosition);
	      sphere.rotation.copy(orientation);

	      // Add the sphere to the object3D
	      this.object3D.add(sphere);

	      // Return true as we've added correctly a new point (or sphere)
	      return true;
	    },
	    // This function is called on every frame
	    tick: function (time, delta) {
	      for (var i = 0; i < this.object3D.children.length; i++) {
	        var sphere = this.object3D.children[i];
	        // Calculate the sine value based on the time and the phase for this sphere
	        // and use it to scale the geometry
	        var sin = (Math.sin(sphere.phase + time / 500.0) + 1) / 2 + 0.1;
	        sphere.scale.copy(sphere.initialScale).multiplyScalar(sin);
	      }
	    }
	  },
	  // Define extra options for this brush
	  {thumbnail: 'brushes/thumb_spheres.gif', spacing: 0.01}
	);


/***/ }),
/* 6 */
/***/ (function(module, exports) {

	/* globals AFRAME THREE */
	AFRAME.registerBrush('cubes',
	  {
	    init: function (color, width) {
	      this.material = new THREE.MeshStandardMaterial({
	        color: this.data.color,
	        roughness: 0.5,
	        metalness: 0.5,
	        side: THREE.DoubleSide,
	        shading: THREE.FlatShading
	      });
	      this.geometry = new THREE.BoxGeometry(1, 1, 1);
	    },
	    addPoint: function (position, orientation, pointerPosition, pressure, timestamp) {
	      var box = new THREE.Mesh(this.geometry, this.material);

	      var sca = pressure * this.data.size * Math.random();
	      box.scale.set(sca, sca, sca);
	      box.position.copy(pointerPosition);
	      box.rotation.copy(orientation);

	      this.object3D.add(box);

	      return true;
	    }
	  },
	  {thumbnail: 'brushes/thumb_cubes.gif', spacing: 0.01}
	);


/***/ }),
/* 7 */
/***/ (function(module, exports) {

	/* globals AFRAME THREE */
	(function(){
	  var vertexShader = [
	    "varying vec2 vUv;",
	    "void main() {",
	    "vUv = uv;",
	    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
	    "}"
	  ].join();

	  var fragmentShader = [
	    "uniform sampler2D tDiffuse;",
	    "uniform float amount;",
	    "uniform float time;",
	    "varying vec2 vUv;",

	    "vec3 hsv2rgb(vec3 c) {",
	    "    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
	    "    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
	    "    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
	    "}",

	    "void main() {",
	    " float h = mod(vUv.x - time / 3000.0, 1.0);",
	    " vec4 color = vec4(hsv2rgb(vec3(h, 1.0, 0.5)), 1.0);",
	    " gl_FragColor = color;",
	    "}"
	  ].join();

	  var material = new THREE.ShaderMaterial({
	    vertexShader: vertexShader,
	    fragmentShader: fragmentShader,
	    side: THREE.DoubleSide,
	    uniforms: {
	      time: {type: 'f', value: 0}
	    }
	  });

	  AFRAME.registerBrush('line-rainbow',
	    {
	      init: function (color, brushSize) {
	        this.idx = 0;
	        this.geometry = new THREE.BufferGeometry();
	        this.vertices = new Float32Array(this.options.maxPoints * 3 * 3);
	        this.uvs = new Float32Array(this.options.maxPoints * 2 * 2);
	        this.linepositions = new Float32Array(this.options.maxPoints);

	        this.geometry.setDrawRange(0, 0);
	        this.geometry.addAttribute('position', new THREE.BufferAttribute(this.vertices, 3).setDynamic(true));
	        this.geometry.addAttribute('uv', new THREE.BufferAttribute(this.uvs, 2).setDynamic(true));
	        this.geometry.addAttribute('lineposition', new THREE.BufferAttribute(this.linepositions, 1).setDynamic(true));

	        this.material = material;
	        var mesh = new THREE.Mesh(this.geometry, this.material);
	        mesh.drawMode = THREE.TriangleStripDrawMode;

	        mesh.frustumCulled = false;
	        mesh.vertices = this.vertices;

	        this.object3D.add(mesh);
	      },
	      addPoint: function (position, orientation, pointerPosition, pressure, timestamp) {
	        var uv = 0;
	        for (i = 0; i < this.data.numPoints; i++) {
	          this.uvs[ uv++ ] = i / (this.data.numPoints - 1);
	          this.uvs[ uv++ ] = 0;

	          this.uvs[ uv++ ] = i / (this.data.numPoints - 1);
	          this.uvs[ uv++ ] = 1;
	        }

	        var direction = new THREE.Vector3();
	        direction.set(1, 0, 0);
	        direction.applyQuaternion(orientation);
	        direction.normalize();

	        var posA = pointerPosition.clone();
	        var posB = pointerPosition.clone();
	        var brushSize = this.data.size * pressure;
	        posA.add(direction.clone().multiplyScalar(brushSize / 2));
	        posB.add(direction.clone().multiplyScalar(-brushSize / 2));

	        this.vertices[ this.idx++ ] = posA.x;
	        this.vertices[ this.idx++ ] = posA.y;
	        this.vertices[ this.idx++ ] = posA.z;

	        this.vertices[ this.idx++ ] = posB.x;
	        this.vertices[ this.idx++ ] = posB.y;
	        this.vertices[ this.idx++ ] = posB.z;

	        this.geometry.attributes.position.needsUpdate = true;
	        this.geometry.attributes.uv.needsUpdate = true;

	        this.geometry.setDrawRange(0, this.data.numPoints * 2);

	        return true;
	      },

	      tick: function(timeOffset, delta) {
	        this.material.uniforms.time.value = timeOffset;
	      },
	    },
	    {thumbnail:'brushes/thumb_rainbow.png', maxPoints: 3000}
	  );
	})();


/***/ }),
/* 8 */
/***/ (function(module, exports) {

	/* globals AFRAME THREE */
	AFRAME.registerBrush('single-sphere',
	  {
	    init: function (color, width) {
	      this.material = new THREE.MeshStandardMaterial({
	        color: this.data.color,
	        roughness: 0.6,
	        metalness: 0.2,
	        side: THREE.FrontSide,
	        shading: THREE.SmoothShading
	      });
	      this.geometry = new THREE.IcosahedronGeometry(1, 2);
	      this.mesh = new THREE.Mesh(this.geometry, this.material);
	      this.object3D.add(this.mesh);
	      this.mesh.visible = false
	    },
	    addPoint: function (position, orientation, pointerPosition, pressure, timestamp) {
	      if (!this.firstPoint) {
	        this.firstPoint = pointerPosition.clone();
	        this.mesh.position.set(this.firstPoint.x, this.firstPoint.y, this.firstPoint.z)
	      }
	      this.mesh.visible = true
	      var distance = this.firstPoint.distanceTo(pointerPosition);
	      this.mesh.scale.set(distance, distance, distance);
	      return true;
	    }
	  },
	  {thumbnail: 'brushes/thumb_single_sphere.png', spacing: 0.0}
	);


/***/ })
/******/ ]);