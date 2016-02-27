import bpy

# Add cube with radius 1 at (0,0,0)
bpy.ops.mesh.primitive_cube_add(radius=1, location=(0,0,0))

# Get reference to the cube
cube = bpy.data.objects["Cube"]

# Select it for ops
cube.select = True

# Scale x by 3
bpy.ops.transform.resize(value=(3,1,1))

# Add Subsurf modifier
bpy.ops.object.modifier_add(type="SUBSURF")
bpy.context.object.modifiers["Subsurf"].levels=4
bpy.context.object.modifiers["Subsurf"].render_levels=4
bpy.ops.object.modifier_apply(apply_as="DATA", modifier="Subsurf")

# Solidify
bpy.ops.object.modifier_add(type="SOLIDIFY")
bpy.context.object.modifiers["Solidify"].offset = 0
bpy.context.object.modifiers["Solidify"].thickness = 0.04
bpy.ops.object.modifier_apply(apply_as='DATA', modifier="Solidify")


bpy.ops.mesh.separate(type="LOOSE")


