;(function () {
    "use strict";

    function vec(x, y, z) {
        if (!(this instanceof vec)) {
            // vec(vec) makes a copy of the argument:
            if (arguments.length == 1 && x.x !== undefined) return new vec(x.x, x.y, x.z)  // TODO: Why?
            return new vec(x, y, z)
        }

        this.x = x
        this.y = y
        this.z = z

        if (arguments.length !== 3) throw new Error("vec() requires 3 arguments: x, y, and z.")
    }
    
    
    // These attributeVector objects must be set up in property.js

    function attributeVector(parent, x, y, z) {
        this.__parent = parent
        this.__x = x
        this.__y = y
        this.__z = z
        if (parent) parent.__change()
    }

    attributeVector.prototype = new vec(0, 0, 0)
    attributeVector.prototype.constructor = attributeVector

    function attributeVectorPos(parent, x, y, z) { // for pos in VPython environment, to make make_trail work
        this.__parent = parent
        this.__x = x
        this.__y = y
        this.__z = z
        if (parent) {
        	parent.__change()
        	if (parent.__make_trail) parent.__update_trail()
        }
    }

    attributeVectorPos.prototype = new vec(0, 0, 0)
    attributeVectorPos.prototype.constructor = attributeVectorPos

    function attributeVectorAxis(parent, x, y, z) { // for axis in VPython environment
        this.__parent = parent
        this.__x = x
        this.__y = y
        this.__z = z
        if (parent) {
        	parent.__size.__x = Math.sqrt(x*x + y*y + z*z)
        	parent.__change()
        }
    }

    attributeVectorAxis.prototype = new vec(1, 0, 0)
    attributeVectorAxis.prototype.constructor = attributeVectorAxis

    function attributeVectorSize(parent, x, y, z) { // for size in VPython environment
        this.__parent = parent
        this.__x = x
        this.__y = y
        this.__z = z
        if (parent) {
            // Be careful not to alter the attributeVectorAxis character of parent.__axis
        	if (x !== 0) { // can get in trouble if we make axis be a zero vector
	            var v = parent.__axis.norm().multiply(x)
	        	parent.__axis.__x = v.x
	        	parent.__axis.__y = v.y
	        	parent.__axis.__z = v.z
        	}
        	parent.__change()
        }
    }

    attributeVectorSize.prototype = new vec(1,1,1)
    attributeVectorSize.prototype.constructor = attributeVectorSize
    
    // Ordinary attributeVector --------------------------------------------------------------------

    Object.defineProperty(attributeVector.prototype, '__x', { enumerable: false, writable: true, value: 0 })
    Object.defineProperty(attributeVector.prototype, 'x', {
        enumerable: true,
        get:
            function () { return this.__x },
        set:
            function (value) {
                this.__x = value
                this.__parent.__change()
            }
    });

    Object.defineProperty(attributeVector.prototype, '__y', { enumerable: false, writable: true, value: 0 })
    Object.defineProperty(attributeVector.prototype, 'y', {
        enumerable: true,
        get:
            function () { return this.__y },
        set:
            function (value) {
                this.__y = value
                this.__parent.__change()
            }
    });

    Object.defineProperty(attributeVector.prototype, '__z', { enumerable: false, writable: true, value: 0 })
    Object.defineProperty(attributeVector.prototype, 'z', {
        enumerable: true,
        get:
            function () { return this.__z },
        set:
            function (value) {
                this.__z = value
                this.__parent.__change()
            }
    });
    
    // attributeVectorPos for VPython pos attribute ------------------------------------------------------

    Object.defineProperty(attributeVectorPos.prototype, '__x', { enumerable: false, writable: true, value: 0 })
    Object.defineProperty(attributeVectorPos.prototype, 'x', {
        enumerable: true,
        get:
            function () { return this.__x },
        set:
            function (value) {
                this.__x = value
                this.__parent.__change()
            	if (this.__parent.__make_trail) this.__parent.__update_trail()
            }
    });

    Object.defineProperty(attributeVectorPos.prototype, '__y', { enumerable: false, writable: true, value: 0 })
    Object.defineProperty(attributeVectorPos.prototype, 'y', {
        enumerable: true,
        get:
            function () { return this.__y },
        set:
            function (value) {
            	this.__y = value
                this.__parent.__change()
            	if (this.__parent.__make_trail) this.__parent.__update_trail()
            }
    });

    Object.defineProperty(attributeVectorPos.prototype, '__z', { enumerable: false, writable: true, value: 0 })
    Object.defineProperty(attributeVectorPos.prototype, 'z', {
        enumerable: true,
        get:
            function () { return this.__z },
        set:
            function (value) {
        		this.__z = value
                this.__parent.__change()
            	if (this.__parent.__make_trail) this.__parent.__update_trail()
            }
    });
    
    // attributeVectorAxis for VPython axis attribute ------------------------------------------------------

    Object.defineProperty(attributeVectorAxis.prototype, '__x', { enumerable: false, writable: true, value: 0 })
    Object.defineProperty(attributeVectorAxis.prototype, 'x', {
        enumerable: true,
        get:
            function () { return this.__x },
        set:
            function (value) {
                this.__x = this.__parent.__axis.__x = value
				this.__parent.__size.x = this.mag()
                this.__parent.__change()
            }
    });

    Object.defineProperty(attributeVectorAxis.prototype, '__y', { enumerable: false, writable: true, value: 0 })
    Object.defineProperty(attributeVectorAxis.prototype, 'y', {
        enumerable: true,
        get:
            function () { return this.__y },
        set:
            function (value) {
        		this.__y = this.__parent.__axis.__y = value
				this.__parent.__size.x = this.mag()
                this.__parent.__change()
            }
    });

    Object.defineProperty(attributeVectorAxis.prototype, '__z', { enumerable: false, writable: true, value: 0 })
    Object.defineProperty(attributeVectorAxis.prototype, 'z', {
        enumerable: true,
        get:
            function () { return this.__z },
        set:
            function (value) {
        		this.__z = this.__parent.__axis.__z = value
				this.__parent.__size.x = this.mag()
                this.__parent.__change()
            }
    });
    
    // attributeVectorSize for VPython size attribute --------------------------------------------------------

    Object.defineProperty(attributeVectorSize.prototype, '__x', { enumerable: false, writable: true, value: 0 })
    Object.defineProperty(attributeVectorSize.prototype, 'x', {
        enumerable: true,
        get:
            function () { return this.__x },
        set:
            function (value) {
                this.__x = value
                // Be careful not to alter the attributeVectorAxis character of this.__parent.__axis
                var v = this.__parent.__axis.norm().multiply(value)
            	this.__parent.__axis.__x = v.x
            	this.__parent.__axis.__y = v.y
            	this.__parent.__axis.__z = v.z
                this.__parent.__change()
            }
    });

    Object.defineProperty(attributeVectorSize.prototype, '__y', { enumerable: false, writable: true, value: 0 })
    Object.defineProperty(attributeVectorSize.prototype, 'y', {
        enumerable: true,
        get:
            function () { return this.__y },
        set:
            function (value) {
                this.__y = value
                this.__parent.__change()
            }
    });

    Object.defineProperty(attributeVectorSize.prototype, '__z', { enumerable: false, writable: true, value: 0 })
    Object.defineProperty(attributeVectorSize.prototype, 'z', {
        enumerable: true,
        get:
            function () { return this.__z },
        set:
            function (value) {
                this.__z = value
                this.__parent.__change()
            }
    });
    
    // General vec properties

    vec.prototype.toString = function () {
        // Mimics the vector display of VPython
        var input = [this.x, this.y, this.z]
        var output = []
        var c, eloc, period, char, end
        for (var i = 0; i < 3; i++) {
            var c = input[i]
            if (c == 0) {
                output.push('0')
                continue
            }
            if (Math.abs(c) < 1e-4) c = c.toExponential(5)
            else c = c.toPrecision(6)
            period = c.indexOf('.')
            if (period >= 0) {
                end = c.indexOf('e')
                if (end < 0) end = c.length
                char = end
                while (true) {
                    char--
                    if (c.charAt(char) == '0') continue
                    if (char == period) {
                        output.push(c.slice(0, period).concat(c.slice(end, c.length)))
                        break
                    }
                    if (end == c.length) output.push(c.slice(0, char + 1))
                    else output.push(c.slice(0, char + 1).concat(c.slice(end, c.length)))
                    break
                }
            } else output.push(c)
        }
        return "< " + output[0] + ", " + output[1] + ", " + output[2] + " >"
    }

    vec.prototype.add = function (v) {
        return new vec(this.x + v.x, this.y + v.y, this.z + v.z)
    }

    vec.prototype.sub = function (v) {
        return new vec(this.x - v.x, this.y - v.y, this.z - v.z)
    }

    vec.prototype.multiply = function (s) {
        return new vec(this.x * s, this.y * s, this.z * s)
    }

    vec.prototype.mag = function (s) {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }

    vec.prototype.mag2 = function (s) {
        return this.x * this.x + this.y * this.y + this.z * this.z
    }

    vec.prototype.divide = function (s) {
        return new vec(this.x / s, this.y / s, this.z / s)
    }

    vec.prototype.norm = function () {
        var r = this.mag()
        if (r == 0) return new vec(0, 0, 0)
        return new vec(this.x / r, this.y / r, this.z / r)
    }

    vec.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y + this.z * v.z
    }

    vec.prototype.equals = function (v) {
    	if (v === null) return false
        return (this.x == v.x && this.y == v.y && this.z == v.z)
    }

    vec.prototype.proj = function (v) {
        var B = norm(v)
        return B.multiply(this.dot(B))
    }

    vec.prototype.comp = function (v) {
        return this.dot(norm(v))
    }

    vec.prototype.cross = function (v) {
        return new vec(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x)
    }

    vec.prototype.diff_angle = function (v) {
        return Math.acos(this.norm().dot(v.norm()))
    }

    vec.prototype.rotate = function (args) {
    	var angle, axis
	    if (arguments.length == 1) {
	        if (args !== null && args !== undefined) {
	        	if (typeof args === 'number') {
	        		angle = args
	        	} else {
		        	angle = args.angle
		        	axis = args.axis
	        	}
	        }
	    } else if (arguments.length == 2) {
        	angle = arguments[0]
        	axis = arguments[1]
        }
    	if (angle === undefined) throw new Error("To rotate a vector you must specify an angle.")
        if (axis === undefined) axis = new vec(0, 0, 1)
        var theta = this.diff_angle(axis)
        if (theta == 0) return new vec(this.x, this.y, this.z)
        var axis = axis.norm()
        var parallel = axis.multiply(axis.dot(this)) // projection along axis
        var perp = axis.cross(this)
        var pmag = perp.mag() // length of 'this' projected onto plane perpendicular to axis
        perp = perp.norm()
        var y = perp.cross(axis) // y, perp, axis is an orthogonal coordinate system
        var rotated = y.multiply(pmag * Math.cos(angle)).add(perp.multiply(pmag * Math.sin(angle)))
        return parallel.add(rotated)
    }

    vec.random = function () {
        return new vec(-1 + 2 * Math.random(), -1 + 2 * Math.random(), -1 + 2 * Math.random())
    }

    // Support operator overloading
    String.prototype['+'] = function (r) { return this + r }
    Number.prototype['+'] = function (r) { return this + r }
    Number.prototype['-'] = function (r) { return this - r }
    Number.prototype['*'] = function (r) { return r['*r'](this); }
    Number.prototype['*r'] = function (l) { return l * this; }
    Number.prototype['/'] = function (r) { return this / r }
    Number.prototype["-u"] = function () { return -this }
    vec.prototype['+'] = vec.prototype.add
    vec.prototype['-'] = vec.prototype.sub
    vec.prototype['*'] = vec.prototype.multiply
    vec.prototype['*r'] = vec.prototype.multiply
    vec.prototype['/'] = function (r) { return this.divide(r) }
    vec.prototype["-u"] = function () { return new vec(-this.x, -this.y, -this.z) }

    var exports = { vec: vec, 
    		        attributeVector: attributeVector,
    		        attributeVectorPos: attributeVectorPos,
    		        attributeVectorAxis: attributeVectorAxis, 
    		        attributeVectorSize: attributeVectorSize }
    Export(exports)
})()

; (function vectorLibraryWrappers() {
    "use strict";

    function mag(A) {
        return A.mag();
    }
    function mag2(A) {
        return A.mag2();
    }
    function norm(A) {
        return A.norm();
    }
    function dot(A,B) {
        return A.dot(B);
    }
    function cross(A,B) {
        return A.cross(B);
    }
    function comp(A,B) {
        return A.comp(B);
    }
    function diff_angle(A,B) {
        return A.diff_angle(B);
    }
    function rotate(args) {
    	var angle, axis
    	var v = arguments[0]
	    if (arguments.length == 2) {
	        var args = arguments[1]
	        if (args !== null && args !== undefined) {
	        	if (typeof args === 'number') {
	        		angle = args
	        	} else {
		        	angle = args.angle
		        	axis = args.axis
	        	}
	        }
        } else if (arguments.length == 3) {
        	angle = arguments[1]
        	axis = arguments[2]
        }
    	if (angle === undefined) throw new Error("To rotate a vector you must specify an angle.")
    	if (axis === undefined) axis = new vec(0,0,1)
        return v.rotate({angle:angle, axis:axis})
    }
    var exports = {
        mag: mag,
        mag2: mag2,
        norm: norm,
        dot: dot,
        cross: cross,
        comp: comp,
        diff_angle: diff_angle,
        rotate: rotate
    }
    Export(exports)
})();

