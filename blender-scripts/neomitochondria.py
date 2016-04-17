import bpy
import bmesh
import imp
from operator import itemgetter

# Utils
import blenderutils
imp.reload(blenderutils)
from blenderutils import unselect_all

# Decorators
import blenderDecorators
imp.reload(blenderDecorators)
from blenderDecorators import startClean, editMode

# Mesh geometries
import geom
imp.reload(geom)

# Edit mode operators
import edit
imp.reload(edit)

# Modifiers
import modifiers
imp.reload(modifiers)

# Materials
import materials
imp.reload(materials)
from materials import makeMaterial, setMaterial

import meshUtils
imp.reload(meshUtils)
from meshUtils import getPolygonByNormal, getEdgeForFaceAtIndex, selectVerticesAndAssignMaterial

# === FUNCTIONS ===

def select_some():
    bpy.ops.object.mode_set(mode='EDIT')

    active_mesh = bpy.context.object.data
    mesh = bmesh.from_edit_mesh(active_mesh)

    center = 0.0
    threshold = 0.01
    vertices = []

    for v in mesh.verts:
        v = bpy.context.object.matrix_world * v.co

        x = v.x
        y = v.y
        z = v.z

        if y >= 0 and z >= center-threshold and z <= center+threshold:
            # v.select = True
            vertices.append({'x': x, 'y':y, 'z':z})

    bpy.ops.object.mode_set(mode='OBJECT')

    # Trigger viewport update
    #bpy.context.scene.objects.active = bpy.context.scene.objects.active

    return vertices

def make_membranes(scale, loc=(0,0,0)):
    geom.box(loc, scale, name='Membrane')

    modifiers.subsurf(4)
    modifiers.solidify(0, 0.04)

    # Seperate Inner and Outer membrane
    bpy.ops.mesh.separate(type='LOOSE')

    # Rename
    bpy.data.objects['Membrane'].name = 'Inner Membrane'
    bpy.data.objects['Membrane.001'].name = 'Outer Membrane'

def make_cristae(loc, scale=(0.1, 1, 1)):
    # Initial box
    cristae = geom.box(loc=loc, scale=scale, name='Cristae')

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

def make_mitochondria(length=3, width=1):
    make_membranes(scale=(length, width, 1))

    unselect_all()

# === START ===

cristae_disc_loop_cut_scale_val = 2.5

@startClean
def main():
    make_mitochondria()
    bpy.data.objects['Inner Membrane'].select = True
    vertices = sorted(select_some(), key=itemgetter('x'))

    print(vertices)

    # make_cristae(loc=(0,0,0))

main()
