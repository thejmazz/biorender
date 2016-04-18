import bpy

def makeMaterial(name, diffuse, specular, alpha):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = diffuse
    mat.diffuse_shader = 'LAMBERT'
    mat.diffuse_intensity = 1.0
    mat.specular_color = specular
    mat.specular_shader = 'COOKTORR'
    mat.specular_intensity = 0.5
    mat.alpha = alpha
    mat.ambient = 1

    return mat

def setMaterial(obj, mat):
    obj.data.materials.append(mat)

def getMaterialIndexByName(obj, name):
    for i, mat in enumerate(obj.material_slots):
        if mat.name == name:
            return i

def getUsedMaterials(obj):
    used_materials = set()
    for poly in obj.data.polygons:
        used_materials.add(poly.material_index)

    return used_materials

def remove_unused_materials_helper(obj, material, debug):
    materialIndex = getMaterialIndexByName(obj, material.name)
    used_materials = getUsedMaterials(obj)

    if not materialIndex in used_materials and materialIndex != None:
        if debug:
            print('Removing material ', material.name, ' from ', obj.name)
        obj.active_material_index = materialIndex
        bpy.ops.object.material_slot_remove()

def remove_unused_materials(obj, debug=False):
    for material in obj.material_slots:
        remove_unused_materials_helper(obj, material, debug=debug)
    for material in obj.data.materials:
        remove_unused_materials_helper(obj, material, debug=debug)
