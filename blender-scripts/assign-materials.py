import imp
import bpy
import mathutils

# Blender utils
import utils
imp.reload(utils)

# Mesh geometries
import geom
imp.reload(geom)

# Edit mode operators
import edit
imp.reload(edit)


# === START ===

utils.delete_all_meshes()

cristae_disc_loop_cut_scale_val = 2.4

geom.box(scale=(0.1, 1, 1), name='Cristae')

ob = bpy.data.objects['Cristae']

edges = ob.data.edges
# face_edge_map = {ek: edges[i] for i, ek in enumerate(ob.data.edge_keys)}
face_edge_map = {ek: i for i, ek in enumerate(ob.data.edge_keys)}

good_index = 0
for polygon in ob.data.polygons:
    v = mathutils.Vector((1, 0, 0))
    print('face index', polygon.index)
    print('normal', polygon.normal)

    if polygon.normal == v:
        for i, ek in enumerate(polygon.edge_keys):
            edge = face_edge_map[ek]
            if (i == 1):
                good_index = edge
            print('edge', ek, edge)


print(good_index)

edit.loop_cut(good_index, 2)
    #bpy.ops.transform.resize(value=(1, cristae_disc_loop_cut_scale_val, 1))
