//import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
//import * as dat from 'dat.gui'

import { MeshLine, MeshLineMaterial } from 'three.meshline';
//import * as animejs from 'animejs'

// Debug
//const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
/*
// Objects
const geometry = new THREE.TorusGeometry( .7, .2, 16, 100 );

// Materials

const material = new THREE.MeshBasicMaterial()
material.color = new THREE.Color(0xff0000)

// Mesh
const sphere = new THREE.Mesh(geometry,material)
scene.add(sphere) 
*/
// Lights

const pointLight = new THREE.PointLight(0xffffff, 0.1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

/** НАШ КОД ... */

    //Curve
    function createCurve(q){
        const lonHelper = new THREE.Object3D();
        scene.add(lonHelper);
        // We rotate the latHelper on its X axis to the latitude
        const latHelper = new THREE.Object3D();
        lonHelper.add(latHelper);
        // The position helper moves the object to the edge of the sphere
        const positionHelper = new THREE.Object3D();
        positionHelper.position.z = .5;
        latHelper.add(positionHelper);
        // Used to move the center of the cube so it scales from the position Z axis
        const originHelper = new THREE.Object3D();
        originHelper.position.z = 0.5;
        positionHelper.add(originHelper);
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(q.q[0],q.q[1],q.q[2]),
            new THREE.Vector3(q.w[0],q.w[1],q.w[2]),
            new THREE.Vector3(q.e[0],q.e[1],q.e[2])
        );
        const pointsCurve = curve.getPoints(24);
        return pointsCurve;
    }
    //\Curve

    const lineMesh=[];
    function createMeshLine(dataFromCreateCurve,flat=null){
        // Строим геометрию
        // let color=new THREE.Color(1,getRandomFloat(.5,1.),1);
        // let color=new THREE.Color(.2,.7,1);
        // let color=new THREE.Color(.2,getRandomFloat(.5,.8),1);
        let color=new THREE.Color(.2,THREE.Math.randFloat(.5,.8),1);
        let dashRatio=.5,
            lineWidth=.005
        if(flat){
            color=new THREE.Color(0xffffff);
            dashRatio=.9
            lineWidth=.003
        }
        const line = new MeshLine();
        line.setGeometry(dataFromCreateCurve);
        const geometryl = line.geometry;
        // Построить материал с параметрами, чтобы оживить его.
        const materiall = new MeshLineMaterial({
            transparent: true,
            lineWidth,
            color,
            dashArray: 2, // всегда должен быть
            dashOffset: 0, // начать с dash к zero
            dashRatio, // видимая минута ряда длины. Мин: 0.99, Макс: 0.5
        });
        // Построение сетки
        const lineMeshMat = new THREE.Mesh(geometryl, materiall);
        lineMeshMat.lookAt(new THREE.Vector3())
        scene.add(lineMeshMat);
        //parent.add(lineMeshMat);
        lineMesh.push(lineMeshMat);
        /*function update() {
            // Проверьте, есть ли dash, чтобы остановить анимацию.
            // Уменьшить значение dashOffset анимировать dash.
            lineMesh.material.uniforms.dashOffset.value -= 0.01;
            // requestAnimationFrame(update)
        }
        update()*/

    }
    const mainPos=[.662,.8,-.28];

    //console.log(createCurve({q:[.63,.84,-.13],w:[.7,.8,-.2],e:mainPos}));
    
    createMeshLine(createCurve({q:[.63,.84,-.13],w:[.7,.8,-.2],e:mainPos}))

    const points = [];
    for (let j = 0; j < Math.PI; j += (2 * Math.PI) / 100) {
      points.push(Math.cos(j), Math.sin(j), 0);
    }
    let dashRatio=.5,
    lineWidth=.005
    let color=new THREE.Color(.2,THREE.Math.randFloat(.5,.8),1);
    const line = new MeshLine();

    line.setPoints(points);

    const materiall = new MeshLineMaterial({
        transparent: true,
        lineWidth,
        color,
        dashArray:2, // всегда должен быть
        dashOffset: 0, // начать с dash к zero
        dashRatio, // видимая минута ряда длины. Мин: 0.99, Макс: 0.5
    });
    //line.materiall.uniforms.dashOffset.value -= 0.01;

    const lineMeshMat = new THREE.Mesh(line, materiall);
    //lineMeshMat.lookAt(new THREE.Vector3())
    scene.add(lineMeshMat);
    lineMesh.push(lineMeshMat);

/** \ НАШ КОД */

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

// Controls
 const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    //sphere.rotation.y = .5 * elapsedTime

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)


    lineMesh.forEach(e=>{
        e.material.uniforms.dashOffset.value -= 0.01
    });
}

tick()