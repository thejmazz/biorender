from materials import getMaterialIndexByName

def getUsedMaterials(obj):
    used_materials = set()
    for poly in obj.data.polygons:
        used_materials.add(poly.material_index)
    
    return used_materials

def remove_unused_materials_helper(obj, material):
    materialIndex = getMaterialIndexByName(obj, material.name)
    used_materials = getUsedMaterials(obj)
    
    if not materialIndex in used_materials and materialIndex != None:
        print('Removing material ', material.name, ' from ', obj.name)
        obj.active_material_index = materialIndex
        bpy.ops.object.material_slot_remove()

def remove_unused_materials(obj):
    for material in obj.material_slots:
        remove_unused_materials_helper(obj, material)
    for material in obj.data.materials:
        remove_unused_materials_helper(obj, material)

remove_unused_materials(bpy.data.objects['Inner Membrane'])
    