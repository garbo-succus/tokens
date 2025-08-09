import type { Meta, StoryObj } from '@storybook/html';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import prettyStringify from 'json-stringify-pretty-compact';

function stringify(obj: unknown, options?: Record<string, unknown>): string {
  const customOptions = {
    ...options,
    replacer: (_key: string, value: unknown) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const objValue = value as Record<string, unknown>;
        const keys = Object.keys(objValue).sort();
        const childrenIndex = keys.indexOf("children");

        if (childrenIndex !== -1) {
          keys.splice(childrenIndex, 1);
          keys.push("children");
        }

        const sortedObj: Record<string, unknown> = {};
        keys.forEach((k) => {
          sortedObj[k] = objValue[k];
        });

        return sortedObj;
      }
      return value;
    },
  };

  return prettyStringify(obj, customOptions);
}

export function createAssetMeta(asset: any, assetName: string, displayName: string): Meta {
  return {
    title: `Assets/${displayName}`,
    parameters: {
      docs: {
        description: {
          component: `
# ${asset.name}

## Usage
\`\`\`
template: ${assetName}
\`\`\`

## Properties
- **Scale**: ${asset.scale.join(' × ')}
- **Faces**: ${asset.faces?.length || 'N/A'} faces
- **Format**: GLTF with textures
          `
        }
      }
    }
  };
}

export function createAssetStory(asset: any, assetName: string): StoryObj {
  const createThreeScene = () => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '400px';
    container.style.background = '#f0f0f0';
    container.style.borderRadius = '8px';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(400, 400);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Load the GLTF model
    const loader = new GLTFLoader();
    loader.load(asset.src, (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(5);
      scene.add(model);
      
      // Center the camera
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 3.0;
      
      camera.position.set(center.x, center.y, center.z + cameraZ);
      camera.lookAt(center);
      
      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        model.rotation.x += 0.005;
        model.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();
    });
    
    return container;
  };

  return {
    render: () => {
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.gap = '20px';
      container.style.alignItems = 'flex-start';
      
      const scene = createThreeScene();
      const info = document.createElement('div');
      
      let infoHTML = `<h3>${asset.name}</h3>`;
      infoHTML += `<p>To use this in your board game, add <code>"template": "${assetName}"</code> to a piece.</p>`;
      infoHTML += '<h4>Built-in Template:</h4>';
      infoHTML += '<p><small><em>Reference only - these properties are automatically provided when you use this template.</em></small></p>';
      
      // Create a copy without the src property
      const assetWithoutSrc = { ...asset };
      delete assetWithoutSrc.src;
      
      infoHTML += `<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${stringify(assetWithoutSrc)}</pre>`;
      
      info.innerHTML = infoHTML;
      
      container.appendChild(scene);
      container.appendChild(info);
      
      return container;
    }
  };
}