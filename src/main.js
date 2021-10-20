import {
  create3DGrid
} from './utils/createGrid.js';
import * as THREE from 'three';
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';


let camera, scene, renderer, left_text_groups, background_text_groups, background_right_text_groups;
const gridStyle = {
  with: 50,
  height: 40,
  length: 80
};
// 中心点
const lookAt = new THREE.Vector3(gridStyle.with / 2, gridStyle.height / 2, gridStyle.length / 2);
init();
render();

function init() {
  
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(new THREE.Color(0xeeeeee));
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.set(280, 180, 200);
  
  camera.lookAt(lookAt); // 相机看向的中心点
  scene.add(camera);

  // 创建3D坐标网格
  const {
    grid3D,
    left_text_group,
    background_text_group,
    background_right_text_group
  } = create3DGrid({
    width: gridStyle.with,
    height: gridStyle.height,
    length: gridStyle.length,
    // 网格分段数和样式
    grid: {
      length: 10,
      width: 10,
      height: 5,
      style: {
        color: 0xEED5B7
      }
    },
    // 文字样式
    textStyle: {
      color: 0xFF8C00
    }
  });
  scene.add(grid3D);
  // 坐标文字
  left_text_groups = left_text_group;
  background_text_groups = background_text_group;
  background_right_text_groups = background_right_text_group;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 0.5;
  controls.maxDistance = 1000;
  controls.target = lookAt; // 控制围绕中心点
  controls.update(); // 更新中心点
  controls.enablePan = false;
  // 控制相机旋转角度
  controls.maxPolarAngle = Math.PI / 2;
  controls.maxAzimuthAngle = Math.PI / 2;
  controls.minAzimuthAngle = 0;


  //光照
  let ambientLight;
  function initLight() {
    ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
  }
  initLight();
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  // 文字跟随 相机旋转
  if (left_text_groups) {
    left_text_groups.children.map(text => {
      text.lookAt(camera.position)
    })
  }
  if (background_text_groups) {
    background_text_groups.children.map(text => {
      text.lookAt(camera.position)
    })
  }
  if (background_right_text_groups) {
    background_right_text_groups.children.map(text => {
      text.lookAt(camera.position)
    })
  }
}