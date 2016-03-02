# === Imports ===
import bpy
import random

# === Functions ===
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
    bpy.ops.mesh.primitive_cube_add(location=(0,0,0))
    bpy.ops.transform.resize(value=(3,1,1))
    
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
make_row(20, {"x":0.05}, 0.2, {"x":-2, "y": 0, "z": 0})
 