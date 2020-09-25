import * as THREE from 'three';
import {Points} from 'three/src/objects/Points.js';
import {Mesh} from 'three/src/objects/Mesh.js';

import * as util from './util';
import * as viewer from './viewer';

// Constants
const X_TRANSLATE = -150;
const Y_TRANSLATE = -100;
const Z_TRANSLATE = -250;
const X_SCALE = 1;
const Y_SCALE = 1;
const Z_SCALE = 1;
const CAMERA_POS_X = 100;
const CAMERA_POS_Y = 100;
const CAMERA_POS_Z = 400;
const CAMERA_FOCAL_LENGTH = 20;
const POINT_CLOUD_ROTATE_Y = 0;

const LINE_THICKNESS = 1;
const LINE_LENGTH_Z = 256;
const LINE_OPACITY = .06;
const LINE_COLOR = 0x555555;
const Z_OFFSET = 125;

const MAX_Z_DEPTH = 255;
const BOUNDING_GRID_START = 5;
const BOUNDING_GRID_INTERVAL = 10;

/**
 * This class extends Viewer, which creates a three.js scene. It sets up the
 * point cloud three.js scene and loads the point cloud.
 */
export class PointCloudViewer extends viewer.Viewer {
  private pointCloudGroup: THREE.Group = new THREE.Group();

  /**
   * The constructor for the InfoViewer class.
   * @param paintings an Array of Painting objects.
   */
  constructor(
      canvas: HTMLCanvasElement, width: number, height: number,
      enableRotate: boolean) {
    super(canvas, width, height, enableRotate);

    // to compute this, we'd need to get the actual input image dimensions (rather
    // than just the canvas context)
    this.pointCloudWidth = 512;
    this.pointCloudHeight = 512;
    this.setCamera(
        CAMERA_POS_X, CAMERA_POS_Y, CAMERA_POS_Z, CAMERA_FOCAL_LENGTH);

    this.scene.add(this.pointCloudGroup);
    this.makeBoundingGrid();


    super.animate();
  }

  /**
   * Makes the point cloud viewer's bounding grid lines.
   */
  private makeBoundingGrid() {
    this.makeBoundingGridXYLines();
    this.makeBoundingGridZLines();
  }

  /**
   * Makes the bounding grid lines in the x and y directions
   */
  private makeBoundingGridXYLines() {
    const minXPosition = 0;
    const minYPosition = 0;
    const maxYPosition = this.pointCloudHeight;
    const offsetXPosition = this.pointCloudWidth / 2;
    const offsetYPosition = this.pointCloudHeight / 2;

    const widthX = this.pointCloudWidth;
    const heightX = LINE_THICKNESS;
    const depthX = LINE_THICKNESS;

    const widthY = LINE_THICKNESS;
    const heightY = this.pointCloudHeight;
    const depthY = LINE_THICKNESS;

    for (let currZ = BOUNDING_GRID_START; currZ <= MAX_Z_DEPTH;
         currZ += BOUNDING_GRID_INTERVAL) {
      // Horizontal lines on the bottom
      this.makeLine(
          offsetXPosition, minYPosition, currZ + Z_OFFSET, widthX, heightX,
          depthX);
      // Horizontal lines on the top
      this.makeLine(
          offsetXPosition, maxYPosition, currZ + Z_OFFSET, widthX, heightX,
          depthX);
      // Vertical lines on the left
      this.makeLine(
          minXPosition, offsetYPosition, currZ + Z_OFFSET, widthY, heightY,
          depthY);
    }
  }

  /**
   * Makes the 4 bounding grid lines in the z direction.
   */
  private makeBoundingGridZLines() {
    const minXPosition = 0;
    const minYPosition = 0;
    const maxXPosition = this.pointCloudWidth;
    const maxYPosition = this.pointCloudHeight;
    const zPosition = LINE_LENGTH_Z;

    const width = LINE_THICKNESS;
    const height = LINE_THICKNESS;
    const depth = LINE_LENGTH_Z;

    this.makeLine(
        minXPosition, minYPosition, zPosition, width, height,
        depth);  // Lower left line
    this.makeLine(
        maxXPosition, minYPosition, zPosition, width, height,
        depth);  // Lower right line
    this.makeLine(
        maxXPosition, maxYPosition, zPosition, width, height,
        depth);  // Upper right line
    this.makeLine(
        minXPosition, maxYPosition, zPosition, width, height,
        depth);  // Upper left line
  }

  /**
   * Makes a line with the given settings.
   * @param positionX the x position of the line.
   * @param positionY the y position of the line.
   * @param positionZ the z position of the line.
   * @param width the width of the line.
   * @param height the height of the line.
   * @param depth the depth of the line.
   */
  private makeLine(
      positionX: number, positionY: number, positionZ: number, width: number,
      height: number, depth: number) {
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);
    geometry.translate(
        X_TRANSLATE + positionX, Y_TRANSLATE + positionY,
        Z_TRANSLATE + positionZ);
    geometry.scale(X_SCALE, Y_SCALE, Z_SCALE);
    geometry.rotateY(POINT_CLOUD_ROTATE_Y);

    const material = new THREE.MeshLambertMaterial(
        {color: LINE_COLOR, transparent: true, opacity: LINE_OPACITY});
    this.scene.add(new THREE.Mesh(geometry, material));
  }

  /**
   * Adds the depth image pixel points to the scene.
   */
  loadPointCloud(
      originalPaintingContext: CanvasRenderingContext2D,
      depthMapContext: CanvasRenderingContext2D) {
    // Clear any existing point cloud geometry.
    // this.pointCloudGroup.children = [];
    // const pointsGeometry =
    //     this.updatePointsGeometry(originalPaintingContext, depthMapContext);

    // const pointsMaterial =
    //     new THREE.PointsMaterial({size: 4, vertexColors: THREE.VertexColors});
    // this.pointCloudGroup.add(new Points(pointsGeometry, pointsMaterial));

    this.pointCloudGroup.children = [];
    const geometry = this.meshGeometry(originalPaintingContext, depthMapContext);
    const material = new THREE.MeshLambertMaterial({
      // color: 'orange'
      // transparent: true,
      // opacity: 0.5
    });
    this.pointCloudGroup.add(new Mesh(geometry, material));

    // //debug
    // var wireframe = new THREE.WireframeGeometry(pointsGeometry);
    // var line = new THREE.LineSegments(wireframe);
    // line.material.depthTest = false;
    // line.material.opacity = 0.25;
    // line.material.transparent = true;
    // this.scene.add(line);
  }

  /**
   * Updates the points in the point cloud given the new pixel information.
   * @param originalPaintingContext a CanvasRenderingContext2D with the original
   *    image's pixel information
   * @param depthMapContext a CanvasRenderingContext2D with the depth map's
   *    pixel information
   */
  private meshGeometry(
      originalPaintingContext: CanvasRenderingContext2D,
      depthMapContext: CanvasRenderingContext2D) {
    const positions = [];
    const colors = [];

    const depthMapData = util.getPixelDataFromContext(
        depthMapContext, 0, 0, this.pointCloudWidth, this.pointCloudHeight);
    const origPaintingData = util.getPixelDataFromContext(
        originalPaintingContext, 0, 0, this.pointCloudWidth, this.pointCloudHeight);

    const numChannels = 4;
    for (let i = 0; i < this.pointCloudWidth; i += 1) {
      for (let j = 1; j < this.pointCloudHeight; j += 1) {
        const idx = (i * this.pointCloudHeight + j) * numChannels;

        // Add position data, with the depth value as the z position.
        const xPosition = j;
        const yPosition = this.pointCloudHeight - i;
        const zPosition = depthMapData[idx];
        const point = [
            xPosition * X_SCALE + X_TRANSLATE,
            yPosition * Y_SCALE + Y_TRANSLATE,
            zPosition * Z_SCALE + Z_TRANSLATE
        ];
        positions.push(point[0]-1, point[1]-1, point[2]-1);
        positions.push(point[0]+1, point[1], point[2]+1);
        positions.push(point[0]+1, point[1]+1, point[2]+1);

        // Use the color data from the original image
        const color = [
            origPaintingData[idx] / 255.0,
            origPaintingData[idx + 1] / 255.0,
            origPaintingData[idx + 2] / 255.0
        ];
        // colors.push(1, 0, 0);
        // colors.push(1, 0, 0);
        // colors.push(1, 0, 0);
        colors.push(color[0], color[1], color[2]);
        colors.push(color[0], color[1], color[2]);
        colors.push(color[0], color[1], color[2]);
      }
    }
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.addAttribute(
        'position', new THREE.Float32BufferAttribute(positions, 3));
    // pointsGeometry.addAttribute(
    //     'color', new THREE.Float32BufferAttribute(colors, 3));
    pointsGeometry.rotateY(POINT_CLOUD_ROTATE_Y);

    return pointsGeometry;
  }


  // /**
  //  * Updates the points in the point cloud given the new pixel information.
  //  * @param originalPaintingContext a CanvasRenderingContext2D with the original
  //  *    image's pixel information
  //  * @param depthMapContext a CanvasRenderingContext2D with the depth map's
  //  *    pixel information
  //  */
  // private updatePointsGeometry(
  //     originalPaintingContext: CanvasRenderingContext2D,
  //     depthMapContext: CanvasRenderingContext2D) {
  //   const positions = [];
  //   const colors = [];

  //   const depthMapData = util.getPixelDataFromContext(
  //       depthMapContext, 0, 0, this.pointCloudWidth, this.pointCloudHeight);
  //   const origPaintingData = util.getPixelDataFromContext(
  //       originalPaintingContext, 0, 0, this.pointCloudWidth, this.pointCloudHeight);

  //   const numChannels = 4;
  //   for (let i = 0; i < this.pointCloudWidth; i += 1) {
  //     for (let j = 1; j < this.pointCloudHeight; j += 1) {
  //       const idx = (i * this.pointCloudHeight + j) * numChannels;

  //       // Add position data, with the depth value as the z position.
  //       const xPosition = j;
  //       const yPosition = this.pointCloudHeight - i;
  //       const zPosition = depthMapData[idx];
  //       positions.push(
  //           xPosition * X_SCALE + X_TRANSLATE,
  //           yPosition * Y_SCALE + Y_TRANSLATE,
  //           zPosition * Z_SCALE + Z_TRANSLATE);

  //       // Use the color data from the original image
  //       colors.push(
  //           origPaintingData[idx] / 255.0, origPaintingData[idx + 1] / 255.0,
  //           origPaintingData[idx + 2] / 255.0);
  //     }
  //   }
  //   const pointsGeometry = new THREE.BufferGeometry();
  //   pointsGeometry.addAttribute(
  //       'position', new THREE.Float32BufferAttribute(positions, 3));
  //   pointsGeometry.addAttribute(
  //       'color', new THREE.Float32BufferAttribute(colors, 3));
  //   pointsGeometry.rotateY(POINT_CLOUD_ROTATE_Y);

  //   return pointsGeometry;
  // }
}
