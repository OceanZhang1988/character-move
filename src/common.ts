import Ammo from 'ammojs-typed';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect';

export class DrawingCommon {
    private _boundHandleFrame: (t: DOMHighResTimeStamp) => any;

    // DOM items
    glCanvas = document.createElement('canvas')
	glContext: WebGLRenderingContext;

    // Three.js items
    scene = new THREE.Scene() 
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    effect: OutlineEffect; 
    listener: THREE.AudioListener;
    spotLight = new THREE.SpotLight( 0x223344 );

    constructor(public el: HTMLElement){
        // make it a method that's bound to this object
		this._boundHandleFrame = this._handleFrame.bind(this) 

        // let's create a canvas and to draw in
        el.appendChild(this.glCanvas);

        this.glCanvas.id = "threecanvas";

        // define scene view
        this.scene.background = new THREE.Color( 0xffffff );

        this.camera.position.y = 15;
		this.camera.position.z = 50;
		this.scene.add(this.camera)

		// Create a canvas and context for the session layer
		let ctx = this.glCanvas.getContext('webgl')
        if (!ctx) {
            throw new Error("Cannot create WebGL render context in common.ts")
        }
        this.glContext = ctx


		// Set up the THREE renderer with the session's layer's glContext
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.glCanvas,
			context: this.glContext,
			antialias: true,
			alpha: true
		})
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.glCanvas.offsetWidth, this.glCanvas.offsetHeight );
        this.renderer.shadowMap.enabled = true;
        
        //effect
        this.effect = new OutlineEffect( this.renderer );

        // update the camera
        this.camera.aspect = this.glCanvas.offsetWidth / this.glCanvas.offsetHeight;
        this.camera.updateProjectionMatrix();

        this.listener = new THREE.AudioListener();
        this.listener.position.z = 1;	
        this.camera.add( this.listener );

        window.addEventListener('resize', (event) => {
            this.camera.aspect = this.el.offsetWidth / this.el.offsetHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( this.el.offsetWidth, this.el.offsetHeight );
        });

        // some controls
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.listenToKeyEvents( this.glCanvas ); 


        this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.05;

		this.controls.screenSpacePanning = false;

		this.controls.minDistance = 3;
		this.controls.maxDistance = 50;

        // lights
        this.spotLight.position.set( 5, 20, 15 );
        this.spotLight.angle = 0.8;
        this.spotLight.intensity = 0.7;
        this.spotLight.penumbra = 0.8;
        this.spotLight.castShadow = true;

        // Model specific Shadow parameters
        this.spotLight.shadow.bias = -0.001;

        this.scene.add( this.spotLight );
        this.scene.add( this.spotLight.target );


		// lights
		const directionalLight = new THREE.DirectionalLight( 0x333333 );
        directionalLight.position.set( -15, 15, 20 );

        // Shadow parameters
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.x = 1024;
        directionalLight.shadow.mapSize.y = 1024;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.bottom = -20;
        
        // Model specific Shadow parameters
        directionalLight.shadow.bias = -0.001;

        this.scene.add( directionalLight );

		const ambientLight = new THREE.AmbientLight( 0x666666 );
		this.scene.add( ambientLight );


        // pass

        // var bloomPass = new THREE.UnrealBloomPass(
        //     new THREE.Vector2( window.innerWidth, window.innerHeight ),
        //     1.0, 0.7, 0.1
        // );

        // var copyPass = new THREE.ShaderPass( THREE.CopyShader );
        // var copyPass2 = new THREE.ShaderPass( THREE.CopyShader );

        // copyPass.renderToScreen = true;

        // composer = new THREE.EffectComposer( renderer );
        // composer.setSize( window.innerWidth, window.innerHeight );
        // composer.addPass( bloomPass );
        // composer.addPass( copyPass );

        // composer2 = new THREE.EffectComposer( renderer );
        // composer2.readBuffer = composer.readBuffer;
        // composer2.setSize( window.innerWidth, window.innerHeight );
        // composer2.addPass( copyPass2 );

        // Give extending classes the opportunity to initially populate the scene
		this.initializeScene()

        window.requestAnimationFrame(this._boundHandleFrame)
	}


    // a simple wrapper to reliably get the offset within an DOM element
    // We need this because the mouse position in the mouse event is
    // relative to the Window, but we want to specify draw coordinates
    // relative to the canvas DOM element  
    // see: http://www.jacklmoore.com/notes/mouse-position/
    static offset(e: MouseEvent): ps.MousePosition {
        e = e || <MouseEvent> window.event;

        var target = <Element> (e.target || e.srcElement),
            rect = target.getBoundingClientRect(),
            offsetX = e.clientX - rect.left,
            offsetY = e.clientY - rect.top;

        return {x: offsetX, y: offsetY};
    }

	/*
	Extending classes should override this to set up the scene during class construction
	*/
	initializeScene(){}

	/*
	Extending classes that need to update the layer during each frame should override this method
	*/
	updateScene(time: DOMHighResTimeStamp){}

	_handleFrame(t: DOMHighResTimeStamp){
		const nextFrameRequest = window.requestAnimationFrame(this._boundHandleFrame)

        this.controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

        // Let the extending class update the scene before each render
		this.updateScene(t)

	    this.doRender()
    }

	doRender() {
		this.effect.render(this.scene, this.camera)
	}
}
