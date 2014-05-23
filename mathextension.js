﻿var AssertHelper = (function () {
    function AssertHelper() {
    }
    AssertHelper.assertParameter = function () {
        var parameters = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            parameters[_i] = arguments[_i + 0];
        }
        parameters.forEach(function (p) {
            AssertHelper.assert(p != null, "Argument not optional");
        });
    };

    AssertHelper.assertNumber = function () {
        var numbers = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            numbers[_i] = arguments[_i + 0];
        }
        numbers.forEach(function (n) {
            AssertHelper.assert(n !== undefined, "Argument not optional");
            AssertHelper.assert(!isNaN(n), "Invalid argument.");
        });
    };

    AssertHelper.assertArray = function () {
        var arrays = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            arrays[_i] = arguments[_i + 0];
        }
        arrays.forEach(function (array) {
            AssertHelper.assert(Array.isArray(array), "Invalid argument.");
        });
    };

    AssertHelper.assert = function (condition, message) {
        if (!condition)
            throw new Error(message);
    };
    return AssertHelper;
})();
Math.add = function (x, y) {
    return x + y;
};

Math.subtract = function (x, y) {
    return x - y;
};

Math.multiply = function (x, y) {
    return x * y;
};

Math.divide = function (x, y) {
    return x / y;
};

Math.substitute = function (x, y) {
    return y;
};

Math.factorial = function (x) {
    var result = 1;
    for (var i = 1; i <= x; i++)
        result *= i;
    return result;
};
var Matrix = (function () {
    function Matrix(size, items) {
        if (typeof items === "undefined") { items = []; }
        if (!Array.isArray(size)) {
            this._array = [];
            return;
        }

        for (var i = 1; i < size.length; i++) {
            if (isNaN(size[i]))
                throw new Error("NaN is allowed only on the highest matrix dimension length.");
        }

        var subchunkSize = 1;
        for (var i = 1; i < size.length; i++)
            subchunkSize *= size[i];
        if (isNaN(size[0])) {
            size = size.slice(0);
            size[0] = Math.ceil(items.length / subchunkSize);
        }
        this._array = Matrix._getArrayMatrix(size, items, subchunkSize);
        ////columnLength is a number
        //AssertHelper.assert(columnLength >= 1, "Column length should be larger than or equal to 1.");
        //AssertHelper.assert(items.length % columnLength == 0, "Invalid number of items");
        ////columnLength >= 1, items exist, items.length % columnLength == 0
        //for (var row = 0; row < items.length / columnLength; row++) {
        //    this._array.push([]);
        //    for (var column = 0; column < columnLength; column++)
        //        this._array[row][column] = items[row * columnLength + column];
        //}
    }
    Matrix.isMatrix = function (object) {
        //http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
        var funcNameRegex = /function\s+(.{1,})\s*\(/;
        var regexResults = funcNameRegex.exec(object.constructor.toString());
        var result = (regexResults && regexResults.length > 1) ? regexResults[1] : "";
        return result === "Matrix";
    };

    //this implicitly returns NaN if isNaN(i) is true
    Matrix._getZeroBasedIndex = function (i) {
        if (Matrix.isZeroBased)
            return i;
        else
            return i - 1;
    };

    Matrix._getUserFriendlyIndex = function (i) {
        if (Matrix.isZeroBased)
            return i;
        else
            return i + 1;
    };

    Object.defineProperty(Matrix.prototype, "columnLength", {
        get: function () {
            if (this.rowLength > 0)
                return this._array[0].length;
            else
                return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "rowLength", {
        get: function () {
            return this._array.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "size", {
        get: function () {
            var size = [];
            var targetArray = this._array;
            while (Array.isArray(targetArray)) {
                size.push(targetArray.length);
                targetArray = targetArray[0];
            }
            return size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "serialSize", {
        get: function () {
            var size = this.size;
            var serial = 1;
            size.forEach(function (dimensionSize) {
                serial *= dimensionSize;
            });
            return serial;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "dimension", {
        get: function () {
            return this.size.length;
        },
        enumerable: true,
        configurable: true
    });

    Matrix.prototype._isValidInternalCoordinate = function (coordinate) {
        var size = this.size;
        AssertHelper.assertArray(coordinate);

        //AssertHelper.assert(coordinate.length == size.length, "Coordinate dimension is not valid for this matrix.");
        return coordinate.every(function (dimensionIndex, dimension) {
            return dimensionIndex < size[dimension];
        });
    };

    Matrix._getArrayMatrix = function (size, itemChunk, subchunkSize) {
        //if (subchunkSize === undefined) {
        //    subchunkSize = 1;
        //    for (var i = 1; i < size.length; i++)
        //        subchunkSize *= size[i];
        //}
        if (size.length > 1) {
            var array = [];

            var childSize = size.slice(1);
            var nextSubchunkSize = subchunkSize / size[0];
            for (var i = 0; i < size[0]; i++) {
                var subchunk = itemChunk.slice(subchunkSize * i, subchunkSize * (i + 1));
                array.push(this._getArrayMatrix(childSize, subchunk, nextSubchunkSize));
            }
            return array;
        } else {
            itemChunk = itemChunk.slice(0, size[0]);
            if (itemChunk.length < size[0]) {
                while (itemChunk.length != size[0])
                    itemChunk.push(undefined);
            }
            return itemChunk;
        }
        //for (var i = 0; i < size
    };

    Matrix.prototype._getInternalCoordinateFromIndex = function (index) {
        AssertHelper.assertNumber(index);
        index = Matrix._getZeroBasedIndex(index);

        var size = this.size;
        var dimension = size.length;
        var coordinate = [];
        var higherIndex = index;

        while (coordinate.length < dimension) {
            var currentDimensionSize = size.pop();
            if (currentDimensionSize > 0)
                coordinate.unshift(higherIndex % currentDimensionSize);
            else
                coordinate.unshift(higherIndex);
            higherIndex = Math.floor(higherIndex / currentDimensionSize);
        }

        return coordinate;
    };

    Matrix.prototype._getInternalCoordinate = function (coordinate) {
        AssertHelper.assertParameter(coordinate);
        var internalCoordinate = [];
        if (Array.isArray(coordinate)) {
            internalCoordinate = coordinate.map(function (i) {
                return Matrix._getZeroBasedIndex(i);
            });
        } else {
            var index = coordinate;
            internalCoordinate = this._getInternalCoordinateFromIndex(index);
        }

        return internalCoordinate;
    };

    Matrix.prototype.get = function (coordinate) {
        AssertHelper.assertParameter(coordinate);
        var internalCoordinate = this._getInternalCoordinate(coordinate);

        if (this._isValidInternalCoordinate(internalCoordinate)) {
            var dimensioner = internalCoordinate.slice(0);
            var targetArray = this._array;
            while (dimensioner.length > 0) {
                targetArray = targetArray[dimensioner.shift()];
            }
            return targetArray;
        } else
            return undefined;
    };

    Matrix.prototype.set = function (coordinate, input) {
        AssertHelper.assertParameter(coordinate);
        var internalCoordinate = this._getInternalCoordinate(coordinate);

        if (!this._isValidInternalCoordinate(internalCoordinate)) {
            this.expand(internalCoordinate.map(function (i) {
                return i + 1;
            }), undefined);
        }

        var dimensioner = internalCoordinate.slice(0);
        var targetArray = this._array;
        while (dimensioner.length > 1) {
            targetArray = targetArray[dimensioner.shift()];
        }
        targetArray[dimensioner.shift()] = input;
        return this;
    };

    Matrix._expandArray = function (array, targetSize, fill) {
        if (targetSize.length > 1) {
            var childSize = targetSize.slice(1);

            for (var i = 0; i < array.length; i++) {
                this._expandArray(array[i], childSize, fill);
            }
            for (var i = array.length; i < targetSize[0]; i++) {
                var childArray = [];
                this._expandArray(childArray, childSize, fill);
                array.push(childArray);
            }
        } else if (targetSize.length == 1) {
            for (var i = array.length; i < targetSize[0]; i++) {
                array.push(fill);
            }
        }
    };

    //should be more efficient
    Matrix.prototype.expand = function (targetSize, fill) {
        var size = this.size;
        AssertHelper.assertArray(targetSize);
        AssertHelper.assert(targetSize.length >= size.length, "Target dimension should be larger than or equal with original dimension");

        if (this.serialSize > 0 && targetSize.length > size.length) {
            var dimensionDifference = targetSize.length - size.length;

            //targetSize[dimensionDifference - 1]--;
            var newArray = [];
            Matrix._expandArray(newArray, targetSize, fill);

            //AssertHelper.assert(size.length == targetSize.length, "Coordinate dimension is not valid for this matrix.");
            var targetArray = newArray;
            for (var i = 0; i < dimensionDifference - 1; i++) {
                targetArray = targetArray[0];
            }
            targetArray[0] = this._array;
            Matrix._expandArray(this._array, targetSize.slice(targetSize.length - size.length), fill);
            this._array = newArray;
        } else {
            Matrix._expandArray(this._array, targetSize, fill);
        }
    };

    Matrix.prototype.clone = function () {
        var items = [];
        this.forEach(function (item) {
            items.push(item);
        });
        return new Matrix(this.size, items);
    };

    Matrix.isSameSize = function (x, y) {
        var xsize = x.size;
        var ysize = y.size;
        for (var i = 0; i < xsize.length; i++) {
            if (xsize[i] != ysize[i])
                return false;
        }
        return true;
    };

    Matrix.prototype.map = function (func, input) {
        var argArray = [];
        for (var _i = 0; _i < (arguments.length - 2); _i++) {
            argArray[_i] = arguments[_i + 2];
        }
        return this.mapFor.apply(this, [func, null, input].concat(argArray));
    };

    Matrix.prototype.mapFor = function (func, condition, input) {
        var argArray = [];
        for (var _i = 0; _i < (arguments.length - 3); _i++) {
            argArray[_i] = arguments[_i + 3];
        }
        if (input != null && Matrix.isMatrix(input))
            AssertHelper.assert(Matrix.isSameSize(this, input), "Dimensions should match each other");

        var newMatrix = this.clone();
        newMatrix.forEach(function (item, coordinate) {
            if (!condition || condition(item, coordinate)) {
                if (input == null)
                    newMatrix.set(coordinate, func.apply(null, [item]));
                else
                    newMatrix.set(coordinate, func.apply(null, [item, Matrix.isMatrix(input) ? input.get(coordinate) : input].concat(argArray)));
            }
        });

        return newMatrix;
    };

    Matrix._forEach = function (array, func, parentCoordinate, depth) {
        var _this = this;
        if (depth == 1) {
            array.forEach(function (item, index) {
                func(item, parentCoordinate.concat(Matrix._getUserFriendlyIndex(index)));
            });
        } else if (depth > 1) {
            var shallower = depth - 1;
            array.forEach(function (childArray, index) {
                _this._forEach(childArray, func, parentCoordinate.concat(Matrix._getUserFriendlyIndex(index)), shallower);
            });
        }
    };

    Matrix.prototype.forEach = function (func) {
        //var stack = [this._array];
        //var indexes = [0];
        //var dimension = this.dimension;
        //while (stack.length > 0) {
        //    if (indexes[0] < stack[0].length) {
        //        if (stack.length == dimension) {
        //            outputArray.push(stack[0][indexes[0]]);
        //            indexes[0]++;
        //        }
        //        else {
        //            outputArray.push('[');
        //            stack.unshift(stack[0][indexes[0]]);
        //            indexes[0]++;
        //            indexes.unshift(0);
        //        }
        //    }
        //    else {
        //        stack.shift();
        //        indexes.shift();
        //    }
        //}
        Matrix._forEach(this._array, func, [], this.dimension);
    };

    Matrix.prototype.toString = function () {
        var outputArray = ['['];
        var stack = [this._array];
        var indexes = [0];

        var dimension = this.dimension;
        while (stack.length > 0) {
            if (indexes[0] < stack[0].length) {
                if (stack.length == dimension) {
                    outputArray.push(stack[0][indexes[0]]);
                    indexes[0]++;
                } else {
                    outputArray.push('[');
                    stack.unshift(stack[0][indexes[0]]);
                    indexes[0]++;
                    indexes.unshift(0);
                }
            } else {
                stack.shift();
                indexes.shift();
                outputArray.push(']');
            }
        }

        return outputArray.join(' ');
    };

    //toMatlabString() {
    //    var outputArray: string[] = [];
    //    for (var row = 0; row < this.rowLength; row++) {
    //        var strArray: any[] = [];
    //        for (var column = 0; column < this.columnLength; column++)
    //            strArray.push(this._array[row][column]);
    //        outputArray.push(strArray.join(' '));
    //    }
    //    return '[' + outputArray.join('; ') + ']';
    //}
    Matrix.getZeroMatrix = function (coordinate) {
        AssertHelper.assertArray(coordinate);
        var newMatrix = new Matrix();
        newMatrix.expand(coordinate, 0);
        return newMatrix;
    };

    Matrix.getIdentityMatrix = function (size) {
        AssertHelper.assertNumber(size);
        var newMatrix = Matrix.getZeroMatrix([size, size]);
        for (var i = 0; i < size; i++)
            newMatrix._array[i][i] = 1;
        return newMatrix;
    };

    Matrix.getLinearSpace = function (start, end, pointNumber) {
        AssertHelper.assertNumber(start, end, pointNumber);
        AssertHelper.assert(end > start, "End should be larger than start.");
        var newMatrix = new Matrix();
        newMatrix.expand([pointNumber]);
        var gap = (end - start) / (pointNumber - 1);
        for (var i = 0; i < pointNumber; i++)
            newMatrix._array[i] = start + gap * i;
        return newMatrix;
    };

    Matrix.getGapSpace = function (start, end, gap) {
        AssertHelper.assertNumber(start, end);
        AssertHelper.assert(end > start, "End should be larger than start.");
        if (isNaN(gap))
            gap = 1;
        var newMatrix = new Matrix();
        var length = Math.floor((end - start) / gap) + 1;
        newMatrix.expand([length]);
        for (var i = 0; i < length; i++)
            newMatrix._array[i] = start + gap * i;
        return newMatrix;
    };

    Matrix.prototype.plus = function (input) {
        return this.map(Math.add, input);
    };

    Matrix.prototype.minus = function (input) {
        return this.map(Math.subtract, input);
    };

    Matrix.prototype.times = function (input) {
        return this.map(Math.multiply, input);
    };

    Matrix.prototype.dividedBy = function (input) {
        return this.map(Math.divide, input);
    };

    Matrix.prototype.powerOf = function (input) {
        return this.map(Math.pow, input);
    };

    Matrix.prototype.replace = function (input) {
        return this.map(Math.substitute, input);
    };

    Matrix.prototype.matrixMultiply = function (input) {
        AssertHelper.assert(this.columnLength == input.rowLength, "Row length of the input matrix should be same with column length of the original one.");
        var newColumnLength = input.columnLength;
        var newItems = [];
        this._array.forEach(function (rowArray) {
            for (var column = 0; column < input.columnLength; column++) {
                var newItem = 0;
                for (var row = 0; row < input.rowLength; row++)
                    newItem += rowArray[row] * input._array[row][column];
                newItems.push(newItem);
            }
        });

        return new Matrix(newColumnLength, newItems);
    };

    Matrix.prototype.transpose = function () {
        AssertHelper.assert(this.dimension == 2, "Transpose function only supports two-dimensional matrices.");
        var newMatrix = Matrix.getZeroMatrix([this.columnLength, this.rowLength]);
        this.forEach(function (item, coordinate) {
            newMatrix.set([coordinate[1], coordinate[0]], item);
        });
        return newMatrix;
    };
    Matrix.isZeroBased = false;
    return Matrix;
})();
//interface FileReader {
//    readAsMatrix(blob: Blob): void;
//}
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
//if (!FileReader.prototype.readAsMatrix) {
//    FileReader.prototype.readAsMatrix = (blob: Blob) => {
//        var matrix = new Matrix();
//        var reader = new FileReader();
//        //(<FileReader>this).dispatchEvent();
//    };
//}
var BlobStream = (function () {
    function BlobStream(blob) {
        this.blob = blob;
        this.indexInSlice = 0;
        this.slice = new ArrayBuffer(0);
        this.sliceSize = 10240;
        this.left = blob.size;
    }
    //read(length = this.blob.size) {
    //}
    BlobStream.prototype.readNextSlice = function (oncomplete) {
        var _this = this;
        if (this.sliceIndex === undefined)
            this.sliceIndex = 0;
        else
            this.sliceIndex++;
        var start = this.sliceIndex * this.sliceSize;
        if (this.left == 0)
            throw new Error("No left input stream");
        else {
            var reader = new FileReader();
            reader.onload = function (ev) {
                _this.slice = ev.target.result;
                _this.left -= blobSlice.size;
                _this.indexInSlice = 0;
                oncomplete();
            };
            var blobSlice;
            if (this.left < this.sliceSize)
                blobSlice = this.blob.slice(start, start + this.left);
            else
                blobSlice = this.blob.slice(start, start + this.sliceSize);
            reader.readAsArrayBuffer(blobSlice);
        }
    };

    BlobStream.prototype.readLine = function (oncomplete) {
        var _this = this;
        var result = '';
        var view = new Uint8Array(this.slice);
        var asyncFunction = function () {
            var i = Array.prototype.indexOf.call(view, 0x0A, _this.indexInSlice);
            if (i == -1) {
                if (_this.left) {
                    result += String.fromCharCode.apply(null, view.subarray(_this.indexInSlice));
                    _this.readNextSlice(function () {
                        i = 0;
                        view = new Uint8Array(_this.slice);
                        window.setImmediate(asyncFunction);
                    });
                } else
                    oncomplete(null);
            } else {
                result += String.fromCharCode.apply(null, view.subarray(_this.indexInSlice, i));
                _this.indexInSlice = i + 1;
                oncomplete(result);
            }
        };
        asyncFunction();
    };

    BlobStream.prototype.readLines = function (oneach, oncomplete) {
        var _this = this;
        var asyncFunction = function () {
            _this.readLine(function (result) {
                window.setImmediate(oneach, result);
                if (_this.left > 0)
                    window.setImmediate(asyncFunction);
                else if (oncomplete)
                    window.setImmediate(oncomplete);
            });
        };
        asyncFunction();
    };
    return BlobStream;
})();

var Matrix2DStream = (function (_super) {
    __extends(Matrix2DStream, _super);
    function Matrix2DStream(blob, dimension) {
        if (typeof dimension === "undefined") { dimension = -1; }
        _super.call(this, blob);
        this.dimension = dimension;
    }
    Matrix2DStream.prototype.readRow = function (delimiter, oncomplete) {
        var _this = this;
        var asyncFunction = function () {
            _super.prototype.readLine.call(_this, function (line) {
                var splitted = line.split(delimiter).map(function (s) {
                    return parseFloat(s);
                });
                var valid = splitted.every(function (s) {
                    return !isNaN(s);
                });
                if (valid) {
                    if (_this.dimension == -1 || splitted.length == _this.dimension) {
                        _this.dimension = splitted.length;
                        oncomplete(splitted);
                    } else
                        throw new Error("???");
                } else
                    window.setImmediate(asyncFunction);
            });
        };
        asyncFunction();
    };

    Matrix2DStream.prototype.readRows = function (delimiter, oneach, oncomplete) {
        var _this = this;
        var asyncFunction = function () {
            _this.readRow(delimiter, function (row) {
                window.setImmediate(oneach, row);
                if (_this.left > 0)
                    window.setImmediate(asyncFunction);
                else if (oncomplete)
                    window.setImmediate(oncomplete);
            });
        };
        asyncFunction();
    };
    return Matrix2DStream;
})(BlobStream);
//# sourceMappingURL=mathextension.js.map
