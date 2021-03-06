;(function () {
    "use strict";

    // Mesh() represents a mesh of triangles
    // TODO: Big meshes (>64K vertices) for compound()
    function Mesh() {
        this.pos = []
        this.normal = []
        this.color = []
        this.opacity = []
        this.shininess = []
        this.emissive = []
        this.texpos = []
        this.bumpaxis = []
        this.index = []
        this.model_transparent = false
    }
    $.extend( Mesh.prototype, {
        merge: function merge(otherMesh, object, bias) {
        	var xmin = null, xmax = null, ymin = null, ymax = null, zmin = null, zmax = null
            var offset = this.pos.length / 3
            if (object instanceof vertex) {
	            if (bias < 0) this.index.push(offset + bias)
	            else {
	        		if (xmin === null || object.__pos.x < xmin) xmin = object.__pos.x
	        		if (xmax === null || object.__pos.x > xmax) xmax = object.__pos.x        	
	        		if (ymin === null || object.__pos.y < ymin) ymin = object.__pos.y
	        		if (ymax === null || object.__pos.y > ymax) ymax = object.__pos.y        	
	        		if (zmin === null || object.__pos.z < zmin) zmin = object.__pos.z
	        		if (zmax === null || object.__pos.z > zmax) zmax = object.__pos.z
		            this.pos.push(object.__pos.x, object.__pos.y, object.__pos.z)
		            this.normal.push(object.__normal.x, object.__normal.y, object.__normal.z)
		            this.color.push(object.__color.x, object.__color.y, object.__color.z)
	            	if (object.__opacity < 1) this.model_transparent = true
	            	this.opacity.push(object.__opacity)
	            	this.shininess.push(object.__shininess)
	            	this.emissive.push(object.__emissive)
		            this.texpos.push(object.__texpos.x, object.__texpos.y)
		            this.bumpaxis.push(object.__bumpaxis.x, object.__bumpaxis.y, object.__bumpaxis.z) 
		            this.index.push(offset) 
	            }
            } else {
                var c = [object.__color.x, object.__color.y, object.__color.z]
	            for (var j = 0; j < otherMesh.pos.length; j++) {
	            	if (j%3 === 0) {
	            		if (xmin === null || otherMesh.pos[j] < xmin) xmin = otherMesh.pos[j]
	            		if (xmax === null || otherMesh.pos[j] > xmax) xmax = otherMesh.pos[j]
	            	} else if (j%3 === 1) {
	            		if (ymin === null || otherMesh.pos[j] < ymin) ymin = otherMesh.pos[j]
	            		if (ymax === null || otherMesh.pos[j] > ymax) ymax = otherMesh.pos[j]
	            	} else if (j%3 === 2) {
	            		if (zmin === null || otherMesh.pos[j] < zmin) zmin = otherMesh.pos[j]
	            		if (zmax === null || otherMesh.pos[j] > zmax) zmax = otherMesh.pos[j]
	            	}
	                this.pos.push(otherMesh.pos[j])
	            }
	            for (var j = 0; j < otherMesh.normal.length; j++)
	                this.normal.push(otherMesh.normal[j])
	            for (var j = 0; j < otherMesh.color.length; j++) 
	            	this.color.push( c[j % 3] * otherMesh.color[j] )
	            for (var j = 0; j < otherMesh.opacity.length; j++) {
	            	var opacity = object.__opacity * otherMesh.opacity[j]
	            	if (opacity < 1) this.model_transparent = true
	                this.opacity.push(opacity)
	            }
	            for (var j = 0; j < otherMesh.shininess.length; j++) {
	            	var shininess = object.__shininess * otherMesh.shininess[j]
	            	this.shininess.push( shininess )
	            }
		        for (var j = 0; j < otherMesh.emissive.length; j++)  {
		            var emissive = object.__emissive || otherMesh.emissive[j] ? 1 : 0
		            this.emissive.push( emissive )
		        }
	            for (var j = 0; j < otherMesh.texpos.length; j++)
	                this.texpos.push(otherMesh.texpos[j])
	            for (var j = 0; j < otherMesh.bumpaxis.length; j++)
	                this.bumpaxis.push(otherMesh.bumpaxis[j])
	            for (var j = 0; j < otherMesh.index.length; j++)
	                this.index.push(offset + otherMesh.index[j])
            }
            return {__xmin:xmin, __ymin:ymin, __zmin:zmin, __xmax:xmax, __ymax:ymax, __zmax:zmax}
        },
        transformed: function transformed(matrix) {
            var normalTrans = mat3.toMat4(mat3.transpose(mat4.toInverseMat3(matrix)))
            var out = new Mesh()
            out.index = this.index
            out.color = this.color
            out.opacity = this.opacity
            out.shininess = this.shininess
            out.emissive = this.emissive
            out.texpos = this.texpos
            for (var i = 0; i < this.pos.length; i += 3) {
                var v = [this.pos[i], this.pos[i + 1], this.pos[i + 2]]
                var n = [this.normal[i], this.normal[i + 1], this.normal[i + 2], 0]
                var b = [this.bumpaxis[i], this.bumpaxis[i + 1], this.bumpaxis[i + 2]]
                mat4.multiplyVec3(matrix, v)
                mat4.multiplyVec4(normalTrans, n)
                mat4.multiplyVec3(matrix, b)
                out.pos.push(v[0], v[1], v[2])
                out.normal.push(n[0], n[1], n[2])
                out.bumpaxis.push(b[0], b[1], b[2])
            }
            return out
        },
        /* Seems not useful; not needed if gl.CULL_FACE not enabled
        make_twosided: function make_twosided() {
        	var offset = this.pos.length/3
        	this.pos = this.pos.concat(this.pos)
        	this.normal = this.normal.concat(this.normal)
        	this.texpos = this.texpos.concat(this.texpos)
        	this.bumpaxis = this.bumpaxis.concat(this.bumpaxis)
        	this.index = this.index.concat(this.index)
        	var end = this.normal.length
        	for (var i=end/2; i<end; i++) {
        		this.normal[i] *= -1
        		this.bumpaxis[i] *= -1
        	}
        	end = this.index.length
			for (var i=end/2; i<end; i+=3) {
				var temp = this.index[i+2]
				this.index[i+2] = offset+this.index[i]
				this.index[i] = offset+temp
				this.index[i+1] += offset
			}
        }
        */
    })

    // Mesh.make*() generate meshes for specific primitives
    $.extend( Mesh, {
        makeCube: function() {
            var m = new Mesh()
            var s = 0.5; // from VPython; 1x1x1 cube
            m.pos.push( 
                  +s, +s, +s,    +s, -s, +s,     +s, -s, -s,     +s, +s, -s,   // Right face
                  -s, +s, -s,    -s, -s, -s,     -s, -s, +s,     -s, +s, +s,   // Left face
                  -s, -s, +s,    -s, -s, -s,     +s, -s, -s,     +s, -s, +s,   // Bottom face
                  -s, +s, -s,    -s, +s, +s,     +s, +s, +s,     +s, +s, -s,   // Top face
                  -s, +s, +s,    -s, -s, +s,     +s, -s, +s,     +s, +s, +s,   // Front face
                  +s, +s, -s,    +s, -s, -s,     -s, -s, -s,     -s, +s, -s )  // Back face
            m.normal.push(
                  +1, 0, 0 ,  +1, 0, 0 ,  +1, 0, 0 ,  +1, 0, 0,
                  -1, 0, 0,   -1, 0, 0,   -1, 0, 0,   -1, 0, 0,
                  0, -1, 0,   0, -1, 0,   0, -1, 0,   0, -1, 0,
                  0, +1, 0,   0, +1, 0,   0, +1, 0,   0, +1, 0,
                  0, 0, +1,   0, 0, +1,   0, 0, +1,   0, 0, +1,
                  0, 0, -1,   0, 0, -1,   0, 0, -1,   0, 0, -1 )
            m.color.push(
            	  1, 1, 1,    1, 1, 1,    1, 1, 1,    1, 1, 1,
            	  1, 1, 1,    1, 1, 1,    1, 1, 1,    1, 1, 1,
            	  1, 1, 1,    1, 1, 1,    1, 1, 1,    1, 1, 1,
            	  1, 1, 1,    1, 1, 1,    1, 1, 1,    1, 1, 1,
            	  1, 1, 1,    1, 1, 1,    1, 1, 1,    1, 1, 1,
            	  1, 1, 1,    1, 1, 1,    1, 1, 1,    1, 1, 1 )
            m.opacity.push(
            	  1, 1, 1, 1,
            	  1, 1, 1, 1,
            	  1, 1, 1, 1,
            	  1, 1, 1, 1,
            	  1, 1, 1, 1,
            	  1, 1, 1, 1 )
            m.shininess.push(
            	  1, 1, 1, 1,
            	  1, 1, 1, 1,
            	  1, 1, 1, 1,
            	  1, 1, 1, 1,
            	  1, 1, 1, 1,
            	  1, 1, 1, 1 )
            m.emissive.push(
	           	  0, 0, 0, 0,
	           	  0, 0, 0, 0,
	           	  0, 0, 0, 0,
	           	  0, 0, 0, 0,
	           	  0, 0, 0, 0,
	           	  0, 0, 0, 0 )
            m.texpos.push(
                  0, 1,  0, 0,  1, 0,  1, 1,
                  0, 1,  0, 0,  1, 0,  1, 1,
                  0, 1,  0, 0,  1, 0,  1, 1,
                  0, 1,  0, 0,  1, 0,  1, 1,
                  0, 1,  0, 0,  1, 0,  1, 1,
                  0, 1,  0, 0,  1, 0,  1, 1 )
            m.bumpaxis.push(
                  0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
                  0, 0, +1,  0, 0, +1,  0, 0, +1,  0, 0, +1,
                  +1, 0, 0,  +1, 0, 0,  +1, 0, 0,  +1, 0, 0,
                  +1, 0, 0,  +1, 0, 0,  +1, 0, 0,  +1, 0, 0,
                  +1, 0, 0,  +1, 0, 0,  +1, 0, 0,  +1, 0, 0,
                  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0 )
            m.index.push(
                  0, 1, 2, 0, 2, 3,   4, 5, 6, 4, 6, 7,   8, 9, 10, 8, 10, 11,
                  12, 13, 14, 12, 14, 15,   16, 17, 18, 16, 18, 19,   20, 21, 22, 20, 22, 23 )
            //m.make_twosided() // seems not useful
            return m
        },

        makeQuad: function() { // origin of 2-triangle quad at lower left: (0, 0); used for depth peeling merge
            var m = new Mesh()
            m.pos.push( 
            	  -1, -1, 0,    +1, -1, 0,    +1, +1, 0,    -1, +1, 0 )
            m.normal.push(
                  0, 0, 1,    0, 0, 1,    0, 0, 1,    0, 0, 1 )
            m.color.push(
            	   1, 1, 1,    1, 1, 1,   1, 1, 1,   1, 1, 1)
            m.opacity.push(
            	   1,  1,  1,  1)
            m.shininess.push(
                   1,  1,  1,  1)
            m.emissive.push(
            	   0,  0,  0,  0)
            m.texpos.push( 
            	  0, 0,    1, 0,    1, 1,    0, 1 )
            m.bumpaxis.push(
                  1, 0, 0,    1, 0, 0,    1, 0, 0,    1, 0, 0 )
            m.index.push(
                  0, 1, 2,    0, 2, 3 )
            return m
        },
        
        makeCylinder: function(R) {
            var N = 50 // number of sides of the cylinder, of radius 1 and axis < 1,0,0 >
            // Total number of pos is 4*N+2 = 202 for N = 50
            var dtheta = 2*Math.PI/N
            var sind = Math.sin(dtheta), cosd = Math.cos(dtheta)
            // sin(theta+dtheta) = sin(theta)*cosd + cos(theta)*sind, so newy = y*cosd + z*sind
            // cos(theta+dtheta) = cos(theta)*cosd - sin(theta)*sind, so newz = z*cosd - y*sind
            var y = 0, z = -R
            var newy, newz
            var m = new Mesh()
            m.pos.push( 0, 0, 0,  1, 0, 0 )
            m.normal.push( -1, 0, 0,  1, 0, 0 )
            m.color.push( 1, 1, 1,  1, 1, 1 )
            m.opacity.push( 1, 1, 1, 1, 1, 1 )
            m.shininess.push( 1, 1, 1, 1, 1, 1 )
            m.emissive.push( 0, 0, 0, 0, 0, 0 )
            m.texpos.push( 0.5,0.5,  0.5,0.5 )
            m.bumpaxis.push( 0,0,-1,  0,0,-1 )
            for (var i=2; i<=2+4*N; i+=4) {
                
                m.pos.push( 0,y,z,  0,y,z,  1,y,z,  1,y,z )
                
                m.normal.push( -1,0,0,  0,y,z,  1,0,0,  0,y,z )
                
                m.color.push( 1,1,1,  1,1,1,  1,1,1,  1,1,1)
                
                m.opacity.push(1,  1,  1,  1)
                
                m.shininess.push(1,  1,  1,  1)
                
                m.emissive.push(0, 0, 0, 0)
                
                m.texpos.push( 0.5*(1+z/R),0.5+0.5*y/R, 1-(i-2)/N/4,0, 0.5*(1-z/R),0.5+0.5*y/R, 1-(i-2)/N/4,1 )
                
                m.bumpaxis.push( 1,0,0,  1,0,0,  1,0,0,  1,0,0  )
                
                if (i != 2+4*N) m.index.push( 0,i,i+4,  i+1,i+3,i+7,    i+1,i+7,i+5,    1,i+6,i+2  )
                
                newy = y*cosd + z*sind
                newz = z*cosd - y*sind
                y = newy
                z = newz
            }
            return m
        },
        
        /*
        // Doesn't quite work, but in any case one would need a special shader and special mesh
        // because the API says that size.x is the diameter of the cross section.
        makeRing: function(R1, R2) { // R1 = radius of ring; R2 = radius of cross section of ring
            var N = 30 // number of sides of each open cylinder
            var NC = 50 // number of open cylinders
            var dtheta = 2*Math.PI/N // going around a cross-section, the sides of each cylinder
            var dphi = 2*Math.PI/NC  // goind around the ring
            var sind = Math.sin(dtheta), cosd = Math.cos(dtheta)
            var sphi = Math.sin(dphi/2)
            // sin(theta+dtheta) = sin(theta)*cosd + cos(theta)*sind, so newy = y*cosd + z*sind
            // cos(theta+dtheta) = cos(theta)*cosd - sin(theta)*sind, so newz = z*cosd - y*sind
            var newy, newz
            var m = new Mesh()
            var phi = dphi/2
            for (var c=0; c<NC; c++) {
            	var r = vec(0, Math.sin(phi), -Math.cos(phi)) // unit vector from origin to center of cylindrical element
            	var R = r.multiply(R1)
            	var w = vec(0, Math.cos(phi), Math.sin(phi)) // unit vector along the cylindrical element
            	var q = vec(-1,0,0)
            	var y = 0, z = -R2
                for (var i=0; i<=2*N; i+=4) {
                	var rrel = (r.multiply(z).add(q.multiply(y)))
                	var r2 = rrel.add(R) // a point on the circular cross section
                	var L = vec(0, r2.y, r2.z).mag()*sphi // distance from point on cross section to end of cylindrical element
	                var end1 = r2.add(w.multiply(-L))
	                var end2 = r2.add(w.multiply(L))
	                
	                m.pos.push( end1.x,end1.y,end1.z,  end2.x,end2.y,end2.z )
	                
	                m.normal.push( rrel.x,rrel.y, rrel.z,  rrel.x,rrel.y, rrel.z )
                	
	                m.color.push( 1,1,1,  1,1,1 )
	                
	                m.opacity.push( 1, 1 )
	                
	                m.texpos.push( 0,0,  1,0 ) // TODO: these texpos values are not right
	                //m.texpos.push( 0.5*(1+z/R),0.5+0.5*y/R, 1-(i-2)/N/4,0, 0.5*(1-z/R),0.5+0.5*y/R, 1-(i-2)/N/4,1 )
	                
	                m.bumpaxis.push( 1,0,0,  1,0,0 )	                
	                
	                if (i != 2*N) m.index.push( i+1,i+3,i+7,    i+1,i+7,i+5  )
	                
	                newy = y*cosd + z*sind
	                newz = z*cosd - y*sind
	                y = newy
	                z = newz
	            }
            }
            return m
        },
        */

        makeSphere: function(R, N) {
            // A scheme which used spherical symmetry didn't save any time and was somewhat harder to read.
            // An improvement would be to offset alternate latitudes by dphi/2 to make equilateral triangles.
        	var Nlat = N, Nlong = N   // number of latitude and longitude slices
            var dtheta = Math.PI/Nlat   // polar angle (latitude)
            var dphi = 2*Math.PI/Nlong  // azimuthal angle (longitude)
            var sint = Math.sin(dtheta), cost = Math.cos(dtheta)
            var sinp = Math.sin(dphi), cosp = Math.cos(dphi)
            // sin(theta+dtheta) = sin(theta)*cost + cos(theta)*sint
            // cos(theta+dtheta) = cos(theta)*cost - sin(theta)*sint
            var m = new Mesh()
            var x1, x2, y1, y2, z1, z2, newy1, newz1, s, firstz2
            var i, j
            x1 = R // rightmost latitude in this latitude band
            y1 = 0
            z1 = 0
            // This algorithm started out with the "cut line" in from (z > 0).
            // z-related quantities now have minus signs to put the cut line at the back,
            // to make textures look better.
            for (i=0; i<Nlat; i++) { 
                    x2 = x1*cost-z1*sint // leftmost latitude in this latitude band
                    y2 = 0
                    firstz2 = z2 = z1*cost+x1*sint
                    for (j=0; j<=Nlong; j+=1) {
                    
                        m.pos.push( x1,y1,-z1 )
                        m.normal.push( x1/R,y1/R,-z1/R )
                        m.color.push( 1,1,1 )
                        m.opacity.push( 1 )
                        m.shininess.push( 1 )
                        m.emissive.push( 0 )
                        m.texpos.push( 1-j/Nlong,1-i/Nlat )
                        m.bumpaxis.push( 0,z1/R,y1/R )
                    
                        s = i*(Nlong+1)
                        if (j != Nlong) m.index.push( s+j,s+j+Nlong+2,s+j+1,  s+j,s+j+Nlong+1,s+j+Nlong+2 )
                    
                        newy1 = y1*cosp+z1*sinp
                        newz1 = z1*cosp-y1*sinp
                        y1 = newy1
                        z1 = newz1
                    }
                    x1 = x2
                    y1 = 0
                    z1 = firstz2
    	            if (i == Nlat-1) {
    	            	z1 = R // to make it possible to calculate bumpaxis
    	                for (j=0; j<=Nlong; j+=1) {
    	                    m.pos.push( -R,0,0 )
    	                    m.normal.push( -1,0,0 )
                            m.color.push( 1,1,1 )
                            m.opacity.push( 1 )
                            m.shininess.push( 1 )
                            m.emissive.push( 0 )
                            m.texpos.push( 1-j/Nlong,0 )
    	                    m.bumpaxis.push( 0,z1/R,y1/R )
                            newy1 = y1*cosp+z1*sinp
                            newz1 = z1*cosp-y1*sinp
    	                    y1 = newy1
    	                    z1 = newz1
    	                }
    	            }
                }
            return m
        },

        makeCone: function(R) {
            // This cone algorithm gives the same unsmooth display as PhiloGL and should be changed to use the
            // VPython algorithm, which apparently generates a series of rings in order to make the cone smooth.
            // Dave: You shouldn't need vertical slices to make the cone smooth.  I think you just need two triangles per "face" of the cone,
            //    so the normal on the edges can be different at the tip
        
            var N = 100 // number of sides of the cone, of radius 1 and axis < 1,0,0 >
            // Total number of pos is 3*N+1 = 301 for N = 100 (not smooth enough with N = 50)
            var dtheta = 2*Math.PI/N
            var sind = Math.sin(dtheta), cosd = Math.cos(dtheta)
            var k = 1/Math.sqrt(2)
            // sin(theta+dtheta) = sin(theta)*cosd + cos(theta)*sind, so newy = y*cosd + z*sind
            // cos(theta+dtheta) = cos(theta)*cosd - sin(theta)*sind, so newz = z*cosd - y*sind
            var y = 0, z = -R
            var newy, newz
            var m = new Mesh()
            m.pos.push( 0, 0, 0 )
            m.normal.push( -1, 0, 0 )
            m.color.push( 1, 1, 1 )
            m.opacity.push( 1 )
            m.shininess.push( 1 )
            m.emissive.push( 0 )
            m.texpos.push( 0.5,0.5 )
            m.bumpaxis.push( 0,0,1 )
            for (var i=1; i<=1+3*N; i+=3) {
                newy = y*cosd + z*sind
                newz = z*cosd - y*sind
            
                m.pos.push( 0,y,z,  0,y,z,      1,0,0 )
                
                m.normal.push( -1,0,0,  k,k*y,k*z,  k,k*(y+newy)/2,k*(z+newz)/2 )
                
                m.color.push( 1,1,1,  1,1,1,  1,1,1 )
                
                m.opacity.push( 1,  1,  1 )
                
                m.shininess.push( 1, 1, 1 )
                
                m.emissive.push( 0, 0, 0 )
                
                m.texpos.push( 0.5*(1+z/R),0.5*(1+y/R), 1-(i-1)/N/3,0,  1-(i-1)/N/3,1 )
                
                m.bumpaxis.push( 0,0,1,  0,0,1,  0,-z,y )
                 
                if (i != 1+3*N) m.index.push( 0,i,i+3,  i+1,i+2,i+4  )
            
                y = newy
                z = newz
            }
            return m
        },

        makePyramid: function() {
            // pyramid has base that is length (x) by width (z) by height (y); default axis is < 1,0,0 >
            var m = new Mesh()
            m.pos.push(
                    0,.5,.5,   0,.5,-.5,  0,-.5,-.5,  0,-.5,.5,  // base (on left)
                    0,.5,-.5,   0,.5,.5,    1,0,0,  // top
                    0,-.5,-.5,  0,.5,-.5,   1,0,0,  // back
                    0,-.5,.5,   0,-.5,-.5,  1,0,0,  // bottom
                    0,.5,.5,    0,-.5,.5,   1,0,0 ) // front
            m.normal.push(
                    -1,0,0,  -1,0,0,  -1,0,0,  -1,0,0,  // base (on left)
                    1,2,0,   1,2,0,   1,2,0,  // top
                    1,0,-2,  1,0,-2,  1,0,-2, // back
                    1,-2,0,  1,-2,0,  1,-2,0, // bottom
                    1,0,2,   1,0,2,   1,0,2 ) // front
            m.color.push(
            		1,1,1,  1,1,1,  1,1,1,  1,1,1,
            		1,1,1,  1,1,1,  1,1,1,
            		1,1,1,  1,1,1,  1,1,1,
            		1,1,1,  1,1,1,  1,1,1,
            		1,1,1,  1,1,1,  1,1,1)
            m.opacity.push(
            		1,  1,  1,  1,
            		1,  1,  1,
            		1,  1,  1,
            		1,  1,  1,
            		1,  1,  1 )
            m.shininess.push(
                    1,  1,  1,  1,
                    1,  1,  1,
                    1,  1,  1,
                    1,  1,  1,
                    1,  1,  1 )
             m.emissive.push(
                    0,  0,  0,  0,
                    0,  0,  0,
                    0,  0,  0,
                    0,  0,  0,
                    0,  0,  0 )
            m.texpos.push( 1,1, 0,1, 0,0, 1,0,           // base (on left) 
            				0,0,    0.25,0,   0.125,1,    // top
            				1,0,    0.75,0,   0.875,1,    // back
            				0.5,0,  0.75,0,   0.625,1,    // bottom
            				0.25,0, 0.5,0,    0.375,1 )   // front
            m.bumpaxis.push( 0,0,1, 0,0,1, 0,0,1, 0,0,1,     // base (on left)  
   				 			 0,0,1,  0,0,1,  0,0,1,          // top
            				 0,1,0,  0,1,0,  0,1,0,          // back  
            				 0,0,-1, 0,0,-1, 0,0,-1,         // bottom
            				 0,-1,0, 0,-1,0, 0,-1,0  )       // front
            m.index.push(0,1,2,  0,2,3,  4,5,6,  7,8,9,  10,11,12,  13,14,15)
            return m
        },
        
        makeCurveSegment: function(R) {
            // A low-triangle-count cylinder with a hemisphere at one end, to be rendered using the "curve_vertex" program
            // which will stretch the cylinder, but not the hemisphere, over the length of the segment.  To make this possible,
            // we provide 4D pos x,y,z,w, with w=0 being the beginning of the segment and w=1 the end. The position of a
        	// vertex with w=0 is relative to the beginning of the segment. The position of a vertex with w=1 is relative
        	// to the center of the hemisphere at the end of the segment. For example, x=0, y=0, z=0 with w=1 is the center
        	// of the hemisphere, whereas x=0, y=0, z=0 with w=0 is the center of the beginning of the segment.

            // An open-ended low-triangle-count cylinder for segments of a curve object
            var N = 16 // number of sides of the cylinder, of radius 1 and axis < 1,0,0 >
            // Total number of pos is 2*N = 32 for N = 16
            var dtheta = 2*Math.PI/N
            var sind = Math.sin(dtheta), cosd = Math.cos(dtheta)
            // sin(theta+dtheta) = sin(theta)*cosd + cos(theta)*sind, so newy = y*cosd + z*sind
            // cos(theta+dtheta) = cos(theta)*cosd - sin(theta)*sind, so newz = z*cosd - y*sind
            var y = 0, z = -R
            var newy, newz
            var m = new Mesh()
            for (var i=0; i<=2*N; i+=2) {
            
                m.pos.push( 0,y,z,0,  0,y,z,1 )
                m.normal.push(  0,y,z,  0,y,z )
                m.color.push( 1,1,1,  1,1,1 )
                m.opacity.push( 1, 1 )
                m.shininess.push ( 1, 1 )
                m.emissive.push( 0, 0 )
                m.texpos.push( 0,0, 0,0 ) // no textures or bumpmaps currently for curve points
                m.bumpaxis.push( 0,0,0, 0,0,0 )

                if (i != 2*N) m.index.push( i,i+2,i+1,  i+1,i+2,i+3  )
                
                newy = y*cosd + z*sind
                newz = z*cosd - y*sind
                y = newy
                z = newz
            }
            
            var offset = m.pos.length/4
            var sph = Mesh.makeSphere(R, N)
            // sph.pos.length/3 = 81 for N = 8; 9 pos per latitude (where points 0 and 8 coincide)
            for(var i=0; i<(N/2+1)*(N+1); i+=1) { // N/2+1 groups of N+1 pos for the hemisphere, including the equator
                m.pos.push( sph.pos[3*i], sph.pos[3*i+1], sph.pos[3*i+2], 1 )
                m.normal.push(sph.normal[3*i], sph.normal[3*i+1], sph.normal[3*i+2])
                m.color.push(1, 1, 1)
                m.opacity.push(1)
                m.shininess.push ( 1 )
                m.emissive.push( 0 )
                m.texpos.push( sph.texpos[2*i], sph.texpos[2*i+1] )
                m.bumpaxis.push( sph.bumpaxis[3*i], sph.bumpaxis[3*i+1], sph.bumpaxis[3*i+2] )
            }
            for(var i=0; i<sph.index.length/2; i++)
                m.index.push(sph.index[i] + offset)
            return m
        }
    })

    var exports = {
        Mesh:Mesh
        }

    Export(exports)
})()