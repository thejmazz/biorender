import bpy

from blenderDecorators import objectMode

@objectMode
def subsurf(level, render_levels=-1, apply=True):
    if render_levels == -1:
        render_levels = level

    bpy.ops.object.modifier_add(type='SUBSURF')
    bpy.context.object.modifiers['Subsurf'].levels = level
    bpy.context.object.modifiers['Subsurf'].render_levels = render_levels

    if apply:
        bpy.ops.object.modifier_apply(apply_as='DATA', modifier='Subsurf')
