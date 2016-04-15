import bpy

def box(loc=(0,0,0), scale=(1,1,1), name=''):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    bpy.ops.transform.resize(value=scale)

    if name != '':
        bpy.context.object.name = name
