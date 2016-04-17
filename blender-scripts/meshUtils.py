import bpy
import bmesh

from blenderutils import setMode
from blenderDecorators import editMode
from materials import makeMaterial, setMaterial

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
    bpy.ops.object.vertex_group_deselect()

def selectVerticesAndAssignMaterial(obj, group, filters, material):
    select_vertices(obj, group, filters)
    assignMaterialToGroup(obj, group, material)
