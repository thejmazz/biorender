import bpy
import imp
from mathutils import Vector

# Blender utils
from blenderutils import setMode, delete_all_meshes
# imp.reload(blenderutils)

# Decorators
# import blenderDecorators
from blenderDecorators import startClean
# imp.reload(blenderDecorators)

# Mesh geometries
# All geometry methods return the object created
import geom
imp.reload(geom)

# Edit mode operators
import edit
imp.reload(edit)

# === CONSTANTS ===

# Used in getFaceEdgeMap, getPolygonByNormal
# INDEX_OF = 0
# REF_TO = 1

# === FUNCTIONS ===

# Define as variables which values come from obj.data at the top of each scope
# where they are required.

# Always return a previosuly assigned variable, not a statement to execute.
# Except if you are in a loop and its faster to break out once you find what
# you need.

def getFaceEdgeMap(obj):
    edges = obj.data.edges
    edge_keys = obj.data.edge_keys

    face_edge_map = {ek: edges[i] for i, ek in enumerate(edge_keys)}

    return face_edge_map

# TODO check if normal is actually normal, throw error
def getPolygonByNormal(obj, normal):
    polygons = obj.data.polygons

    for polygon in polygons:
        if polygon.normal == normal:
            return polygon

def getEdgeForFaceAtIndex(obj, face, index):
    face_edge_map = getFaceEdgeMap(obj)
    edge_keys = face.edge_keys

    for i, ek in enumerate(edge_keys):
        edge = face_edge_map[ek]

        if i == index:
            return edge

# === START ===

# cristae_disc_loop_cut_scale_val = 2.4

@startClean
def main():
    cristae = geom.box(scale=(0.1, 1, 1), name='Cristae')

    face = getPolygonByNormal(cristae, Vector((1, 0, 0)))
    good_index = getEdgeForFaceAtIndex(cristae, face, 0).index

    edit.loop_cut(good_index, 2)
    setMode('EDIT')

    #bpy.ops.transform.resize(value=(1, cristae_disc_loop_cut_scale_val, 1))

main()
