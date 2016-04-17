import bpy
import bmesh
import imp
from mathutils import Vector

# Blender utils
from blenderutils import setMode, delete_all_meshes
# imp.reload(blenderutils)

# Decorators
import blenderDecorators
imp.reload(blenderDecorators)
from blenderDecorators import startClean

# Mesh geometries
# All geometry methods return the object created
import geom
imp.reload(geom)

# Edit mode operators
import edit
imp.reload(edit)

# Modifiers
import modifiers

# Materials
from materials import makeMaterial, setMaterial

# === Decorators

def editMode(func):
    def inner(*args, **kwargs):
        setMode('EDIT')
        ret = func(*args, **kwargs)
    return inner

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

def getMaterialIndexByName(obj, name):
    for i, mat in enumerate(obj.material_slots):
        if mat.name == name:
            return i

# Creates a vertex group since bmesh data is ephemeral
@editMode
def select_vertices(obj, group, filters):
    mesh = bmesh.from_edit_mesh(obj.data)
    vertices = []

    axisMap = {
        'x': 0,
        'y': 1,
        'z': 2
    }

    for v in mesh.verts:
        satisfied = True
        for axis in filters:
            for relation in filters[axis]:
                mesh_val = v.co[axisMap[axis]]
                val = filters[axis][relation]

                if relation == 'lt':
                    if mesh_val >= val:
                        satisfied = False
                elif relation == 'lte':
                    if mesh_val > val:
                        satisfied = False
                elif relation == 'gt':
                    if mesh_val <= val:
                        satisfied = False
                elif relation == 'gte':
                    if mesh_val < val:
                        satisfied = False

        if satisfied:
            vertices.append(v.index)

    vertex_group = obj.vertex_groups.new(group)

    # === MODE TOGGLE ===
    setMode('OBJECT')

    vertex_group.add(vertices, 1.0, 'REPLACE')

def assignMaterialToGroup(obj, group, material):
    setMaterial(obj, material)
    obj.active_material_index = getMaterialIndexByName(obj, material.name)

    bpy.ops.object.vertex_group_set_active(group=group)

    # === MODE TOGGLE ===
    setMode('EDIT')

    bpy.ops.object.vertex_group_select()
    bpy.ops.object.material_slot_assign()

def selectVerticesAndAssignMaterial(obj, group, filters, material):
    select_vertices(obj, group, filters)
    assignMaterialToGroup(obj, group, material)

# === START ===

cristae_disc_loop_cut_scale_val = 2.5

@startClean
def main():
    # Initial box
    cristae = geom.box(scale=(0.1, 1, 1), name='Cristae')

    # Loop cut on front face 2x horizontally and vertically
    face = getPolygonByNormal(cristae, Vector((1, 0, 0)))

    edit.loop_cut(getEdgeForFaceAtIndex(cristae, face, 0).index, 2)
    bpy.ops.transform.resize(value=(1, cristae_disc_loop_cut_scale_val, 1))

    edit.loop_cut(getEdgeForFaceAtIndex(cristae, face, 1).index, 2)
    bpy.ops.transform.resize(value=(1, 1, cristae_disc_loop_cut_scale_val))

    # Subdivision surface 4x
    modifiers.subsurf(4)

    # Set base material
    setMaterial(cristae, makeMaterial('Cristae.Base', (1,1,1), (1,1,1), 1))

    # selectVerticesAndAssignMaterial(cristae, 'Curved', {'y': {'lt': -0.9}}, makeMaterial('Red', (1,0,0), (1,1,1), 1))

    selectVerticesAndAssignMaterial(cristae, 'Curved', {
        'y': {'gt': 0},
        'z': {'gte': 0}
    }, makeMaterial('Red', (1,0,0), (1,1,1), 1))
main()
