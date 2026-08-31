# -*- coding: utf-8 -*-
"""
DriveDE - AutoDad-style 3D roundabout explainer (fully procedural, no assets).
German rules choreography: approach + yield (traffic in the ring has priority),
enter WITHOUT signaling, signal right + exit.

Run headless:  blender --background --python roundabout.py -- --frame 200 --out /tmp/f200.png --samples 24
Full render:   blender --background --python roundabout.py -- --animate --out /content/frames --samples 48

Scene: ring road around a tree island, four approach roads, low-poly houses
and trees, three cars (blue = you, red = circulating traffic, sand = parked).
30 fps, 480 frames (16 s). Camera: tilted top-down, slow push.
"""
import bpy
import math
import sys

# ---------- args ----------
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default
FRAME = int(arg('--frame', 0))
OUT = arg('--out', '/tmp/out')
SAMPLES = int(arg('--samples', 32))
ANIMATE = '--animate' in argv
START = int(arg('--start', 1))   # resume: first frame to render
END = int(arg('--end', 0))       # 0 = full length

FPS = 30
FRAMES = 480

# ---------- reset ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = 0.05
scene.render.use_persistent_data = True  # big speedup for animations
scene.render.resolution_x = 720
scene.render.resolution_y = 1280
scene.render.fps = FPS
scene.frame_start = 1
scene.frame_end = FRAMES
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'CUDA'
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    scene.cycles.device = 'GPU'
except Exception:
    scene.cycles.device = 'CPU'

# ---------- materials ----------
def flat_mat(name, rgb, rough=0.8, emit=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*rgb, 1)
    bsdf.inputs['Roughness'].default_value = rough
    if emit:
        bsdf.inputs['Emission Color'].default_value = (*rgb, 1)
        bsdf.inputs['Emission Strength'].default_value = emit
    return m

M = {
    'grass':   flat_mat('grass', (0.13, 0.34, 0.12)),
    'asphalt': flat_mat('asphalt', (0.13, 0.14, 0.15)),
    'mark':    flat_mat('mark', (0.85, 0.85, 0.82), rough=0.6),
    'island':  flat_mat('island', (0.16, 0.40, 0.15)),
    'trunk':   flat_mat('trunk', (0.25, 0.15, 0.08)),
    'leaf':    flat_mat('leaf', (0.10, 0.42, 0.14)),
    'leaf2':   flat_mat('leaf2', (0.16, 0.50, 0.18)),
    'wall':    flat_mat('wall', (0.85, 0.80, 0.72)),
    'roof':    flat_mat('roof', (0.55, 0.18, 0.12)),
    'blue':    flat_mat('blue', (0.08, 0.32, 0.85), rough=0.35),
    'red':     flat_mat('red', (0.75, 0.10, 0.10), rough=0.35),
    'sand':    flat_mat('sand', (0.72, 0.62, 0.42), rough=0.4),
    'glass':   flat_mat('glass', (0.06, 0.09, 0.12), rough=0.15),
    'tire':    flat_mat('tire', (0.04, 0.04, 0.04)),
    'blinker': flat_mat('blinker', (1.0, 0.55, 0.0)),
    'curb':    flat_mat('curb', (0.55, 0.56, 0.58), rough=0.7),
}

def add_cube(name, size, loc, mat, rz=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.rotation_euler.z = rz
    o.data.materials.append(mat)
    return o

def add_cyl(name, r, depth, loc, mat, verts=24, rx=0.0):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, vertices=verts)
    o = bpy.context.object
    o.name = name
    o.rotation_euler.x = rx
    o.data.materials.append(mat)
    return o

# ---------- ground + roads ----------
bpy.ops.mesh.primitive_plane_add(size=70, location=(0, 0, 0))
ground = bpy.context.object
ground.name = 'ground'
ground.data.materials.append(M['grass'])

RING_OUT, RING_IN, ROAD_W = 9.0, 4.6, 5.6
add_cyl('ring', RING_OUT, 0.04, (0, 0, 0.02), M['asphalt'], verts=64)
add_cyl('island', RING_IN, 0.06, (0, 0, 0.04), M['island'], verts=48)
add_cyl('island_curb', RING_IN + 0.25, 0.05, (0, 0, 0.03), M['curb'], verts=48)

for i, (dx, dy, rz) in enumerate([(0, -1, 0), (0, 1, 0), (-1, 0, math.pi / 2), (1, 0, math.pi / 2)]):
    add_cube(f'road{i}', (ROAD_W, 30, 0.04), (dx * 21, dy * 21, 0.02), M['asphalt'], rz=rz)

# lane dashes on approaches
for (dx, dy, vertical) in [(0, -1, True), (0, 1, True), (-1, 0, False), (1, 0, False)]:
    for k in range(7):
        d = 9.5 + k * 2.6
        if vertical:
            add_cube('dash', (0.16, 1.1, 0.05), (0, dy * d, 0.05), M['mark'])
        else:
            add_cube('dash', (1.1, 0.16, 0.05), (dx * d, 0, 0.05), M['mark'])

# ring lane dashes (circle between island and outer edge)
RING_MID = (RING_OUT + RING_IN) / 2 + 0.6
for k in range(22):
    a = k * (2 * math.pi / 22)
    add_cube('rdash', (0.14, 0.8, 0.05),
             (RING_MID * math.cos(a), RING_MID * math.sin(a), 0.05), M['mark'], rz=a)

# yield dashes at each entry (broken wait line)
for (ex, ey, rz) in [(0, -RING_OUT + 0.4, 0), (0, RING_OUT - 0.4, 0),
                     (-RING_OUT + 0.4, 0, math.pi / 2), (RING_OUT - 0.4, 0, math.pi / 2)]:
    for m in (-1.6, -0.55, 0.55, 1.6):
        if rz == 0:
            add_cube('yield', (0.7, 0.22, 0.05), (ex + m, ey, 0.05), M['mark'])
        else:
            add_cube('yield', (0.22, 0.7, 0.05), (ex, ey + m, 0.05), M['mark'])

# ---------- environment ----------
def tree(x, y, s=1.0):
    add_cyl('trunk', 0.18 * s, 0.9 * s, (x, y, 0.45 * s), M['trunk'], verts=8)
    bpy.ops.mesh.primitive_ico_sphere_add(radius=0.9 * s, location=(x, y, 1.3 * s), subdivisions=1)
    o = bpy.context.object; o.data.materials.append(M['leaf'])
    bpy.ops.mesh.primitive_ico_sphere_add(radius=0.65 * s, location=(x + 0.2 * s, y + 0.15 * s, 1.9 * s), subdivisions=1)
    o = bpy.context.object; o.data.materials.append(M['leaf2'])

def house(x, y, w=4.5, d=3.6, rz=0.0):
    add_cube('house', (w, d, 2.0), (x, y, 1.0), M['wall'], rz=rz)
    bpy.ops.mesh.primitive_cone_add(radius1=max(w, d) * 0.72, depth=1.4, vertices=4, location=(x, y, 2.7))
    r = bpy.context.object
    r.rotation_euler.z = rz + math.pi / 4
    r.data.materials.append(M['roof'])

tree(0, 0, 1.5)  # island tree
for (x, y, s) in [(-13, -13, 1.2), (14, -11, 1.0), (-12, 12, 1.1), (13, 14, 1.3),
                  (-7, -16, 0.9), (8, 17, 1.0), (-16, 6, 1.0), (17, -5, 0.9)]:
    tree(x, y, s)
for (x, y, rz) in [(-14, -7, 0.15), (13, 8, -0.1), (-13, 15, 0.2), (15, -14, 0)]:
    house(x, y, rz=rz)

# ---------- cars ----------
def car(name, mat, blinker=False):
    parts = []
    body = add_cube(f'{name}_body', (1.7, 3.6, 0.75), (0, 0, 0.55), mat)
    cab = add_cube(f'{name}_cab', (1.5, 1.9, 0.62), (0, -0.15, 1.2), M['glass'])
    parts += [cab]
    for (wx, wy) in [(-0.72, 1.15), (0.72, 1.15), (-0.72, -1.15), (0.72, -1.15)]:
        w = add_cyl(f'{name}_wheel', 0.30, 0.26, (wx, wy, 0.30), M['tire'], verts=16, rx=0)
        w.rotation_euler.y = math.pi / 2
        parts.append(w)
    blinkers = []
    if blinker:
        for (bx, by) in [(0.8, 1.75), (0.8, -1.75)]:  # right-side front + rear
            b = add_cube(f'{name}_blk', (0.28, 0.22, 0.22), (bx, by, 0.62), M['blinker'])
            blinkers.append(b)
    bpy.context.view_layer.update()
    for p in parts + blinkers:
        p.parent = body
        p.matrix_parent_inverse = body.matrix_world.inverted()
    return body, blinkers

blue, blue_blinkers = car('blue', M['blue'], blinker=True)
red, _ = car('red', M['red'])
sandcar, _ = car('sand', M['sand'])
sandcar.location = (-13.0, 1.7, 0.55)
sandcar.rotation_euler.z = math.pi / 2

# ---------- choreography ----------
# Cars point +Y at rotation 0 (body long axis is Y). Ring driving is
# counterclockwise seen from above (German). Ring radius for driving:
DRIVE_R = RING_MID

def key(obj, frame, loc=None, rz=None):
    scene.frame_set(frame)
    if loc is not None:
        obj.location = (loc[0], loc[1], 0.55)  # body center height
        obj.keyframe_insert('location', frame=frame)
    if rz is not None:
        obj.rotation_euler.z = rz
        obj.keyframe_insert('rotation_euler', frame=frame)

def ring_pose(a_deg):
    a = math.radians(a_deg)
    # CCW tangent heading: position angle a -> car +Y axis along tangent
    return (DRIVE_R * math.cos(a), DRIVE_R * math.sin(a), a + math.pi)  # heading rz

# red car: circulates the whole time (CCW, ~11 s/lap)
LAP = 330
for f in range(1, FRAMES + 1, 4):
    a0 = 150  # start angle deg
    a = a0 + 360.0 * (f / LAP)
    x, y, rz = ring_pose(a)
    key(red, f, (x, y), rz + math.pi / 2)

# blue car: south approach -> yield -> enter -> ring -> exit north
BLUE_LANE_X = 1.4  # right-hand lane of the south road
def blue_path(f):
    """returns (x, y, heading_rz) for frame f"""
    if f <= 100:  # approach, decelerating (ease-out)
        t = f / 100.0
        e = 1 - (1 - t) ** 2
        y = -17 + e * 6.6           # to y = -10.4 (yield line)
        return (BLUE_LANE_X, y, 0.0)
    if f <= 170:  # wait at the line
        return (BLUE_LANE_X, -10.4, 0.0)
    if f <= 230:  # merge onto ring: blend to ring angle -60 deg
        t = (f - 170) / 60.0
        e = t * t * (3 - 2 * t)
        ax, ay = BLUE_LANE_X, -10.4
        a = math.radians(-90 + 30 * e)  # ring angle -90 -> -60
        bx, by = DRIVE_R * math.cos(a), DRIVE_R * math.sin(a)
        x = ax + (bx - ax) * e
        y = ay + (by - ay) * e
        hz = 0.0 + e * (math.degrees(a) + 90 + 90) * math.pi / 180  # blend heading
        return (x, y, hz * 0.9)
    if f <= 360:  # ring from -60 to +90 (north exit point), CCW
        t = (f - 230) / 130.0
        a = -60 + 150 * t
        x, y, rz = ring_pose(a)
        return (x, y, rz + math.pi / 2)
    # exit north, accelerating
    t = (f - 360) / 120.0
    e = t * t
    a = math.radians(90)
    x0, y0 = DRIVE_R * math.cos(a) + 1.4, DRIVE_R * math.sin(a)
    y = y0 + t * 6 + e * 6
    return (1.4, max(y, y0), math.pi)  # heading north... rz points +Y at 0; north exit lane x=+1.4

for f in range(1, FRAMES + 1, 2):
    x, y, rz = blue_path(f)
    key(blue, f, (x, y), rz)

# blinker: off until frame 300, then flash (right turn signal) until 430
blk_mat = M['blinker']
bsdf = blk_mat.node_tree.nodes['Principled BSDF']
def key_emit(frame, strength):
    bsdf.inputs['Emission Strength'].default_value = strength
    bsdf.inputs['Emission Color'].default_value = (1.0, 0.55, 0.0, 1)
    bsdf.inputs['Emission Strength'].keyframe_insert('default_value', frame=frame)
key_emit(1, 0)
key_emit(299, 0)
f = 300
on = True
while f < 430:
    key_emit(f, 25 if on else 0)
    on = not on
    f += 8
key_emit(430, 0)
for fc in blk_mat.node_tree.animation_data.action.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = 'CONSTANT'

# ---------- light + camera ----------
bpy.ops.object.light_add(type='SUN', location=(10, -10, 25))
sun = bpy.context.object
sun.data.energy = 4.0
sun.data.angle = math.radians(15)
sun.rotation_euler = (math.radians(35), math.radians(-18), math.radians(20))
world = bpy.data.worlds.new('w')
scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.55, 0.7, 0.9, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.9

bpy.ops.object.camera_add(location=(0, -21, 24), rotation=(math.radians(38), 0, 0))
cam = bpy.context.object
cam.data.lens = 32
scene.camera = cam
# slow push for life
cam.keyframe_insert('location', frame=1)
scene.frame_set(FRAMES)
cam.location = (0, -19.5, 22.5)
cam.keyframe_insert('location', frame=FRAMES)

# ---------- render ----------
scene.render.image_settings.file_format = 'PNG'
if ANIMATE:
    scene.frame_start = START
    scene.frame_end = END if END > 0 else FRAMES
    scene.render.filepath = OUT + '/f_'
    bpy.ops.render.render(animation=True)
else:
    scene.frame_set(FRAME if FRAME > 0 else 200)
    scene.render.filepath = OUT
    bpy.ops.render.render(write_still=True)
print('RENDER DONE')
