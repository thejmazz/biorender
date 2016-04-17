import bpy
import imp

# Decorators
import blenderDecorators
imp.reload(blenderDecorators)
from blenderDecorators import startClean

# Mesh geometries
import geom
imp.reload(geom)

# Edit mode operators
import edit
imp.reload(edit)

# Modifiers
import modifiers

# Materials
import materials
imp.reload(materials)
from materials import makeMaterial, setMaterial

import meshUtils
imp.reload(meshUtils)
from meshUtils import getPolygonByNormal, getEdgeForFaceAtIndex, selectVerticesAndAssignMaterial

# === START ===

cristae_disc_loop_cut_scale_val = 2.5

def make_cristae(name='Cristae', loc=(0,0,0), scale=(0.1, 1, 1), loop_cut_scale_val=2.4):
    # Initial box
    cristae = geom.box(loc=loc, scale=(0.1, 1, 1), name=name)

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

    selectVerticesAndAssignMaterial(cristae, 'Cristae.Pinch', {'y': {'lt': -0.89}}, makeMaterial('Cristae.Pinch', (1,0,0), (1,1,1), 1))
    selectVerticesAndAssignMaterial(cristae, 'Cristae.Wall', {'y': {'gte': -0.91}}, makeMaterial('Cristae.Wall', (0,0,1), (1,1,1), 1))

    setMode('OBJECT')
    # === SECOND ===

@startClean
def main():
    make_cristae(name='Cristae.001', loc=(-1,0,0))

    make_cristae(name='Cristae.002', loc=(1, 0, 0))
    # loc = (1, 0, 0)
    # cristae = geom.box(loc=loc, scale=(0.1, 1, 1), name='Cristae.002')

    # crashes..
    #make_cristae(loc=(1,0,0))

main()
