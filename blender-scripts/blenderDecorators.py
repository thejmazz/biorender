import bpy

import blenderutils
# from blenderutils import setMode, delete_all_meshes

def delete_all_materials():
    for material in bpy.data.materials:
        material.user_clear()
        bpy.data.materials.remove(material)

def objectMode(func):
    def inner(*args, **kwargs):
        blenderutils.setMode('OBJECT')
        ret = func(*args, **kwargs)
    return inner

def editMode(func):
    def inner(*args, **kwargs):
        blenderutils.setMode('EDIT')
        ret = func(*args, **kwargs)
    return inner

def startClean(func):
    def inner(*args, **kwargs):
        blenderutils.delete_all_meshes()
        delete_all_materials()
        ret = func(*args, **kwargs)
    return inner
