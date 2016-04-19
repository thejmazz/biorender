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
from materials import makeMaterial, setMaterial, remove_unused_materials

# Mesh utils
import meshUtils
imp.reload(meshUtils)
from meshUtils import getPolygonByNormal, getEdgeForFaceAtIndex, selectVerticesAndAssignMaterial

# Math
from mathutils import Vector

# === DECORATORS ===
def timeit(method):
  from time import time
  def timed(*args, **kw):
    ts = time()
    result = method(*args, **kw)
    te = time()
    print('\t{:s} {:2.2f}'.format(method.__name__,te-ts))
    return result
  return timed

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

def remove_top_outer():
    bpy.context.object.select = False

    bpy.ops.object.mode_set(mode='EDIT')

    mesh=bmesh.from_edit_mesh(bpy.context.object.data)

    for v in mesh.verts:
        v2 = bpy.context.object.matrix_world * v.co
        if v2.z > 0.01:
            v.select = True

    bpy.ops.mesh.delete(type='VERT')

def numToStr(num):
    if num > 99:
        return str(num)
    elif num > 9:
        return '0' + str(num)
    else:
        return '00' + str(num)

def smooth_shade_everything():
    bpy.ops.object.select_all()
    bpy.ops.object.shade_smooth()


def make_membranes(scale, loc=(0,0,0)):
    geom.box(loc, scale, name='Membrane')

    modifiers.subsurf(4)
    modifiers.solidify(0, 0.04)

    # Seperate Inner and Outer membrane
    bpy.ops.mesh.separate(type='LOOSE')

    # Rename
    bpy.data.objects['Membrane'].name = 'Inner-Membrane'
    bpy.data.objects['Membrane.001'].name = 'Outer-Membrane'

    # Materialize Outer-Membrane
    setMaterial(bpy.data.objects['Outer-Membrane'], makeMaterial('Membrane.Outer', (0,1,0), (1,1,1), 1))

def make_cristae(name='Cristae', loc=(0,0,0), scale=(0.1, 1, 1), side='right', loop_cut_scale_val=2.4, subsurf_level=2):
    # Initial box
    cristae = geom.box(loc=loc, scale=scale, name=name)

    # Loop cut on front face 2x horizontally and vertically
    face = getPolygonByNormal(cristae, Vector((1, 0, 0)))

    edit.loop_cut(getEdgeForFaceAtIndex(cristae, face, 0).index, 2)
    bpy.ops.transform.resize(value=(1, loop_cut_scale_val, 1))

    edit.loop_cut(getEdgeForFaceAtIndex(cristae, face, 1).index, 2)
    bpy.ops.transform.resize(value=(1, 1, loop_cut_scale_val))

    # Subdivision surface
    modifiers.subsurf(subsurf_level)

    # Set base material
    setMaterial(cristae, makeMaterial('Membrane.Inner.Base', (1,1,1), (1,1,1), 1))

    # TODO figure out what these numbers should be procedurally
    # was 0.89, 0.91 with 4x subdiv.
    pinchThreshold = 0.90
    wallThreshold = 0.95

    if side == 'right':
        selectVerticesAndAssignMaterial(cristae, 'Membrane.Inner.Pinch', {'y': {'lt': -pinchThreshold}}, makeMaterial('Membrane.Inner.Pinch', (1,0,0), (1,1,1), 1))
        selectVerticesAndAssignMaterial(cristae, 'Membrane.Inner.Wall', {'y': {'gte': -wallThreshold}}, makeMaterial('Membrane.Inner.Wall', (0,0,1), (1,1,1), 1))
    elif side == 'left':
        selectVerticesAndAssignMaterial(cristae, 'Membrane.Inner.Pinch', {'y': {'gte': pinchThreshold}}, makeMaterial('Membrane.Inner.Pinch', (1,0,0), (1,1,1), 1))
        selectVerticesAndAssignMaterial(cristae, 'Membrane.Inner.Wall', {'y': {'lt': wallThreshold}}, makeMaterial('Membrane.Inner.Wall', (0,0,1), (1,1,1), 1))

    setMode('OBJECT')

def make_mitochondria(length=3, width=1, num_rows=30, padding_factor=0.2, do_laplace=False, skip_material_cleaning=True, export=False):
    # Settings
    # TODO paramaterize
    mito_length = 0.8*length
    row_width = mito_length / num_rows
    # cristae_width = row_width*(1 - 2*padding_factor)
    cristae_width = 12.67 * 0.002
    cristae_disc_subsurf_level = 2
    # cristae_disc_loop_cut_scale_val = 2.4
    inner_membrane_subsurf_level = 2
    laplace_smooth_factor = 15


    make_membranes(scale=(length, width, 1))

    unselect_all()

    innerMembane = bpy.data.objects['Inner-Membrane']
    vertices = sorted(select_some(innerMembane, center=0.0, threshold=0.01), key=itemgetter('x'))
    j_spaces = []

    start = 0 - mito_length
    # for i in range(0, 2):
    for i in range(0, num_rows+1):
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

        spacage  = j_2 / j_spaces[i]

        make_cristae(name='Cristae.' + numToStr(i*2), loc=(x, y, 0), scale=(cristae_width, 1, 1), subsurf_level=cristae_disc_subsurf_level)

        if spacage >= 0.4:
            make_cristae(name='Cristae.' + numToStr(i*2 + 1), loc=(x, y2, 0), scale=(cristae_width, 1, 1), side='left', subsurf_level=cristae_disc_subsurf_level)

    # Select all cristaes
    # for i in range(0, num_rows+1):
    #     bpy.data.objects['Cristae.' + numToStr(i*2)].select = True
    #     bpy.data.objects['Cristae.' + numToStr(i*2 + 1)].select = True
    for obj in bpy.data.objects:
        if 'Cristae' in obj.name:
            obj.select = True

    # Join Cristaes
    bpy.ops.object.join()

    # bpy.data.objects['Cristae.' + numToStr(num_rows*2 + 1)].name = 'Cristae.All'

    # bpy.data.objects['Cristae.All'].select = True
    modifiers.boolean(bpy.data.objects['Inner-Membrane'], 'UNION')

    # TODO fix cristae's ending up outside
    # bpy.ops.mesh.separate(type='LOOSE')
    # unselect_all()
    #
    # for obj in bpy.data.objects:
    #     if 'Cristae' in obj.name and obj.name != 'Cristae.All.001':
    #         obj.select = True
    # # bpy.data.objects['Cristae.All'].select = True
    # # bpy.data.objects['Cristae.All.002'].select = True
    # bpy.ops.object.delete()

    # Remove top half of outer membrane
    unselect_all()
    bpy.context.scene.objects.active = bpy.data.objects['Outer-Membrane']
    bpy.data.objects['Outer-Membrane'].select = True
    remove_top_outer()

    # Remove old inner membrane
    setMode('OBJECT')
    unselect_all()
    bpy.data.objects['Inner-Membrane'].select = True
    bpy.ops.object.delete()

    # Rename
    # bpy.data.objects['Cristae.All.001'].name = 'Inner-Membrane'
    # bpy.data.objects['Cristae.All'].name = 'Inner-Membrane'
    # Should be only one Cristae\.d+
    for obj in bpy.data.objects:
        if 'Cristae' in obj.name:
            obj.name = 'Inner-Membrane'

    bpy.data.objects['Inner-Membrane'].select = True
    bpy.context.scene.objects.active = bpy.data.objects['Inner-Membrane']

    modifiers.subsurf(inner_membrane_subsurf_level)
    modifiers.corrective_smooth(1, 5, True)
    if (do_laplace):
        modifiers.laplacian_smooth(laplace_smooth_factor)

    # === bisect ===
    setMode('EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.bisect(plane_co=(0,0,0), plane_no=(0,0,1), xstart=10, xend=545, ystart=572, yend=572)

    mesh = bmesh.from_edit_mesh(bpy.context.object.data)
    zs = []

    for v in mesh.verts:
        v2 = bpy.context.object.matrix_world * v.co
        if v.select == True:
            v.select = False
            zs.append(v2.z)

    mz = max(zs)

    for v in mesh.verts:
        v2 = bpy.context.object.matrix_world * v.co
        if v2.z > mz:
            v.select = True

    bpy.ops.mesh.delete(type='VERT')

    setMode('OBJECT')
    unselect_all()

    # === Solidifiy outer membrane ===
    bpy.data.objects['Outer-Membrane'].select = True
    bpy.context.scene.objects.active = bpy.data.objects['Outer-Membrane']
    modifiers.solidify(0, 4 * 0.002)

    reset_box = geom.box(loc=(5,5,5), name='Reset-Box')

    # Make and join to reset box then fix up
    unselect_all()
    bpy.data.objects['Inner-Membrane'].select = True
    bpy.data.objects['Reset-Box'].select = True
    bpy.context.scene.objects.active = bpy.data.objects['Reset-Box']
    bpy.ops.object.join()
    setMode('EDIT')
    bpy.ops.mesh.separate(type='LOOSE')
    setMode('OBJECT')
    unselect_all()
    bpy.data.objects['Reset-Box.001'].select = True
    bpy.ops.object.delete()
    bpy.data.objects['Reset-Box'].name = 'Inner-Membrane'


    # Solidify Inner-Membrane
    unselect_all()
    bpy.data.objects['Inner-Membrane'].select = True
    modifiers.solidify(0, 4 * 0.002)

    # Clean up materials
    if not skip_material_cleaning:
        remove_unused_materials(bpy.data.objects['Inner-Membrane'])

    unselect_all()
    bpy.data.objects['Inner-Membrane'].select = True
    bpy.data.objects['Outer-Membrane'].select = True

    bpy.ops.object.join()

    bpy.data.objects['Inner-Membrane'].name = 'Mitochondria'

    unselect_all()
    bpy.data.objects['Mitochondria'].select = True

    bpy.ops.object.shade_smooth()

    unselect_all()
    bpy.data.objects['Mitochondria'].select = True

    if export:
        bpy.ops.export_scene.obj(
            filepath='/Users/jmazz/Desktop/mitochondria.obj',
            check_existing=False,
            axis_forward='-Z',
            axis_up='Y',
            use_selection=True,
            use_uvs=False,
            use_materials=False,
            group_by_material=True
        )

# === START ===

@timeit
@startClean
def main():
    make_mitochondria(export=False)

random.seed(1000825609)
main()
