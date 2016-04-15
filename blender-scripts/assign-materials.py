import bpy
import imp

import geom
imp.reload(geom)

import edit
imp.reload(edit)



cristae_disc_loop_cut_scale_val = 2.4

geom.box(scale=(0.1, 1, 1), name='Cristae')

ob = bpy.data.objects['Cristae']

edges = ob.data.edges
face_edge_map = {ek: edges[i] for i, ek in enumerate(me.edge_keys)}

for polygon in ob.data.polygons:
    print('face index', polygon.index)
    print('normal', polygon.normal)

    for ek in polygon.edge_keys:
        edge = face_edge_map[ek]
        print('edge', ek, edge)




    #edit.loop_cut(7, 2)
    #bpy.ops.transform.resize(value=(1, cristae_disc_loop_cut_scale_val, 1))
