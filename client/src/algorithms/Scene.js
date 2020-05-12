//import * as THREE from '../plugins/three.module'
//import { GLTFLoader } from '../plugins/GLTFLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

export default class Scene {
  constructor(wrapperElem) {
    wrapperElem.innerHTML = ''
    this.wrapper = wrapperElem
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75,
      2, //this.canvas.width / this.canvas.height,
      0.1,
      5000
    )
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    let elem = this.renderer.domElement
    elem.id = 'scene'
    this.wrapper.style.width = '100%'
    this.wrapper.style.height = '100%'
    this.wrapper.appendChild(elem)
    this.camera.rotation.set(
      -3.141592653589793,
      0.7853981633974408,
      -3.141592653589793,
      'XYZ'
    ) // World
    this.camera.position.set(1, -7, -28)
    this.camera.matrixAutoUpdate = false

    let ambientLight = new THREE.AmbientLight(0xcccccc)
    this.scene.add(ambientLight)

    let directionalLight = new THREE.DirectionalLight(0xffffff)
    directionalLight.position.set(0, 1, 1).normalize()
    this.scene.add(directionalLight)

    let objectLoader = new GLTFLoader()
    objectLoader.load(
      '/3dmodels/VC.glb',
      function(object) {
        object.scene.position.z = -20
        object.scene.position.y = -10

        // mixer.clipAction(object.animations[0]).play() // for eventual animation
        this.scene.add(object.scene)
      }.bind(this)
    )

    // this.renderer.setSize(this.canvas.width, this.canvas.height) // not sure if needed at all
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  /**
   * Apply the matrix to the camera
   * @param domMatrix Array representation of the matrix
   */
  updateMatrix(domMatrix) {
    let matrixArray = domMatrix.toFloat32Array()
    let m = new THREE.Matrix4()
    m.set(
      matrixArray[0],
      matrixArray[1],
      matrixArray[2],
      matrixArray[3],
      matrixArray[4],
      matrixArray[5],
      matrixArray[6],
      matrixArray[7],
      matrixArray[8],
      matrixArray[9],
      matrixArray[10],
      matrixArray[11],
      matrixArray[12],
      matrixArray[13],
      matrixArray[14],
      matrixArray[15]
    )
    this.camera.matrixWorld.copy(m)
    this.camera.updateMatrixWorld()
  }
}
