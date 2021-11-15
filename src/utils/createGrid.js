import {
	BufferGeometry,
	Object3D,
	Line,
	MeshBasicMaterial,
  Vector2,
  Group,
  Mesh
} from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
// 字体文件
import fontjson from 'three/examples/fonts/optimer_regular.typeface.json';

// 创建文字
function createText(font, text, style) {
  const geometry = new TextGeometry(text, {
    font: font,
    size: 2,
    height: 0.3,
    curveSegments: 10,
    bevelEnabled: false,
    bevelThickness: 1,
    bevelSize: 1,
    bevelSegments: 5
  });
  const material = new MeshBasicMaterial(style);
  geometry.computeBoundingBox();
  geometry.center();
  const cube = new Mesh( geometry, material );
  return cube;
}

// 创建网格方法
function createGroundGrid (width, height, widthSegment, heightSegment, materialParams={}) {
  // 调整非整数段
  widthSegment = width / Math.floor(width / widthSegment);
  heightSegment = height / Math.floor(height / heightSegment);
  const DELTA = 0.000001; // 用来忽略数字错误
  const points = [];
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  let i = 0;
  
  // 先从下到上，绘制水平线
  for (let h = -halfHeight; h <= halfHeight + DELTA; h += heightSegment, i++) {
    const endWidth = (i % 2 === 0) ? halfWidth : -halfWidth;
    if (i === 0) {
      points.push(new Vector2(-halfWidth, h));
    }
    points.push(new Vector2(endWidth, h));
    if (h < halfHeight) {
      points.push(new Vector2(endWidth, h + heightSegment));
    }
  }
  // 文字坐标
  let h_point = points.filter(vector2 =>  vector2.x < 0);
  h_point = h_point.map((v, i) => {
    return {
      x: v.x,
      y: v.y,
      t: parseInt(i * heightSegment)
    }
  });
  
  const startFromLeft = !!(i % 2 === 0); // 检查最后一个点是在右边还是左边

  // 文字坐标
  let w_point = [];
  if (startFromLeft) {
    for (let w = -halfWidth, i = 0; w <= halfWidth + DELTA; w += widthSegment, i++) {
      const endHeight = (i % 2 === 0) ? -halfHeight : halfHeight;
      points.push(new Vector2(w, endHeight));
      w_point.push({x: w, y: endHeight});
      if (w < halfWidth) {
        points.push(new Vector2(w + widthSegment, endHeight));
        w_point.push({x: w + widthSegment, y: endHeight});
      }
    }
  } else {
    for (let w2 = halfWidth, j = 0; w2 + DELTA >= -halfWidth; w2 -= widthSegment, j++) {
      const endHeight2 = (j % 2 === 0) ? -halfHeight : halfHeight;
      points.push(new Vector2(w2, endHeight2));
      w_point.push({x: w2, y: endHeight2});
      if (w2 > -halfWidth) {
        points.push(new Vector2(w2 - widthSegment, endHeight2));
        w_point.push({x: w2 - widthSegment, y: endHeight2});
      }
    }
  }

  // 文字坐标
  w_point = w_point.filter(v2 => v2.y < 0);
  w_point = w_point.map((v, i) => {
    return {
      x: v.x,
      y: v.y,
      t: parseInt(i * widthSegment)
    }
  });
  // 默认属性
  const default_params = { color: 0x00ffcc, transparent: true, wireframeLinewidth: 0.5 };
  // 自定义配置
  const params = { ...default_params, ...materialParams };
  const material = new MeshBasicMaterial(params);
  const geometry = new BufferGeometry();
  geometry.setFromPoints(points);
  const line = new Line(geometry, material);
  return {
    line,
    h_point,
    w_point
  }
}

// 创建三维网格坐标
export function create3DGrid(params = {}) {
  const { grid, textStyle, length, width, height } = params;
  const grid3D = new Object3D();
  // 左侧
  const {line: gridXZ, h_point: Lh_point} = createGroundGrid(length, height, grid.length, grid.height, grid.style);
  gridXZ.position.set(0, height/2, length/2);
  gridXZ.rotation.y = Math.PI / 2;
  grid3D.add(gridXZ);

  // 地面
  var {line: gridXY, h_point: Bh_point, w_point: Bw_point} = createGroundGrid(width, length, grid.width, grid.length, grid.style);
  gridXY.position.set(width/2, 0, length/2);
  gridXY.rotation.x = -(Math.PI / 2);
  gridXY.rotation.y = Math.PI;
  grid3D.add(gridXY);


  // 后侧
  var {line: gridYZ} = createGroundGrid(height, width, grid.height, grid.width, grid.style);
  gridYZ.position.set(width/2, height/2, 0);
  gridYZ.rotation.z = Math.PI / 2;
  grid3D.add(gridYZ);

  const left_text_group = new Group();
  const background_text_group = new Group();
  const background_right_text_group = new Group();

  // 加载文字
  const font = new Font(fontjson);
  const margin = 3;
  // 左侧
  Lh_point.map(p => {
    const cube = createText(font, ''+ p.t, textStyle);
    cube.position.set(p.x - margin, p.y, 0);
    left_text_group.add(cube);
  });
  gridXZ.add(left_text_group);

  // 地面
  Bw_point.map((p) => {
    if (p.t != 0) {
      const cube = createText(font, ''+ p.t, textStyle);
      cube.position.set(p.x, p.y - margin, 0);

      cube.rotation.x = Math.PI * -0.5;
      cube.rotation.y = Math.PI;
      background_text_group.add(cube);
    }
  });
  gridXY.add(background_text_group);

  // 地面长
  Bh_point.map((p) => {
    if (p.t != 0) {
      const cube = createText(font, ''+ p.t, textStyle);
      cube.position.set(p.x - margin, p.y, 0);
      cube.rotation.x = Math.PI * -0.5;
      cube.rotation.y = Math.PI;
      background_right_text_group.add(cube);
    }
  });
  gridXY.add(background_right_text_group);

  return {
    grid3D, // 网格
    left_text_group, // 左侧文字
    background_text_group, // 底部文字
    background_right_text_group,  // 底部文字
  };
}