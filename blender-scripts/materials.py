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
