import * as THREE from "three"

export class Polygon {
  constructor(scene, fillColor = 0xff0000, lineColor = 0x00ff00) {
    this.scene = scene
    this.vertices = []
    this.fillColor = fillColor
    this.lineColor = lineColor
    this.mesh = null
    this.edgesMesh = null
    this.pointsMesh = null
    this.linesMesh = null
  }

  addVertex(x, y) {
    const vertex = new THREE.Vector3(x, y, 0)
    this.vertices.push(vertex)
    this.updatePointsAndLines()
  }

  updatePointsAndLines() {
    // Remove existing points and lines
    if (this.pointsMesh) this.scene.remove(this.pointsMesh)
    if (this.linesMesh) this.scene.remove(this.linesMesh)

    // Create points
    const pointsGeometry = new THREE.BufferGeometry().setFromPoints(this.vertices)
    const pointsMaterial = new THREE.PointsMaterial({ color: this.lineColor, size: 5 })
    this.pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial)
    this.scene.add(this.pointsMesh)

    // Create lines
    const linesGeometry = new THREE.BufferGeometry().setFromPoints(this.vertices)
    const linesMaterial = new THREE.LineBasicMaterial({ color: this.lineColor })
    this.linesMesh = new THREE.Line(linesGeometry, linesMaterial)
    this.scene.add(this.linesMesh)
  }

  complete() {
    if (this.vertices.length < 3) return false

    const shape = new THREE.Shape(this.vertices)
    const geometry = new THREE.ShapeGeometry(shape)
    const material = new THREE.MeshBasicMaterial({ color: this.fillColor })
    this.mesh = new THREE.Mesh(geometry, material)

    const edgesGeometry = new THREE.EdgesGeometry(geometry)
    const edgesMaterial = new THREE.LineBasicMaterial({ color: this.lineColor })
    this.edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial)

    this.scene.add(this.mesh)
    this.scene.add(this.edgesMesh)

    // Remove temporary points and lines
    this.scene.remove(this.pointsMesh)
    this.scene.remove(this.linesMesh)

    return true
  }

  copy() {
    const copiedPolygon = new Polygon(this.scene, this.fillColor, this.lineColor)
    copiedPolygon.vertices = this.vertices.map((v) => v.clone())
    copiedPolygon.complete()
    return copiedPolygon
  }

  move(x, y) {
    if (this.mesh && this.edgesMesh) {
      this.mesh.position.set(x, y, 0)
      this.edgesMesh.position.set(x, y, 0)
    }
  }

  remove() {
    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.scene.remove(this.edgesMesh)
    }
    if (this.pointsMesh) this.scene.remove(this.pointsMesh)
    if (this.linesMesh) this.scene.remove(this.linesMesh)
  }
}

