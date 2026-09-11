import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const data = readFileSync(new URL('../public/models/am-sculpture.glb', import.meta.url));
const gltf = await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength), '');
let meshes = 0;
let triangles = 0;
const materials = new Set();
gltf.scene.traverse(object => {
  if (!object.isMesh) return;
  meshes++;
  materials.add(object.material.name);
  triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
  assert(Array.from(object.geometry.attributes.position.array).every(Number.isFinite));
});
const size = new Box3().setFromObject(gltf.scene).getSize(new Vector3());
assert(meshes === 6 && triangles > 100, 'Expected both letters and inlays');
assert(size.x > 6 && size.y > 3 && size.z > 0.4, 'Expected an upright model with real depth');
assert(materials.has('Brushed aluminium') && materials.has('Cobalt enamel'));
assert(!gltf.scene.getObjectByName('Cube'), 'Do not export the Blender startup scene');
console.log(`GLB verified: ${meshes} meshes, ${triangles} triangles, ${data.length} bytes.`);
