import bpy
import bmesh
import imp
from operator import itemgetter
import random

# Utils
import blenderutils
imp.reload(blenderutils)
from blenderutils import unselect_all, setMode

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

# TODO generalize this
# TODO use Vector object
def select_some(obj, center, threshold):
    setMode('EDIT')
    mesh = bmesh.from_edit_mesh(obj.data)

    vertices = []

    for v in mesh.verts:
        v = obj.matrix_world * v.co

        x = v.x
        y = v.y
        z = v.z

        if y >= 0 and z >= center-threshold and z <= center+threshold:
            vertices.append({'x': x, 'y':y, 'z':z})

    bpy.ops.object.mode_set(mode='OBJECT')

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

def make_cristae(loc, scale=(0.1, 1, 1), loop_cut_scale_val=2.4):
    # Initial box
    cristae = geom.box(loc=loc, scale=scale, name='Cristae')

    # Loop cut on front face 2x horizontally and vertically
    face = getPolygonByNormal(cristae, Vector((1, 0, 0)))

    edit.loop_cut(getEdgeForFaceAtIndex(cristae, face, 0).index, 2)
    bpy.ops.transform.resize(value=(1, loop_cut_scale_val, 1))

    edit.loop_cut(getEdgeForFaceAtIndex(cristae, face, 1).index, 2)
    bpy.ops.transform.resize(value=(1, 1, loop_cut_scale_val))

    # Subdivision surface 4x
    modifiers.subsurf(4)

    # Set base material
    setMaterial(cristae, makeMaterial('Cristae.Base', (1,1,1), (1,1,1), 1))

    selectVerticesAndAssignMaterial(cristae, 'Cristae.Pinch', {'y': {'lt': -0.89}}, makeMaterial('Cristae.Pinch', (1,0,0), (1,1,1), 1))
    selectVerticesAndAssignMaterial(cristae, 'Cristae.Wall', {'y': {'gte': -0.91}}, makeMaterial('Cristae.Wall', (0,0,1), (1,1,1), 1))

def make_mitochondria(length=3, width=1, num_rows=30, padding_factor=0.2, do_laplace=False):
    # Settings
    # TODO paramaterize
    mito_length = 0.8*length
    row_width = mito_length / num_rows
    cristae_width = row_width*(1 - 2*padding_factor)
    cristae_disc_subsurf_level = 2
    # cristae_disc_loop_cut_scale_val = 2.4
    inner_membrane_subsurf_level = 2
    laplace_smooth_factor = 15


    make_membranes(scale=(length, width, 1))

    unselect_all()

    innerMembane = bpy.data.objects['Inner Membrane']
    vertices = sorted(select_some(innerMembane, center=0.0, threshold=0.01), key=itemgetter('x'))
    j_spaces = []

    start = 0 - mito_length
    for i in range(0, 1):
    # for i in range(0, num_rows+1):
        x = start + 2*row_width*i
        y = -2

        for v in vertices:
            if v['x'] >= x:
                j_spaces.append(2*v['y'])
                y = v['y'] + width
                break


        j_1 = j_spaces[i]*random.random()
        y -= j_1

        j_2 = (j_spaces[i]-j_1)*random.random()
        y2 = y - j_2 - width*2

        print('{x: %s, y1: %s, y2: %s}' % (x, y, y2))

        make_cristae(loc=(x, y, 0), scale=(cristae_width, 1, 1))

# === START ===

@startClean
def main():
    make_mitochondria()

    # make_cristae(loc=(0,0,0))

main()
