import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.SphereGeometry( 3, 10, 10 );
window.geometry = geometry;
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
material.wireframe = true;
const cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

const spheres = [];
for (let i = 0; i < 4; i++) {
    const sphere = new THREE.Mesh(geometry, material);
    sphere.scale.x = i/3;
    sphere.scale.y = i/3;
    sphere.scale.z = i/3;
    sphere.rotation.x = Math.random() * 2 * Math.PI;
    sphere.rotation.y = Math.random() * 2 * Math.PI;
    spheres.push(sphere);
    scene.add(sphere);
}

camera.position.z = 5;

let time = 0;
let offsets = spheres.map((_,i) => (i*Math.PI)/spheres.length);
let targets = spheres.map((_,i) => Math.random() * 2 * Math.PI);

setInterval(() => {
    targets = spheres.map((_,i) => Math.random() * 2 * Math.PI);
}, 200);

let x = 0;
let y = 1;
let z = 0.1;
let sigma = 10 * Math.random();
let beta = 8/3 * Math.random();
let rho = 28 * Math.random();

const update = () => {
    x += sigma * (y - x) * 0.01;
    y += (x * (rho - z) - y) * 0.01;
    z += (x * y - beta * z) * 0.01;
}

const animate = () => {
    update();
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
    spheres.forEach((sphere, i) => {
        /*
        sphere.rotation.x += (targets[i]-sphere.rotation.x)/100 * (Math.sin(time + offsets[i])*Math.sin(time + offsets[i]));
        sphere.rotation.y += (targets[i]-sphere.rotation.y)/100 * (Math.sin(time + offsets[i]));
        */
        sphere.rotation.x += x/300;
        sphere.rotation.y += y/300;
        sphere.position.x = Math.sin(z/10 + i + time/10);
    });
    time += 0.2;

    console.log(x,y,z);
}
animate();