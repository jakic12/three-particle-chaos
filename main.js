import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// make the camera slowly spin around the center
const cameraTarget = new THREE.Vector3(0,0,0);
const cameraRadius = 10;
let cameraAngle = 0;

const updateCamera = () => {
    camera.position.x = cameraTarget.x + cameraRadius * Math.cos(cameraAngle);
    camera.position.y = cameraTarget.y + cameraRadius * Math.sin(cameraAngle);
    camera.position.z = cameraTarget.z + cameraRadius * Math.sin(cameraAngle);
    camera.lookAt(cameraTarget);
    cameraAngle += 0.01;
}

const colourFromValue = (value) => new THREE.Color(`hsl(${value}, 100%, 50%)`);


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BufferGeometry();
const particles = 100000;
const positions = new Float32Array( particles * 3 );
const sizes = new Float32Array( particles );
const colors = new Float32Array( particles * 3 );
const radius = 5;
// simple shader material
const shaderMaterial = new THREE.ShaderMaterial( {

    vertexShader: document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent

} );

for ( let i = 0; i < particles; i++ ) {
    positions[i*3] =   ( Math.random() * 2 - 1 ) * radius ;
    positions[i*3+1] = ( Math.random() * 2 - 1 ) * radius ;
    positions[i*3+2] = ( Math.random() * 2 - 1 ) * radius ;
    
    sizes[i] = 20;

    const clr = colourFromValue(10);

    colors[i*3+0] = clr.r;
    colors[i*3+1] = clr.g;
    colors[i*3+2] = clr.b;
}

console.log(colors)
geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );
const particleSystem = new THREE.Points( geometry, shaderMaterial );
scene.add( particleSystem );

camera.position.z = 5;

const normFactor = 2;
let sigma = (0 + Math.random()*10)/normFactor;
let beta  = (0 + Math.random()*10)/normFactor;
let rho   = (0 + Math.random()*10)/normFactor;

console.log(sigma, beta, rho)


const update = (x,y,z,beat) => [
    x + (sigma * y - sigma * x) * 0.01 * beat,
    y + (Math.pow(Math.tanh(x), 6)*x * rho - x*z - y) * 0.01 * beat,
    z + (x * Math.abs(Math.tanh(y))*y - (beta * beat * z*x)) * 0.01
]

const clamp = (x, min, max) => Math.max(Math.min(x, max), min);

let beat = 0;
const animate = () => {
    beat += 0.125;
    const signal = Math.sin(beat)*Math.sin(beat)
	requestAnimationFrame( animate );
    const positions = geometry.attributes.position.array;
    const colors = geometry.attributes.color.array;
    let centerOfMass = [0,0,0];
    let t = 1;
    for(let i = 0; i < particles; i++) {
        const [x,y,z] = update(positions[i*3], positions[i*3+1], positions[i*3+2], signal);
        const dx = x - positions[i*3];
        const dy = y - positions[i*3+1];
        const dz = z - positions[i*3+2];
        const speed = dx*dx + dy*dy + dz*dz;

        positions[i*3] = x;
        positions[i*3+1] = y;
        positions[i*3+2] = z;

        if(Math.abs(x) > 10000 || Math.abs(y) > 10000 || Math.abs(z) > 10000) {
            positions[i*3] =   ( Math.random() * 2 - 1 ) * radius ;
            positions[i*3+1] = ( Math.random() * 2 - 1 ) * radius ;
            positions[i*3+2] = ( Math.random() * 2 - 1 ) * radius ;
        }
        
        if(!(isNaN(x) || isNaN(y) || isNaN(z))) {
            centerOfMass[0] += (x-centerOfMass[0])/(t);
            centerOfMass[1] += (y-centerOfMass[1])/(t);
            centerOfMass[2] += (z-centerOfMass[2])/(t);
            t++;
        }

        colors[i*3+0] = Math.min(speed+0, 255);
        colors[i*3+1] = 255;
        colors[i*3+2] = Math.min(speed+0, 255);
    }
    for(let i = 0; i < particles; i++) {
        positions[i*3] -= centerOfMass[0]/2;
        positions[i*3+1] -= centerOfMass[1]/2;
        positions[i*3+2] -= centerOfMass[2]/2;
    }

    if(centerOfMass[0] < 100000)
        cameraTarget.x = 0//cameraTarget.x*0 + clamp(centerOfMass[0], 10000, -10000)
    if(centerOfMass[1] < 100000)
        cameraTarget.y = 0//cameraTarget.y*0 + clamp(centerOfMass[1], 10000, -10000)
    if(centerOfMass[1] < 100000)
        cameraTarget.z = 0//cameraTarget.z*0 + clamp(centerOfMass[2], 10000, -10000)
    updateCamera();
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;


	renderer.render( scene, camera );
}
animate();