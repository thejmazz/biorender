# === Imports ===
import bpy, bmesh
import random
from operator import itemgetter

# === Functions ===

def view3d_find(return_area=False):
    # returns first 3d view, normally we get from context
    for area in bpy.context.window.screen.areas:
        if area.type == 'VIEW_3D':
            v3d = area.spaces[0]
            rv3d = v3d.region_3d
            for region in area.regions:
                if region.type == 'WINDOW':
                    if return_area: return region, rv3d, v3d, area
                    return region, rv3d, v3d
    return None, None

def numToStr(num):
    if num > 99:
        return str(num)
    elif num > 9:
        return '0' + str(num)
    else:
        return '00' + str(num)

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

def remove_top_outer():
    bpy.context.object.select = False

    bpy.ops.object.mode_set(mode='EDIT')

    mesh=bmesh.from_edit_mesh(bpy.context.object.data)

    for v in mesh.verts:
        v2 = bpy.context.object.matrix_world * v.co
        if v2.z > 0.01:
            v.select = True

    bpy.ops.mesh.delete(type='VERT')

def loop_cut(edge_index):
    bpy.ops.object.mode_set(mode='EDIT')

    region, rv3d, v3d, area = view3d_find(True)

    override = {
        'scene': bpy.context.scene,
        'region': region,
        'area': area,
        'space': v3d
    }

    bpy.ops.mesh.loopcut_slide(
        override,
        MESH_OT_loopcut={
            "number_cuts":2,
            "smoothness":0,
            "falloff":'INVERSE_SQUARE',
            "edge_index":edge_index,
            "mesh_select_mode_init":(True, False, False)
        },
        TRANSFORM_OT_edge_slide={
            "value":0,
            "single_side":False,
            "mirror":False,
            "snap":False,
            "snap_target":'CLOSEST',
            "snap_point":(0, 0, 0),
            "snap_align":False,
            "snap_normal":(0, 0, 0),
            "correct_uv":False,
            "release_confirm":False
        }
    )

def make_box(loc=(0,0,0), scale=(1,1,1), name=''):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    bpy.ops.transform.resize(value=scale)

    if name != '':
        bpy.context.object.name = name


def make_row(n, scale, spacing, origin):
    x = origin['x']
    y = origin['y']
    z = origin['z']

    cristaes = []

    for i in range(1,n):
        cY = y + (random.random() - 0.5)*3.57

        bpy.ops.mesh.primitive_cube_add(radius=1, location=(x,cY,z))
        bpy.ops.transform.resize(value=(scale['x'], 1, 1))
        bpy.context.object.name = 'Cristae'

        x += spacing

def corrective_smooth(factor, iterations, use_only_smooth):
    bpy.ops.object.mode_set(mode='OBJECT')

    bpy.ops.object.modifier_add(type='CORRECTIVE_SMOOTH')
    bpy.context.object.modifiers['CorrectiveSmooth'].use_only_smooth = use_only_smooth
    bpy.context.object.modifiers['CorrectiveSmooth'].iterations = iterations
    bpy.ops.object.modifier_apply(apply_as='DATA', modifier='CorrectiveSmooth')

def laplacian_smooth(lambda_factor):
    bpy.ops.object.mode_set(mode='OBJECT')

    bpy.ops.object.modifier_add(type='LAPLACIANSMOOTH')
    bpy.context.object.modifiers['Laplacian Smooth'].lambda_factor = lambda_factor
    bpy.ops.object.modifier_apply(apply_as='DATA', modifier='Laplacian Smooth')

def subsurf(level):
    bpy.ops.object.mode_set(mode='OBJECT')

    bpy.ops.object.modifier_add(type='SUBSURF')
    bpy.context.object.modifiers['Subsurf'].levels = level
    bpy.context.object.modifiers['Subsurf'].render_levels = level
    bpy.ops.object.modifier_apply(apply_as='DATA', modifier='Subsurf')

def solidify(offset, thickness):
    bpy.ops.object.mode_set(mode='OBJECT')

    bpy.ops.object.modifier_add(type='SOLIDIFY')
    bpy.context.object.modifiers['Solidify'].offset = offset
    bpy.context.object.modifiers['Solidify'].thickness = thickness
    bpy.ops.object.modifier_apply(apply_as='DATA', modifier='Solidify')

def make_membranes(scale, loc=(0,0,0)):
    make_box(loc, scale, name='Membrane')

    subsurf(4)
    solidify(0, 0.04)

    # Seperate Inner and Outer membrane
    bpy.ops.mesh.separate(type='LOOSE')

def unselect_all():
    for obj in bpy.data.objects:
        obj.select = False

# TODO width -> radius...
def make_mitochondria(loc=(0,0,0), length=3, width=1, num_rows=30, padding_factor=0.2, do_laplace=False):
    mito_length = 0.8*length
    row_width = mito_length / num_rows
    cristae_width = row_width*(1 - 2*padding_factor)
    cristae_disc_subsurf_level = 2
    cristae_disc_loop_cut_scale_val = 2.4
    inner_membrane_subsurf_level = 2
    laplace_smooth_factor = 15


    make_membranes(scale=(length, width, 1))

    bpy.context.object.select = False
    bpy.data.objects['Membrane'].select = True
    bpy.data.objects['Membrane.001'].select = False

    vertices = sorted(select_some(), key=itemgetter('x'))
    j_spaces = []

    start = 0 - mito_length
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

        print('{x: %s, y1: %s, y2: %s}' % (x, y, y2))

        make_box(loc=(x, y, 0), scale=(cristae_width, 1, 1), name='Cristae')


        loop_cut(7)
        bpy.ops.transform.resize(value=(1, cristae_disc_loop_cut_scale_val, 1))
        loop_cut(8)
        bpy.ops.transform.resize(value=(1, 1, cristae_disc_loop_cut_scale_val))
        subsurf(cristae_disc_subsurf_level)

        make_box(loc=(x, y2, 0), scale=(cristae_width, 1, 1), name='Cristae')
        loop_cut(7)
        bpy.ops.transform.resize(value=(1, cristae_disc_loop_cut_scale_val, 1))
        loop_cut(8)
        bpy.ops.transform.resize(value=(1, 1, cristae_disc_loop_cut_scale_val))
        subsurf(cristae_disc_subsurf_level)

        bpy.context.object.select = False

    # Select all Cristaes
    for obj in bpy.data.objects:
        if obj.name.find('Cristae') == 0:
            obj.select = True

    # Join Cristaes
    bpy.ops.object.join()

    # Boolean union -> Membrane
    bpy.ops.object.modifier_add(type='BOOLEAN')
    bpy.context.object.modifiers['Boolean'].object = bpy.data.objects['Membrane']
    bpy.context.object.modifiers['Boolean'].operation = 'UNION'
    bpy.ops.object.modifier_apply(apply_as='DATA', modifier='Boolean')

    # TODO fix cristae's ending up outside
    bpy.ops.mesh.separate(type='LOOSE')

    unselect_all()
    bpy.data.objects['Membrane'].select = True
    bpy.ops.object.delete()

    unselect_all()
    bpy.context.scene.objects.active = bpy.data.objects['Membrane.001']
    bpy.data.objects['Membrane.001'].select = True
    remove_top_outer()

    #bpy.ops.object.mode_set(mode='OBJECT')

    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.data.objects['Cristae'].select = True
    bpy.context.scene.objects.active = bpy.data.objects['Cristae']

    subsurf(inner_membrane_subsurf_level)
    corrective_smooth(1, 5, True)
    if (do_laplace):
        laplacian_smooth(laplace_smooth_factor)


    # bisect
    bpy.ops.object.mode_set(mode='EDIT')
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

    bpy.ops.object.mode_set(mode='OBJECT')
    unselect_all()

# === Main ===
random.seed(1000825609)
make_mitochondria()
