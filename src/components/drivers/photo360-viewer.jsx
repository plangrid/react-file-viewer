import React, { Component } from 'react';
import * as THREE from "three";

export default class extends Component {
  constructor(props) {
    super(props);
    let latitude, savedX, savedY, savedLongitude, savedLatitude;

    this.state = {
      manualControl: false,
      longitude: 0,
      latitude: 0,
      savedX,
      savedY,
      savedLongitude,
      savedLatitude,
    }
  }

  // todo - unbind the events
  bindEvents() {
    document.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), false);
    document.addEventListener("mousemove", this.onDocumentMouseMove.bind(this), false);
    document.addEventListener("mouseup", this.onDocumentMouseUp.bind(this), false);
  }

  unbindEvents() {
    document.removeEventListener("mousedown")
  }

  onDocumentMouseDown(event) {
    event.preventDefault();
    this.setState({
      savedLongitude: this.state.longitude,
      savedLatitude: this.state.latitude,
      savedX: event.clientX,
      savedY: event.clientY,
      manualControl: true,
    });
  }

  onDocumentMouseMove(event){
    const { savedX, savedY, savedLongitude, savedLatitude } = this.state;

    if(this.state.manualControl){
      const newLongitude = (savedX - event.clientX) * 0.1 + savedLongitude;
      const newLatitude = (event.clientY - savedY) * 0.1 + savedLatitude;
      this.setState({
        longitude: newLongitude,
        latitude: newLatitude
      });
    }
  }

  onDocumentMouseUp(event) {
    this.setState({ manualControl: false });
  }

  componentWillUpdate() {
    this.updateView()
  }

  componentDidMount() {
    this.bindEvents();

    // add rendered
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("360-photo").appendChild(this.renderer.domElement);

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
    loader.crossOrigin = "anonymous";
    // load a resource
    loader.load(
      // resource URL
      this.props.filePath,
      // Function when resource is loaded
      ( texture ) => {
         this.sphereMaterial.map = texture

         // geometry + material = mesh (actual object)
         var sphereMesh = new THREE.Mesh(this.sphere, this.sphereMaterial);
         this.scene.add(sphereMesh);

         this.updateView()
    	},
    	function ( xhr ) {
    		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    	},
    	function ( xhr ) {
    		console.log( 'An error happened' );
    	}
    );
  }

  updateView() {
    const latitude = Math.max(-85, Math.min(85, this.state.latitude));

    // moving the camera according to current latitude (vertical movement) and longitude (horizontal movement)
    this.camera.target.x = 500 * Math.sin(THREE.Math.degToRad(90 - this.state.latitude)) * Math.cos(THREE.Math.degToRad(this.state.longitude));
    this.camera.target.y = 500 * Math.cos(THREE.Math.degToRad(90 - this.state.latitude));
    this.camera.target.z = 500 * Math.sin(THREE.Math.degToRad(90 - this.state.latitude)) * Math.sin(THREE.Math.degToRad(this.state.longitude));
    this.camera.lookAt(this.camera.target);

    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div id="360-photo"></div>
    )
  }
}
