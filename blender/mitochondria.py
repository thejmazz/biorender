# === Imports ===
import bpy, bmesh
import random
from operator import itemgetter

# === Functions ===

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
        
def make_membranes(scale, loc=(0,0,0)):
    make_box(loc, scale, name='Membrane')
    
    # Subsurf modifier
    bpy.ops.object.modifier_add(type='SUBSURF')
    bpy.context.object.modifiers['Subsurf'].levels = 4
    bpy.context.object.modifiers['Subsurf'].render_levels = 4
    bpy.ops.object.modifier_apply(apply_as='DATA', modifier='Subsurf')
    
    # Solidify
    bpy.ops.object.modifier_add(type='SOLIDIFY')
    bpy.context.object.modifiers['Solidify'].offset = 0
    bpy.context.object.modifiers['Solidify'].thickness = 0.04
    bpy.ops.object.modifier_apply(apply_as='DATA', modifier='Solidify')
    
    # Seperate Inner and Outer membrane
    bpy.ops.mesh.separate(type='LOOSE')

# TODO width -> radius
def make_mitochondria(loc=(0,0,0), length=3, width=1, num_rows=30, padding_factor=0.2):
    mito_length = 0.8*length
    row_width = mito_length / num_rows
    cristae_width = row_width*(1 - 2*padding_factor)

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
 
        make_box(loc=(x, y, 0), scale=(cristae_width, 1, 1), name='Cristae')
        make_box(loc=(x, y2, 0), scale=(cristae_width, 1, 1), name='Cristae')
        bpy.context.object.select = False

# === Main ===
random.seed(1000825609)
make_mitochondria()
