function range(start, stop, step) {
    if (arguments.length <= 1) {
        stop = start || 0;
        start = 0;
    }
    step = arguments[2] || 1;
    var length = Math.max (Math.ceil ((stop - start) / step) , 0);
    var idx = 0;
    var range = new Array(length);
    while (idx < length) {
        range[idx++] = start;
        start += step;
    }
    return range;
}
function len(obj) {
    if (obj instanceof Array || typeof obj === "string") return obj.length;
    else {
        var count = 0;
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) count++;
        }
        return count;
    }
}
function _$rapyd$_in(val, arr) {
    if (arr instanceof Array || typeof arr === "string") return arr.indexOf(val) != -1;
    else {
        if (arr.hasOwnProperty(val)) return true;
        return false;
    }
}
function dir(item) {
    var arr = [];
    for (var i in item) {
        arr.push(i);
    }
    return arr;
}
function _$rapyd$_extends(child, parent) {
    child.prototype = new parent;
    child.prototype.constructor = child;
}
JSON = JSON || {};
if (!JSON.stringify) {
    
    JSON.stringify = function(obj) {
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string")
                obj = '"' + obj + '"';
            if (t == "function")
                return; // return undefined
            else
                return String(obj);
        } else {
            // recurse array or object
            var n, v, json = []
            var arr = (obj && obj.constructor == Array);
            for (n in obj) {
                v = obj[n];
                t = typeof (v);
                if (t != "function" && t != "undefined") {
                    if (t == "string")
                        v = '"' + v + '"';
                    else if ((t == "object" || t == "function") && v !== null)
                        v = JSON.stringify(v);
                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    };
    ;
}
str = JSON.stringify;
function kwargs(f) {
    var argNames;
    argNames = f.toString().match(/\(([^\)]+)/)[1];
    argNames = argNames ? argNames.split(",").map(function(s) {
        return s.trim();
    }) : [];
    return function() {
        var args, kw, i;
        args = [].slice.call(arguments);
        if (args.length && args.length < f.length) {
            kw = args.pop();
            if (typeof kw == "object") {
                for (i = 0; i < len(argNames); i++) {
                    if (_$rapyd$_in(argNames[i], dir(kw))) {
                        args[i] = kw[argNames[i]];
                    }
                }
            } else {
                args.push(kw);
            }
        }
        return f.apply(f, args);
    };
}
function IndexError(message){
    var self = this;
    if (typeof message === "undefined") message = "list index out of range";
    self.name = "IndexError";
    self.message = message;
};

_$rapyd$_extends(IndexError, Error);

function TypeError(message){
    var self = this;
    self.name = "TypeError";
    self.message = message;
};

_$rapyd$_extends(TypeError, Error);

function ValueError(message){
    var self = this;
    self.name = "ValueError";
    self.message = message;
};

_$rapyd$_extends(ValueError, Error);

function AssertionError(message){
    var self = this;
    if (typeof message === "undefined") message = "";
    self.name = "AssertionError";
    self.message = message;
};

_$rapyd$_extends(AssertionError, Error);

if (!Array.prototype.map) {
    
	Array.prototype.map = function(callback, thisArg) {
		var T, A, k;
		if (this == null) {
			throw new TypeError(" this is null or not defined");
		}
		var O = Object(this);
		var len = O.length >>> 0;
		if ({}.toString.call(callback) != "[object Function]") {
			throw new TypeError(callback + " is not a function");
		}
		if (thisArg) {
			T = thisArg;
		}
		A = new Array(len);
		for (var k = 0; k < len; k++) {
			var kValue, mappedValue;
			if (k in O) {
				kValue = O[k];
				mappedValue = callback.call(T, kValue);
				A[k] = mappedValue;
			}
		}
		return A;
	};
	;
}
function map(oper, arr) {
    return list(arr.map(oper));
}
if (!Array.prototype.filter) {
    
	Array.prototype.filter = function(filterfun, thisArg) {
		"use strict";
		if (this == null) {
			throw new TypeError(" this is null or not defined");
		}
		var O = Object(this);
		var len = O.length >>> 0;
		if ({}.toString.call(filterfun) != "[object Function]") {
			throw new TypeError(filterfun + " is not a function");
		}
		if (thisArg) {
			T = thisArg;
		}
		var A = [];
		var thisp = arguments[1];
		for (var k = 0; k < len; k++) {
			if (k in O) {
				var val = O[k]; // in case fun mutates this
				if (filterfun.call(T, val))
					A.push(val);
			}
		}
		return A;
	};
	;
}
function filter(oper, arr) {
    return list(arr.filter(oper));
}
function sum(arr, start) {
    if (typeof start === "undefined") start = 0;
    return arr.reduce(function(prev, cur) {
        return prev + cur;
    }, start);
}
function deep_eq(a, b) {
    var i;
    "\n    Equality comparison that works with all data types, returns true if structure and\n    contents of first object equal to those of second object\n\n    Arguments:\n        a: first object\n        b: second object\n    ";
    if (a === b) {
        return true;
    }
    if (a instanceof Array && b instanceof Array || a instanceof Object && b instanceof Object) {
        if (a.constructor !== b.constructor || a.length !== b.length) {
            return false;
        }
        var _$rapyd$_Iter0 = dict.keys(a);
        for (var _$rapyd$_Index0 = 0; _$rapyd$_Index0 < _$rapyd$_Iter0.length; _$rapyd$_Index0++) {
            i = _$rapyd$_Iter0[_$rapyd$_Index0];
            if (b.hasOwnProperty(i)) {
                if (!deep_eq(a[i], b[i])) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    }
    return false;
}
String.prototype.find = Array.prototype.indexOf;
String.prototype.strip = String.prototype.trim;
String.prototype.lstrip = String.prototype.trimLeft;
String.prototype.rstrip = String.prototype.trimRight;
String.prototype.join = function(iterable) {
    return iterable.join(this);
};
String.prototype.zfill = function(size) {
    var s;
    s = this;
    while (s.length < size) {
        s = "0" + s;
    }
    return s;
};
function list(iterable) {
    if (typeof iterable === "undefined") iterable = [];
    var result, i;
    result = [];
    var _$rapyd$_Iter1 = iterable;
    for (var _$rapyd$_Index1 = 0; _$rapyd$_Index1 < _$rapyd$_Iter1.length; _$rapyd$_Index1++) {
        i = _$rapyd$_Iter1[_$rapyd$_Index1];
        result.append(i);
    }
    return result;
}
Array.prototype.append = Array.prototype.push;
Array.prototype.find = Array.prototype.indexOf;
Array.prototype.index = function(index) {
    var val;
    val = this.find(index);
    if (val == -1) {
        throw new ValueError(str(index) + " is not in list");
    }
    return val;
};
Array.prototype.insert = function(index, item) {
    this.splice(index, 0, item);
};
Array.prototype.pop = function(index) {
    if (typeof index === "undefined") index = this.length - 1;
    return this.splice(index, 1)[0];
};
Array.prototype.extend = function(array2) {
    this.push.apply(this, array2);
};
Array.prototype.remove = function(item) {
    var index;
    index = this.find(item);
    this.splice(index, 1);
};
Array.prototype.copy = function() {
    return this.slice(0);
};
function dict(iterable) {
    var result, key;
    result = {};
    var _$rapyd$_Iter2 = iterable;
    for (var _$rapyd$_Index2 = 0; _$rapyd$_Index2 < _$rapyd$_Iter2.length; _$rapyd$_Index2++) {
        key = _$rapyd$_Iter2[_$rapyd$_Index2];
        result[key] = iterable[key];
    }
    return result;
}
if (typeof Object.getOwnPropertyNames !== "function") {
    dict.keys = function(hash) {
        var keys;
        keys = [];
        
        for (var x in hash) {
            if (hash.hasOwnProperty(x)) {
                keys.push(x);
            }
        }
        ;
        return keys;
    };
} else {
    dict.keys = function(hash) {
        return Object.getOwnPropertyNames(hash);
    };
}
dict.values = function(hash) {
    var vals, key;
    vals = [];
    var _$rapyd$_Iter3 = dict.keys(hash);
    for (var _$rapyd$_Index3 = 0; _$rapyd$_Index3 < _$rapyd$_Iter3.length; _$rapyd$_Index3++) {
        key = _$rapyd$_Iter3[_$rapyd$_Index3];
        vals.append(hash[key]);
    }
    return vals;
};
dict.items = function(hash) {
    var items, key;
    items = [];
    var _$rapyd$_Iter4 = dict.keys(hash);
    for (var _$rapyd$_Index4 = 0; _$rapyd$_Index4 < _$rapyd$_Iter4.length; _$rapyd$_Index4++) {
        key = _$rapyd$_Iter4[_$rapyd$_Index4];
        items.append([key, hash[key]]);
    }
    return items;
};
dict.copy = dict;
dict.clear = function(hash) {
    var key;
    var _$rapyd$_Iter5 = dict.keys(hash);
    for (var _$rapyd$_Index5 = 0; _$rapyd$_Index5 < _$rapyd$_Iter5.length; _$rapyd$_Index5++) {
        key = _$rapyd$_Iter5[_$rapyd$_Index5];
        delete hash[key];
    }
};
