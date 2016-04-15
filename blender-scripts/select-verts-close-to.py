import bpy, bmesh

# Get the active mesh
active_mesh = bpy.context.object.data

mesh = bmesh.from_edit_mesh(active_mesh)

center = 0.0
threshold = 0.1


for v in mesh.verts:
    z = v.co.z
    if z >= center-threshold and z <= center+threshold:
        v.select = True

# Trigger viewport update
bpy.context.scene.objects.active = bpy.context.scene.objects.active

