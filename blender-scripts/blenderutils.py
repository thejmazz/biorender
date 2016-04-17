import bpy

import blenderDecorators
# from blenderDecorators import objectMode

def setMode(mode):
    bpy.ops.object.mode_set(mode=mode)

@blenderDecorators.objectMode
def delete_all_meshes():
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.select = True
        else:
            obj.select = False

    bpy.ops.object.delete()

def unselect_all():
    for obj in bpy.data.objects:
        obj.select = False
