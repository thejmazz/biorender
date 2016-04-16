import bpy

from blenderDecorators import objectMode

@objectMode
def subsurf(level, render_levels=level, apply=True):
    bpy.ops.object.modifier_add(type='SUBSURF')
    bpy.context.object.modifiers['Subsurf'].levels = level
    bpy.context.object.modifiers['Subsurf'].render_levels = render_levels

    if apply:
        bpy.ops.object.modifier_apply(apply_as='DATA', modifier='Subsurf')
