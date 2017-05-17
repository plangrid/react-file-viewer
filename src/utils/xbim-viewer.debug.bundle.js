

/* Copyright (c) 2016, xBIM Team, Northumbria University. All rights reserved.

This javascript library is part of xBIM project. It is provided under the same 
Common Development and Distribution License (CDDL) as the xBIM Toolkit. For 
more information see http://www.openbim.org

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
function xBinaryReader() {
    this._buffer = null;
    this._position = 0;
}

xBinaryReader.prototype.onloaded = function () { };
xBinaryReader.prototype.onerror = function () { };

  
xBinaryReader.prototype.load = function (source) {
    this._position = 0;
    var self = this;

    if (typeof (source) == 'undefined' || source == null) throw 'Source must be defined';
    if (typeof (source) == 'string') {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open("GET", source, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var fReader = new FileReader();
                fReader.onloadend = function () {
                    if (fReader.result) {
                        //set data buffer for next processing
                        self._buffer = fReader.result;
                        //do predefined processing of the data
                        if (self.onloaded) {
                            self.onloaded();
                        }
                    }
                };
                fReader.readAsArrayBuffer(xhr.response);
            }
            //throw exception as a warning
            if (xhr.readyState == 4 && xhr.status != 200) {
                var msg = 'Failed to fetch binary data from server. Server code: ' + xhr.status +
                    '. This might be due to CORS policy of your browser if you run this as a local file.';
                if (self.onerror) self.onerror(msg);
                throw msg;
            }
        };
        xhr.responseType = 'blob';
        xhr.send();
    }
    else if (source instanceof Blob || source instanceof File) {
        var fReader = new FileReader();
        fReader.onloadend = function () {
            if (fReader.result) {
                //set data buffer for next processing
                self._buffer = fReader.result;
                //do predefined processing of the data
                if (self.onloaded) {
                    self.onloaded();
                }
            }
        };
        fReader.readAsArrayBuffer(source);
    }
    else if (source instanceof ArrayBuffer) {
        this._buffer = source;
    }
};

xBinaryReader.prototype.getIsEOF = function (type, count) {
    if (typeof (this._position) === "undefined")
        throw "Position is not defined";
    return this._position == this._buffer.byteLength;
};

xBinaryReader.prototype.read = function (arity, count, ctor) {
    if(typeof (count) === "undefined") count = 1;
    var length = arity * count;
    var offset = this._position;
    this._position += length;
    var result;

    return count === 1 ?
        new ctor(this._buffer.slice(offset, offset + length))[0] :
        new ctor(this._buffer.slice(offset, offset + length));
};

xBinaryReader.prototype.readByte = function (count) {
    return this.read(1, count, Uint8Array);
};
xBinaryReader.prototype.readUint8 = function (count) {
    return this.read(1, count, Uint8Array);
};
xBinaryReader.prototype.readInt16 = function (count) {
    return this.read(2, count, Int16Array);
};
xBinaryReader.prototype.readUint16 = function (count) {
    return this.read(2, count, Uint16Array);
};
xBinaryReader.prototype.readInt32 = function (count) {
    return this.read(4, count, Int32Array);
};
xBinaryReader.prototype.readUint32 = function (count) {
    return this.read(4, count, Uint32Array);
};
xBinaryReader.prototype.readFloat32 = function (count) {
    return this.read(4, count, Float32Array);
};
xBinaryReader.prototype.readFloat64 = function (count) {
    return this.read(8, count, Float64Array);
};

//functions for a higher objects like points, colours and matrices
xBinaryReader.prototype.readChar = function (count) {
    if (typeof (count) === "undefined") count = 1;
    var bytes = this.readByte(count);
    var result = new Array(count);
    for (var i in bytes) {
        result[i] = String.fromCharCode(bytes[i]);
    }
    return count ===1 ? result[0] : result;
};

xBinaryReader.prototype.readPoint = function (count) {
    if (typeof (count) === "undefined") count = 1;
    var coords = this.readFloat32(count * 3);
    var result = new Array(count);
    for (var i = 0; i < count; i++) {
        var offset = i * 3 * 4;
        //only create new view on the buffer so that no new memory is allocated
        var point = new Float32Array(coords.buffer, offset, 3);
        result[i] = point;
    }
    return count === 1 ? result[0] : result;
};
xBinaryReader.prototype.readRgba = function (count) {
    if (typeof (count) === "undefined") count = 1;
    var values = this.readByte(count * 4);
    var result = new Array(count);
    for (var i = 0; i < count ; i++) {
        var offset = i * 4;
        var colour = new Uint8Array(values.buffer, offset, 4);
        result[i] = colour;
    }
    return count === 1 ? result[0] : result;
};
xBinaryReader.prototype.readPackedNormal = function (count) {
    if (typeof (count) === "undefined") count = 1;
    var values = this.readUint8(count * 2);
    var result = new Array(count);
    for (var i = 0; i < count; i++) {
        var uv = new Uint8Array(values.buffer, i * 2, 2);
        result[i] = uv;
    }
    return count === 1 ? result[0] : result;
};
xBinaryReader.prototype.readMatrix4x4 = function (count) {
    if (typeof (count) === "undefined") count = 1;
    var values = this.readFloat32(count * 16);
    var result = new Array(count);
    for (var i = 0; i < count; i++) {
        var offset = i * 16 * 4;
        var matrix = new Float32Array(values.buffer, offset, 16);
        result[i] = matrix;
    }
    return count === 1 ? result[0] : result;
};
xBinaryReader.prototype.readMatrix4x4_64 = function (count) {
    if (typeof (count) === "undefined") count = 1;
    var values = this.readFloat64(count * 16);
    var result = new Array(count);
    for (var i = 0; i < count; i++) {
        var offset = i * 16 * 8;
        var matrix = new Float64Array(values.buffer, offset, 16);
        result[i] = matrix;
    }
    return count === 1 ? result[0] : result;
};function xModelGeometry() {
    //all this data is to be fed into GPU as attributes
    this.normals = [];
    this.indices = [];
    this.products = [];
    this.transformations = [];
    this.styleIndices = [];
    this.states = []; //this is the only array we need to keep alive on client side to be able to change appearance of the model

    //these will be sent to GPU as the textures
    this.vertices = [];
    this.matrices = [];
    this.styles = [];

    this.meter = 1000;

    //this will be used to change appearance of the objects
    //map objects have a format: 
    //map = {
    //	productID: int,
    //	type: int,
    //	bBox: Float32Array(6),
    //	spans: [Int32Array([int, int]),Int32Array([int, int]), ...] //spanning indexes defining shapes of product and it's state
    //};

    this.productMap = {};
}

xModelGeometry.prototype.parse = function (binReader) {
    var br = binReader;
    var magicNumber = br.readInt32();
    if (magicNumber != 94132117) throw 'Magic number mismatch.';
    var version = br.readByte();
    var numShapes = br.readInt32();
    var numVertices = br.readInt32();
    var numTriangles = br.readInt32();
    var numMatrices = br.readInt32();;
    var numProducts = br.readInt32();;
    var numStyles = br.readInt32();;
    this.meter = br.readFloat32();;
    var numRegions = br.readInt16();



    //set size of arrays to be square usable for texture data
    //TODO: reflect support for floating point textures
    var square = function (arity, count) {
        if (typeof (arity) == 'undefined' || typeof (count) == 'undefined') {
            throw 'Wrong arguments';
        }
        if (count == 0) return 0;
        var byteLength = count * arity;
        var imgSide = Math.ceil(Math.sqrt(byteLength / 4));
        //clamp to parity
        while ((imgSide * 4) % arity != 0) {
            imgSide++
        }
        var result = imgSide * imgSide * 4 / arity;
        return result;
    };

    //create target buffers of correct size (avoid reallocation of memory)
    this.vertices = new Float32Array(square(4, numVertices * 3));
    this.normals = new Uint8Array(numTriangles * 6);
    this.indices = new Float32Array(numTriangles * 3);
    this.styleIndices = new Uint16Array(numTriangles * 3);
    this.styles = new Uint8Array(square(1, (numStyles + 1) * 4)); //+1 is for a default style
    this.products = new Float32Array(numTriangles * 3);
    this.states = new Uint8Array(numTriangles * 3 * 2); //place for state and restyling
    this.transformations = new Float32Array(numTriangles * 3);
    this.matrices = new Float32Array(square(4, numMatrices * 16));
    this.productMap = {};
    this.regions = new Array(numRegions);

    var iVertex = 0;
    var iIndexForward = 0;
    var iIndexBackward = numTriangles * 3;
    var iTransform = 0;
    var iMatrix = 0;

    var stateEnum = xState;
    var typeEnum = xProductType;


    for (var i = 0; i < numRegions; i++) {
        this.regions[i] = {
            population: br.readInt32(),
            centre: br.readFloat32(3),
            bbox: br.readFloat32(6)
        }
    }


    var styleMap = [];
    styleMap.getStyle = function(id) {
        for (var i = 0; i < this.length; i++) {
            var item = this[i];
            if (item.id == id) return item;
        }
        return null;
    };
    var iStyle = 0;
    for (iStyle; iStyle < numStyles; iStyle++) {
        var styleId = br.readInt32();
        var R = br.readFloat32() * 255;
        var G = br.readFloat32() * 255;
        var B = br.readFloat32() * 255;
        var A = br.readFloat32() * 255;
        this.styles.set([R, G, B, A], iStyle * 4);
        styleMap.push({ id: styleId, index: iStyle, transparent: A < 254 });
    }
    this.styles.set([255, 255, 255, 255], iStyle * 4);
    var defaultStyle = { id: -1, index: iStyle, transparent: A < 254 }
    styleMap.push(defaultStyle);

    for (var i = 0; i < numProducts ; i++) {
        var productLabel = br.readInt32();
        var prodType = br.readInt16();
        var bBox = br.readFloat32(6);

        var map = {
            productID: productLabel,
            type: prodType,
            bBox: bBox,
            spans: []
        };
        this.productMap[productLabel] = map;
    }

    for (var iShape = 0; iShape < numShapes; iShape++) {

        var repetition = br.readInt32();
        var shapeList = [];
        for (var iProduct = 0; iProduct < repetition; iProduct++) {
            var prodLabel = br.readInt32();
            var instanceTypeId = br.readInt16();
            var instanceLabel = br.readInt32();
            var styleId = br.readInt32();
            var transformation = null;

            if (repetition > 1) {
                transformation = version === 1 ? br.readFloat32(16) : br.readFloat64(16);
                this.matrices.set(transformation, iMatrix);
                iMatrix += 16;
            }

            var styleItem = styleMap.getStyle(styleId);
            if (styleItem === null)
                styleItem = defaultStyle;

            shapeList.push({
                pLabel: prodLabel,
                iLabel: instanceLabel,
                style: styleItem.index,
                transparent: styleItem.transparent,
                transform: transformation != null ? iTransform++ : 0xFFFF
            });
        }

        //read shape geometry
        var shapeGeom = new xTriangulatedShape();
        shapeGeom.parse(br);


        //copy shape data into inner array and set to null so it can be garbage collected
        shapeList.forEach(function (shape) {
            var iIndex = 0;
            //set iIndex according to transparency either from beginning or at the end
            if (shape.transparent) {
                iIndex = iIndexBackward - shapeGeom.indices.length;
            }
            else {
                iIndex = iIndexForward;
            }

            var begin = iIndex;
            var map = this.productMap[shape.pLabel];
            if (typeof (map) === "undefined") {
                //throw "Product hasn't been defined before.";
                map = {
                    productID: 0,
                    type: typeEnum.IFCOPENINGELEMENT,
                    bBox: new Float32Array(6),
                    spans: []
                };
                this.productMap[shape.pLabel] = map;
            }

            this.normals.set(shapeGeom.normals, iIndex * 2);

            //switch spaces and openings off by default 
            var state = map.type == typeEnum.IFCSPACE || map.type == typeEnum.IFCOPENINGELEMENT ?
                stateEnum.HIDDEN :
                0xFF; //0xFF is for the default state

            //fix indices to right absolute position. It is relative to the shape.
            for (var i = 0; i < shapeGeom.indices.length; i++) {
                this.indices[iIndex] = shapeGeom.indices[i] + iVertex / 3;
                this.products[iIndex] = shape.pLabel;
                this.styleIndices[iIndex] = shape.style;
                this.transformations[iIndex] = shape.transform;
                this.states[2 * iIndex] = state; //set state
                this.states[2 * iIndex + 1] = 0xFF; //default style

                iIndex++;
            }

            var end = iIndex;
            map.spans.push(new Int32Array([begin, end]));

            if (shape.transparent) iIndexBackward -= shapeGeom.indices.length;
            else iIndexForward += shapeGeom.indices.length;
        }, this);

        //copy geometry and keep track of amount so that we can fix indices to right position
        //this must be the last step to have correct iVertex number above
        this.vertices.set(shapeGeom.vertices, iVertex);
        iVertex += shapeGeom.vertices.length;
        shapeGeom = null;
    }

    //binary reader should be at the end by now
    if (!br.getIsEOF()) {
        //throw 'Binary reader is not at the end of the file.';
    }

    this.transparentIndex = iIndexForward;
};

//Source has to be either URL of wexBIM file or Blob representing wexBIM file
xModelGeometry.prototype.load = function (source) {
    //binary reading
    var br = new xBinaryReader();
    var self = this;
    br.onloaded = function () {
        self.parse(br);
        if (self.onloaded) {
            self.onloaded();
        }
    };
    br.onerror = function (msg) {
        if (self.onerror) self.onerror(msg);
    };
    br.load(source);
};

xModelGeometry.prototype.onloaded = function () { };
xModelGeometry.prototype.onerror = function () { };//this class holds pointers to textures, uniforms and data buffers which 
//make up a model in GPU

//gl: WebGL context
//model: xModelGeometry
//fpt: bool (floating point texture support)
function xModelHandle(gl, model, fpt) {
    if (typeof (gl) == 'undefined' || typeof (model) == 'undefined' || typeof (fpt) == 'undefined') {
        throw 'WebGL context and geometry model must be specified';
    }

    this._gl = gl;
    this._model = model;
    this._fpt = fpt;

    /**
     * unique ID which can be used to identify this handle 
     */
    this.id = xModelHandle._instancesNum++;

    /**
     * indicates if this model should be used in a rendering loop or not.
     */
    this.stopped = false;

    this.count = model.indices.length;

    //data structure 
    this.vertexTexture = gl.createTexture();
    this.matrixTexture = gl.createTexture();
    this.styleTexture = gl.createTexture();
    this.stateStyleTexture = gl.createTexture();

    this.vertexTextureSize = 0;
    this.matrixTextureSize = 0;
    this.styleTextureSize = 0;

    this.normalBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    this.productBuffer = gl.createBuffer();
    this.styleBuffer = gl.createBuffer();
    this.stateBuffer = gl.createBuffer();
    this.transformationBuffer = gl.createBuffer();

    //small texture which can be used to overwrite appearance of the products
    this.stateStyle = new Uint8Array(15 * 15 * 4);
    this._feedCompleted = false;

    this.region = model.regions[0];
    //set the most populated region
    model.regions.forEach(function (region) {
        if (region.population > this.region.population) {
            this.region = region;
        }
    }, this);
    //set default region if no region is defined. This shouldn't ever happen if model contains any geometry.
    if (typeof (this.region) == 'undefined') {
        this.region = {
            population: 1,
            centre: [0.0, 0.0, 0.0],
            bbox: [0.0, 0.0, 0.0, 10 * model.meter, 10 * model.meter, 10 * model.meter]
        }
    }
}

/**
 * Static counter to keep unique ID of the model handles
 */
xModelHandle._instancesNum = 0;

//this function sets this model as an active one
//it needs an argument 'pointers' which contains pointers to
//shader attributes and uniforms which are to be set.
//pointers = {
//	normalAttrPointer: null,
//	indexlAttrPointer: null,
//	productAttrPointer: null,
//	stateAttrPointer: null,
//	styleAttrPointer: null,
//	transformationAttrPointer: null,
//
//	matrixSamplerUniform: null,
//	vertexSamplerUniform: null,
//	styleSamplerUniform: null,
//	stateStyleSamplerUniform: null,
//	
//	vertexTextureSizeUniform: null,
//	matrixTextureSizeUniform: null,
//	styleTextureSizeUniform: null,
//};
xModelHandle.prototype.setActive = function (pointers) {
    if (this.stopped) return;

    var gl = this._gl;
    //set predefined textures
    if (this.vertexTextureSize > 0) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.vertexTexture);
    }

    if (this.matrixTextureSize > 0) {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.matrixTexture);
    }

    if (this.styleTextureSize > 0) {
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.styleTexture);
    }

    //this texture has constant size
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, this.stateStyleTexture);


    //set attributes and uniforms
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(pointers.normalAttrPointer, 2, gl.UNSIGNED_BYTE, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.indexBuffer);
    gl.vertexAttribPointer(pointers.indexlAttrPointer, 1, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.productBuffer);
    gl.vertexAttribPointer(pointers.productAttrPointer, 1, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.stateBuffer);
    gl.vertexAttribPointer(pointers.stateAttrPointer, 2, gl.UNSIGNED_BYTE, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.styleBuffer);
    gl.vertexAttribPointer(pointers.styleAttrPointer, 1, gl.UNSIGNED_SHORT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.transformationBuffer);
    gl.vertexAttribPointer(pointers.transformationAttrPointer, 1, gl.FLOAT, false, 0, 0);

    gl.uniform1i(pointers.vertexSamplerUniform, 1);
    gl.uniform1i(pointers.matrixSamplerUniform, 2);
    gl.uniform1i(pointers.styleSamplerUniform, 3);
    gl.uniform1i(pointers.stateStyleSamplerUniform, 4);
    gl.uniform1i(pointers.vertexTextureSizeUniform, this.vertexTextureSize);
    gl.uniform1i(pointers.matrixTextureSizeUniform, this.matrixTextureSize);
    gl.uniform1i(pointers.styleTextureSizeUniform, this.styleTextureSize);
};

//this function must be called AFTER 'setActive()' function which sets up active buffers and uniforms
xModelHandle.prototype.draw = function (mode) {
    if (this.stopped) return;

    var gl = this._gl;

    if (typeof (mode) === "undefined") {
        //draw image frame
        gl.drawArrays(gl.TRIANGLES, 0, this.count);
        return;
    }

    if (mode === "solid") {
        gl.drawArrays(gl.TRIANGLES, 0, this._model.transparentIndex);
        return;
    }

    if (mode === "transparent") {
        gl.drawArrays(gl.TRIANGLES, this._model.transparentIndex, this.count - this._model.transparentIndex);
        return;
    }
    
};



xModelHandle.prototype.drawProduct = function (ID) {
    if (this.stopped) return;

    var gl = this._gl;
    var map = this.getProductMap(ID);

    //var i = 3; //3 is for a glass panel
    //gl.drawArrays(gl.TRIANGLES, map.spans[i][0], map.spans[i][1] - map.spans[i][0]);

    if (map != null) {
        map.spans.forEach(function (span) {
            gl.drawArrays(gl.TRIANGLES, span[0], span[1] - span[0]);
        }, this);
    }
};

xModelHandle.prototype.getProductMap = function (ID) {
    var map = this._model.productMap[ID];
    if (typeof (map) !== "undefined") return map;
    return null;
};

xModelHandle.prototype.unload = function () {
    var gl = this._gl;

    gl.deleteTexture(this.vertexTexture);
    gl.deleteTexture(this.matrixTexture);
    gl.deleteTexture(this.styleTexture);
    gl.deleteTexture(this.stateStyleTexture);

    gl.deleteBuffer(this.normalBuffer);
    gl.deleteBuffer(this.indexBuffer);
    gl.deleteBuffer(this.productBuffer);
    gl.deleteBuffer(this.styleBuffer);
    gl.deleteBuffer(this.stateBuffer);
    gl.deleteBuffer(this.transformationBuffer);
};

xModelHandle.prototype.feedGPU = function () {
    if (this._feedCompleted) {
        throw 'GPU can bee fed only once. It discards unnecessary data which cannot be restored again.';
    }

    var gl = this._gl;
    var model = this._model;

    //fill all buffers
    this._bufferData(this.normalBuffer, model.normals);
    this._bufferData(this.indexBuffer, model.indices);
    this._bufferData(this.productBuffer, model.products);
    this._bufferData(this.stateBuffer, model.states);
    this._bufferData(this.transformationBuffer, model.transformations);
    this._bufferData(this.styleBuffer, model.styleIndices);

    //fill in all textures
    this.vertexTextureSize = this._bufferTexture(this.vertexTexture, model.vertices, 3);
    this.matrixTextureSize = this._bufferTexture(this.matrixTexture, model.matrices, 4);
    this.styleTextureSize = this._bufferTexture(this.styleTexture, model.styles);
    //this has a constant size 15 which is defined in vertex shader
    this._bufferTexture(this.stateStyleTexture, this.stateStyle);

    //Forget everything except for states and styles (this should save some RAM).
    //data is already loaded to GPU by now
    model.normals = null;
    model.indices = null;
    model.products = null;
    model.transformations = null;
    model.styleIndices = null;

    model.vertices = null;
    model.matrices = null;

    this._feedCompleted = true;
};

xModelHandle.prototype.refreshStyles = function () {
    this._bufferTexture(this.stateStyleTexture, this.stateStyle);
};

xModelHandle.prototype._bufferData = function (pointer, data) {
    var gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, pointer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
};

xModelHandle.prototype._bufferTexture = function (pointer, data, arity) {
    var gl = this._gl;
    if (data.length == 0) return 0;

    //detect floating point texture support and data type
    var fp = this._fpt && data instanceof Float32Array;

    //compute size of the image (length should be correct already)
    var size = 0;
    var maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (fp) {
        //recompute to smaller size, but make it +1 to make sure it is all right
        size = Math.ceil(Math.sqrt(Math.ceil(data.length / arity))) + 1;
    }
    else {
        var dim = Math.sqrt(data.byteLength / 4);
        size = Math.ceil(dim);
    }

    if (size == 0) return 0;
    if (size > maxSize) throw 'Too much data! It cannot fit into the texture.';

    gl.bindTexture(gl.TEXTURE_2D, pointer);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); //this is our convention
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);  //this should preserve values of alpha
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, 0);  //this should preserve values of colours

    if (fp) {
        //create new data buffer and fill it in with data
        var image = null;
        if (size * size * arity != data.length) {
            image = new Float32Array(size * size * arity);
            image.set(data);
        }
        else {
            image = data;
        }
        var type = null;
        switch (arity) {
            case 1: type = gl.ALPHA; break;
            case 3: type = gl.RGB; break;
            case 4: type = gl.RGBA; break;
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, type, size, size, 0, type, gl.FLOAT, image);
    }
    else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data.buffer));
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).

    return size;
};

xModelHandle.prototype.getState = function (id) {
    if (typeof (id) === "undefined") throw "id must be defined";
    var map = this.getProductMap(id);
    if (map === null) return null;

    var span = map.spans[0];
    if (typeof (span) == "undefined") return null;

    return this._model.states[span[0] * 2];
}

xModelHandle.prototype.getStyle = function (id) {
    if (typeof (id) === "undefined") throw "id must be defined";
    var map = this.getProductMap(id);
    if (map === null) return null;

    var span = map.spans[0];
    if (typeof (span) == "undefined") return null;

    return this._model.states[span[0] * 2 + 1];
}

xModelHandle.prototype.setState = function (state, args) {
    if (typeof (state) != 'number' && state < 0 && state > 255) throw 'You have to specify state as an ID of state or index in style pallete.';
    if (typeof (args) == 'undefined') throw 'You have to specify products as an array of product IDs or as a product type ID';

    var maps = [];
    //it is type
    if (typeof (args) == 'number') {
        for (var n in this._model.productMap) {
            var map = this._model.productMap[n];
            if (map.type == args) maps.push(map);
        }
    }
        //it is a list of IDs
    else {
        for (var l = 0; l < args.length; l++) {
            var id = args[l];
            var map = this.getProductMap(id);
            if (map != null) maps.push(map);
        }
    }

    //shift +1 if it is an overlay colour style or 0 if it is a state.
    var shift = state <= 225 ? 1 : 0;
    maps.forEach(function (map) {
        map.spans.forEach(function (span) {
            //set state or style
            for (var k = span[0]; k < span[1]; k++) {
                this._model.states[k * 2 + shift] = state;
            }
        }, this);
    }, this);

    //buffer data to GPU
    this._bufferData(this.stateBuffer, this._model.states);
};

xModelHandle.prototype.resetStates = function () {
    for (var i = 0; i < this._model.states.length; i += 2) {
        this._model.states[i] = xState.UNDEFINED;
    }
    //buffer data to GPU
    this._bufferData(this.stateBuffer, this._model.states);
};

xModelHandle.prototype.resetStyles = function () {
    for (var i = 0; i < this._model.states.length; i += 2) {
        this._model.states[i + 1] = xState.UNSTYLED;
    }
    //buffer data to GPU
    this._bufferData(this.stateBuffer, this._model.states);
};

xModelHandle.prototype.getModelState = function() {
    var result = [];
    var products = this._model.productMap; 
    for (var i in products) {
        if (!products.hasOwnProperty(i)) {
            continue;
        }
        var map = products[i];
        var span = map.spans[0];
        if (typeof (span) == "undefined") continue;

        var state = this._model.states[span[0] * 2];
        var style = this._model.states[span[0] * 2 + 1];

        result.push([map.productID, state + (style << 8)]);
    }
    return result;  
};

xModelHandle.prototype.restoreModelState = function (state) {
    state.forEach(function (s) {
        var id = s[0];
        var style = s[1] >> 8;
        var state = s[1] - (style << 8);

        var map = this.getProductMap(id);
        if (map != null) {
            map.spans.forEach(function (span) {
                //set state or style
                for (var k = span[0]; k < span[1]; k++) {
                    this._model.states[k * 2] = state;
                    this._model.states[k * 2 + 1] = style;
                }
            }, this);
        }

    }, this);

    //buffer data to GPU
    this._bufferData(this.stateBuffer, this._model.states);
};
var xProductInheritance = { name: "IfcProduct", id: 20, abs: true, children: [{ name: "IfcElement", id: 19, abs: true, children: [{ name: "IfcDistributionElement", id: 44, abs: false, children: [{ name: "IfcDistributionFlowElement", id: 45, abs: false, children: [{ name: "IfcDistributionChamberElement", id: 180, abs: false }, { name: "IfcEnergyConversionDevice", id: 175, abs: false, children: [{ name: "IfcAirToAirHeatRecovery", id: 1097, abs: false }, { name: "IfcBoiler", id: 1105, abs: false }, { name: "IfcBurner", id: 1109, abs: false }, { name: "IfcChiller", id: 1119, abs: false }, { name: "IfcCoil", id: 1124, abs: false }, { name: "IfcCondenser", id: 1132, abs: false }, { name: "IfcCooledBeam", id: 1141, abs: false }, { name: "IfcCoolingTower", id: 1142, abs: false }, { name: "IfcEngine", id: 1164, abs: false }, { name: "IfcEvaporativeCooler", id: 1166, abs: false }, { name: "IfcEvaporator", id: 1167, abs: false }, { name: "IfcHeatExchanger", id: 1187, abs: false }, { name: "IfcHumidifier", id: 1188, abs: false }, { name: "IfcTubeBundle", id: 1305, abs: false }, { name: "IfcUnitaryEquipment", id: 1310, abs: false }, { name: "IfcElectricGenerator", id: 1160, abs: false }, { name: "IfcElectricMotor", id: 1161, abs: false }, { name: "IfcMotorConnection", id: 1216, abs: false }, { name: "IfcSolarDevice", id: 1270, abs: false }, { name: "IfcTransformer", id: 1303, abs: false }] }, { name: "IfcFlowController", id: 121, abs: false, children: [{ name: "IfcElectricDistributionPoint", id: 242, abs: false }, { name: "IfcAirTerminalBox", id: 1096, abs: false }, { name: "IfcDamper", id: 1148, abs: false }, { name: "IfcFlowMeter", id: 1182, abs: false }, { name: "IfcValve", id: 1311, abs: false }, { name: "IfcElectricDistributionBoard", id: 1157, abs: false }, { name: "IfcElectricTimeControl", id: 1162, abs: false }, { name: "IfcProtectiveDevice", id: 1235, abs: false }, { name: "IfcSwitchingDevice", id: 1290, abs: false }] }, { name: "IfcFlowFitting", id: 467, abs: false, children: [{ name: "IfcDuctFitting", id: 1153, abs: false }, { name: "IfcPipeFitting", id: 1222, abs: false }, { name: "IfcCableCarrierFitting", id: 1111, abs: false }, { name: "IfcCableFitting", id: 1113, abs: false }, { name: "IfcJunctionBox", id: 1195, abs: false }] }, { name: "IfcFlowMovingDevice", id: 502, abs: false, children: [{ name: "IfcCompressor", id: 1131, abs: false }, { name: "IfcFan", id: 1177, abs: false }, { name: "IfcPump", id: 1238, abs: false }] }, { name: "IfcFlowSegment", id: 574, abs: false, children: [{ name: "IfcDuctSegment", id: 1154, abs: false }, { name: "IfcPipeSegment", id: 1223, abs: false }, { name: "IfcCableCarrierSegment", id: 1112, abs: false }, { name: "IfcCableSegment", id: 1115, abs: false }] }, { name: "IfcFlowStorageDevice", id: 371, abs: false, children: [{ name: "IfcTank", id: 1293, abs: false }, { name: "IfcElectricFlowStorageDevice", id: 1159, abs: false }] }, { name: "IfcFlowTerminal", id: 46, abs: false, children: [{ name: "IfcFireSuppressionTerminal", id: 1179, abs: false }, { name: "IfcSanitaryTerminal", id: 1262, abs: false }, { name: "IfcStackTerminal", id: 1277, abs: false }, { name: "IfcWasteTerminal", id: 1315, abs: false }, { name: "IfcAirTerminal", id: 1095, abs: false }, { name: "IfcMedicalDevice", id: 1212, abs: false }, { name: "IfcSpaceHeater", id: 1272, abs: false }, { name: "IfcAudioVisualAppliance", id: 1099, abs: false }, { name: "IfcCommunicationsAppliance", id: 1127, abs: false }, { name: "IfcElectricAppliance", id: 1156, abs: false }, { name: "IfcLamp", id: 1198, abs: false }, { name: "IfcLightFixture", id: 1199, abs: false }, { name: "IfcOutlet", id: 1219, abs: false }] }, { name: "IfcFlowTreatmentDevice", id: 425, abs: false, children: [{ name: "IfcInterceptor", id: 1193, abs: false }, { name: "IfcDuctSilencer", id: 1155, abs: false }, { name: "IfcFilter", id: 1178, abs: false }] }] }, { name: "IfcDistributionControlElement", id: 468, abs: false, children: [{ name: "IfcProtectiveDeviceTrippingUnit", id: 1236, abs: false }, { name: "IfcActuator", id: 1091, abs: false }, { name: "IfcAlarm", id: 1098, abs: false }, { name: "IfcController", id: 1139, abs: false }, { name: "IfcFlowInstrument", id: 1181, abs: false }, { name: "IfcSensor", id: 1264, abs: false }, { name: "IfcUnitaryControlElement", id: 1308, abs: false }] }] }, { name: "IfcElementComponent", id: 424, abs: true, children: [{ name: "IfcDiscreteAccessory", id: 423, abs: false }, { name: "IfcFastener", id: 535, abs: false, children: [{ name: "IfcMechanicalFastener", id: 536, abs: false }] }, { name: "IfcReinforcingElement", id: 262, abs: true, children: [{ name: "IfcReinforcingBar", id: 571, abs: false }, { name: "IfcReinforcingMesh", id: 531, abs: false }, { name: "IfcTendon", id: 261, abs: false }, { name: "IfcTendonAnchor", id: 675, abs: false }] }, { name: "IfcBuildingElementPart", id: 220, abs: false }, { name: "IfcMechanicalFastener", id: 536, abs: false }, { name: "IfcVibrationIsolator", id: 1312, abs: false }] }, { name: "IfcFeatureElement", id: 386, abs: true, children: [{ name: "IfcFeatureElementSubtraction", id: 499, abs: true, children: [{ name: "IfcEdgeFeature", id: 764, abs: true, children: [{ name: "IfcChamferEdgeFeature", id: 765, abs: false }, { name: "IfcRoundedEdgeFeature", id: 766, abs: false }] }, { name: "IfcOpeningElement", id: 498, abs: false, children: [{ name: "IfcOpeningStandardCase", id: 1217, abs: false }] }, { name: "IfcVoidingFeature", id: 1313, abs: false }] }, { name: "IfcFeatureElementAddition", id: 385, abs: true, children: [{ name: "IfcProjectionElement", id: 384, abs: false }] }, { name: "IfcSurfaceFeature", id: 1287, abs: false }] }, { name: "IfcBuildingElement", id: 26, abs: true, children: [{ name: "IfcBuildingElementComponent", id: 221, abs: true, children: [{ name: "IfcBuildingElementPart", id: 220, abs: false }, { name: "IfcReinforcingElement", id: 262, abs: true, children: [{ name: "IfcReinforcingBar", id: 571, abs: false }, { name: "IfcReinforcingMesh", id: 531, abs: false }, { name: "IfcTendon", id: 261, abs: false }, { name: "IfcTendonAnchor", id: 675, abs: false }] }] }, { name: "IfcFooting", id: 120, abs: false }, { name: "IfcPile", id: 572, abs: false }, { name: "IfcBeam", id: 171, abs: false, children: [{ name: "IfcBeamStandardCase", id: 1104, abs: false }] }, { name: "IfcColumn", id: 383, abs: false, children: [{ name: "IfcColumnStandardCase", id: 1126, abs: false }] }, { name: "IfcCurtainWall", id: 456, abs: false }, { name: "IfcDoor", id: 213, abs: false, children: [{ name: "IfcDoorStandardCase", id: 1151, abs: false }] }, { name: "IfcMember", id: 310, abs: false, children: [{ name: "IfcMemberStandardCase", id: 1214, abs: false }] }, { name: "IfcPlate", id: 351, abs: false, children: [{ name: "IfcPlateStandardCase", id: 1224, abs: false }] }, { name: "IfcRailing", id: 350, abs: false }, { name: "IfcRamp", id: 414, abs: false }, { name: "IfcRampFlight", id: 348, abs: false }, { name: "IfcRoof", id: 347, abs: false }, { name: "IfcSlab", id: 99, abs: false, children: [{ name: "IfcSlabElementedCase", id: 1268, abs: false }, { name: "IfcSlabStandardCase", id: 1269, abs: false }] }, { name: "IfcStair", id: 346, abs: false }, { name: "IfcStairFlight", id: 25, abs: false }, { name: "IfcWall", id: 452, abs: false, children: [{ name: "IfcWallStandardCase", id: 453, abs: false }, { name: "IfcWallElementedCase", id: 1314, abs: false }] }, { name: "IfcWindow", id: 667, abs: false, children: [{ name: "IfcWindowStandardCase", id: 1316, abs: false }] }, { name: "IfcBuildingElementProxy", id: 560, abs: false }, { name: "IfcCovering", id: 382, abs: false }, { name: "IfcChimney", id: 1120, abs: false }, { name: "IfcShadingDevice", id: 1265, abs: false }] }, { name: "IfcElementAssembly", id: 18, abs: false }, { name: "IfcFurnishingElement", id: 253, abs: false, children: [{ name: "IfcFurniture", id: 1184, abs: false }, { name: "IfcSystemFurnitureElement", id: 1291, abs: false }] }, { name: "IfcTransportElement", id: 416, abs: false }, { name: "IfcVirtualElement", id: 168, abs: false }, { name: "IfcElectricalElement", id: 23, abs: false }, { name: "IfcEquipmentElement", id: 212, abs: false }, { name: "IfcCivilElement", id: 1122, abs: false }, { name: "IfcGeographicElement", id: 1185, abs: false }] }, { name: "IfcPort", id: 179, abs: true, children: [{ name: "IfcDistributionPort", id: 178, abs: false }] }, { name: "IfcProxy", id: 447, abs: false }, { name: "IfcStructuralActivity", id: 41, abs: true, children: [{ name: "IfcStructuralAction", id: 40, abs: true, children: [{ name: "IfcStructuralLinearAction", id: 463, abs: false, children: [{ name: "IfcStructuralLinearActionVarying", id: 464, abs: false }] }, { name: "IfcStructuralPlanarAction", id: 39, abs: false, children: [{ name: "IfcStructuralPlanarActionVarying", id: 357, abs: false }] }, { name: "IfcStructuralPointAction", id: 356, abs: false }, { name: "IfcStructuralCurveAction", id: 1279, abs: false, children: [{ name: "IfcStructuralLinearAction", id: 463, abs: false }] }, { name: "IfcStructuralSurfaceAction", id: 1284, abs: false, children: [{ name: "IfcStructuralPlanarAction", id: 39, abs: false }] }] }, { name: "IfcStructuralReaction", id: 355, abs: true, children: [{ name: "IfcStructuralPointReaction", id: 354, abs: false }, { name: "IfcStructuralCurveReaction", id: 1280, abs: false }, { name: "IfcStructuralSurfaceReaction", id: 1285, abs: false }] }] }, { name: "IfcStructuralItem", id: 226, abs: true, children: [{ name: "IfcStructuralConnection", id: 265, abs: true, children: [{ name: "IfcStructuralCurveConnection", id: 534, abs: false }, { name: "IfcStructuralPointConnection", id: 533, abs: false }, { name: "IfcStructuralSurfaceConnection", id: 264, abs: false }] }, { name: "IfcStructuralMember", id: 225, abs: true, children: [{ name: "IfcStructuralCurveMember", id: 224, abs: false, children: [{ name: "IfcStructuralCurveMemberVarying", id: 227, abs: false }] }, { name: "IfcStructuralSurfaceMember", id: 420, abs: false, children: [{ name: "IfcStructuralSurfaceMemberVarying", id: 421, abs: false }] }] }] }, { name: "IfcAnnotation", id: 634, abs: false }, { name: "IfcSpatialStructureElement", id: 170, abs: true, children: [{ name: "IfcBuilding", id: 169, abs: false }, { name: "IfcBuildingStorey", id: 459, abs: false }, { name: "IfcSite", id: 349, abs: false }, { name: "IfcSpace", id: 454, abs: false }] }, { name: "IfcGrid", id: 564, abs: false }, { name: "IfcSpatialElement", id: 1273, abs: true, children: [{ name: "IfcSpatialStructureElement", id: 170, abs: true, children: [{ name: "IfcBuilding", id: 169, abs: false }, { name: "IfcBuildingStorey", id: 459, abs: false }, { name: "IfcSite", id: 349, abs: false }, { name: "IfcSpace", id: 454, abs: false }] }, { name: "IfcExternalSpatialStructureElement", id: 1175, abs: true, children: [{ name: "IfcExternalSpatialElement", id: 1174, abs: false }] }, { name: "IfcSpatialZone", id: 1275, abs: false }] }] };
/**
* Enumeration of product types.
* @readonly
* @enum {number}
*/
var xProductType = {

    IFCDISTRIBUTIONELEMENT: 44,
    IFCDISTRIBUTIONFLOWELEMENT: 45,
    IFCDISTRIBUTIONCHAMBERELEMENT: 180,
    IFCENERGYCONVERSIONDEVICE: 175,
    IFCAIRTOAIRHEATRECOVERY: 1097,
    IFCBOILER: 1105,
    IFCBURNER: 1109,
    IFCCHILLER: 1119,
    IFCCOIL: 1124,
    IFCCONDENSER: 1132,
    IFCCOOLEDBEAM: 1141,
    IFCCOOLINGTOWER: 1142,
    IFCENGINE: 1164,
    IFCEVAPORATIVECOOLER: 1166,
    IFCEVAPORATOR: 1167,
    IFCHEATEXCHANGER: 1187,
    IFCHUMIDIFIER: 1188,
    IFCTUBEBUNDLE: 1305,
    IFCUNITARYEQUIPMENT: 1310,
    IFCELECTRICGENERATOR: 1160,
    IFCELECTRICMOTOR: 1161,
    IFCMOTORCONNECTION: 1216,
    IFCSOLARDEVICE: 1270,
    IFCTRANSFORMER: 1303,
    IFCFLOWCONTROLLER: 121,
    IFCELECTRICDISTRIBUTIONPOINT: 242,
    IFCAIRTERMINALBOX: 1096,
    IFCDAMPER: 1148,
    IFCFLOWMETER: 1182,
    IFCVALVE: 1311,
    IFCELECTRICDISTRIBUTIONBOARD: 1157,
    IFCELECTRICTIMECONTROL: 1162,
    IFCPROTECTIVEDEVICE: 1235,
    IFCSWITCHINGDEVICE: 1290,
    IFCFLOWFITTING: 467,
    IFCDUCTFITTING: 1153,
    IFCPIPEFITTING: 1222,
    IFCCABLECARRIERFITTING: 1111,
    IFCCABLEFITTING: 1113,
    IFCJUNCTIONBOX: 1195,
    IFCFLOWMOVINGDEVICE: 502,
    IFCCOMPRESSOR: 1131,
    IFCFAN: 1177,
    IFCPUMP: 1238,
    IFCFLOWSEGMENT: 574,
    IFCDUCTSEGMENT: 1154,
    IFCPIPESEGMENT: 1223,
    IFCCABLECARRIERSEGMENT: 1112,
    IFCCABLESEGMENT: 1115,
    IFCFLOWSTORAGEDEVICE: 371,
    IFCTANK: 1293,
    IFCELECTRICFLOWSTORAGEDEVICE: 1159,
    IFCFLOWTERMINAL: 46,
    IFCFIRESUPPRESSIONTERMINAL: 1179,
    IFCSANITARYTERMINAL: 1262,
    IFCSTACKTERMINAL: 1277,
    IFCWASTETERMINAL: 1315,
    IFCAIRTERMINAL: 1095,
    IFCMEDICALDEVICE: 1212,
    IFCSPACEHEATER: 1272,
    IFCAUDIOVISUALAPPLIANCE: 1099,
    IFCCOMMUNICATIONSAPPLIANCE: 1127,
    IFCELECTRICAPPLIANCE: 1156,
    IFCLAMP: 1198,
    IFCLIGHTFIXTURE: 1199,
    IFCOUTLET: 1219,
    IFCFLOWTREATMENTDEVICE: 425,
    IFCINTERCEPTOR: 1193,
    IFCDUCTSILENCER: 1155,
    IFCFILTER: 1178,
    IFCDISTRIBUTIONCONTROLELEMENT: 468,
    IFCPROTECTIVEDEVICETRIPPINGUNIT: 1236,
    IFCACTUATOR: 1091,
    IFCALARM: 1098,
    IFCCONTROLLER: 1139,
    IFCFLOWINSTRUMENT: 1181,
    IFCSENSOR: 1264,
    IFCUNITARYCONTROLELEMENT: 1308,
    IFCDISCRETEACCESSORY: 423,
    IFCFASTENER: 535,
    IFCMECHANICALFASTENER: 536,
    IFCREINFORCINGBAR: 571,
    IFCREINFORCINGMESH: 531,
    IFCTENDON: 261,
    IFCTENDONANCHOR: 675,
    IFCBUILDINGELEMENTPART: 220,
    IFCMECHANICALFASTENER: 536,
    IFCVIBRATIONISOLATOR: 1312,
    IFCCHAMFEREDGEFEATURE: 765,
    IFCROUNDEDEDGEFEATURE: 766,
    IFCOPENINGELEMENT: 498,
    IFCOPENINGSTANDARDCASE: 1217,
    IFCVOIDINGFEATURE: 1313,
    IFCPROJECTIONELEMENT: 384,
    IFCSURFACEFEATURE: 1287,
    IFCBUILDINGELEMENTPART: 220,
    IFCREINFORCINGBAR: 571,
    IFCREINFORCINGMESH: 531,
    IFCTENDON: 261,
    IFCTENDONANCHOR: 675,
    IFCFOOTING: 120,
    IFCPILE: 572,
    IFCBEAM: 171,
    IFCBEAMSTANDARDCASE: 1104,
    IFCCOLUMN: 383,
    IFCCOLUMNSTANDARDCASE: 1126,
    IFCCURTAINWALL: 456,
    IFCDOOR: 213,
    IFCDOORSTANDARDCASE: 1151,
    IFCMEMBER: 310,
    IFCMEMBERSTANDARDCASE: 1214,
    IFCPLATE: 351,
    IFCPLATESTANDARDCASE: 1224,
    IFCRAILING: 350,
    IFCRAMP: 414,
    IFCRAMPFLIGHT: 348,
    IFCROOF: 347,
    IFCSLAB: 99,
    IFCSLABELEMENTEDCASE: 1268,
    IFCSLABSTANDARDCASE: 1269,
    IFCSTAIR: 346,
    IFCSTAIRFLIGHT: 25,
    IFCWALL: 452,
    IFCWALLSTANDARDCASE: 453,
    IFCWALLELEMENTEDCASE: 1314,
    IFCWINDOW: 667,
    IFCWINDOWSTANDARDCASE: 1316,
    IFCBUILDINGELEMENTPROXY: 560,
    IFCCOVERING: 382,
    IFCCHIMNEY: 1120,
    IFCSHADINGDEVICE: 1265,
    IFCELEMENTASSEMBLY: 18,
    IFCFURNISHINGELEMENT: 253,
    IFCFURNITURE: 1184,
    IFCSYSTEMFURNITUREELEMENT: 1291,
    IFCTRANSPORTELEMENT: 416,
    IFCVIRTUALELEMENT: 168,
    IFCELECTRICALELEMENT: 23,
    IFCEQUIPMENTELEMENT: 212,
    IFCCIVILELEMENT: 1122,
    IFCGEOGRAPHICELEMENT: 1185,
    IFCDISTRIBUTIONPORT: 178,
    IFCPROXY: 447,
    IFCSTRUCTURALLINEARACTION: 463,
    IFCSTRUCTURALLINEARACTIONVARYING: 464,
    IFCSTRUCTURALPLANARACTION: 39,
    IFCSTRUCTURALPLANARACTIONVARYING: 357,
    IFCSTRUCTURALPOINTACTION: 356,
    IFCSTRUCTURALCURVEACTION: 1279,
    IFCSTRUCTURALLINEARACTION: 463,
    IFCSTRUCTURALSURFACEACTION: 1284,
    IFCSTRUCTURALPLANARACTION: 39,
    IFCSTRUCTURALPOINTREACTION: 354,
    IFCSTRUCTURALCURVEREACTION: 1280,
    IFCSTRUCTURALSURFACEREACTION: 1285,
    IFCSTRUCTURALCURVECONNECTION: 534,
    IFCSTRUCTURALPOINTCONNECTION: 533,
    IFCSTRUCTURALSURFACECONNECTION: 264,
    IFCSTRUCTURALCURVEMEMBER: 224,
    IFCSTRUCTURALCURVEMEMBERVARYING: 227,
    IFCSTRUCTURALSURFACEMEMBER: 420,
    IFCSTRUCTURALSURFACEMEMBERVARYING: 421,
    IFCANNOTATION: 634,
    IFCBUILDING: 169,
    IFCBUILDINGSTOREY: 459,
    IFCSITE: 349,
    IFCSPACE: 454,
    IFCGRID: 564,
    IFCBUILDING: 169,
    IFCBUILDINGSTOREY: 459,
    IFCSITE: 349,
    IFCSPACE: 454,
    IFCEXTERNALSPATIALELEMENT: 1174,
    IFCSPATIALZONE: 1275
};
/*
* This file has been generated by spacker.exe utility. Do not change this file manualy as your changes
* will get lost when the file is regenerated. Original content is located in *.c files.
*/
if (!window.xShaders) window.xShaders = {}
xShaders.fragment_shader = " precision mediump float; uniform vec4 uClippingPlane; varying vec4 vFrontColor; varying vec4 vBackColor; varying vec3 vPosition; varying float vDiscard; void main(void) { if ( vDiscard > 0.001) discard; if (length(uClippingPlane) > 0.001) { vec4 p = uClippingPlane; vec3 x = vPosition; float distance = (dot(p.xyz, x) + p.w) / length(p.xyz); if (distance < 0.0){ discard; } } gl_FragColor = gl_FrontFacing ? vFrontColor : vBackColor; }";
xShaders.vertex_shader = " attribute highp float aVertexIndex; attribute highp float aTransformationIndex; attribute highp float aStyleIndex; attribute highp float aProduct; attribute highp vec2 aState; attribute highp vec2 aNormal; uniform mat4 uMVMatrix; uniform mat4 uPMatrix; uniform vec4 ulightA; uniform vec4 ulightB; uniform vec4 uHighlightColour; uniform float uMeter; uniform bool uColorCoding; uniform int uRenderingMode; uniform highp sampler2D uVertexSampler; uniform int uVertexTextureSize; uniform highp sampler2D uMatrixSampler; uniform int uMatrixTextureSize; uniform highp sampler2D uStyleSampler; uniform int uStyleTextureSize; uniform highp sampler2D uStateStyleSampler; varying vec4 vFrontColor; varying vec4 vBackColor; varying vec3 vPosition; varying float vDiscard; vec3 getNormal(){ float U = aNormal[0]; float V = aNormal[1]; float PI = 3.1415926535897932384626433832795; float lon = U / 252.0 * 2.0 * PI; float lat = V / 252.0 * PI; float x = sin(lon) * sin(lat); float z = cos(lon) * sin(lat); float y = cos(lat); return normalize(vec3(x, y, z)); } vec4 getIdColor(){ float product = floor(aProduct + 0.5); float B = floor (product/(256.0*256.0)); float G = floor((product  - B * 256.0*256.0)/256.0); float R = mod(product, 256.0); return vec4(R/255.0, G/255.0, B/255.0, 1.0); } vec2 getTextureCoordinates(int index, int size) { float x = float(index - (index / size) * size); float y = float(index / size); float pixelSize = 1.0 / float(size); return vec2((x + 0.5) * pixelSize, (y + 0.5) * pixelSize); } vec4 getColor(){ int restyle = int(floor(aState[1] + 0.5)); if (restyle > 224){ int index = int (floor(aStyleIndex + 0.5)); vec2 coords = getTextureCoordinates(index, uStyleTextureSize); return texture2D(uStyleSampler, coords); } vec2 coords = getTextureCoordinates(restyle, 15); return texture2D(uStateStyleSampler, coords); } vec3 getVertexPosition(){ int index = int (floor(aVertexIndex +0.5)); vec2 coords = getTextureCoordinates(index, uVertexTextureSize); vec3 point = vec3(texture2D(uVertexSampler, coords)); int tIndex = int(floor(aTransformationIndex + 0.5)); if (tIndex != 65535) { tIndex *=4; mat4 transform = mat4( texture2D(uMatrixSampler, getTextureCoordinates(tIndex, uMatrixTextureSize)), texture2D(uMatrixSampler, getTextureCoordinates(tIndex+1, uMatrixTextureSize)), texture2D(uMatrixSampler, getTextureCoordinates(tIndex+2, uMatrixTextureSize)), texture2D(uMatrixSampler, getTextureCoordinates(tIndex+3, uMatrixTextureSize)) ); return vec3(transform * vec4(point, 1.0)); } return point; } void main(void) { int state = int(floor(aState[0] + 0.5)); vDiscard = 0.0; if (state == 254) { vDiscard = 1.0; vFrontColor = vec4(0.0, 0.0, 0.0, 0.0); vBackColor = vec4(0.0, 0.0, 0.0, 0.0); vPosition = vec3(0.0, 0.0, 0.0); gl_Position = vec4(0.0, 0.0, 0.0, 1.0); return; } vec3 vertex = getVertexPosition(); vec3 normal = getNormal(); vec3 backNormal = normal * -1.0; if (uColorCoding){ vec4 idColor = getIdColor(); vFrontColor = idColor; vBackColor = idColor; } else{ float lightAIntensity = ulightA[3]; vec3 lightADirection = normalize(ulightA.xyz - vertex); float lightBIntensity = ulightB[3]; vec3 lightBDirection = normalize(ulightB.xyz - vertex); float lightWeightA = max(dot(normal, lightADirection ) * lightAIntensity, 0.0); float lightWeightB = max(dot(normal, lightBDirection ) * lightBIntensity, 0.0); float backLightWeightA = max(dot(backNormal, lightADirection) * lightAIntensity, 0.0); float backLightWeightB = max(dot(backNormal, lightBDirection) * lightBIntensity, 0.0); float lightWeighting = lightWeightA + lightWeightB + 0.4; float backLightWeighting = backLightWeightA + backLightWeightB + 0.4; vec4 baseColor = vec4(1.0, 1.0, 1.0, 1.0); if (uRenderingMode == 2){ if (state == 252){ baseColor = getColor(); } else{ baseColor = vec4(0.0, 0.0, 0.3, 0.5); } } if (state == 253) { baseColor = uHighlightColour; } if (uRenderingMode != 2 && state != 253){ baseColor = getColor(); } if (baseColor.a < 0.98 && uRenderingMode == 0) { vec3 trans = -0.002 * uMeter * normalize(normal); vertex = vertex + trans; } vFrontColor = vec4(baseColor.rgb * lightWeighting, baseColor.a); vBackColor = vec4(baseColor.rgb * backLightWeighting, baseColor.a); } vPosition = vertex; gl_Position = uPMatrix * uMVMatrix * vec4(vertex, 1.0); }";
xShaders.vertex_shader_noFPT = " attribute highp float aVertexIndex; attribute highp float aTransformationIndex; attribute highp float aStyleIndex; attribute highp float aProduct; attribute highp float aState; attribute highp vec2 aNormal; uniform mat4 uMVMatrix; uniform mat4 uPMatrix; uniform vec4 ulightA; uniform vec4 ulightB; uniform bool uColorCoding; uniform bool uFloatingPoint; uniform highp sampler2D uVertexSampler; uniform int uVertexTextureSize; uniform highp sampler2D uMatrixSampler; uniform int uMatrixTextureSize; uniform highp sampler2D uStyleSampler; uniform int uStyleTextureSize; uniform highp sampler2D uStateStyleSampler; int stateStyleTextureSize = 15; varying vec4 vColor; varying vec3 vPosition; vec3 getNormal(){ float U = aNormal[0]; float V = aNormal[1]; float PI = 3.1415926535897932384626433832795; float u = ((U / 252.0) * (2.0 * PI)) - PI; float v = ((V / 252.0) * (2.0 * PI)) - PI; float x = sin(v) * cos(u); float y = sin(v) * sin(u); float z = cos(v); return normalize(vec3(x, y, z)); } vec4 getIdColor(){ float R = mod(aProduct, 256.0) / 255.0; float G = floor(aProduct/256.0) / 255.0; float B = floor (aProduct/(256.0*256.0)) / 255.0; return vec4(R, G, B, 1.0); } vec2 getVertexTextureCoordinates(int index, int size) { float x = float(index - (index / size) * size); float y = float(index / size); float pixelSize = 1.0 / float(size); return vec2((x + 0.5) * pixelSize, (y + 0.5) * pixelSize); } int getByteFromScale(float base) { float result = base * 255.0; int correction = fract(result) >= 0.5 ? 1 : 0; return int(result) + correction; } ivec4 getPixel(int index, sampler2D sampler, int size) { vec2 coords = getVertexTextureCoordinates(index, size); vec4 pixel = texture2D(sampler, coords); return ivec4( getByteFromScale(pixel.r), getByteFromScale(pixel.g), getByteFromScale(pixel.b), getByteFromScale(pixel.a) ); } void getBits(ivec4 pixel, out int result[32]) { for (int i = 0; i < 4; i++) { int actualByte = pixel[i]; for (int j = 0; j < 8; j++) { result[31 - (j + i * 8)] =  actualByte - (actualByte / 2) * 2; actualByte /= 2; } } } float getFloatFromPixel(ivec4 pixel) { int bits[32]; getBits(pixel, bits); float sign =  bits[0] == 0 ? 1.0 : -1.0; highp float fraction = 1.0; highp float exponent = 0.0; for (int i = 1; i < 9; i++) { exponent += float(bits[9 - i]) * exp2(float (i - 1)); } exponent -= 127.0; for (int i = 9; i < 32; i++) { fraction += float(bits[i]) * exp2(float((-1)*(i-8))); } return sign * fraction * exp2(exponent); } float getFloatFromPixel(int index, sampler2D sampler, int size) { ivec4 pixel = getPixel(index, sampler, size); return getFloatFromPixel(pixel); } vec4 getColor(){ if (floor(aState + 0.5) == 0.0){ int index = int (floor(aStyleIndex + 0.5)); vec2 coords = getVertexTextureCoordinates(index, uStyleTextureSize); return texture2D(uStyleSampler, coords); } else{ return vec4(1.0,1.0,1.0,1.0); } } vec3 getVertexPosition(){ int index = int (floor(aVertexIndex +0.5))* 3; vec3 position = vec3( getFloatFromPixel(index, uVertexSampler, uVertexTextureSize), getFloatFromPixel(index + 1, uVertexSampler, uVertexTextureSize), getFloatFromPixel(index + 2, uVertexSampler, uVertexTextureSize) ); int tIndex = int(floor(aTransformationIndex + 0.5)); if (tIndex != 65535) { tIndex *= 16; mat4 transform = mat4( getFloatFromPixel(tIndex + 0, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 1, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 2, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 3, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 4, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 5, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 6, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 7, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 8, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 9, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 10, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 11, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 12, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 13, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 14, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 15, uMatrixSampler, uMatrixTextureSize) ); vec4 transformedPosition = transform * vec4(position, 1.0); return vec3(transformedPosition); } return position; } void main(void) { vec3 vertex = getVertexPosition(); vPosition = vertex; gl_Position = uPMatrix * uMVMatrix * vec4(vertex, 1.0); if (uColorCoding){ vColor = getIdColor(); } else{ vec3 normal = getNormal(); float lightAIntensity = ulightA[3]; vec3 lightADirection = normalize(ulightA.xyz - vPosition); float lightBIntensity = ulightB[3]; vec3 lightBDirection = normalize(ulightB.xyz - vPosition); float lightWeightA = max(dot(normal, lightADirection ) * lightAIntensity, 0.0); float lightWeightB = max(dot(normal, lightBDirection ) * lightBIntensity, 0.0); float lightWeighting = lightWeightA + lightWeightB + 0.4; vec4 baseColor = getColor(); vColor = vec4(baseColor.rgb * lightWeighting, baseColor.a); } }";

/**
    * Enumeration for object states.
    * @readonly
    * @enum {number}
    */
var xState = {
    UNDEFINED: 255,
    HIDDEN: 254,
    HIGHLIGHTED: 253,
    XRAYVISIBLE: 252,
    UNSTYLED: 225
};
function xTriangulatedShape() { };

//this will get xBinaryReader on the current position and will parse it's content to fill itself with vertices, normals and vertex indices
xTriangulatedShape.prototype.parse = function (binReader) {
    var self = this;
    var version = binReader.readByte();
    var numVertices = binReader.readInt32();
    var numOfTriangles = binReader.readInt32();
    self.vertices = binReader.readFloat32(numVertices * 3);
    //allocate memory of defined size (to avoid reallocation of memory)
    self.indices = new Uint32Array(numOfTriangles * 3);
    self.normals = new Uint8Array(numOfTriangles * 6);
    //indices for incremental adding of indices and normals
    var iIndex = 0;
    var readIndex;
    if (numVertices <= 0xFF) {
        readIndex = function (count) { return binReader.readByte(count); };
    }
    else if (numVertices <= 0xFFFF) {
        readIndex = function (count) { return binReader.readUint16(count); };
    }
    else {
        readIndex = function (count) { return binReader.readInt32(count); };
    }
    
    var numFaces = binReader.readInt32();

    if (numVertices === 0 || numOfTriangles === 0)
        return;

    for (var i = 0; i < numFaces; i++) {
        var numTrianglesInFace = binReader.readInt32();
        if (numTrianglesInFace == 0) continue;

        var isPlanar = numTrianglesInFace > 0;
        numTrianglesInFace = Math.abs(numTrianglesInFace);
        if (isPlanar) {
            var normal = binReader.readByte(2);
            //read and set all indices
            var planarIndices = readIndex(3 * numTrianglesInFace);
            self.indices.set(planarIndices, iIndex);

            for (var j = 0; j < numTrianglesInFace*3; j++) {
                //add three identical normals because this is planar but needs to be expanded for WebGL
                self.normals[iIndex * 2] = normal[0];
                self.normals[iIndex * 2 + 1] = normal[1];
                iIndex++;
            }
        }
        else {
            for (var j = 0; j < numTrianglesInFace; j++) {
                self.indices[iIndex] = readIndex();//a
                self.normals.set(binReader.readByte(2), iIndex * 2);
                iIndex++;

                self.indices[iIndex] = readIndex();//b
                self.normals.set(binReader.readByte(2), iIndex * 2);
                iIndex++;

                self.indices[iIndex] = readIndex();//c
                self.normals.set(binReader.readByte(2), iIndex * 2);
                iIndex++;
            }
        }
    }
};

//This would load only shape data from binary file
xTriangulatedShape.prototype.load = function (source) {
    //binary reading
    var br = new xBinaryReader();
    var self = this;
    br.onloaded = function () {
        self.parse(br);
        if (self.onloaded) {
            self.onloaded();
        }
    };
    br.load(source);
};


xTriangulatedShape.prototype.vertices = [];
xTriangulatedShape.prototype.indices = [];
xTriangulatedShape.prototype.normals = [];

//this function will get called when loading is finished.
//This won't get called after parse which is supposed to happen in large operation.
xTriangulatedShape.prototype.onloaded = function () { };

/**
* This is constructor of the xBIM Viewer. It gets HTMLCanvasElement or string ID as an argument. Viewer will than be initialized 
* in the context of specified canvas. Any other argument will throw exception.
* @name xViewer
* @constructor
* @classdesc This is the main and the only class you need to load and render IFC models in wexBIM format. This viewer is part of
* xBIM toolkit which can be used to create wexBIM files from IFC, ifcZIP and ifcXML. WexBIM files are highly optimized for
* transmition over internet and rendering performance. Viewer uses WebGL technology for hardware accelerated 3D rendering and SVG for
* certain kinds of user interaction. This means that it won't work with obsolete and non-standard-compliant browsers like IE10 and less.
*
* @param {string | HTMLCanvasElement} canvas - string ID of the canvas or HTML canvas element.
*/
function xViewer(canvas) {
    if (typeof (canvas) == 'undefined') {
        throw 'Canvas has to be defined';
    }
    this._canvas = null;
    if (typeof(canvas.nodeName) != 'undefined' && canvas.nodeName == 'CANVAS') { 
        this._canvas = canvas;
    }
    if (typeof (canvas) == 'string') {
        this._canvas = document.getElementById(canvas);
    }
    if (this._canvas == null) {
        throw 'You have to specify canvas either as an ID of HTML element or the element itself';
    }

    /**
    * This is a structure that holds settings of perspective camera.
    * @member {PerspectiveCamera} xViewer#perspectiveCamera
    */
    /**
    * This is only a structure. Don't call the constructor.
    * @classdesc This is a structure that holds settings of perspective camera. If you want 
    * to switch viewer to use perspective camera set {@link xViewer#camera camera} to 'perspective'.
    * You can modify this but it is not necessary because sensible values are 
    * defined when geometry model is loaded with {@link xViewer#load load()} method. If you want to 
    * change these values you have to do it after geometry is loaded.
    * @class
    * @name PerspectiveCamera
    */
    this.perspectiveCamera = {
        /** @member {Number} PerspectiveCamera#fov - Field of view*/
        fov: 45,
        /** @member {Number} PerspectiveCamera#near - Near cutting plane*/
        near: 0,
        /** @member {Number} PerspectiveCamera#far - Far cutting plane*/
        far: 0
    };

    /**
    * This is a structure that holds settings of orthogonal camera. You can modify this but it is not necessary because sensible values are 
    * defined when geometry model is loaded with {@link xViewer#load load()} method. If you want to change these values you have to do it after geometry is loaded.
    * @member {OrthogonalCamera} xViewer#orthogonalCamera
    */
    /**
    * This is only a structure. Don't call the constructor.
    * @classdesc This is a structure that holds settings of orthogonal camera. If you want to switch viewer to use orthogonal camera set {@link xViewer#camera camera} to 'orthogonal'.
    * @class
    * @name OrthogonalCamera
    */
    this.orthogonalCamera = {
        /** @member {Number} OrthogonalCamera#left*/
        left: 0,
        /** @member {Number} OrthogonalCamera#right*/
        right: 0,
        /** @member {Number} OrthogonalCamera#top*/
        top: 0,
        /** @member {Number} OrthogonalCamera#bottom*/
        bottom: 0,
        /** @member {Number} OrthogonalCamera#near*/
        near: 0,
        /** @member {Number} OrthogonalCamera#far*/
        far: 0
    };

    /**
    * Type of camera to be used. Available values are <strong>'perspective'</strong> and <strong>'orthogonal'</strong> You can change this value at any time with instant effect.
    * @member {string} xViewer#camera
    */
    this.camera = 'perspective';

    /**
    * Array of four integers between 0 and 255 representing RGBA colour components. This defines background colour of the viewer. You can change this value at any time with instant effect.
    * @member {Number[]} xViewer#background
    */
    this.background = [230, 230, 230, 255];
    /**
    * Array of four integers between 0 and 255 representing RGBA colour components. This defines colour for highlighted elements. You can change this value at any time with instant effect.
    * @member {Number[]} xViewer#highlightingColour
    */
    this.highlightingColour = [255, 173, 33, 255];
    /**
    * Array of four floats. It represents Light A's position <strong>XYZ</strong> and intensity <strong>I</strong> as [X, Y, Z, I]. Intensity should be in range 0.0 - 1.0.
    * @member {Number[]} xViewer#lightA
    */
    this.lightA = [0, 1000000, 200000, 0.8];
    /**
    * Array of four floats. It represents Light B's position <strong>XYZ</strong> and intensity <strong>I</strong> as [X, Y, Z, I]. Intensity should be in range 0.0 - 1.0.
    * @member {Number[]} xViewer#lightB
    */
    this.lightB = [0, -500000, 50000, 0.2];

    /**
    * Switch between different navigation modes for left mouse button. Allowed values: <strong> 'pan', 'zoom', 'orbit' (or 'fixed-orbit') , 'free-orbit' and 'none'</strong>. Default value is <strong>'orbit'</strong>;
    * @member {String} xViewer#navigationMode
    */
    this.navigationMode = 'orbit';

    /**
    * Switch between different rendering modes. Allowed values: <strong> 'normal', 'x-ray'</strong>. Default value is <strong>'normal'</strong>;
    * Only products with state set to state.HIGHLIGHTED or xState.XRAYVISIBLE will be rendered highlighted or in a normal colours. All other products
    * will be rendered semi-transparent and single sided.
    * @member {String} xViewer#renderingMode
    */
    this.renderingMode = 'normal';

    /** 
    * Clipping plane [a, b, c, d] defined as normal equation of the plane ax + by + cz + d = 0. [0,0,0,0] is for no clipping plane.
    * @member {Number[]} xViewer#clippingPlane
    */
    this.clippingPlane = [0, 0, 0, 0];

    this._lastClippingPoint = [0, 0, 0];


    //*************************** Do all the set up of WebGL **************************
    var gl = WebGLUtils.setupWebGL(this._canvas);

    //do not even initialize this object if WebGL is not supported
    if (!gl) {
        return;
    }

    this._gl = gl;

    //detect floating point texture support
    this._fpt = (
	gl.getExtension('OES_texture_float') ||
	gl.getExtension('MOZ_OES_texture_float') ||
	gl.getExtension('WEBKIT_OES_texture_float')
	);


    //set up DEPTH_TEST and BLEND so that transparent objects look right
    //this is not 100% perfect as it would be necessary to sort all objects from back to
    //front when rendering them. We have sacrificed this for the sake of performance.
    //Objects with no transparency in their default style are drawn first and semi-transparent last.
    //This gives 90% right when there is not too much of transparency. It may not look right if you
    //have a look through two windows or if you have a look from inside of the building out.
    //It is granted to be alright when looking from outside of the building inside through one
    //semi-transparent object like curtain wall panel or window which is the case most of the time.
    //This is known limitation but there is no plan to change this behaviour.
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    //cache canvas width and height and change it only when size change
    // it is better to cache this value because it is used frequently and it takes a time to get a value from HTML
    this._width = this._canvas.width = this._canvas.offsetWidth;
    this._height = this._canvas.height = this._canvas.offsetHeight;

    this._geometryLoaded = false;
    //number of active models is used to indicate that state has changed
    this._numberOfActiveModels = 0;
    //this object is used to identify if anything changed before two frames (hence if it is necessary to redraw)
    this._lastStates = {};
    this._visualStateAttributes = ["perspectiveCamera", "orthogonalCamera", "camera", "background", "lightA", "lightB",
        "renderingMode", "clippingPlane", "_mvMatrix", "_pMatrix", "_distance", "_origin", "highlightingColour", "_numberOfActiveModels"];
    this._stylingChanged = true;

    //this is to indicate that user has done some interaction
    this._userAction = true;

    //dictionary of named events which can be registered and unregistered by using '.on('eventname', callback)'
    // and '.off('eventname', callback)'. Registered call-backs are triggered by the viewer when important events occur.
    this._events = {};

    //array of plugins which can implement certain methods which get called at certain points like before draw, after draw and others.
    this._plugins = [];

    //pointers to uniforms in shaders
    this._mvMatrixUniformPointer = null;
    this._pMatrixUniformPointer = null;
    this._lightAUniformPointer = null;
    this._lightBUniformPointer = null;
    this._colorCodingUniformPointer = null;
    this._clippingPlaneUniformPointer = null;
    this._meterUniformPointer = null;
    this._renderingModeUniformPointer = null;
    this._highlightingColourUniformPointer = null;

    //transformation matrices
    this._mvMatrix = mat4.create(); 	//world matrix
    this._pMatrix = mat4.create(); 		//camera matrix (this can be either perspective or orthogonal camera)

    //Navigation settings - coordinates in the WCS of the origin used for orbiting and panning
    this._origin = [0, 0, 0]
    //Default distance for default views (top, bottom, left, right, front, back)
    this._distance = 0;
    //shader program used for rendering
    this._shaderProgram = null;

    //Array of handles which can eventually contain handles to one or more models.
    //Models are loaded using 'load()' function.
    this._handles = [];

    //This array keeps data for overlay styles.
    this._stateStyles = new Uint8Array(15 * 15 * 4);

    //This is a switch which can stop animation.
    this._isRunning = true;

    //********************** Run all the initialize functions *****************************
    //compile shaders for use
    this._initShaders();
    //initialize vertex attribute and uniform pointers
    this._initAttributesAndUniforms();
    //initialize mouse events to capture user interaction
    this._initMouseEvents();
};

/**
* This is a static function which should always be called before xViewer is instantiated.
* It will check all prerequisites of the viewer and will report all issues. If Prerequisities.errors contain
* any messages viewer won't work. If Prerequisities.warnings contain any messages it will work but some
* functions may be restricted or may not work or it may have poor performance.
* @function xViewer.check
* @return {Prerequisites}
*/
xViewer.check = function () {
    /**
    * This is a structure reporting errors and warnings about prerequisites of {@link xViewer xViewer}. It is result of {@link xViewer.checkPrerequisities checkPrerequisities()} static method.
    *
    * @name Prerequisites
    * @class
    */
    var result = {
        /**
        * If this array contains any warnings xViewer will work but it might be slow or may not support full functionality.
        * @member {string[]}  Prerequisites#warnings
        */
        warnings: [],
        /**
        * If this array contains any errors xViewer won't work at all or won't work as expected. 
        * You can use messages in this array to report problems to user. However, user won't probably 
        * be able to do to much with it except trying to use different browser. IE10- are not supported for example. 
        * The latest version of IE should be all right.
        * @member {string[]}  Prerequisites#errors
        */
        errors: [],
        /**
        * If false xViewer won't work at all or won't work as expected. 
        * You can use messages in {@link Prerequisites#errors errors array} to report problems to user. However, user won't probably 
        * be able to do to much with it except trying to use different browser. IE10- are not supported for example. 
        * The latest version of IE should be all right.
        * @member {string[]}  Prerequisites#noErrors
        */
        noErrors: false,
        /**
        * If false xViewer will work but it might be slow or may not support full functionality. Use {@link Prerequisites#warnings warnings array} to report problems.
        * @member {string[]}  Prerequisites#noWarnings
        */
        noWarnings: false
    };

    //check WebGL support
    var canvas = document.createElement('canvas');
    if (!canvas) result.errors.push("Browser doesn't have support for HTMLCanvasElement. This is critical.");
    else {
        var gl = WebGLUtils.setupWebGL(canvas);
        if (gl == null) result.errors.push("Browser doesn't support WebGL. This is critical.");
        else {
            //check floating point extension availability
            var fpt = (
	            gl.getExtension('OES_texture_float') ||
	            gl.getExtension('MOZ_OES_texture_float') ||
	            gl.getExtension('WEBKIT_OES_texture_float')
	            );
            if (!fpt) result.warnings.push('Floating point texture extension is not supported. Performance of the viewer will be very bad. But it should work.');

            //check number of supported vertex shader textures. Minimum is 5 but standard requires 0.
            var vertTextUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
            if (vertTextUnits < 4) result.errors.push("Browser supports only " + vertTextUnits + " vertex texture image units but minimal requirement for the viewer is 4.");
        }
    }

    //check FileReader and Blob support
    if (!window.File || !window.FileReader ||  !window.Blob)  result.errors.push("Browser doesn't support 'File', 'FileReader' or 'Blob' objects.");
    

    //check for typed arrays
    if (!window.Int32Array || !window.Float32Array) result.errors.push("Browser doesn't support TypedArrays. These are crucial for binary parsing and for comunication with GPU.");
    
    //check SVG support
    if (!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) result.warnings.push("Browser doesn't support SVG. This is used for user interaction like interactive clipping. Functions using SVG shouldn't crash but they won't work as expected.");

    //set boolean members for convenience
    if (result.errors.length == 0) result.noErrors = true;
    if (result.warnings.length == 0) result.noWarnings = true;
    return result;
};

/**
* Adds plugin to the viewer. Plugins can implement certain methods which get called in certain moments in time like
* before draw, after draw etc. This makes it possible to implement functionality tightly integrated into xViewer like navigation cube or others. 
* @function xViewer#addPlugin
* @param {object} plugin - plug-in object
*/
xViewer.prototype.addPlugin = function (plugin) {
    this._plugins.push(plugin);

    if (!plugin.init) return;
    plugin.init(this);
};

/**
* Removes plugin from the viewer. Plugins can implement certain methods which get called in certain moments in time like
* before draw, after draw etc. This makes it possible to implement functionality tightly integrated into xViewer like navigation cube or others. 
* @function xViewer#removePlugin
* @param {object} plugin - plug-in object
*/
xViewer.prototype.removePlugin = function (plugin) {
    var index = this._plugins.indexOf(plugin, 0);
    if (index < 0) return;
    this._plugins.splice(index, 1);
};

/**
* Use this function to define up to 224 optional styles which you can use to change appearance of products and types if you pass the index specified in this function to {@link xViewer#setState setState()} function.
* @function xViewer#defineStyle
* @param {Number} index - Index of the style to be defined. This has to be in range 0 - 224. Index can than be passed to change appearance of the products in model
* @param {Number[]} colour - Array of four numbers in range 0 - 255 representing RGBA colour. If there are less or more numbers exception is thrown.
*/
xViewer.prototype.defineStyle = function (index, colour) {
    if (typeof (index) == 'undefined' || (index < 0 && index > 224)) throw 'Style index has to be defined as a number 0-224';
    if (typeof (colour) == 'undefined' || colour.length == 'undefined' || colour.length != 4) throw 'Colour must be defined as an array of 4 bytes';
    this._stylingChanged = true;

    //set style to style texture via model handle
    var colData = new Uint8Array(colour);
    this._stateStyles.set(colData, index * 4);

    //if there are some handles already set this style in there
    this._handles.forEach(function (handle) {
        handle.stateStyle = this._stateStyles;
        handle.refreshStyles();
    }, this);
};

    

/**
* You can use this function to change state of products in the model. State has to have one of values from {@link xState xState} enumeration. 
* Target is either enumeration from {@link xProductType xProductType} or array of product IDs. If you specify type it will effect all elements of the type.
*
* @function xViewer#setState
* @param {Number} state - One of {@link xState xState} enumeration values.
* @param {Number[] | Number} target - Target of the change. It can either be array of product IDs or product type from {@link xProductType xProductType}.
*/
xViewer.prototype.setState = function (state, target) {
    if (typeof (state) == 'undefined' || !(state >= 225 && state <= 255)) throw 'State has to be defined as 225 - 255. Use xState enum.';
    this._handles.forEach(function (handle) {
        handle.setState(state, target);
    }, this);
    this._stylingChanged = true;
};

/**
* Use this function to get state of the products in the model. You can compare result of this function 
* with one of values from {@link xState xState} enumeration. 0xFF is the default value.
*
* @function xViewer#getState
* @param {Number} id - Id of the product. You would typically get the id from {@link xViewer#event:pick pick event} or similar event.
*/
xViewer.prototype.getState = function (id) {
    var state = null;
    this._handles.forEach(function (handle) {
        state = handle.getState(id);
        if (state !== null) {
            return;
        }
    }, this);
    return state;
};

/**
* Use this function to reset state of all products to 'UNDEFINED' which means visible and not highlighted. 
* You can use optional hideSpaces parameter if you also want to show spaces. They will be hidden by default.
* 
* @function xViewer#resetStates
* @param {Bool} [hideSpaces = true] - Default state is UNDEFINED which would also show spaces. That is often not 
* desired so it can be excluded with this parameter.
*/
xViewer.prototype.resetStates = function (hideSpaces) {
    this._handles.forEach(function (handle) {
        handle.resetStates();
    }, this);
    //hide spaces
    hideSpaces = typeof (hideSpaces) != 'undefined' ? hideSpaces : true;
    if (hideSpaces){
        this._handles.forEach(function (handle) {
            handle.setState(xState.HIDDEN, xProductType.IFCSPACE);
        }, this);
    }
    this._stylingChanged = true;
};

/**
 * Gets complete model state and style. Resulting object can be used to restore the state later on.
 * 
 * @param {Number} id - Model ID which you can get from {@link xViewer#event:loaded loaded} event.
 * @returns {Array} - Array representing model state in compact form suitable for serialization
 */
xViewer.prototype.getModelState = function (id) {
    var handle = this._handles[id];
    if (typeof (handle) === "undefined") {
        throw "Model doesn't exist";
    }

    return handle.getModelState();
};

/**
 * Restores model state from the data previously captured with {@link xViewer#getModelState getModelState()} function
 * @param {Number} id - ID of the model
 * @param {Array} state - State of the model as obtained from {@link xViewer#getModelState getModelState()} function
 */
xViewer.prototype.restoreModelState = function (id, state) {
    var handle = this._handles[id];
    if (typeof (handle) === "undefined") {
        throw "Model doesn't exist";
    }

    handle.restoreModelState(state);
    this._stylingChanged = true;
};

/**
* Use this method for restyling of the model. This doesn't change the default appearance of the products so you can think about it as an overlay. You can 
* remove the overlay if you set the style to {@link xState#UNSTYLED xState.UNSTYLED} value. You can combine restyling and hiding in this way. 
* Use {@link xViewer#defineStyle defineStyle()} to define styling first. 
* 
* @function xViewer#setStyle
* @param style - style defined in {@link xViewer#defineStyle defineStyle()} method
* @param {Number[] | Number} target - Target of the change. It can either be array of product IDs or product type from {@link xProductType xProductType}.
*/
xViewer.prototype.setStyle = function (style, target) {
    if (typeof (style) == 'undefined' || !(style >= 0 && style <= 225)) throw 'Style has to be defined as 0 - 225 where 225 is for default style.';
    var c = [
        this._stateStyles[style * 4],
        this._stateStyles[style * 4 + 1],
        this._stateStyles[style * 4 + 2],
        this._stateStyles[style * 4 + 3]
    ];
    if (c[0] == 0 && c[1] == 0 && c[2] == 0 && c[3] == 0 && console && console.warn)
        console.warn('You have used undefined colour for restyling. Elements with this style will have transparent black colour and hence will be invisible.');

    this._handles.forEach(function (handle) {
        handle.setState(style, target);
    }, this);
    this._stylingChanged = true;
};

/**
* Use this function to get overriding colour style of the products in the model. The number you get is the index of 
* your custom colour which you have defined in {@link xViewer#defineStyle defineStyle()} function. 0xFF is the default value.
*
* @function xViewer#getStyle
* @param {Number} id - Id of the product. You would typically get the id from {@link xViewer#event:pick pick event} or similar event.
*/
xViewer.prototype.getStyle = function (id) {
    this._handles.forEach(function (handle) {
        var style = handle.getStyle(id);
        if (style !== null) {
            return style;
        }
    }, this);
    return null;
};

/**
* Use this function to reset appearance of all products to their default styles.
*
* @function xViewer#resetStyles 
*/
xViewer.prototype.resetStyles = function () {
    this._handles.forEach(function (handle) {
        handle.resetStyles();
    }, this);
    this._stylingChanged = true;
};

/**
* 
* @function xViewer#getProductType
* @return {Number} Product type ID. This is either null if no type is identified or one of {@link xProductType type ids}.
* @param {Number} prodID - Product ID. You can get this value either from semantic structure of the model or by listening to {@link xViewer#event:pick pick} event.
*/
xViewer.prototype.getProductType = function (prodId) {
    var pType = null;
    this._handles.forEach(function (handle) {
        var map = handle.getProductMap(prodId);
        if (map) pType = map.type;
    }, this);
    return pType;
};

/**
* Use this method to set position of camera. Use it after {@link xViewer#setCameraTarget setCameraTarget()} to get desired result.
* 
* @function xViewer#setCameraPosition
* @param {Number[]} coordinates - 3D coordinates of the camera in WCS
*/
xViewer.prototype.setCameraPosition = function (coordinates) {
    if (typeof (coordinates) == 'undefined') throw 'Parameter coordinates must be defined';
    mat4.lookAt(this._mvMatrix, coordinates, this._origin, [0,0,1]);
}

/**
* This method sets navigation origin to the centroid of specified product's bounding box or to the centre of model if no product ID is specified.
* This method doesn't affect the view itself but it has an impact on navigation. Navigation origin is used as a centre for orbiting and it is used
* if you call functions like {@link xViewer.show show()} or {@link xViewer#zoomTo zoomTo()}.
* @function xViewer#setCameraTarget
* @param {Number} prodId [optional] Product ID. You can get ID either from semantic structure of the model or from {@link xViewer#event:pick pick event}.
* @return {Bool} True if the target exists and is set, False otherwise
*/
xViewer.prototype.setCameraTarget = function (prodId) {
    var viewer = this;
    //helper function for setting of the distance based on camera field of view and size of the product's bounding box
    var setDistance = function (bBox) {
        var size = Math.max(bBox[3], bBox[4], bBox[5]);
        var ratio = Math.max(viewer._width, viewer._height) / Math.min(viewer._width, viewer._height);
        viewer._distance = size / Math.tan(viewer.perspectiveCamera.fov * Math.PI / 180.0) * ratio * 1.0;
    }

    //set navigation origin and default distance to the product BBox
    if (typeof (prodId) != 'undefined' && prodId != null) {
        //get product BBox and set it's centre as a navigation origin
        var bbox = null;
        this._handles.every(function (handle) {
            var map = handle.getProductMap(prodId);
            if (map) {
                bbox = map.bBox;
                return false;
            }
            return true;
        });
        if (bbox) {
            this._origin = [bbox[0] + bbox[3] / 2.0, bbox[1] + bbox[4] / 2.0, bbox[2] + bbox[5] / 2.0];
            setDistance(bbox);
            return true;
        }
        else
            return false;
    }
        //set navigation origin and default distance to the most populated region from the first model
    else {
        //get region extent and set it's centre as a navigation origin
        var handle = this._handles[0];
        if (handle) {
            var region = handle.region
            if (region) {
                this._origin = [region.centre[0], region.centre[1], region.centre[2]]
                setDistance(region.bbox);
            }
        }
        return true;
    }
};

/**
* This method can be used for batch setting of viewer members. It doesn't check validity of the input.
* @function xViewer#set
* @param {Object} settings - Object containing key - value pairs
*/
xViewer.prototype.set = function (settings) {
    for (key in settings) {
        this[key] = settings[key];
    }
};

/**
* This method is used to load model data into viewer. Model has to be either URL to wexBIM file or Blob or File representing wexBIM file binary data. Any other type of argument will throw an exception.
* Region extend is determined based on the region of the model
* Default view if 'front'. If you want to define different view you have to set it up in handler of {@link xViewer#event:loaded loaded} event. <br>
* You can load more than one model if they occupy the same space, use the same scale and have unique product IDs. Duplicated IDs won't affect 
* visualization itself but would cause unexpected user interaction (picking, zooming, ...)
* @function xViewer#load
* @param {String | Blob | File} model - Model has to be either URL to wexBIM file or Blob or File representing wexBIM file binary data.
* @param {Any} tag [optional] - Tag to be used to identify the model in {@link xViewer#event:loaded loaded} event.
* @fires xViewer#loaded
*/
xViewer.prototype.load = function (model, tag) {
    if (typeof (model) == 'undefined') throw 'You have to specify model to load.';
    if (typeof(model) != 'string' && !(model instanceof Blob) && !(model instanceof File))
        throw 'Model has to be specified either as a URL to wexBIM file or Blob object representing the wexBIM file.';
    var viewer = this;

    var geometry = new xModelGeometry();
    geometry.onloaded = function () {
        viewer._addHandle(geometry, tag);
    };
    geometry.onerror = function (msg) {
        viewer._error(msg);
    }
    geometry.load(model);
};

//this is a private function used to add loaded geometry as a new handle and to set up camera and 
//default view if this is the first geometry loaded
xViewer.prototype._addHandle = function (geometry, tag) {
    var viewer = this;
    var gl = this._gl;

    var handle = new xModelHandle(viewer._gl, geometry, viewer._fpt != null);
    viewer._handles.push(handle);

    handle.stateStyle = viewer._stateStyles;
    handle.feedGPU();

    //get one meter size from model and set it to shader
    var meter = handle._model.meter;
    gl.uniform1f(viewer._meterUniformPointer, meter);

    //only set camera parameters and the view if this is the first model
    if (viewer._handles.length === 1) {
        //set centre and default distance based on the most populated region in the model
        viewer.setCameraTarget();

        //set perspective camera near and far based on 1 meter dimension and size of the model
        var region = handle.region;
        var maxSize = Math.max(region.bbox[3], region.bbox[4], region.bbox[5]);
        viewer.perspectiveCamera.far = maxSize * 50;
        viewer.perspectiveCamera.near = meter / 10.0;

        //set orthogonalCamera boundaries so that it makes a sense
        viewer.orthogonalCamera.far = viewer.perspectiveCamera.far;
        viewer.orthogonalCamera.near = viewer.perspectiveCamera.near;
        var ratio = 1.8;
        viewer.orthogonalCamera.top = maxSize / ratio;
        viewer.orthogonalCamera.bottom = maxSize / ratio * -1;
        viewer.orthogonalCamera.left = maxSize / ratio * -1 * viewer._width / viewer._height;
        viewer.orthogonalCamera.right = maxSize / ratio * viewer._width / viewer._height;

        //set default view
        viewer.setCameraTarget();
        var dist = Math.sqrt(viewer._distance * viewer._distance / 3.0);
        viewer.setCameraPosition([region.centre[0] + dist * -1.0, region.centre[1] + dist * -1.0, region.centre[2] + dist]);
    }

    /**
     * Occurs when geometry model is loaded into the viewer. This event returns object containing ID of the model.
     * This ID can later be used to unload or temporarily stop the model.
     * 
     * @event xViewer#loaded
     * @type {object}
     * @param {Number} id - model ID
     * @param {Any} tag - tag which was passed to 'xViewer.load()' function
     * 
    */
    viewer._fire('loaded', { id: handle.id, tag: tag })
    viewer._geometryLoaded = true;
};

/**
 * Unloads model from the GPU. This action is not reversible.
 * 
 * @param {Number} modelId - ID of the model which you can get from {@link xViewer#event:loaded loaded} event.
 */
xViewer.prototype.unload = function (modelId) {
    var handle = this._handles.filter(function (h) { return h.id === modelId }).pop();
    if (typeof (handle) === "undefined") throw "Model with id: " + modelId + " doesn't exist or was unloaded already."

    //stop for start so it doesn't interfere with the rendering loop
    handle.stopped = true;

    //remove from the array
    var index = this._handles.indexOf(handle);
    this._handles.splice(index, 1);
    this._numberOfActiveModels = this._handles.length;

    //unload and delete
    handle.unload();
    handle = undefined;
    // delete handle;
};


//this function should be only called once during initialization
//or when shader set-up changes
xViewer.prototype._initShaders = function () {
        
    var gl = this._gl;
    var viewer = this;
    var compile = function (shader, code) {
        gl.shaderSource(shader, code);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            viewer._error(gl.getShaderInfoLog(shader));
            return null;
        }
    }

    //fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    compile(fragmentShader, xShaders.fragment_shader);
    
    //vertex shader (the more complicated one)
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (this._fpt != null) compile(vertexShader, xShaders.vertex_shader);
    else compile(vertexShader, xShaders.vertex_shader_noFPT);

    //link program
    this._shaderProgram = gl.createProgram();
    gl.attachShader(this._shaderProgram, vertexShader);
    gl.attachShader(this._shaderProgram, fragmentShader);
    gl.linkProgram(this._shaderProgram);

    if (!gl.getProgramParameter(this._shaderProgram, gl.LINK_STATUS)) {
        this._error('Could not initialise shaders ');
    }

    gl.useProgram(this._shaderProgram);
};

xViewer.prototype._initAttributesAndUniforms = function () {
    var gl = this._gl;

    //create pointers to uniform variables for transformations
    this._pMatrixUniformPointer = gl.getUniformLocation(this._shaderProgram, "uPMatrix");
    this._mvMatrixUniformPointer = gl.getUniformLocation(this._shaderProgram, "uMVMatrix");
    this._lightAUniformPointer = gl.getUniformLocation(this._shaderProgram, "ulightA");
    this._lightBUniformPointer = gl.getUniformLocation(this._shaderProgram, "ulightB");
    this._colorCodingUniformPointer = gl.getUniformLocation(this._shaderProgram, "uColorCoding");
    this._clippingPlaneUniformPointer = gl.getUniformLocation(this._shaderProgram, "uClippingPlane");
    this._meterUniformPointer = gl.getUniformLocation(this._shaderProgram, "uMeter");
    this._renderingModeUniformPointer = gl.getUniformLocation(this._shaderProgram, "uRenderingMode");
    this._highlightingColourUniformPointer = gl.getUniformLocation(this._shaderProgram, "uHighlightColour");

    this._pointers = {
        normalAttrPointer: gl.getAttribLocation(this._shaderProgram, "aNormal"),
        indexlAttrPointer: gl.getAttribLocation(this._shaderProgram, "aVertexIndex"),
        productAttrPointer: gl.getAttribLocation(this._shaderProgram, "aProduct"),
        stateAttrPointer: gl.getAttribLocation(this._shaderProgram, "aState"),
        styleAttrPointer: gl.getAttribLocation(this._shaderProgram, "aStyleIndex"),
        transformationAttrPointer: gl.getAttribLocation(this._shaderProgram, "aTransformationIndex"),
        vertexSamplerUniform: gl.getUniformLocation(this._shaderProgram, "uVertexSampler"),
        matrixSamplerUniform: gl.getUniformLocation(this._shaderProgram, "uMatrixSampler"),
        styleSamplerUniform: gl.getUniformLocation(this._shaderProgram, "uStyleSampler"),
        stateStyleSamplerUniform: gl.getUniformLocation(this._shaderProgram, "uStateStyleSampler"),
        vertexTextureSizeUniform: gl.getUniformLocation(this._shaderProgram, "uVertexTextureSize"),
        matrixTextureSizeUniform: gl.getUniformLocation(this._shaderProgram, "uMatrixTextureSize"),
        styleTextureSizeUniform: gl.getUniformLocation(this._shaderProgram, "uStyleTextureSize")
    };

    //enable vertex attributes arrays
    gl.enableVertexAttribArray(this._pointers.normalAttrPointer);
    gl.enableVertexAttribArray(this._pointers.indexlAttrPointer);
    gl.enableVertexAttribArray(this._pointers.productAttrPointer);
    gl.enableVertexAttribArray(this._pointers.stateAttrPointer);
    gl.enableVertexAttribArray(this._pointers.styleAttrPointer);
    gl.enableVertexAttribArray(this._pointers.transformationAttrPointer);
};

xViewer.prototype._initMouseEvents = function () {
    var viewer = this;

    var mouseDown = false;
    var lastMouseX = null;
    var lastMouseY = null;
    var startX = null;
    var startY = null;
    var button = 'L';
    var id = -1;

    //set initial conditions so that different gestures can be identified
    function handleMouseDown(event) {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        startX = event.clientX;
        startY = event.clientY;

        //get coordinates within canvas (with the right orientation)
        var r = viewer._canvas.getBoundingClientRect();
        var viewX = startX - r.left;
        var viewY = viewer._height - (startY - r.top);

        //this is for picking
        id = viewer._getID(viewX, viewY);

        /**
        * Occurs when mousedown event happens on underlying canvas.
        *
        * @event xViewer#mouseDown
        * @type {object}
        * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
        */
        viewer._fire('mouseDown', {id: id});


        //keep information about the mouse button
        switch (event.button) {
            case 0:
                button = 'left';
                break;

            case 1:
                button = 'middle';
                break;

            case 2:
                button = 'right';
                break;

            default:
                button = 'left';
                break;
        }

        viewer._disableTextSelection();
    }

    function handleMouseUp(event) {
        mouseDown = false;

        var endX = event.clientX;
        var endY = event.clientY;

        var deltaX = Math.abs(endX - startX);
        var deltaY = Math.abs(endY - startY);

        //if it was a longer movement do not perform picking
        if (deltaX < 3 && deltaY < 3 && button == 'left') {

            var handled = false;
            viewer._plugins.forEach(function (plugin) {
                if (!plugin.onBeforePick) {
                    return;
                }
                handled = handled || plugin.onBeforePick(id);
            }, this);

            /**
            * Occurs when user click on model.
            *
            * @event xViewer#pick
            * @type {object}
            * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
            */
            if(!handled) viewer._fire('pick', {id : id});
        }

        viewer._enableTextSelection();
    }

    function handleMouseMove(event) {
        if (!mouseDown) {
            return;
        }

        if (viewer.navigationMode == 'none') {
            return;
        }

        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = newX - lastMouseX;
        var deltaY = newY - lastMouseY;

        lastMouseX = newX;
        lastMouseY = newY;

        if (button == 'left') {
            switch (viewer.navigationMode) {
                case 'free-orbit':
                    navigate('free-orbit', deltaX, deltaY);
                    break;

                case 'fixed-orbit':
                case 'orbit':
                    navigate('orbit', deltaX, deltaY);
                    break;

                case 'pan':
                    navigate('pan', deltaX, deltaY);
                    break;

                case 'zoom':
                    navigate('zoom', deltaX, deltaY);
                    break;

                default:
                    break;

            }
        }
        if (button == 'middle') {
            navigate('pan', deltaX, deltaY);
        }

    }

    function handleMouseScroll(event) {
        if (viewer.navigationMode == 'none') {
            return;
        }
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        if (event.preventDefault) {
            event.preventDefault();
        }
        function sign(x) {
            x = +x // convert to a number
            if (x === 0 || isNaN(x))
                return x
            return x > 0 ? 1 : -1
        }

        //deltaX and deltaY have very different values in different web browsers so fixed value is used for constant functionality.
        navigate('zoom', sign(event.deltaX) * -1.0, sign(event.deltaY) * -1.0);
    }

    function navigate(type, deltaX, deltaY) {
        if(!viewer._handles || !viewer._handles[0]) return;
        //translation in WCS is position from [0, 0, 0]
        var origin = viewer._origin;
        var camera = viewer.getCameraPosition();

        //get origin coordinates in view space
        var mvOrigin = vec3.transformMat4(vec3.create(), origin, viewer._mvMatrix)

        //movement factor needs to be dependant on the distance but one meter is a minimum so that movement wouldn't stop when camera is in 0 distance from navigation origin
        var distanceVec = vec3.subtract(vec3.create(), origin, camera);
        var distance = Math.max(vec3.length(distanceVec), viewer._handles[0]._model.meter);

        //move to the navigation origin in view space
        var transform = mat4.translate(mat4.create(), mat4.create(), mvOrigin)

        //function for conversion from degrees to radians
        function degToRad(deg) {
            return deg * Math.PI / 180.0;
        }

        switch (type) {
            case 'free-orbit':
                transform = mat4.rotate(mat4.create(), transform, degToRad(deltaY / 4), [1, 0, 0]);
                transform = mat4.rotate(mat4.create(), transform, degToRad(deltaX / 4), [0, 1, 0]);
                break;

            case 'fixed-orbit':
            case 'orbit':
                mat4.rotate(transform, transform, degToRad(deltaY / 4), [1, 0, 0]);

                //z rotation around model z axis
                var mvZ = vec3.transformMat3(vec3.create(), [0, 0, 1], mat3.fromMat4(mat3.create(), viewer._mvMatrix));
                mvZ = vec3.normalize(vec3.create(), mvZ);
                transform = mat4.rotate(mat4.create(), transform, degToRad(deltaX / 4), mvZ);

                break;

            case 'pan':
                mat4.translate(transform, transform, [deltaX * distance / 150, 0, 0]);
                mat4.translate(transform, transform, [0, (-1.0 * deltaY) * distance / 150, 0]);
                break;

            case 'zoom':
                mat4.translate(transform, transform, [0, 0, deltaX * distance / 20]);
                mat4.translate(transform, transform, [0, 0, deltaY * distance / 20]);
                break;

            default:
                break;
        }

        //reverse the translation in view space and leave only navigation changes
        var translation = vec3.negate(vec3.create(), mvOrigin);
        transform = mat4.translate(mat4.create(), transform, translation);

        //apply transformation in right order
        viewer._mvMatrix = mat4.multiply(mat4.create(), transform, viewer._mvMatrix);
    }

    //watch resizing of canvas every 500ms
    var elementHeight = viewer.height;
    var elementWidth = viewer.width;
    setInterval(function () {
        if (viewer._canvas.offsetHeight !== elementHeight || viewer._canvas.offsetWidth !== elementWidth) {
            elementHeight = viewer._height = viewer._canvas.height = viewer._canvas.offsetHeight;
            elementWidth = viewer._width = viewer._canvas.width = viewer._canvas.offsetWidth;
        }
    }, 500);


    //attach callbacks
    this._canvas.addEventListener('mousedown', handleMouseDown, true);
    this._canvas.addEventListener('wheel', handleMouseScroll, true);
    window.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('mousemove', handleMouseMove, true);

    this._canvas.addEventListener('mousemove', function() {
        viewer._userAction = true;
    }, true);


    /**
    * Occurs when user double clicks on model.
    *
    * @event xViewer#dblclick
    * @type {object}
    * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
    */
    this._canvas.addEventListener('dblclick', function () { viewer._fire('dblclick', { id: id }); }, true);
};

/**
* This is a static draw method. You can use it if you just want to render model once with no navigation and interaction.
* If you want interactive model call {@link xViewer#start start()} method. {@link xViewer#frame Frame event} is fired when draw call is finished.
* @function xViewer#draw
* @fires xViewer#frame
*/
xViewer.prototype.draw = function () {
    if (!this._geometryLoaded || this._handles.length == 0 || !(this._stylingChanged || this._isChanged())) {
        if (!this._userAction) return;
    }
    this._userAction = false;

    //call all before-draw plugins
    this._plugins.forEach(function (plugin) {
        if (!plugin.onBeforeDraw) {
            return;
        }
        plugin.onBeforeDraw();
    }, this);

    //styles are up to date when new frame is drawn
    this._stylingChanged = false;

    var gl = this._gl;
    var width = this._width;
    var height = this._height;

    gl.useProgram(this._shaderProgram);
    gl.viewport(0, 0, width, height);
    gl.clearColor(this.background[0] / 255, this.background[1] / 255, this.background[2] / 255, this.background[3] / 255);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //set up camera
    switch (this.camera) {
        case 'perspective':
            mat4.perspective(this._pMatrix, this.perspectiveCamera.fov * Math.PI / 180.0, this._width / this._height, this.perspectiveCamera.near, this.perspectiveCamera.far);
            break;

        case 'orthogonal':
            mat4.ortho(this._pMatrix, this.orthogonalCamera.left, this.orthogonalCamera.right, this.orthogonalCamera.bottom, this.orthogonalCamera.top, this.orthogonalCamera.near, this.orthogonalCamera.far);
            break;

        default:
            mat4.perspective(this._pMatrix, this.perspectiveCamera.fov * Math.PI / 180.0, this._width / this._height, this.perspectiveCamera.near, this.perspectiveCamera.far);
            break;
    }

    //set uniforms (these may quickly change between calls to draw)
    gl.uniformMatrix4fv(this._pMatrixUniformPointer, false, this._pMatrix);
    gl.uniformMatrix4fv(this._mvMatrixUniformPointer, false, this._mvMatrix);
    gl.uniform4fv(this._lightAUniformPointer, new Float32Array(this.lightA));
    gl.uniform4fv(this._lightBUniformPointer, new Float32Array(this.lightB));
    gl.uniform4fv(this._clippingPlaneUniformPointer, new Float32Array(this.clippingPlane));

    //use normal colour representation (1 would cause shader to use colour coding of IDs)
    gl.uniform1i(this._colorCodingUniformPointer, 0);

    //update highlighting colour
    gl.uniform4fv(this._highlightingColourUniformPointer, new Float32Array(
        [this.highlightingColour[0]/255.0, 
        this.highlightingColour[1]/255.0, 
        this.highlightingColour[2]/255.0, 
        this.highlightingColour[3]/255.0]));

    //check for x-ray mode
    if (this.renderingMode == 'x-ray')
    {
        //two passes - first one for non-transparent objects, second one for all the others
        gl.uniform1i(this._renderingModeUniformPointer, 2);
        gl.disable(gl.CULL_FACE);
        this._handles.forEach(function (handle) {
            if (!handle.stopped) {
                handle.setActive(this._pointers);
                handle.draw("solid");
            }
        }, this);

        //transparent objects should have only one side so that they are even more transparent.
        gl.uniform1i(this._renderingModeUniformPointer, 2);
        gl.enable(gl.CULL_FACE);
        this._handles.forEach(function (handle) {
            if (!handle.stopped) {
                handle.setActive(this._pointers);
                handle.draw("transparent");
            }
        }, this);
        gl.uniform1i(this._renderingModeUniformPointer, 0);
    }
    else {
        gl.uniform1i(this._renderingModeUniformPointer, 0);
        gl.disable(gl.CULL_FACE);

        //two runs, first for solids from all models, second for transparent objects from all models
        //this makes sure that transparent objects are always rendered at the end.
        this._handles.forEach(function (handle) {
            if (!handle.stopped) {
                handle.setActive(this._pointers);
                handle.draw("solid");
            }
        }, this);

        this._handles.forEach(function (handle) {
            if (!handle.stopped) {
                handle.setActive(this._pointers);
                handle.draw("transparent");
            }
        }, this);
    }
    
    //call all after-draw plugins
    this._plugins.forEach(function (plugin) {
        if (!plugin.onAfterDraw) {
            return;
        }
        plugin.onAfterDraw();
    }, this);

    /**
     * Occurs after every frame in animation. Don't do anything heavy weighted in here as it will happen about 60 times in a second all the time.
     *
     * @event xViewer#frame 
     * @type {object}
     */
    this._fire('frame', {});
};

xViewer.prototype._isChanged = function () {
    var theSame = true;
    this._visualStateAttributes.forEach(function (visualStateAttribute) {
        var state = JSON.stringify(this[visualStateAttribute]);
        var lastState = this._lastStates[visualStateAttribute];
        this._lastStates[visualStateAttribute] = state;
        theSame = theSame && (state === lastState)
    }, this);
    return !theSame;
};

/**
* Use this method get actual camera position.
* @function xViewer#getCameraPosition
*/
xViewer.prototype.getCameraPosition = function () {
    var transform = mat4.create();
    mat4.multiply(transform, this._pMatrix, this._mvMatrix);
    var inv = mat4.create()
    mat4.invert(inv, transform);
    var eye = vec3.create();
    vec3.transformMat4(eye, vec3.create(), inv);

    return eye;
}

/**
* Use this method to zoom to specified element. If you don't specify a product ID it will zoom to full extent.
* @function xViewer#zoomTo
* @param {Number} [id] Product ID
* @return {Bool} True if target exists and zoom was successful, False otherwise
*/
xViewer.prototype.zoomTo = function (id) {
    var found = this.setCameraTarget(id);
    if (!found)  return false;

    var eye = this.getCameraPosition();
    var dir = vec3.create();
    vec3.subtract(dir, eye, this._origin);
    dir = vec3.normalize(vec3.create(), dir);

    var translation = vec3.create();
    vec3.scale(translation, dir, this._distance);
    vec3.add(eye, translation, this._origin);

    mat4.lookAt(this._mvMatrix, eye, this._origin, [0, 0, 1]);
    return true;
};

/**
* Use this function to show default views.
*
* @function xViewer#show
* @param {String} type - Type of view. Allowed values are <strong>'top', 'bottom', 'front', 'back', 'left', 'right'</strong>. 
* Directions of this views are defined by the coordinate system. Target and distance are defined by {@link xViewer#setCameraTarget setCameraTarget()} method to certain product ID
* or to the model extent if {@link xViewer#setCameraTarget setCameraTarget()} is called with no arguments.
*/
xViewer.prototype.show = function (type) {
    var origin = this._origin;
    var distance = this._distance;
    var camera = [0, 0, 0];
    var heading = [0, 0, 1];
    switch (type) {
        //top and bottom are different because these are singular points for look-at function if heading is [0,0,1]
        case 'top':
            //only move to origin and up (negative values because we move camera against model)
            mat4.translate(this._mvMatrix, mat4.create(), [origin[0] * -1.0, origin[1] * -1.0, (distance + origin[2])* -1.0 ]);
            return;
        case 'bottom':
            //only move to origin and up and rotate 180 degrees around Y axis
            var toOrigin = mat4.translate(mat4.create(), mat4.create(), [origin[0] * -1.0, origin[1] * +1.0, (origin[2] + distance) * -1]);
            var rotationY = mat4.rotateY(mat4.create(), toOrigin, Math.PI);
            var rotationZ = mat4.rotateZ(mat4.create(), rotationY, Math.PI);
            this._mvMatrix = rotationZ; // mat4.translate(mat4.create(), rotationZ, [0, 0, -1.0 * distance]);
            return;

        case 'front':
            camera = [origin[0], origin[1] - distance, origin[2]];
            break;
        case 'back':
            camera = [origin[0], origin[1] + distance, origin[2]];
            break;
        case 'left':
            camera = [origin[0] - distance, origin[1], origin[2]];
            break;
        case 'right':
            camera = [origin[0] + distance, origin[1], origin[2]];
            break;
        default:
            break;
    }
    //use look-at function to set up camera and target
    mat4.lookAt(this._mvMatrix, camera, origin, heading);
};

xViewer.prototype._error = function (msg) {
    /**
    * Occurs when viewer encounters error. You should listen to this because it might also report asynchronous errors which you would miss otherwise.
    *
    * @event xViewer#error
    * @type {object}
    * @param {string} message - Error message
    */
    this._fire('error', {message: msg});
};

//this renders the colour coded model into the memory buffer
//not to the canvas and use it to identify ID of the object from that
xViewer.prototype._getID = function (x, y) {

    //call all before-drawId plugins
    this._plugins.forEach(function (plugin) {
        if (!plugin.onBeforeDrawId) {
            return;
        }
        plugin.onBeforeDrawId();
    }, this);

    //it is not necessary to render the image in full resolution so this factor is used for less resolution. 
    var factor = 2;
    var gl = this._gl;
    var width = this._width / factor;
    var height = this._height / factor;
    x = x / factor;
    y = y / factor;

    //create framebuffer
    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    // create renderbuffer
    var renderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
    // allocate renderbuffer
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // Set the parameters so we can render any image size.        
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


    // attach renderbuffer and texture
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
        this._error("this combination of attachments does not work");
        return null;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.viewport(0, 0, width, height);

    gl.enable(gl.DEPTH_TEST); //we don't use any kind of blending or transparency
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0); //zero colour for no-values
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //set uniform for colour coding
    gl.uniform1i(this._colorCodingUniformPointer, 1);

    //render colour coded image using latest buffered data
    this._handles.forEach(function (handle) {
        if (!handle.stopped) {
            handle.setActive(this._pointers);
            handle.draw();
        }
    }, this);

    //call all after-drawId plugins
    this._plugins.forEach(function (plugin) {
        if (!plugin.onAfterDrawId) {
            return;
        }
        plugin.onAfterDrawId();
    }, this);

    //get colour in of the pixel
    var result = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, result);


    //reset framebuffer to render into canvas again
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //free GPU memory
    gl.deleteTexture(texture);
    gl.deleteRenderbuffer(renderBuffer);
    gl.deleteFramebuffer(frameBuffer);

    //set back blending
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    //decode ID (bit shifting by multiplication)
    var hasValue = result[3] != 0; //0 transparency is only for no-values
    if (hasValue) {
        var id = result[0] + result[1] * 256 + result[2] * 256 * 256;
        var handled = false;
        this._plugins.forEach(function (plugin) {
            if (!plugin.onBeforeGetId) {
                return;
            }
            handled = handled || plugin.onBeforeGetId(id);
        }, this);

        if (!handled)
            return id;
        else
            return null;
    }
    else {
        return null;
    }
};

/**
* Use this function to start animation of the model. If you start animation before geometry is loaded it will wait for content to render it.
* This function is bound to browser framerate of the screen so it will stop consuming any resources if you switch to another tab.
*
* @function xViewer#start
* @param {Number} id [optional] - Optional ID of the model to be stopped. You can get this ID from {@link xViewer#event:loaded loaded} event.
*/
xViewer.prototype.start = function (id) {
    if (typeof (id) !== "undefined") {
        var model = this._handles.filter(function (h) { return h.id === id; }).pop();
        if (typeof (model) === "undefined")
            throw "Model doesn't exist.";

        model.stopped = false;
        this._numberOfActiveModels++;
        return;
    }

    this._isRunning = true;
    var viewer = this;
    var lastTime = new Date();
    var counter = 0;
    function tick() {
        counter++;
        if (counter == 30) {
            counter = 0;
            var newTime = new Date();
            var span = newTime.getTime() - lastTime.getTime();
            lastTime = newTime;
            var fps = 1000 / span * 30;
            /**
            * Occurs after every 30th frame in animation. Use this event if you want to report FPS to the user. It might also be interesting performance measure.
            *
            * @event xViewer#fps 
            * @type {Number}
            */
            viewer._fire('fps', Math.floor(fps) );
        }

        if (viewer._isRunning) {
            window.requestAnimFrame(tick)
            viewer.draw()
        }
    }
    tick();
};

/**
* Use this function to stop animation of the model. User will still be able to see the latest state of the model. You can 
* switch animation of the model on again by calling {@link xViewer#start start()}.
*
* @function xViewer#stop
* @param {Number} id [optional] - Optional ID of the model to be stopped. You can get this ID from {@link xViewer#event:loaded loaded} event.
*/
xViewer.prototype.stop = function (id) {
    if (typeof (id) == "undefined") {
        this._isRunning = false;
        return;
    }

    var model = this._handles.filter(function (h) { return h.id === id; }).pop();
    if (typeof (model) === "undefined")
        throw "Model doesn't exist.";

    model.stopped = true;
    this._numberOfActiveModels--;
};

/**
 * Use this method to register to events of the viewer like {@link xViewer#event:pick pick}, {@link xViewer#event:mouseDown mouseDown}, 
 * {@link xViewer#event:loaded loaded} and others. You can define arbitrary number
 * of event handlers for any event. You can remove handler by calling {@link xViewer#off off()} method.
 *
 * @function xViewer#on
 * @param {String} eventName - Name of the event you would like to listen to.
 * @param {Object} callback - Callback handler of the event which will consume arguments and perform any custom action.
*/
xViewer.prototype.on = function (eventName, callback) {
    var events = this._events;
    if (!events[eventName]) {
        events[eventName] = [];
    }
    events[eventName].push(callback);
};

/**
* Use this method to unregister handlers from events. You can add event handlers by calling the {@link xViewer#on on()} method.
*
* @function xViewer#off
* @param {String} eventName - Name of the event
* @param {Object} callback - Handler to be removed
*/
xViewer.prototype.off = function (eventName, callback) {
    var events = this._events;
    var callbacks = events[eventName];
    if (!callbacks) {
        return;
    }
    var index = callbacks.indexOf(callback);
    if (index >= 0) {
        callbacks.splice(index, 1);
    }
};

//executes all handlers bound to event name
xViewer.prototype._fire = function (eventName, args) {
    var handlers = this._events[eventName];
    if (!handlers) {
        return;
    }
    //cal the callbacks
    handlers.forEach(function (handler) {
        handler(args);
    }, this);
};

xViewer.prototype._disableTextSelection = function () {
    //disable text selection
    document.documentElement.style['-webkit-touch-callout'] = 'none';
    document.documentElement.style['-webkit-user-select'] = 'none';
    document.documentElement.style['-khtml-user-select'] = 'none';
    document.documentElement.style['-moz-user-select'] = 'none';
    document.documentElement.style['-ms-user-select'] = 'none';
    document.documentElement.style['user-select'] = 'none';
};

xViewer.prototype._enableTextSelection = function () {
    //enable text selection again
    document.documentElement.style['-webkit-touch-callout'] = 'text';
    document.documentElement.style['-webkit-user-select'] = 'text';
    document.documentElement.style['-khtml-user-select'] = 'text';
    document.documentElement.style['-moz-user-select'] = 'text';
    document.documentElement.style['-ms-user-select'] = 'text';
    document.documentElement.style['user-select'] = 'text';
};

xViewer.prototype._getSVGOverlay = function() {
    //check support for SVG
    if (!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) return false;
    var ns = "http://www.w3.org/2000/svg";

    function getOffsetRect(elem) {
        var box = elem.getBoundingClientRect();

        var body = document.body;
        var docElem = document.documentElement;

        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;
        var clientBottom = docElem.clientBottom || body.clientBottom || 0;
        var clientRight = docElem.clientRight || body.clientRight || 0;


        var top = Math.round(box.top + scrollTop - clientTop);
        var left = Math.round(box.left + scrollLeft - clientLeft);
        var bottom = Math.round(box.top + scrollTop - clientBottom);
        var right = Math.round(box.left + scrollLeft - clientRight);

        return { top: top, left: left, width: right - left, height: bottom - top };
    }

    //create SVG overlay
    var svg = document.createElementNS(ns, "svg");
    //document.body.appendChild(svg);

    var cRect = getOffsetRect(this._canvas);

    svg.style.position = 'absolute';
    svg.style.top = cRect.top + 'px';
    svg.style.left = cRect.left + 'px';
    svg.style['z-index'] = 100;
    svg.setAttribute('width', this._width);
    svg.setAttribute('height', this._height);

    return svg;
};

/**
* This method can be used to get parameter of the current clipping plane. If no clipping plane is active
* this returns [[0,0,0],[0,0,0]];
*
* @function xViewer#getClip
* @return  {Number[][]} Point and normal defining current clipping plane
*/
xViewer.prototype.getClip = function () {
    var cp = this.clippingPlane;
    if (cp.every(function(e) { return e === 0; })) {
        return [[0, 0, 0], [0, 0, 0]];
    }

    var normal = vec3.normalize([0.0 ,0.0, 0.0], [cp[0], cp[1], cp[2]]);

    //test if the last clipping point fits in the condition
    var lp = this._lastClippingPoint;
    var test = lp[0] * cp[0] + lp[1] * cp[1] + lp[2] * cp[2] + cp[3];
    if (Math.abs(test) < 1e-5) {
        return [lp, normal];
    }

    //find the point on the plane
    var x = cp[0] !== 0 ? -1.0 * cp[3] / cp[0] : 0.0;
    var y = cp[1] !== 0 ? -1.0 * cp[3] / cp[1] : 0.0;
    var z = cp[2] !== 0 ? -1.0 * cp[3] / cp[2] : 0.0;

    return [[x,y,z], normal];
};

/**
* Use this method to clip the model. If you call the function with no arguments interactive clipping will start. This is based on SVG overlay
* so SVG support is necessary for it. But as WebGL is more advanced technology than SVG it is sound assumption that it is present in the browser.
* Use {@link xViewer.check xViewer.check()} to make sure it is supported at the very beginning of using of xViewer. Use {@link xViewer#unclip unclip()} method to 
* unset clipping plane.
*
* @function xViewer#clip
* @param {Number[]} [point] - point in clipping plane
* @param {Number[]} [normal] - normal pointing to the half space which will be hidden
* @fires xViewer#clipped
*/
xViewer.prototype.clip = function (point, normal) {

    //non interactive clipping, all information is there
    if (typeof (point) != 'undefined' && typeof (normal) != 'undefined') {

        this._lastClippingPoint = point;

        //compute normal equation of the plane
        var d = 0.0 - normal[0] * point[0] - normal[1] * point[1] - normal[2] * point[2];

        //set clipping plane
        this.clippingPlane = [normal[0], normal[1], normal[2], d]

        /**
        * Occurs when model is clipped. This event has empty object.
        *
        * @event xViewer#clipped
        * @type {object}
        */
        this._fire('clipped', {});
        return;
    }

    //********************************************** Interactive clipping ********************************************//
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._getSVGOverlay();
    var viewer = this;
    var position = {};
    var down = false;
    var g = {};

    var handleMouseDown = function (event) {
        if (down) return;
        down = true;

        viewer._disableTextSelection();

        var r = svg.getBoundingClientRect();
        position.x = event.clientX - r.left;
        position.y = event.clientY - r.top;
        position.angle = 0.0;

        //create very long vertical line going through the point
        g = document.createElementNS(ns, "g");
        g.setAttribute('id', 'section');
        svg.appendChild(g);

        var line = document.createElementNS(ns, "line");
        g.appendChild(line);

        line.setAttribute('style', "stroke:rgb(255,0,0);stroke-width:2");
        line.setAttribute('x1', position.x);
        line.setAttribute('y1', 99999);
        line.setAttribute('x2', position.x);
        line.setAttribute('y2', -99999);
    };

    var handleMouseUp = function (event) {
        if (!down) return;

        //check if the points are not identical. 
        var r = svg.getBoundingClientRect();
        if (position.x == event.clientX - r.left && position.y == event.clientY - r.top) {
            return;
        }

        down = false;
        viewer._enableTextSelection();


        //get inverse transformation
        var transform = mat4.create();
        mat4.multiply(transform, viewer._pMatrix, viewer._mvMatrix);
        var inverse = mat4.create();
        mat4.invert(inverse, transform);

        //get normalized coordinates the point in WebGL CS
        var x1 = position.x / (viewer._width / 2.0) - 1.0;
        var y1 = 1.0 - position.y / (viewer._height / 2.0);

        //First point in WCS
        var A = vec3.create();
        vec3.transformMat4(A, [x1, y1, -1], inverse); //near clipping plane

        //Second point in WCS
        var B = vec3.create();
        vec3.transformMat4(B, [x1, y1, 1], inverse); //far clipping plane

        //Compute third point on plane
        var angle = position.angle * Math.PI / 180.0 ;
        var x2 = x1 + Math.cos(angle);
        var y2 = y1 + Math.sin(angle);

        //Third point in WCS
        var C = vec3.create();
        vec3.transformMat4(C, [x2, y2, 1], inverse); // far clipping plane


        //Compute normal in WCS
        var BA = vec3.subtract(vec3.create(), A, B);
        var BC = vec3.subtract(vec3.create(), C, B);
        var N = vec3.cross(vec3.create(), BA, BC);
        
        viewer.clip(B, N);

        //clean
        svg.parentNode.removeChild(svg);
        svg.removeEventListener('mousedown', handleMouseDown, true);
        window.removeEventListener('mouseup', handleMouseUp, true);
        window.removeEventListener('mousemove', handleMouseMove, true);
    };

    var handleMouseMove = function (event) {
        if (!down) return;

        var r = svg.getBoundingClientRect();
        var x = event.clientX - r.left;
        var y = event.clientY - r.top;

        //rotate
        var dX = x - position.x;
        var dY = y - position.y;
        var angle = Math.atan2(dX, dY) * -180.0 / Math.PI + 90.0;

        //round to 5 DEG
        angle = Math.round(angle / 5.0) * 5.0
        position.angle = 360.0 - angle + 90;

        g.setAttribute('transform', 'rotate(' + angle + ' ' + position.x + ' ' + position.y + ')');
    }

    //this._canvas.parentNode.appendChild(svg);
    document.documentElement.appendChild(svg)
    svg.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('mousemove', handleMouseMove, true);

    this.stopClipping = function() {
        svg.parentNode.removeChild(svg);
        svg.removeEventListener('mousedown', handleMouseDown, true);
        window.removeEventListener('mouseup', handleMouseUp, true);
        window.removeEventListener('mousemove', handleMouseMove, true);
        //clear also itself
        viewer.stopClipping = function() {};
    };
};

/**
* This method is only active when interactive clipping is active. It stops interactive clipping operation.
* 
* @function xViewer#stopClipping
*/
//this is only a placeholder. It is actually created only when interactive clipping is active.
xViewer.prototype.stopClipping = function() {};

/**
* This method will cancel any clipping plane if it is defined. Use {@link xViewer#clip clip()} 
* method to define clipping by point and normal of the plane or interactively if you call it with no arguments.
* @function xViewer#unclip
* @fires xViewer#unclipped
*/
xViewer.prototype.unclip = function () {
    this.clippingPlane = [0, 0, 0, 0];
    /**
      * Occurs when clipping of the model is dismissed. This event has empty object.
      *
      * @event xViewer#unclipped
      * @type {object}
      */
    this._fire('unclipped', {});
};

/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var WebGLUtils=function(){var makeFailHTML=function(msg){return''+'<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>'+'<td align="center">'+'<div style="display: table-cell; vertical-align: middle;">'+'<div style="">'+msg+'</div>'+'</div>'+'</td></tr></table>';};var GET_A_WEBGL_BROWSER=''+'This page requires a browser that supports WebGL.<br/>'+'<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';var OTHER_PROBLEM=''+"It doesn't appear your computer can support WebGL.<br/>"+'<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';var setupWebGL=function(canvas,opt_attribs,opt_onError){function handleCreationError(msg){var container=canvas.parentNode;if(container){var str=window.WebGLRenderingContext?OTHER_PROBLEM:GET_A_WEBGL_BROWSER;if(msg){str+="<br/><br/>Status: "+msg;}
container.innerHTML=makeFailHTML(str);}};opt_onError=opt_onError||handleCreationError;if(canvas.addEventListener){canvas.addEventListener("webglcontextcreationerror",function(event){opt_onError(event.statusMessage);},false);}
var context=create3DContext(canvas,opt_attribs);if(!context){if(!window.WebGLRenderingContext){opt_onError("");}}
return context;};var create3DContext=function(canvas,opt_attribs){var names=["webgl","experimental-webgl","webkit-3d","moz-webgl"];var context=null;for(var ii=0;ii<names.length;++ii){try{context=canvas.getContext(names[ii],opt_attribs);}catch(e){}
if(context){break;}}
return context;}
return{create3DContext:create3DContext,setupWebGL:setupWebGL};}();window.requestAnimFrame=(function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(callback,element){window.setTimeout(callback,1000/60);};})();/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.2.2
 */

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

(function(_global){"use strict";var shim={};if(typeof(exports)==='undefined'){if(typeof define=='function'&&typeof define.amd=='object'&&define.amd){shim.exports={};define(function(){return shim.exports;});}else{shim.exports=typeof(window)!=='undefined'?window:_global;}}
else{shim.exports=exports;}
(function(exports){if(!GLMAT_EPSILON){var GLMAT_EPSILON=0.000001;}
if(!GLMAT_ARRAY_TYPE){var GLMAT_ARRAY_TYPE=(typeof Float32Array!=='undefined')?Float32Array:Array;}
if(!GLMAT_RANDOM){var GLMAT_RANDOM=Math.random;}
var glMatrix={};glMatrix.setMatrixArrayType=function(type){GLMAT_ARRAY_TYPE=type;}
if(typeof(exports)!=='undefined'){exports.glMatrix=glMatrix;}
var degree=Math.PI/180;glMatrix.toRadian=function(a){return a*degree;};var vec2={};vec2.create=function(){var out=new GLMAT_ARRAY_TYPE(2);out[0]=0;out[1]=0;return out;};vec2.clone=function(a){var out=new GLMAT_ARRAY_TYPE(2);out[0]=a[0];out[1]=a[1];return out;};vec2.fromValues=function(x,y){var out=new GLMAT_ARRAY_TYPE(2);out[0]=x;out[1]=y;return out;};vec2.copy=function(out,a){out[0]=a[0];out[1]=a[1];return out;};vec2.set=function(out,x,y){out[0]=x;out[1]=y;return out;};vec2.add=function(out,a,b){out[0]=a[0]+b[0];out[1]=a[1]+b[1];return out;};vec2.subtract=function(out,a,b){out[0]=a[0]-b[0];out[1]=a[1]-b[1];return out;};vec2.sub=vec2.subtract;vec2.multiply=function(out,a,b){out[0]=a[0]*b[0];out[1]=a[1]*b[1];return out;};vec2.mul=vec2.multiply;vec2.divide=function(out,a,b){out[0]=a[0]/b[0];out[1]=a[1]/b[1];return out;};vec2.div=vec2.divide;vec2.min=function(out,a,b){out[0]=Math.min(a[0],b[0]);out[1]=Math.min(a[1],b[1]);return out;};vec2.max=function(out,a,b){out[0]=Math.max(a[0],b[0]);out[1]=Math.max(a[1],b[1]);return out;};vec2.scale=function(out,a,b){out[0]=a[0]*b;out[1]=a[1]*b;return out;};vec2.scaleAndAdd=function(out,a,b,scale){out[0]=a[0]+(b[0]*scale);out[1]=a[1]+(b[1]*scale);return out;};vec2.distance=function(a,b){var x=b[0]-a[0],y=b[1]-a[1];return Math.sqrt(x*x+y*y);};vec2.dist=vec2.distance;vec2.squaredDistance=function(a,b){var x=b[0]-a[0],y=b[1]-a[1];return x*x+y*y;};vec2.sqrDist=vec2.squaredDistance;vec2.length=function(a){var x=a[0],y=a[1];return Math.sqrt(x*x+y*y);};vec2.len=vec2.length;vec2.squaredLength=function(a){var x=a[0],y=a[1];return x*x+y*y;};vec2.sqrLen=vec2.squaredLength;vec2.negate=function(out,a){out[0]=-a[0];out[1]=-a[1];return out;};vec2.inverse=function(out,a){out[0]=1.0/a[0];out[1]=1.0/a[1];return out;};vec2.normalize=function(out,a){var x=a[0],y=a[1];var len=x*x+y*y;if(len>0){len=1/Math.sqrt(len);out[0]=a[0]*len;out[1]=a[1]*len;}
return out;};vec2.dot=function(a,b){return a[0]*b[0]+a[1]*b[1];};vec2.cross=function(out,a,b){var z=a[0]*b[1]-a[1]*b[0];out[0]=out[1]=0;out[2]=z;return out;};vec2.lerp=function(out,a,b,t){var ax=a[0],ay=a[1];out[0]=ax+t*(b[0]-ax);out[1]=ay+t*(b[1]-ay);return out;};vec2.random=function(out,scale){scale=scale||1.0;var r=GLMAT_RANDOM()*2.0*Math.PI;out[0]=Math.cos(r)*scale;out[1]=Math.sin(r)*scale;return out;};vec2.transformMat2=function(out,a,m){var x=a[0],y=a[1];out[0]=m[0]*x+m[2]*y;out[1]=m[1]*x+m[3]*y;return out;};vec2.transformMat2d=function(out,a,m){var x=a[0],y=a[1];out[0]=m[0]*x+m[2]*y+m[4];out[1]=m[1]*x+m[3]*y+m[5];return out;};vec2.transformMat3=function(out,a,m){var x=a[0],y=a[1];out[0]=m[0]*x+m[3]*y+m[6];out[1]=m[1]*x+m[4]*y+m[7];return out;};vec2.transformMat4=function(out,a,m){var x=a[0],y=a[1];out[0]=m[0]*x+m[4]*y+m[12];out[1]=m[1]*x+m[5]*y+m[13];return out;};vec2.forEach=(function(){var vec=vec2.create();return function(a,stride,offset,count,fn,arg){var i,l;if(!stride){stride=2;}
if(!offset){offset=0;}
if(count){l=Math.min((count*stride)+offset,a.length);}else{l=a.length;}
for(i=offset;i<l;i+=stride){vec[0]=a[i];vec[1]=a[i+1];fn(vec,vec,arg);a[i]=vec[0];a[i+1]=vec[1];}
return a;};})();vec2.str=function(a){return'vec2('+a[0]+', '+a[1]+')';};if(typeof(exports)!=='undefined'){exports.vec2=vec2;};_global.vec3={};vec3.create=function(){var out=new GLMAT_ARRAY_TYPE(3);out[0]=0;out[1]=0;out[2]=0;return out;};vec3.clone=function(a){var out=new GLMAT_ARRAY_TYPE(3);out[0]=a[0];out[1]=a[1];out[2]=a[2];return out;};vec3.fromValues=function(x,y,z){var out=new GLMAT_ARRAY_TYPE(3);out[0]=x;out[1]=y;out[2]=z;return out;};vec3.copy=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=a[2];return out;};vec3.set=function(out,x,y,z){out[0]=x;out[1]=y;out[2]=z;return out;};vec3.add=function(out,a,b){out[0]=a[0]+b[0];out[1]=a[1]+b[1];out[2]=a[2]+b[2];return out;};vec3.subtract=function(out,a,b){out[0]=a[0]-b[0];out[1]=a[1]-b[1];out[2]=a[2]-b[2];return out;};vec3.sub=vec3.subtract;vec3.multiply=function(out,a,b){out[0]=a[0]*b[0];out[1]=a[1]*b[1];out[2]=a[2]*b[2];return out;};vec3.mul=vec3.multiply;vec3.divide=function(out,a,b){out[0]=a[0]/b[0];out[1]=a[1]/b[1];out[2]=a[2]/b[2];return out;};vec3.div=vec3.divide;vec3.min=function(out,a,b){out[0]=Math.min(a[0],b[0]);out[1]=Math.min(a[1],b[1]);out[2]=Math.min(a[2],b[2]);return out;};vec3.max=function(out,a,b){out[0]=Math.max(a[0],b[0]);out[1]=Math.max(a[1],b[1]);out[2]=Math.max(a[2],b[2]);return out;};vec3.scale=function(out,a,b){out[0]=a[0]*b;out[1]=a[1]*b;out[2]=a[2]*b;return out;};vec3.scaleAndAdd=function(out,a,b,scale){out[0]=a[0]+(b[0]*scale);out[1]=a[1]+(b[1]*scale);out[2]=a[2]+(b[2]*scale);return out;};vec3.distance=function(a,b){var x=b[0]-a[0],y=b[1]-a[1],z=b[2]-a[2];return Math.sqrt(x*x+y*y+z*z);};vec3.dist=vec3.distance;vec3.squaredDistance=function(a,b){var x=b[0]-a[0],y=b[1]-a[1],z=b[2]-a[2];return x*x+y*y+z*z;};vec3.sqrDist=vec3.squaredDistance;vec3.length=function(a){var x=a[0],y=a[1],z=a[2];return Math.sqrt(x*x+y*y+z*z);};vec3.len=vec3.length;vec3.squaredLength=function(a){var x=a[0],y=a[1],z=a[2];return x*x+y*y+z*z;};vec3.sqrLen=vec3.squaredLength;vec3.negate=function(out,a){out[0]=-a[0];out[1]=-a[1];out[2]=-a[2];return out;};vec3.inverse=function(out,a){out[0]=1.0/a[0];out[1]=1.0/a[1];out[2]=1.0/a[2];return out;};vec3.normalize=function(out,a){var x=a[0],y=a[1],z=a[2];var len=x*x+y*y+z*z;if(len>0){len=1/Math.sqrt(len);out[0]=a[0]*len;out[1]=a[1]*len;out[2]=a[2]*len;}
return out;};vec3.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];};vec3.cross=function(out,a,b){var ax=a[0],ay=a[1],az=a[2],bx=b[0],by=b[1],bz=b[2];out[0]=ay*bz-az*by;out[1]=az*bx-ax*bz;out[2]=ax*by-ay*bx;return out;};vec3.lerp=function(out,a,b,t){var ax=a[0],ay=a[1],az=a[2];out[0]=ax+t*(b[0]-ax);out[1]=ay+t*(b[1]-ay);out[2]=az+t*(b[2]-az);return out;};vec3.random=function(out,scale){scale=scale||1.0;var r=GLMAT_RANDOM()*2.0*Math.PI;var z=(GLMAT_RANDOM()*2.0)-1.0;var zScale=Math.sqrt(1.0-z*z)*scale;out[0]=Math.cos(r)*zScale;out[1]=Math.sin(r)*zScale;out[2]=z*scale;return out;};vec3.transformMat4=function(out,a,m){var x=a[0],y=a[1],z=a[2],w=m[3]*x+m[7]*y+m[11]*z+m[15];w=w||1.0;out[0]=(m[0]*x+m[4]*y+m[8]*z+m[12])/w;out[1]=(m[1]*x+m[5]*y+m[9]*z+m[13])/w;out[2]=(m[2]*x+m[6]*y+m[10]*z+m[14])/w;return out;};vec3.transformMat3=function(out,a,m){var x=a[0],y=a[1],z=a[2];out[0]=x*m[0]+y*m[3]+z*m[6];out[1]=x*m[1]+y*m[4]+z*m[7];out[2]=x*m[2]+y*m[5]+z*m[8];return out;};vec3.transformQuat=function(out,a,q){var x=a[0],y=a[1],z=a[2],qx=q[0],qy=q[1],qz=q[2],qw=q[3],ix=qw*x+qy*z-qz*y,iy=qw*y+qz*x-qx*z,iz=qw*z+qx*y-qy*x,iw=-qx*x-qy*y-qz*z;out[0]=ix*qw+iw*-qx+iy*-qz-iz*-qy;out[1]=iy*qw+iw*-qy+iz*-qx-ix*-qz;out[2]=iz*qw+iw*-qz+ix*-qy-iy*-qx;return out;};vec3.rotateX=function(out,a,b,c){var p=[],r=[];p[0]=a[0]-b[0];p[1]=a[1]-b[1];p[2]=a[2]-b[2];r[0]=p[0];r[1]=p[1]*Math.cos(c)-p[2]*Math.sin(c);r[2]=p[1]*Math.sin(c)+p[2]*Math.cos(c);out[0]=r[0]+b[0];out[1]=r[1]+b[1];out[2]=r[2]+b[2];return out;};vec3.rotateY=function(out,a,b,c){var p=[],r=[];p[0]=a[0]-b[0];p[1]=a[1]-b[1];p[2]=a[2]-b[2];r[0]=p[2]*Math.sin(c)+p[0]*Math.cos(c);r[1]=p[1];r[2]=p[2]*Math.cos(c)-p[0]*Math.sin(c);out[0]=r[0]+b[0];out[1]=r[1]+b[1];out[2]=r[2]+b[2];return out;};vec3.rotateZ=function(out,a,b,c){var p=[],r=[];p[0]=a[0]-b[0];p[1]=a[1]-b[1];p[2]=a[2]-b[2];r[0]=p[0]*Math.cos(c)-p[1]*Math.sin(c);r[1]=p[0]*Math.sin(c)+p[1]*Math.cos(c);r[2]=p[2];out[0]=r[0]+b[0];out[1]=r[1]+b[1];out[2]=r[2]+b[2];return out;};vec3.forEach=(function(){var vec=vec3.create();return function(a,stride,offset,count,fn,arg){var i,l;if(!stride){stride=3;}
if(!offset){offset=0;}
if(count){l=Math.min((count*stride)+offset,a.length);}else{l=a.length;}
for(i=offset;i<l;i+=stride){vec[0]=a[i];vec[1]=a[i+1];vec[2]=a[i+2];fn(vec,vec,arg);a[i]=vec[0];a[i+1]=vec[1];a[i+2]=vec[2];}
return a;};})();vec3.str=function(a){return'vec3('+a[0]+', '+a[1]+', '+a[2]+')';};if(typeof(exports)!=='undefined'){exports.vec3=vec3;};var vec4={};vec4.create=function(){var out=new GLMAT_ARRAY_TYPE(4);out[0]=0;out[1]=0;out[2]=0;out[3]=0;return out;};vec4.clone=function(a){var out=new GLMAT_ARRAY_TYPE(4);out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];return out;};vec4.fromValues=function(x,y,z,w){var out=new GLMAT_ARRAY_TYPE(4);out[0]=x;out[1]=y;out[2]=z;out[3]=w;return out;};vec4.copy=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];return out;};vec4.set=function(out,x,y,z,w){out[0]=x;out[1]=y;out[2]=z;out[3]=w;return out;};vec4.add=function(out,a,b){out[0]=a[0]+b[0];out[1]=a[1]+b[1];out[2]=a[2]+b[2];out[3]=a[3]+b[3];return out;};vec4.subtract=function(out,a,b){out[0]=a[0]-b[0];out[1]=a[1]-b[1];out[2]=a[2]-b[2];out[3]=a[3]-b[3];return out;};vec4.sub=vec4.subtract;vec4.multiply=function(out,a,b){out[0]=a[0]*b[0];out[1]=a[1]*b[1];out[2]=a[2]*b[2];out[3]=a[3]*b[3];return out;};vec4.mul=vec4.multiply;vec4.divide=function(out,a,b){out[0]=a[0]/b[0];out[1]=a[1]/b[1];out[2]=a[2]/b[2];out[3]=a[3]/b[3];return out;};vec4.div=vec4.divide;vec4.min=function(out,a,b){out[0]=Math.min(a[0],b[0]);out[1]=Math.min(a[1],b[1]);out[2]=Math.min(a[2],b[2]);out[3]=Math.min(a[3],b[3]);return out;};vec4.max=function(out,a,b){out[0]=Math.max(a[0],b[0]);out[1]=Math.max(a[1],b[1]);out[2]=Math.max(a[2],b[2]);out[3]=Math.max(a[3],b[3]);return out;};vec4.scale=function(out,a,b){out[0]=a[0]*b;out[1]=a[1]*b;out[2]=a[2]*b;out[3]=a[3]*b;return out;};vec4.scaleAndAdd=function(out,a,b,scale){out[0]=a[0]+(b[0]*scale);out[1]=a[1]+(b[1]*scale);out[2]=a[2]+(b[2]*scale);out[3]=a[3]+(b[3]*scale);return out;};vec4.distance=function(a,b){var x=b[0]-a[0],y=b[1]-a[1],z=b[2]-a[2],w=b[3]-a[3];return Math.sqrt(x*x+y*y+z*z+w*w);};vec4.dist=vec4.distance;vec4.squaredDistance=function(a,b){var x=b[0]-a[0],y=b[1]-a[1],z=b[2]-a[2],w=b[3]-a[3];return x*x+y*y+z*z+w*w;};vec4.sqrDist=vec4.squaredDistance;vec4.length=function(a){var x=a[0],y=a[1],z=a[2],w=a[3];return Math.sqrt(x*x+y*y+z*z+w*w);};vec4.len=vec4.length;vec4.squaredLength=function(a){var x=a[0],y=a[1],z=a[2],w=a[3];return x*x+y*y+z*z+w*w;};vec4.sqrLen=vec4.squaredLength;vec4.negate=function(out,a){out[0]=-a[0];out[1]=-a[1];out[2]=-a[2];out[3]=-a[3];return out;};vec4.inverse=function(out,a){out[0]=1.0/a[0];out[1]=1.0/a[1];out[2]=1.0/a[2];out[3]=1.0/a[3];return out;};vec4.normalize=function(out,a){var x=a[0],y=a[1],z=a[2],w=a[3];var len=x*x+y*y+z*z+w*w;if(len>0){len=1/Math.sqrt(len);out[0]=a[0]*len;out[1]=a[1]*len;out[2]=a[2]*len;out[3]=a[3]*len;}
return out;};vec4.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3];};vec4.lerp=function(out,a,b,t){var ax=a[0],ay=a[1],az=a[2],aw=a[3];out[0]=ax+t*(b[0]-ax);out[1]=ay+t*(b[1]-ay);out[2]=az+t*(b[2]-az);out[3]=aw+t*(b[3]-aw);return out;};vec4.random=function(out,scale){scale=scale||1.0;out[0]=GLMAT_RANDOM();out[1]=GLMAT_RANDOM();out[2]=GLMAT_RANDOM();out[3]=GLMAT_RANDOM();vec4.normalize(out,out);vec4.scale(out,out,scale);return out;};vec4.transformMat4=function(out,a,m){var x=a[0],y=a[1],z=a[2],w=a[3];out[0]=m[0]*x+m[4]*y+m[8]*z+m[12]*w;out[1]=m[1]*x+m[5]*y+m[9]*z+m[13]*w;out[2]=m[2]*x+m[6]*y+m[10]*z+m[14]*w;out[3]=m[3]*x+m[7]*y+m[11]*z+m[15]*w;return out;};vec4.transformQuat=function(out,a,q){var x=a[0],y=a[1],z=a[2],qx=q[0],qy=q[1],qz=q[2],qw=q[3],ix=qw*x+qy*z-qz*y,iy=qw*y+qz*x-qx*z,iz=qw*z+qx*y-qy*x,iw=-qx*x-qy*y-qz*z;out[0]=ix*qw+iw*-qx+iy*-qz-iz*-qy;out[1]=iy*qw+iw*-qy+iz*-qx-ix*-qz;out[2]=iz*qw+iw*-qz+ix*-qy-iy*-qx;return out;};vec4.forEach=(function(){var vec=vec4.create();return function(a,stride,offset,count,fn,arg){var i,l;if(!stride){stride=4;}
if(!offset){offset=0;}
if(count){l=Math.min((count*stride)+offset,a.length);}else{l=a.length;}
for(i=offset;i<l;i+=stride){vec[0]=a[i];vec[1]=a[i+1];vec[2]=a[i+2];vec[3]=a[i+3];fn(vec,vec,arg);a[i]=vec[0];a[i+1]=vec[1];a[i+2]=vec[2];a[i+3]=vec[3];}
return a;};})();vec4.str=function(a){return'vec4('+a[0]+', '+a[1]+', '+a[2]+', '+a[3]+')';};if(typeof(exports)!=='undefined'){exports.vec4=vec4;};var mat2={};mat2.create=function(){var out=new GLMAT_ARRAY_TYPE(4);out[0]=1;out[1]=0;out[2]=0;out[3]=1;return out;};mat2.clone=function(a){var out=new GLMAT_ARRAY_TYPE(4);out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];return out;};mat2.copy=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];return out;};mat2.identity=function(out){out[0]=1;out[1]=0;out[2]=0;out[3]=1;return out;};mat2.transpose=function(out,a){if(out===a){var a1=a[1];out[1]=a[2];out[2]=a1;}else{out[0]=a[0];out[1]=a[2];out[2]=a[1];out[3]=a[3];}
return out;};mat2.invert=function(out,a){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],det=a0*a3-a2*a1;if(!det){return null;}
det=1.0/det;out[0]=a3*det;out[1]=-a1*det;out[2]=-a2*det;out[3]=a0*det;return out;};mat2.adjoint=function(out,a){var a0=a[0];out[0]=a[3];out[1]=-a[1];out[2]=-a[2];out[3]=a0;return out;};mat2.determinant=function(a){return a[0]*a[3]-a[2]*a[1];};mat2.multiply=function(out,a,b){var a0=a[0],a1=a[1],a2=a[2],a3=a[3];var b0=b[0],b1=b[1],b2=b[2],b3=b[3];out[0]=a0*b0+a2*b1;out[1]=a1*b0+a3*b1;out[2]=a0*b2+a2*b3;out[3]=a1*b2+a3*b3;return out;};mat2.mul=mat2.multiply;mat2.rotate=function(out,a,rad){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],s=Math.sin(rad),c=Math.cos(rad);out[0]=a0*c+a2*s;out[1]=a1*c+a3*s;out[2]=a0*-s+a2*c;out[3]=a1*-s+a3*c;return out;};mat2.scale=function(out,a,v){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],v0=v[0],v1=v[1];out[0]=a0*v0;out[1]=a1*v0;out[2]=a2*v1;out[3]=a3*v1;return out;};mat2.str=function(a){return'mat2('+a[0]+', '+a[1]+', '+a[2]+', '+a[3]+')';};mat2.frob=function(a){return(Math.sqrt(Math.pow(a[0],2)+Math.pow(a[1],2)+Math.pow(a[2],2)+Math.pow(a[3],2)))};mat2.LDU=function(L,D,U,a){L[2]=a[2]/a[0];U[0]=a[0];U[1]=a[1];U[3]=a[3]-L[2]*U[1];return[L,D,U];};if(typeof(exports)!=='undefined'){exports.mat2=mat2;};var mat2d={};mat2d.create=function(){var out=new GLMAT_ARRAY_TYPE(6);out[0]=1;out[1]=0;out[2]=0;out[3]=1;out[4]=0;out[5]=0;return out;};mat2d.clone=function(a){var out=new GLMAT_ARRAY_TYPE(6);out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[4]=a[4];out[5]=a[5];return out;};mat2d.copy=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[4]=a[4];out[5]=a[5];return out;};mat2d.identity=function(out){out[0]=1;out[1]=0;out[2]=0;out[3]=1;out[4]=0;out[5]=0;return out;};mat2d.invert=function(out,a){var aa=a[0],ab=a[1],ac=a[2],ad=a[3],atx=a[4],aty=a[5];var det=aa*ad-ab*ac;if(!det){return null;}
det=1.0/det;out[0]=ad*det;out[1]=-ab*det;out[2]=-ac*det;out[3]=aa*det;out[4]=(ac*aty-ad*atx)*det;out[5]=(ab*atx-aa*aty)*det;return out;};mat2d.determinant=function(a){return a[0]*a[3]-a[1]*a[2];};mat2d.multiply=function(out,a,b){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],a4=a[4],a5=a[5],b0=b[0],b1=b[1],b2=b[2],b3=b[3],b4=b[4],b5=b[5];out[0]=a0*b0+a2*b1;out[1]=a1*b0+a3*b1;out[2]=a0*b2+a2*b3;out[3]=a1*b2+a3*b3;out[4]=a0*b4+a2*b5+a4;out[5]=a1*b4+a3*b5+a5;return out;};mat2d.mul=mat2d.multiply;mat2d.rotate=function(out,a,rad){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],a4=a[4],a5=a[5],s=Math.sin(rad),c=Math.cos(rad);out[0]=a0*c+a2*s;out[1]=a1*c+a3*s;out[2]=a0*-s+a2*c;out[3]=a1*-s+a3*c;out[4]=a4;out[5]=a5;return out;};mat2d.scale=function(out,a,v){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],a4=a[4],a5=a[5],v0=v[0],v1=v[1];out[0]=a0*v0;out[1]=a1*v0;out[2]=a2*v1;out[3]=a3*v1;out[4]=a4;out[5]=a5;return out;};mat2d.translate=function(out,a,v){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],a4=a[4],a5=a[5],v0=v[0],v1=v[1];out[0]=a0;out[1]=a1;out[2]=a2;out[3]=a3;out[4]=a0*v0+a2*v1+a4;out[5]=a1*v0+a3*v1+a5;return out;};mat2d.str=function(a){return'mat2d('+a[0]+', '+a[1]+', '+a[2]+', '+
a[3]+', '+a[4]+', '+a[5]+')';};mat2d.frob=function(a){return(Math.sqrt(Math.pow(a[0],2)+Math.pow(a[1],2)+Math.pow(a[2],2)+Math.pow(a[3],2)+Math.pow(a[4],2)+Math.pow(a[5],2)+1))};if(typeof(exports)!=='undefined'){exports.mat2d=mat2d;};_global.mat3={};mat3.create=function(){var out=new GLMAT_ARRAY_TYPE(9);out[0]=1;out[1]=0;out[2]=0;out[3]=0;out[4]=1;out[5]=0;out[6]=0;out[7]=0;out[8]=1;return out;};mat3.fromMat4=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[4];out[4]=a[5];out[5]=a[6];out[6]=a[8];out[7]=a[9];out[8]=a[10];return out;};mat3.clone=function(a){var out=new GLMAT_ARRAY_TYPE(9);out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[4]=a[4];out[5]=a[5];out[6]=a[6];out[7]=a[7];out[8]=a[8];return out;};mat3.copy=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[4]=a[4];out[5]=a[5];out[6]=a[6];out[7]=a[7];out[8]=a[8];return out;};mat3.identity=function(out){out[0]=1;out[1]=0;out[2]=0;out[3]=0;out[4]=1;out[5]=0;out[6]=0;out[7]=0;out[8]=1;return out;};mat3.transpose=function(out,a){if(out===a){var a01=a[1],a02=a[2],a12=a[5];out[1]=a[3];out[2]=a[6];out[3]=a01;out[5]=a[7];out[6]=a02;out[7]=a12;}else{out[0]=a[0];out[1]=a[3];out[2]=a[6];out[3]=a[1];out[4]=a[4];out[5]=a[7];out[6]=a[2];out[7]=a[5];out[8]=a[8];}
return out;};mat3.invert=function(out,a){var a00=a[0],a01=a[1],a02=a[2],a10=a[3],a11=a[4],a12=a[5],a20=a[6],a21=a[7],a22=a[8],b01=a22*a11-a12*a21,b11=-a22*a10+a12*a20,b21=a21*a10-a11*a20,det=a00*b01+a01*b11+a02*b21;if(!det){return null;}
det=1.0/det;out[0]=b01*det;out[1]=(-a22*a01+a02*a21)*det;out[2]=(a12*a01-a02*a11)*det;out[3]=b11*det;out[4]=(a22*a00-a02*a20)*det;out[5]=(-a12*a00+a02*a10)*det;out[6]=b21*det;out[7]=(-a21*a00+a01*a20)*det;out[8]=(a11*a00-a01*a10)*det;return out;};mat3.adjoint=function(out,a){var a00=a[0],a01=a[1],a02=a[2],a10=a[3],a11=a[4],a12=a[5],a20=a[6],a21=a[7],a22=a[8];out[0]=(a11*a22-a12*a21);out[1]=(a02*a21-a01*a22);out[2]=(a01*a12-a02*a11);out[3]=(a12*a20-a10*a22);out[4]=(a00*a22-a02*a20);out[5]=(a02*a10-a00*a12);out[6]=(a10*a21-a11*a20);out[7]=(a01*a20-a00*a21);out[8]=(a00*a11-a01*a10);return out;};mat3.determinant=function(a){var a00=a[0],a01=a[1],a02=a[2],a10=a[3],a11=a[4],a12=a[5],a20=a[6],a21=a[7],a22=a[8];return a00*(a22*a11-a12*a21)+a01*(-a22*a10+a12*a20)+a02*(a21*a10-a11*a20);};mat3.multiply=function(out,a,b){var a00=a[0],a01=a[1],a02=a[2],a10=a[3],a11=a[4],a12=a[5],a20=a[6],a21=a[7],a22=a[8],b00=b[0],b01=b[1],b02=b[2],b10=b[3],b11=b[4],b12=b[5],b20=b[6],b21=b[7],b22=b[8];out[0]=b00*a00+b01*a10+b02*a20;out[1]=b00*a01+b01*a11+b02*a21;out[2]=b00*a02+b01*a12+b02*a22;out[3]=b10*a00+b11*a10+b12*a20;out[4]=b10*a01+b11*a11+b12*a21;out[5]=b10*a02+b11*a12+b12*a22;out[6]=b20*a00+b21*a10+b22*a20;out[7]=b20*a01+b21*a11+b22*a21;out[8]=b20*a02+b21*a12+b22*a22;return out;};mat3.mul=mat3.multiply;mat3.translate=function(out,a,v){var a00=a[0],a01=a[1],a02=a[2],a10=a[3],a11=a[4],a12=a[5],a20=a[6],a21=a[7],a22=a[8],x=v[0],y=v[1];out[0]=a00;out[1]=a01;out[2]=a02;out[3]=a10;out[4]=a11;out[5]=a12;out[6]=x*a00+y*a10+a20;out[7]=x*a01+y*a11+a21;out[8]=x*a02+y*a12+a22;return out;};mat3.rotate=function(out,a,rad){var a00=a[0],a01=a[1],a02=a[2],a10=a[3],a11=a[4],a12=a[5],a20=a[6],a21=a[7],a22=a[8],s=Math.sin(rad),c=Math.cos(rad);out[0]=c*a00+s*a10;out[1]=c*a01+s*a11;out[2]=c*a02+s*a12;out[3]=c*a10-s*a00;out[4]=c*a11-s*a01;out[5]=c*a12-s*a02;out[6]=a20;out[7]=a21;out[8]=a22;return out;};mat3.scale=function(out,a,v){var x=v[0],y=v[1];out[0]=x*a[0];out[1]=x*a[1];out[2]=x*a[2];out[3]=y*a[3];out[4]=y*a[4];out[5]=y*a[5];out[6]=a[6];out[7]=a[7];out[8]=a[8];return out;};mat3.fromMat2d=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=0;out[3]=a[2];out[4]=a[3];out[5]=0;out[6]=a[4];out[7]=a[5];out[8]=1;return out;};mat3.fromQuat=function(out,q){var x=q[0],y=q[1],z=q[2],w=q[3],x2=x+x,y2=y+y,z2=z+z,xx=x*x2,yx=y*x2,yy=y*y2,zx=z*x2,zy=z*y2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;out[0]=1-yy-zz;out[3]=yx-wz;out[6]=zx+wy;out[1]=yx+wz;out[4]=1-xx-zz;out[7]=zy-wx;out[2]=zx-wy;out[5]=zy+wx;out[8]=1-xx-yy;return out;};mat3.normalFromMat4=function(out,a){var a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15],b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32,det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!det){return null;}
det=1.0/det;out[0]=(a11*b11-a12*b10+a13*b09)*det;out[1]=(a12*b08-a10*b11-a13*b07)*det;out[2]=(a10*b10-a11*b08+a13*b06)*det;out[3]=(a02*b10-a01*b11-a03*b09)*det;out[4]=(a00*b11-a02*b08+a03*b07)*det;out[5]=(a01*b08-a00*b10-a03*b06)*det;out[6]=(a31*b05-a32*b04+a33*b03)*det;out[7]=(a32*b02-a30*b05-a33*b01)*det;out[8]=(a30*b04-a31*b02+a33*b00)*det;return out;};mat3.str=function(a){return'mat3('+a[0]+', '+a[1]+', '+a[2]+', '+
a[3]+', '+a[4]+', '+a[5]+', '+
a[6]+', '+a[7]+', '+a[8]+')';};mat3.frob=function(a){return(Math.sqrt(Math.pow(a[0],2)+Math.pow(a[1],2)+Math.pow(a[2],2)+Math.pow(a[3],2)+Math.pow(a[4],2)+Math.pow(a[5],2)+Math.pow(a[6],2)+Math.pow(a[7],2)+Math.pow(a[8],2)))};if(typeof(exports)!=='undefined'){exports.mat3=mat3;};_global.mat4={};mat4.create=function(){var out=new GLMAT_ARRAY_TYPE(16);out[0]=1;out[1]=0;out[2]=0;out[3]=0;out[4]=0;out[5]=1;out[6]=0;out[7]=0;out[8]=0;out[9]=0;out[10]=1;out[11]=0;out[12]=0;out[13]=0;out[14]=0;out[15]=1;return out;};mat4.clone=function(a){var out=new GLMAT_ARRAY_TYPE(16);out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[4]=a[4];out[5]=a[5];out[6]=a[6];out[7]=a[7];out[8]=a[8];out[9]=a[9];out[10]=a[10];out[11]=a[11];out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];return out;};mat4.copy=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[4]=a[4];out[5]=a[5];out[6]=a[6];out[7]=a[7];out[8]=a[8];out[9]=a[9];out[10]=a[10];out[11]=a[11];out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];return out;};mat4.identity=function(out){out[0]=1;out[1]=0;out[2]=0;out[3]=0;out[4]=0;out[5]=1;out[6]=0;out[7]=0;out[8]=0;out[9]=0;out[10]=1;out[11]=0;out[12]=0;out[13]=0;out[14]=0;out[15]=1;return out;};mat4.transpose=function(out,a){if(out===a){var a01=a[1],a02=a[2],a03=a[3],a12=a[6],a13=a[7],a23=a[11];out[1]=a[4];out[2]=a[8];out[3]=a[12];out[4]=a01;out[6]=a[9];out[7]=a[13];out[8]=a02;out[9]=a12;out[11]=a[14];out[12]=a03;out[13]=a13;out[14]=a23;}else{out[0]=a[0];out[1]=a[4];out[2]=a[8];out[3]=a[12];out[4]=a[1];out[5]=a[5];out[6]=a[9];out[7]=a[13];out[8]=a[2];out[9]=a[6];out[10]=a[10];out[11]=a[14];out[12]=a[3];out[13]=a[7];out[14]=a[11];out[15]=a[15];}
return out;};mat4.invert=function(out,a){var a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15],b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32,det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!det){return null;}
det=1.0/det;out[0]=(a11*b11-a12*b10+a13*b09)*det;out[1]=(a02*b10-a01*b11-a03*b09)*det;out[2]=(a31*b05-a32*b04+a33*b03)*det;out[3]=(a22*b04-a21*b05-a23*b03)*det;out[4]=(a12*b08-a10*b11-a13*b07)*det;out[5]=(a00*b11-a02*b08+a03*b07)*det;out[6]=(a32*b02-a30*b05-a33*b01)*det;out[7]=(a20*b05-a22*b02+a23*b01)*det;out[8]=(a10*b10-a11*b08+a13*b06)*det;out[9]=(a01*b08-a00*b10-a03*b06)*det;out[10]=(a30*b04-a31*b02+a33*b00)*det;out[11]=(a21*b02-a20*b04-a23*b00)*det;out[12]=(a11*b07-a10*b09-a12*b06)*det;out[13]=(a00*b09-a01*b07+a02*b06)*det;out[14]=(a31*b01-a30*b03-a32*b00)*det;out[15]=(a20*b03-a21*b01+a22*b00)*det;return out;};mat4.adjoint=function(out,a){var a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15];out[0]=(a11*(a22*a33-a23*a32)-a21*(a12*a33-a13*a32)+a31*(a12*a23-a13*a22));out[1]=-(a01*(a22*a33-a23*a32)-a21*(a02*a33-a03*a32)+a31*(a02*a23-a03*a22));out[2]=(a01*(a12*a33-a13*a32)-a11*(a02*a33-a03*a32)+a31*(a02*a13-a03*a12));out[3]=-(a01*(a12*a23-a13*a22)-a11*(a02*a23-a03*a22)+a21*(a02*a13-a03*a12));out[4]=-(a10*(a22*a33-a23*a32)-a20*(a12*a33-a13*a32)+a30*(a12*a23-a13*a22));out[5]=(a00*(a22*a33-a23*a32)-a20*(a02*a33-a03*a32)+a30*(a02*a23-a03*a22));out[6]=-(a00*(a12*a33-a13*a32)-a10*(a02*a33-a03*a32)+a30*(a02*a13-a03*a12));out[7]=(a00*(a12*a23-a13*a22)-a10*(a02*a23-a03*a22)+a20*(a02*a13-a03*a12));out[8]=(a10*(a21*a33-a23*a31)-a20*(a11*a33-a13*a31)+a30*(a11*a23-a13*a21));out[9]=-(a00*(a21*a33-a23*a31)-a20*(a01*a33-a03*a31)+a30*(a01*a23-a03*a21));out[10]=(a00*(a11*a33-a13*a31)-a10*(a01*a33-a03*a31)+a30*(a01*a13-a03*a11));out[11]=-(a00*(a11*a23-a13*a21)-a10*(a01*a23-a03*a21)+a20*(a01*a13-a03*a11));out[12]=-(a10*(a21*a32-a22*a31)-a20*(a11*a32-a12*a31)+a30*(a11*a22-a12*a21));out[13]=(a00*(a21*a32-a22*a31)-a20*(a01*a32-a02*a31)+a30*(a01*a22-a02*a21));out[14]=-(a00*(a11*a32-a12*a31)-a10*(a01*a32-a02*a31)+a30*(a01*a12-a02*a11));out[15]=(a00*(a11*a22-a12*a21)-a10*(a01*a22-a02*a21)+a20*(a01*a12-a02*a11));return out;};mat4.determinant=function(a){var a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15],b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;return b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;};mat4.multiply=function(out,a,b){var a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15];var b0=b[0],b1=b[1],b2=b[2],b3=b[3];out[0]=b0*a00+b1*a10+b2*a20+b3*a30;out[1]=b0*a01+b1*a11+b2*a21+b3*a31;out[2]=b0*a02+b1*a12+b2*a22+b3*a32;out[3]=b0*a03+b1*a13+b2*a23+b3*a33;b0=b[4];b1=b[5];b2=b[6];b3=b[7];out[4]=b0*a00+b1*a10+b2*a20+b3*a30;out[5]=b0*a01+b1*a11+b2*a21+b3*a31;out[6]=b0*a02+b1*a12+b2*a22+b3*a32;out[7]=b0*a03+b1*a13+b2*a23+b3*a33;b0=b[8];b1=b[9];b2=b[10];b3=b[11];out[8]=b0*a00+b1*a10+b2*a20+b3*a30;out[9]=b0*a01+b1*a11+b2*a21+b3*a31;out[10]=b0*a02+b1*a12+b2*a22+b3*a32;out[11]=b0*a03+b1*a13+b2*a23+b3*a33;b0=b[12];b1=b[13];b2=b[14];b3=b[15];out[12]=b0*a00+b1*a10+b2*a20+b3*a30;out[13]=b0*a01+b1*a11+b2*a21+b3*a31;out[14]=b0*a02+b1*a12+b2*a22+b3*a32;out[15]=b0*a03+b1*a13+b2*a23+b3*a33;return out;};mat4.mul=mat4.multiply;mat4.translate=function(out,a,v){var x=v[0],y=v[1],z=v[2],a00,a01,a02,a03,a10,a11,a12,a13,a20,a21,a22,a23;if(a===out){out[12]=a[0]*x+a[4]*y+a[8]*z+a[12];out[13]=a[1]*x+a[5]*y+a[9]*z+a[13];out[14]=a[2]*x+a[6]*y+a[10]*z+a[14];out[15]=a[3]*x+a[7]*y+a[11]*z+a[15];}else{a00=a[0];a01=a[1];a02=a[2];a03=a[3];a10=a[4];a11=a[5];a12=a[6];a13=a[7];a20=a[8];a21=a[9];a22=a[10];a23=a[11];out[0]=a00;out[1]=a01;out[2]=a02;out[3]=a03;out[4]=a10;out[5]=a11;out[6]=a12;out[7]=a13;out[8]=a20;out[9]=a21;out[10]=a22;out[11]=a23;out[12]=a00*x+a10*y+a20*z+a[12];out[13]=a01*x+a11*y+a21*z+a[13];out[14]=a02*x+a12*y+a22*z+a[14];out[15]=a03*x+a13*y+a23*z+a[15];}
return out;};mat4.scale=function(out,a,v){var x=v[0],y=v[1],z=v[2];out[0]=a[0]*x;out[1]=a[1]*x;out[2]=a[2]*x;out[3]=a[3]*x;out[4]=a[4]*y;out[5]=a[5]*y;out[6]=a[6]*y;out[7]=a[7]*y;out[8]=a[8]*z;out[9]=a[9]*z;out[10]=a[10]*z;out[11]=a[11]*z;out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];return out;};mat4.rotate=function(out,a,rad,axis){var x=axis[0],y=axis[1],z=axis[2],len=Math.sqrt(x*x+y*y+z*z),s,c,t,a00,a01,a02,a03,a10,a11,a12,a13,a20,a21,a22,a23,b00,b01,b02,b10,b11,b12,b20,b21,b22;if(Math.abs(len)<GLMAT_EPSILON){return null;}
len=1/len;x*=len;y*=len;z*=len;s=Math.sin(rad);c=Math.cos(rad);t=1-c;a00=a[0];a01=a[1];a02=a[2];a03=a[3];a10=a[4];a11=a[5];a12=a[6];a13=a[7];a20=a[8];a21=a[9];a22=a[10];a23=a[11];b00=x*x*t+c;b01=y*x*t+z*s;b02=z*x*t-y*s;b10=x*y*t-z*s;b11=y*y*t+c;b12=z*y*t+x*s;b20=x*z*t+y*s;b21=y*z*t-x*s;b22=z*z*t+c;out[0]=a00*b00+a10*b01+a20*b02;out[1]=a01*b00+a11*b01+a21*b02;out[2]=a02*b00+a12*b01+a22*b02;out[3]=a03*b00+a13*b01+a23*b02;out[4]=a00*b10+a10*b11+a20*b12;out[5]=a01*b10+a11*b11+a21*b12;out[6]=a02*b10+a12*b11+a22*b12;out[7]=a03*b10+a13*b11+a23*b12;out[8]=a00*b20+a10*b21+a20*b22;out[9]=a01*b20+a11*b21+a21*b22;out[10]=a02*b20+a12*b21+a22*b22;out[11]=a03*b20+a13*b21+a23*b22;if(a!==out){out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];}
return out;};mat4.rotateX=function(out,a,rad){var s=Math.sin(rad),c=Math.cos(rad),a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11];if(a!==out){out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];}
out[4]=a10*c+a20*s;out[5]=a11*c+a21*s;out[6]=a12*c+a22*s;out[7]=a13*c+a23*s;out[8]=a20*c-a10*s;out[9]=a21*c-a11*s;out[10]=a22*c-a12*s;out[11]=a23*c-a13*s;return out;};mat4.rotateY=function(out,a,rad){var s=Math.sin(rad),c=Math.cos(rad),a00=a[0],a01=a[1],a02=a[2],a03=a[3],a20=a[8],a21=a[9],a22=a[10],a23=a[11];if(a!==out){out[4]=a[4];out[5]=a[5];out[6]=a[6];out[7]=a[7];out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];}
out[0]=a00*c-a20*s;out[1]=a01*c-a21*s;out[2]=a02*c-a22*s;out[3]=a03*c-a23*s;out[8]=a00*s+a20*c;out[9]=a01*s+a21*c;out[10]=a02*s+a22*c;out[11]=a03*s+a23*c;return out;};mat4.rotateZ=function(out,a,rad){var s=Math.sin(rad),c=Math.cos(rad),a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7];if(a!==out){out[8]=a[8];out[9]=a[9];out[10]=a[10];out[11]=a[11];out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];}
out[0]=a00*c+a10*s;out[1]=a01*c+a11*s;out[2]=a02*c+a12*s;out[3]=a03*c+a13*s;out[4]=a10*c-a00*s;out[5]=a11*c-a01*s;out[6]=a12*c-a02*s;out[7]=a13*c-a03*s;return out;};mat4.fromRotationTranslation=function(out,q,v){var x=q[0],y=q[1],z=q[2],w=q[3],x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;out[0]=1-(yy+zz);out[1]=xy+wz;out[2]=xz-wy;out[3]=0;out[4]=xy-wz;out[5]=1-(xx+zz);out[6]=yz+wx;out[7]=0;out[8]=xz+wy;out[9]=yz-wx;out[10]=1-(xx+yy);out[11]=0;out[12]=v[0];out[13]=v[1];out[14]=v[2];out[15]=1;return out;};mat4.fromQuat=function(out,q){var x=q[0],y=q[1],z=q[2],w=q[3],x2=x+x,y2=y+y,z2=z+z,xx=x*x2,yx=y*x2,yy=y*y2,zx=z*x2,zy=z*y2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;out[0]=1-yy-zz;out[1]=yx+wz;out[2]=zx-wy;out[3]=0;out[4]=yx-wz;out[5]=1-xx-zz;out[6]=zy+wx;out[7]=0;out[8]=zx+wy;out[9]=zy-wx;out[10]=1-xx-yy;out[11]=0;out[12]=0;out[13]=0;out[14]=0;out[15]=1;return out;};mat4.frustum=function(out,left,right,bottom,top,near,far){var rl=1/(right-left),tb=1/(top-bottom),nf=1/(near-far);out[0]=(near*2)*rl;out[1]=0;out[2]=0;out[3]=0;out[4]=0;out[5]=(near*2)*tb;out[6]=0;out[7]=0;out[8]=(right+left)*rl;out[9]=(top+bottom)*tb;out[10]=(far+near)*nf;out[11]=-1;out[12]=0;out[13]=0;out[14]=(far*near*2)*nf;out[15]=0;return out;};mat4.perspective=function(out,fovy,aspect,near,far){var f=1.0/Math.tan(fovy/2),nf=1/(near-far);out[0]=f/aspect;out[1]=0;out[2]=0;out[3]=0;out[4]=0;out[5]=f;out[6]=0;out[7]=0;out[8]=0;out[9]=0;out[10]=(far+near)*nf;out[11]=-1;out[12]=0;out[13]=0;out[14]=(2*far*near)*nf;out[15]=0;return out;};mat4.ortho=function(out,left,right,bottom,top,near,far){var lr=1/(left-right),bt=1/(bottom-top),nf=1/(near-far);out[0]=-2*lr;out[1]=0;out[2]=0;out[3]=0;out[4]=0;out[5]=-2*bt;out[6]=0;out[7]=0;out[8]=0;out[9]=0;out[10]=2*nf;out[11]=0;out[12]=(left+right)*lr;out[13]=(top+bottom)*bt;out[14]=(far+near)*nf;out[15]=1;return out;};mat4.lookAt=function(out,eye,center,up){var x0,x1,x2,y0,y1,y2,z0,z1,z2,len,eyex=eye[0],eyey=eye[1],eyez=eye[2],upx=up[0],upy=up[1],upz=up[2],centerx=center[0],centery=center[1],centerz=center[2];if(Math.abs(eyex-centerx)<GLMAT_EPSILON&&Math.abs(eyey-centery)<GLMAT_EPSILON&&Math.abs(eyez-centerz)<GLMAT_EPSILON){return mat4.identity(out);}
z0=eyex-centerx;z1=eyey-centery;z2=eyez-centerz;len=1/Math.sqrt(z0*z0+z1*z1+z2*z2);z0*=len;z1*=len;z2*=len;x0=upy*z2-upz*z1;x1=upz*z0-upx*z2;x2=upx*z1-upy*z0;len=Math.sqrt(x0*x0+x1*x1+x2*x2);if(!len){x0=0;x1=0;x2=0;}else{len=1/len;x0*=len;x1*=len;x2*=len;}
y0=z1*x2-z2*x1;y1=z2*x0-z0*x2;y2=z0*x1-z1*x0;len=Math.sqrt(y0*y0+y1*y1+y2*y2);if(!len){y0=0;y1=0;y2=0;}else{len=1/len;y0*=len;y1*=len;y2*=len;}
out[0]=x0;out[1]=y0;out[2]=z0;out[3]=0;out[4]=x1;out[5]=y1;out[6]=z1;out[7]=0;out[8]=x2;out[9]=y2;out[10]=z2;out[11]=0;out[12]=-(x0*eyex+x1*eyey+x2*eyez);out[13]=-(y0*eyex+y1*eyey+y2*eyez);out[14]=-(z0*eyex+z1*eyey+z2*eyez);out[15]=1;return out;};mat4.str=function(a){return'mat4('+a[0]+', '+a[1]+', '+a[2]+', '+a[3]+', '+
a[4]+', '+a[5]+', '+a[6]+', '+a[7]+', '+
a[8]+', '+a[9]+', '+a[10]+', '+a[11]+', '+
a[12]+', '+a[13]+', '+a[14]+', '+a[15]+')';};mat4.frob=function(a){return(Math.sqrt(Math.pow(a[0],2)+Math.pow(a[1],2)+Math.pow(a[2],2)+Math.pow(a[3],2)+Math.pow(a[4],2)+Math.pow(a[5],2)+Math.pow(a[6],2)+Math.pow(a[7],2)+Math.pow(a[8],2)+Math.pow(a[9],2)+Math.pow(a[10],2)+Math.pow(a[11],2)+Math.pow(a[12],2)+Math.pow(a[13],2)+Math.pow(a[14],2)+Math.pow(a[15],2)))};if(typeof(exports)!=='undefined'){exports.mat4=mat4;};var quat={};quat.create=function(){var out=new GLMAT_ARRAY_TYPE(4);out[0]=0;out[1]=0;out[2]=0;out[3]=1;return out;};quat.rotationTo=(function(){var tmpvec3=vec3.create();var xUnitVec3=vec3.fromValues(1,0,0);var yUnitVec3=vec3.fromValues(0,1,0);return function(out,a,b){var dot=vec3.dot(a,b);if(dot<-0.999999){vec3.cross(tmpvec3,xUnitVec3,a);if(vec3.length(tmpvec3)<0.000001)
vec3.cross(tmpvec3,yUnitVec3,a);vec3.normalize(tmpvec3,tmpvec3);quat.setAxisAngle(out,tmpvec3,Math.PI);return out;}else if(dot>0.999999){out[0]=0;out[1]=0;out[2]=0;out[3]=1;return out;}else{vec3.cross(tmpvec3,a,b);out[0]=tmpvec3[0];out[1]=tmpvec3[1];out[2]=tmpvec3[2];out[3]=1+dot;return quat.normalize(out,out);}};})();quat.setAxes=(function(){var matr=mat3.create();return function(out,view,right,up){matr[0]=right[0];matr[3]=right[1];matr[6]=right[2];matr[1]=up[0];matr[4]=up[1];matr[7]=up[2];matr[2]=-view[0];matr[5]=-view[1];matr[8]=-view[2];return quat.normalize(out,quat.fromMat3(out,matr));};})();quat.clone=vec4.clone;quat.fromValues=vec4.fromValues;quat.copy=vec4.copy;quat.set=vec4.set;quat.identity=function(out){out[0]=0;out[1]=0;out[2]=0;out[3]=1;return out;};quat.setAxisAngle=function(out,axis,rad){rad=rad*0.5;var s=Math.sin(rad);out[0]=s*axis[0];out[1]=s*axis[1];out[2]=s*axis[2];out[3]=Math.cos(rad);return out;};quat.add=vec4.add;quat.multiply=function(out,a,b){var ax=a[0],ay=a[1],az=a[2],aw=a[3],bx=b[0],by=b[1],bz=b[2],bw=b[3];out[0]=ax*bw+aw*bx+ay*bz-az*by;out[1]=ay*bw+aw*by+az*bx-ax*bz;out[2]=az*bw+aw*bz+ax*by-ay*bx;out[3]=aw*bw-ax*bx-ay*by-az*bz;return out;};quat.mul=quat.multiply;quat.scale=vec4.scale;quat.rotateX=function(out,a,rad){rad*=0.5;var ax=a[0],ay=a[1],az=a[2],aw=a[3],bx=Math.sin(rad),bw=Math.cos(rad);out[0]=ax*bw+aw*bx;out[1]=ay*bw+az*bx;out[2]=az*bw-ay*bx;out[3]=aw*bw-ax*bx;return out;};quat.rotateY=function(out,a,rad){rad*=0.5;var ax=a[0],ay=a[1],az=a[2],aw=a[3],by=Math.sin(rad),bw=Math.cos(rad);out[0]=ax*bw-az*by;out[1]=ay*bw+aw*by;out[2]=az*bw+ax*by;out[3]=aw*bw-ay*by;return out;};quat.rotateZ=function(out,a,rad){rad*=0.5;var ax=a[0],ay=a[1],az=a[2],aw=a[3],bz=Math.sin(rad),bw=Math.cos(rad);out[0]=ax*bw+ay*bz;out[1]=ay*bw-ax*bz;out[2]=az*bw+aw*bz;out[3]=aw*bw-az*bz;return out;};quat.calculateW=function(out,a){var x=a[0],y=a[1],z=a[2];out[0]=x;out[1]=y;out[2]=z;out[3]=Math.sqrt(Math.abs(1.0-x*x-y*y-z*z));return out;};quat.dot=vec4.dot;quat.lerp=vec4.lerp;quat.slerp=function(out,a,b,t){var ax=a[0],ay=a[1],az=a[2],aw=a[3],bx=b[0],by=b[1],bz=b[2],bw=b[3];var omega,cosom,sinom,scale0,scale1;cosom=ax*bx+ay*by+az*bz+aw*bw;if(cosom<0.0){cosom=-cosom;bx=-bx;by=-by;bz=-bz;bw=-bw;}
if((1.0-cosom)>0.000001){omega=Math.acos(cosom);sinom=Math.sin(omega);scale0=Math.sin((1.0-t)*omega)/sinom;scale1=Math.sin(t*omega)/sinom;}else{scale0=1.0-t;scale1=t;}
out[0]=scale0*ax+scale1*bx;out[1]=scale0*ay+scale1*by;out[2]=scale0*az+scale1*bz;out[3]=scale0*aw+scale1*bw;return out;};quat.invert=function(out,a){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],dot=a0*a0+a1*a1+a2*a2+a3*a3,invDot=dot?1.0/dot:0;out[0]=-a0*invDot;out[1]=-a1*invDot;out[2]=-a2*invDot;out[3]=a3*invDot;return out;};quat.conjugate=function(out,a){out[0]=-a[0];out[1]=-a[1];out[2]=-a[2];out[3]=a[3];return out;};quat.length=vec4.length;quat.len=quat.length;quat.squaredLength=vec4.squaredLength;quat.sqrLen=quat.squaredLength;quat.normalize=vec4.normalize;quat.fromMat3=function(out,m){var fTrace=m[0]+m[4]+m[8];var fRoot;if(fTrace>0.0){fRoot=Math.sqrt(fTrace+1.0);out[3]=0.5*fRoot;fRoot=0.5/fRoot;out[0]=(m[5]-m[7])*fRoot;out[1]=(m[6]-m[2])*fRoot;out[2]=(m[1]-m[3])*fRoot;}else{var i=0;if(m[4]>m[0])
i=1;if(m[8]>m[i*3+i])
i=2;var j=(i+1)%3;var k=(i+2)%3;fRoot=Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k]+1.0);out[i]=0.5*fRoot;fRoot=0.5/fRoot;out[3]=(m[j*3+k]-m[k*3+j])*fRoot;out[j]=(m[j*3+i]+m[i*3+j])*fRoot;out[k]=(m[k*3+i]+m[i*3+k])*fRoot;}
return out;};quat.str=function(a){return'quat('+a[0]+', '+a[1]+', '+a[2]+', '+a[3]+')';};if(typeof(exports)!=='undefined'){exports.quat=quat;};})(shim.exports);})(window);

export default xViewer;
