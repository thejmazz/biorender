import bpy

def objectMode(func):
    def inner(*args, **kwargs):
        bpy.ops.object.mode_set(mode='OBJECT')
        ret = func(*args, **kwargs)
    return inner

@objectMode
def delete_all_meshes():
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.select = True
        else:
            obj.select = False

    bpy.ops.object.delete()
