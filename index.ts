
import './index.css';
// import * as d3 from 'd3';
// import {DepthPlotViewer} from './depthPlotViewer';
// import * as THREE from 'three';
import {PointCloudViewer} from './pointCloudViewer';


function pointCloud() {
  const imgEl = document.querySelector('#img');
  const mapEl = document.querySelector('#map');
  const containerEl = document.querySelector('#container');
  const canvasEl = document.querySelector('#canvas');
  
  const enableRotate = true;
  const pointCloudViewer = new PointCloudViewer(
    canvasEl as HTMLCanvasElement,
    containerEl.clientWidth,
    containerEl.clientHeight,
    enableRotate
  );

  imgEl.crossOrigin = 'Anonymous';
  mapEl.crossOrigin = 'Anonymous';
  const imgCanvas = document.createElement('canvas');
  imgCanvas.width = imgEl.width;
  imgCanvas.height = imgEl.height;
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = mapEl.width;
  mapCanvas.height = mapEl.height;
  // document.body.appendChild(imgCanvas);
  // document.body.appendChild(mapCanvas);
  imgCanvas.getContext('2d').drawImage(imgEl, 0, 0);
  mapCanvas.getContext('2d').drawImage(mapEl, 0, 0);

  pointCloudViewer.loadPointCloud(imgCanvas.getContext('2d'), mapCanvas.getContext('2d'));
  window.controls = pointCloudViewer.controls;
  console.log('window.controls', window.controls);
  window.camera = pointCloudViewer.camera;
  console.log('window.camera', window.camera);
}

// function fromScratch() {
//   const imgEl = document.querySelector('#img');
//   const mapEl = document.querySelector('#map');
//   const renderEl = document.querySelector('#render');
//   const [width, height] = [800, 600];
//   // const renderEl = document.body;
//   // const [width, height] = [window.innerWidth, window.innerHeight];

//   const scene = new THREE.Scene();
//   const CAMERA_FOV = 75;
//   const aspectRatio = width / height;
//   const clippingRange = [0.1, 1000];
//   const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspectRatio, clippingRange[0], clippingRange[1]);

//   const renderer = new THREE.WebGLRenderer();
//   renderer.setSize(width, height);
//   renderEl.appendChild(renderer.domElement);
//   renderEl.style.background = '#333';
//   renderEl.style.padding = '10px';
//   renderEl.style['text-align'] = 'center';

//   // geometry
//   const geometry = new THREE.BoxGeometry(1, 1, 1);
//   const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//   const cube = new THREE.Mesh(geometry, material);
//   scene.add(cube);
//   camera.position.z = 3;
//   camera.position.x = 1;

//   function animate() {
//     requestAnimationFrame(animate);

//     cube.rotation.x += 0.01;
//     cube.rotation.y += 0.01;
//     renderer.render(scene, camera);
//   }
//   animate();
// }

function main() {
  // fromScratch();
  pointCloud();
}

main();