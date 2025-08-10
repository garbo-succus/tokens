#!/usr/bin/env node

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer.js';
import { createCanvas } from '@napi-rs/skia';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// Setup JSDOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: `file://${PROJECT_ROOT}/`,
  resources: 'usable',
  runScripts: 'dangerously'
});

global.window = dom.window;
global.document = dom.window.document;
global.self = global;

// Copy navigator properties if they don't exist
if (!global.navigator) {
  global.navigator = dom.window.navigator;
}

class ScreenshotGenerator {
  constructor(width = 512, height = 512) {
    this.width = width;
    this.height = height;
    this.canvas = createCanvas(width, height);
    
    // Add missing canvas methods for Three.js compatibility
    this.canvas.addEventListener = () => {};
    this.canvas.removeEventListener = () => {};
    this.canvas.dispatchEvent = () => {};
    this.canvas.style = {};
    this.canvas.clientWidth = width;
    this.canvas.clientHeight = height;
    
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    
    // Use SVG renderer for software rendering
    this.renderer = new SVGRenderer();
    this.renderer.domElement = this.canvas;
    
    this.renderer.setSize(width, height);
    
    this.camera.position.set(2, 2, 2);
    this.camera.lookAt(0, 0, 0);
    
    this.setupLighting();
    this.gltfLoader = new GLTFLoader();
  }
  
  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 2, -5);
    this.scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, 5, -5);
    this.scene.add(rimLight);
  }
  
  async loadAsset(assetPath) {
    const absolutePath = join(PROJECT_ROOT, assetPath);
    const fileUrl = `file://${absolutePath}`;
    
    // Override both FileLoader and ImageLoader to handle Node.js file system
    const originalLoad = THREE.FileLoader.prototype.load;
    const originalImageLoad = THREE.ImageLoader.prototype.load;
    THREE.FileLoader.prototype.load = function(url, onLoad, onProgress, onError) {
      try {
        if (url.startsWith('file://')) {
          // Handle file:// URLs by reading from filesystem
          const filePath = url.replace('file://', '');
          const encoding = filePath.endsWith('.gltf') ? 'utf8' : null; // Text for .gltf, binary for others
          const data = readFileSync(filePath, encoding);
          if (onLoad) {
            // Use setTimeout to make it async like the original loader
            setTimeout(() => onLoad(data), 0);
          }
          return data;
        } else if (!url.startsWith('http')) {
          // Handle relative URLs by joining with asset directory
          const fullPath = join(dirname(absolutePath), url);
          const encoding = fullPath.endsWith('.gltf') ? 'utf8' : null;
          const data = readFileSync(fullPath, encoding);
          if (onLoad) {
            setTimeout(() => onLoad(data), 0);
          }
          return data;
        }
      } catch (error) {
        if (onError) {
          setTimeout(() => onError(error), 0);
        }
        return;
      }
      // Fallback to original loader for HTTP URLs
      return originalLoad.call(this, url, onLoad, onProgress, onError);
    };
    
    // Override ImageLoader for texture loading
    THREE.ImageLoader.prototype.load = function(url, onLoad, onProgress, onError) {
      try {
        let fullPath;
        if (url.startsWith('file://')) {
          fullPath = url.replace('file://', '');
        } else if (!url.startsWith('http')) {
          fullPath = join(dirname(absolutePath), url);
        } else {
          // Fallback for HTTP URLs
          return originalImageLoad.call(this, url, onLoad, onProgress, onError);
        }
        
        // Create a fake image object for textures
        const image = {
          width: 512,
          height: 512,
          data: readFileSync(fullPath),
          src: url
        };
        
        if (onLoad) {
          setTimeout(() => onLoad(image), 0);
        }
        return image;
      } catch (error) {
        if (onError) {
          setTimeout(() => onError(error), 0);
        }
        return;
      }
    };
    
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        fileUrl,
        (gltf) => {
          // Restore original loaders
          THREE.FileLoader.prototype.load = originalLoad;
          THREE.ImageLoader.prototype.load = originalImageLoad;
          resolve(gltf);
        },
        (progress) => {
          if (progress.total > 0) {
            console.log(`Loading progress: ${Math.round(progress.loaded / progress.total * 100)}%`);
          }
        },
        (error) => {
          // Restore original loaders
          THREE.FileLoader.prototype.load = originalLoad;
          THREE.ImageLoader.prototype.load = originalImageLoad;
          reject(error);
        }
      );
    });
  }
  
  setupAssetInScene(gltf, config = {}) {
    // Clear previous assets
    const objectsToRemove = [];
    this.scene.traverse((child) => {
      if (child.userData.isAsset) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach(obj => this.scene.remove(obj));
    
    const model = gltf.scene.clone();
    model.userData.isAsset = true;
    
    if (config.scale) {
      model.scale.set(...config.scale);
    }
    if (config.rotation) {
      model.rotation.set(
        THREE.MathUtils.degToRad(config.rotation[0]),
        THREE.MathUtils.degToRad(config.rotation[1]),
        THREE.MathUtils.degToRad(config.rotation[2])
      );
    }
    if (config.position) {
      model.position.set(...config.position);
    }
    
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });
    
    this.scene.add(model);
    
    if (!config.cameraPosition) {
      this.fitCameraToObject(model);
    } else {
      this.camera.position.set(...config.cameraPosition);
      this.camera.lookAt(0, 0, 0);
    }
    
    return model;
  }
  
  fitCameraToObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 1.5;
    
    const theta = Math.PI / 4;
    const phi = Math.PI / 4;
    
    this.camera.position.set(
      center.x + cameraDistance * Math.cos(phi) * Math.cos(theta),
      center.y + cameraDistance * Math.sin(phi),
      center.z + cameraDistance * Math.cos(phi) * Math.sin(theta)
    );
    this.camera.lookAt(center);
  }
  
  renderScreenshot() {
    this.renderer.render(this.scene, this.camera);
    return this.canvas.toBuffer('image/png');
  }
  
  async generateScreenshot(assetPath, outputPath, config = {}) {
    try {
      console.log(`Loading asset: ${assetPath}`);
      const gltf = await this.loadAsset(assetPath);
      
      console.log('Setting up scene...');
      this.setupAssetInScene(gltf, config);
      
      console.log('Rendering screenshot...');
      const imageBuffer = this.renderScreenshot();
      
      mkdirSync(dirname(outputPath), { recursive: true });
      
      console.log(`Saving screenshot: ${outputPath}`);
      writeFileSync(outputPath, imageBuffer);
      
      console.log('Screenshot generated successfully!');
      return outputPath;
    } catch (error) {
      console.error('Error generating screenshot:', error);
      throw error;
    }
  }
  
  dispose() {
    if (this.renderer && typeof this.renderer.dispose === 'function') {
      this.renderer.dispose();
    }
    this.gltfLoader = null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node gltf-screenshot.js <asset-path> [output-path] [options]

Options:
  --scale x,y,z           Scale the asset (default: 1,1,1)
  --rotation x,y,z        Rotation in degrees (default: 0,0,0)
  --position x,y,z        Position offset (default: 0,0,0)
  --camera-position x,y,z Camera position (default: auto-fit)
  --size width,height     Output image size (default: 512,512)

Examples:
  node gltf-screenshot.js ./src/assets/die/die.gltf
  node gltf-screenshot.js ./src/assets/die/die.gltf ./screenshots/die.png --scale 0.016,0.016,0.016
  node gltf-screenshot.js ./src/assets/die/die.gltf --size 1024,1024 --rotation 0,45,0
    `);
    process.exit(1);
  }
  
  const assetPath = args[0];
  let outputPath;
  
  // Check if second argument is output path (doesn't start with --)
  if (args.length > 1 && !args[1].startsWith('--')) {
    outputPath = args[1];
  }
  
  const config = {};
  let width = 512, height = 512;
  
  for (let i = outputPath ? 2 : 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const value = args[i + 1];
      
      switch (arg) {
        case '--scale':
          config.scale = value.split(',').map(Number);
          i++;
          break;
        case '--rotation':
          config.rotation = value.split(',').map(Number);
          i++;
          break;
        case '--position':
          config.position = value.split(',').map(Number);
          i++;
          break;
        case '--camera-position':
          config.cameraPosition = value.split(',').map(Number);
          i++;
          break;
        case '--size':
          const [w, h] = value.split(',').map(Number);
          width = w;
          height = h;
          i++;
          break;
      }
    }
  }
  
  if (!outputPath) {
    const assetBasename = basename(assetPath, extname(assetPath));
    outputPath = join(PROJECT_ROOT, 'screenshots', `${assetBasename}.png`);
  }
  
  const generator = new ScreenshotGenerator(width, height);
  
  try {
    await generator.generateScreenshot(assetPath, outputPath, config);
  } finally {
    generator.dispose();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ScreenshotGenerator };