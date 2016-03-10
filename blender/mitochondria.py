# === Imports ===
import bpy
import random

# Length of mitochondrion block
a = 3
# Width of mitochondrion block
b = 1
# Factor to apply on a to get length of subdived block
f1 = 0.8
c = f1 * a
# Number of cristae rows (#cristae/2)
n = 20
# Width of row
w = c / n
# Padding in each cristae block
pf = 0.2
p = w*pf
# Width of actual cristae
wI = w - 4*p

# === Functions ===

# takes two tuples of 3
def make_box(loc=(0,0,0), scale=(1,1,1)):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    bpy.ops.transform.resize(value=scale)

def make_row(n, scale, spacing, origin):
    x = origin["x"]
    y = origin["y"]
    z = origin["z"]
    
    cristaes = []
    
    for i in range(1,n):
        cY = y + (random.random() - 0.5)*3.57
        
        bpy.ops.mesh.primitive_cube_add(radius=1, location=(x,cY,z))
        bpy.ops.transform.resize(value=(scale["x"], 1, 1))
        bpy.context.object.name = "Cristae"
        
        x += spacing
        
def make_membranes():
    make_box((0,0,0), (a,b,1))
    
    # Subsurf modifier
    bpy.ops.object.modifier_add(type="SUBSURF")
    bpy.context.object.modifiers["Subsurf"].levels = 4
    bpy.context.object.modifiers["Subsurf"].render_levels = 4
    bpy.ops.object.modifier_apply(apply_as="DATA", modifier="Subsurf")
    
    # Solidify
    bpy.ops.object.modifier_add(type="SOLIDIFY")
    bpy.context.object.modifiers["Solidify"].offset = 0
    bpy.context.object.modifiers["Solidify"].thickness = 0.04
    bpy.ops.object.modifier_apply(apply_as="DATA", modifier="Solidify")
    
    # Seperate Inner and Outer membrane
    bpy.ops.mesh.separate(type="LOOSE")

# === Main ===
random.seed(1000825609)
make_membranes()
# test f1
# make_box(scale=(c, 1, 1))

# make_box(loc=(0-c/2,0,0))

start = 0 - c
for i in range(0, 2*n+1):
    #x = start + w*i + 4*p*(i+1)
    #x = start + i*(w+p) + p*2 
    x = start + w*i
    make_box(loc=(x,0,0), scale=(wI, 1, 1))

# make_row(20, {"x":0.05}, 0.2, {"x":-2, "y": 0, "z": 0})
 
