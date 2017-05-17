import React, { Component } from 'react';
import * as THREE from 'three';

export default class extends Component {
  constructor(props) {
    super(props);
    let savedX;
    let savedY;
    let savedLongitude;
    let savedLatitude;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.state = {
      manualControl: false,
      longitude: 0,
      latitude: 0,
      savedX,
      savedY,
      savedLongitude,
      savedLatitude,
    };
  }

  componentDidMount() {
    // add rendered
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('360-photo').appendChild(this.renderer.domElement);

    // creating a new scene
    this.scene = new THREE.Scene();

    // adding a camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.target = new THREE.Vector3(0, 0, 0);

    // creation of a big sphere geometry
    this.sphere = new THREE.SphereGeometry(100, 100, 40);
    this.sphere.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

    // creation of the sphere material
    this.sphereMaterial = new THREE.MeshBasicMaterial();


    // spike on using promises and a different loader or adding three js loading manager
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    // load a resource
    loader.load(
      // resource URL
      this.props.filePath,
      // Function when resource is   loaded
      (texture) => {
        this.sphereMaterial.map = texture;

         // geometry + material = mesh (actual object)
        const sphereMesh = new THREE.Mesh(this.sphere, this.sphereMaterial);
        this.scene.add(sphereMesh);

        this.updateView();
      },
      (xhr) => {
        console.log(`${xhr.loaded / xhr.total * 100}% loaded`);
      },
      (xhr) => {
        console.log('An error happened', xhr);
      },
    );
  }

  componentWillUpdate() {
    this.updateView();
  }

  onMouseMove(event) {
    const { savedX, savedY, savedLongitude, savedLatitude } = this.state;

    if (this.state.manualControl) {
      const newLongitude = (savedX - event.clientX) * 0.1 + savedLongitude;
      const newLatitude = (event.clientY - savedY) * 0.1 + savedLatitude;
      this.setState({
        longitude: newLongitude,
        latitude: newLatitude,
      });
    }
  }

  onMouseUp() {
    this.setState({ manualControl: false });
  }

  onMouseDown(event) {
    event.preventDefault();
    this.setState({
      savedLongitude: this.state.longitude,
      savedLatitude: this.state.latitude,
      savedX: event.clientX,
      savedY: event.clientY,
      manualControl: true,
    });
  }


  updateView() {
    const latitude = Math.max(-85, Math.min(85, this.state.latitude));

    // moving the camera according to current latitude (vertical movement)
    // and longitude (horizontal movement)
    this.camera.target.x = 500 * Math.sin(THREE.Math.degToRad(90 - latitude)) * Math.cos(THREE.Math.degToRad(this.state.longitude));
    this.camera.target.y = 500 * Math.cos(THREE.Math.degToRad(90 - latitude));
    this.camera.target.z = 500 * Math.sin(THREE.Math.degToRad(90 - latitude)) * Math.sin(THREE.Math.degToRad(this.state.longitude));
    this.camera.lookAt(this.camera.target);

    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        id="360-photo"
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
      />
    );
  }
}
