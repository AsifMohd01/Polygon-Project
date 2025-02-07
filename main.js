import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
// import { Polygon } from "./Polygon.js"
import {Polygon} from "./Polygon.js";

let scene, camera, renderer, controls
let ground, gridHelper
let currentPolygon, copiedPolygon
let isCreating = false
let allPolygons = []

const completeBtn = document.getElementById("complete-btn")
const copyBtn = document.getElementById("copy-btn")
const resetBtn = document.getElementById("reset-btn")

init()
animate()

function init() {
  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(
    window.innerWidth / -2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    window.innerHeight / -2,
    0.1,
    1000,
  )
  camera.position.set(0, 0, 10)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)

  const container = document.getElementById("scene-container")
  if (container) {
    container.appendChild(renderer.domElement)
  } else {
    console.error("Scene container not found")
    return
  }

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableRotate = false
  controls.enableZoom = true
  controls.enablePan = true

  createGround()
  setupEventListeners()
  resetScene()
}

function createGround() {
  const groundGeometry = new THREE.PlaneGeometry(1000, 1000)
  const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  ground = new THREE.Mesh(groundGeometry, groundMaterial)
  scene.add(ground)

  gridHelper = new THREE.GridHelper(1000, 100, 0xcccccc, 0xcccccc)
  gridHelper.rotation.x = Math.PI / 2
  scene.add(gridHelper)
}

function setupEventListeners() {
  window.addEventListener("resize", onWindowResize)
  renderer.domElement.addEventListener("click", onMouseClick)
  renderer.domElement.addEventListener("mousemove", onMouseMove)

  completeBtn.addEventListener("click", completePolygon)
  copyBtn.addEventListener("click", copyPolygon)
  resetBtn.addEventListener("click", resetScene)
}

function onWindowResize() {
  camera.left = window.innerWidth / -2
  camera.right = window.innerWidth / 2
  camera.top = window.innerHeight / 2
  camera.bottom = window.innerHeight / -2
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onMouseClick(event) {
  if (copiedPolygon) {
    placeCopiedPolygon(event)
  } else if (isCreating) {
    addVertexToPolygon(event)
  }
}

function onMouseMove(event) {
  if (copiedPolygon) {
    moveCopiedPolygon(event)
  }
}

function addVertexToPolygon(event) {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObject(ground)
  if (intersects.length > 0) {
    const point = intersects[0].point
    currentPolygon.addVertex(point.x, point.y)
    completeBtn.disabled = false

    // Check if the polygon is closed
    if (currentPolygon.vertices.length > 2) {
      const firstVertex = currentPolygon.vertices[0]
      const lastVertex = currentPolygon.vertices[currentPolygon.vertices.length - 1]
      if (firstVertex.distanceTo(lastVertex) < 0.1) {
        completePolygon()
      }
    }
  }
}

function completePolygon() {
  if (currentPolygon && currentPolygon.complete()) {
    allPolygons.push(currentPolygon)
    isCreating = false
    completeBtn.disabled = true
    copyBtn.disabled = false
    currentPolygon = null
  }
}

function copyPolygon() {
  if (allPolygons.length > 0) {
    const lastPolygon = allPolygons[allPolygons.length - 1]
    copiedPolygon = lastPolygon.copy()
    copiedPolygon.move(0, -50)
  }
}

function placeCopiedPolygon(event) {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObject(ground)
  if (intersects.length > 0) {
    const point = intersects[0].point
    copiedPolygon.move(point.x, point.y)
    allPolygons.push(copiedPolygon)
    copiedPolygon = null
  }
}

function moveCopiedPolygon(event) {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObject(ground)
  if (intersects.length > 0) {
    const point = intersects[0].point
    copiedPolygon.move(point.x, point.y)
  }
}

function resetScene() {
  // Remove all polygons from the scene
  allPolygons.forEach((polygon) => polygon.remove())
  allPolygons = []

  // Clear any in-progress polygon
  if (currentPolygon) {
    currentPolygon.remove()
  }

  // Clear any copied polygon
  if (copiedPolygon) {
    copiedPolygon.remove()
  }

  // Reset state
  currentPolygon = new Polygon(scene)
  copiedPolygon = null
  isCreating = true
  completeBtn.disabled = true
  copyBtn.disabled = true
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

// Start creating a new polygon
resetBtn.addEventListener("click", resetScene)

