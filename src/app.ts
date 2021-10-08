// abstract library
import { DrawingCommon } from './common';
import * as THREE from 'three';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader';
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper';
import { Vector3 } from 'three';


const clock = new THREE.Clock();

// A class for our application state and functionality
class Drawing extends DrawingCommon {

    miku!: THREE.SkinnedMesh;

    helper!: MMDAnimationHelper;
	root!: THREE.Group;

	beams = new THREE.Group();
	monitors = new THREE.Group();

	ready = false;

    constructor (canv: HTMLElement) {
        super (canv)
        if (!this.helper) {
            this.helper = new MMDAnimationHelper({ afterglow: 2.0 });
        }

        if (!this.root) {
            this.root = new THREE.Group();
        }
    }

    /*
	Set up the scene during class construction
	*/
	initializeScene(){

        this.helper = new MMDAnimationHelper({ afterglow: 2.0 });
        this.root = new THREE.Group();

        // model

        function onProgress( xhr: any ) {

            if ( xhr.lengthComputable ) {

                const percentComplete = xhr.loaded / xhr.total * 100;
                console.log( Math.round( percentComplete) + '% downloaded' );
            }
        }

        const self = this;

        const modelFile = 'assets/miku/miku_v2.pmd';
        const vmdFiles = [ 'assets/miku/wavefile_v2.vmd' ];
        const audioFile = 'assets/miku/wavefile_short.mp3';
    
        const loader = new MMDLoader();
        loader.loadWithAnimation( modelFile, vmdFiles, function ( mmd ) {

            self.miku = mmd.mesh;
            

            var materials = self.miku.material;

            if ( Array.isArray(materials)) {

                for ( var i = 0, il = materials.length; i < il; i ++ ) {

                    var material: THREE.MeshLambertMaterial = materials[ i ] as THREE.MeshLambertMaterial ;
                    material.emissiveIntensity = ( 0.2 );
    
                }
            }

            self.miku.castShadow = true;
			self.miku.receiveShadow = true;

            self.helper.add( self.miku, {
                animation: mmd.animation,
                physics: true
            } );

            const cameraFiles = 'assets/miku/wavefile_camera.vmd';

            loader.loadAnimation( cameraFiles, self.camera, audiofunc, onProgress, ()=>{} );

            

        }, onProgress, ()=>{} );

        //
        const audiofunc = function ( cameraAnimation: THREE.SkinnedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | THREE.AnimationClip) {

            self.helper.add( self.camera, {
                animation: cameraAnimation as THREE.AnimationClip
            } );

            new THREE.AudioLoader().load( audioFile, function ( buffer ) {

                const audio = new THREE.Audio( self.listener ).setBuffer( buffer );
                const audioParams = { delayTime: 160 * 1 / 30 };

                self.helper.add( audio, audioParams );

                self.root.add( self.miku );

                self.root.add( new THREE.PolarGridHelper( 40, 15 ) );
                self.root.add( new THREE.Mesh(
                    new THREE.SphereBufferGeometry( 256, 32 ),
                    new THREE.MeshBasicMaterial( {
                        color: 0xffffff,
                        wireframe: true
                    } )
                ));

                self.scene.add(self.root);

                self.ready = true;

            }, onProgress, ()=>{});
        };


        // monitors

        // var geometry = new THREE.PlaneBufferGeometry( 100, 40 );

        // var material = new THREE.ShaderMaterial(
        //     {
        //         uniforms: {
        //             strength: { value: 0.20 },
        //             tDiffuse: { value: composer2.writeBuffer.texture }
        //         },
        //         vertexShader: document.getElementById( 'vertexShader' ).textContent,
        //         fragmentShader: document.getElementById( 'fragmentShader' ).textContent
        //     }
        // );

        // var edgeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );

        // function createMonitor() {

        //     var mesh = new THREE.Mesh( geometry, material );
        //     var edge = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
        //     edge.scale.multiplyScalar( 1.01 );
        //     edge.position.z -= 0.01;

        //     mesh.add( edge );

        //     return mesh;

        // }

        // var tv;

        // tv = createMonitor();
        // tv.position.y = 25;
        // tv.position.z = -50;
        // tv.rotation.x = 180 * Math.PI / 180;
        // tv.rotation.y = 180 * Math.PI / 180;
        // tv.rotation.z = 180 * Math.PI / 180;
        // monitors.add( tv );

        // tv = createMonitor();
        // tv.position.x = -70;
        // tv.position.y = 25;
        // tv.position.z = 0;
        // tv.rotation.x = 180 * Math.PI / 180;
        // tv.rotation.y = 110 * Math.PI / 180;
        // tv.rotation.z = 180 * Math.PI / 180;
        // monitors.add( tv );

        // tv = createMonitor();
        // tv.position.x = 70;
        // tv.position.y = 25;
        // tv.position.z = 0;
        // tv.rotation.x = 180 * Math.PI / 180;
        // tv.rotation.y = -110 * Math.PI / 180;
        // tv.rotation.z = 180 * Math.PI / 180;
        // monitors.add( tv );

        // scene.add( monitors );
    }



	/*
	Update the scene during requestAnimationFrame callback before rendering
	*/
	updateScene(time: DOMHighResTimeStamp){
        if ( this.ready ) {
            this.helper.update( clock.getDelta() );
            const pos = new Vector3();
            this.miku.children[ 0 ].getWorldPosition(pos)
            this.spotLight.target.position.copy( pos );
        }
    }
}

// a global variable for our state.  We implement the drawing as a class, and 
// will have one instance
var myDrawing: Drawing;


// main function that we call below.
// This is done to keep things together and keep the variables created self contained.
// It is a common pattern on the web, since otherwise the variables below woudl be in 
// the global name space.  Not a huge deal here, of course.

export function exec() {

   
        // find our container
        var div = document.getElementById("drawing");

        if (!div) {
            console.warn("Your HTML page needs a DIV with id='drawing'")
            return;
        }

        // create a Drawing object
        myDrawing = new Drawing(div);
    
}

exec();