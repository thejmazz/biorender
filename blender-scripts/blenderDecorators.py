import bpy

import blenderutils
# from blenderutils import setMode, delete_all_meshes

def objectMode(func):
    def inner(*args, **kwargs):
        blenderutils.setMode('OBJECT')
        ret = func(*args, **kwargs)
    return inner

def startClean(func):
    def inner(*args, **kwargs):
        blenderutils.delete_all_meshes()
        ret = func(*args, **kwargs)
    return inner
