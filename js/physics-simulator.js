/**
 * Interactive Physics Simulator
 * Built with Three.js and Cannon-ES
 */

class PhysicsSimulator {
    constructor() {
        // Core components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null;
        this.controls = null;
        
        // Simulation state
        this.objects = [];
        this.isPaused = false;
        this.mousePos = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.selectedObject = null;
        this.dragConstraint = null;
        
        // Performance tracking
        this.stats = {
            fps: 0,
            frameCount: 0,
            lastTime: 0,
            physicsTime: 0,
            renderTime: 0
        };
        
        // Physics parameters
        this.params = {
            gravity: -9.82,
            friction: 0.4,
            restitution: 0.3,
            timeStep: 1/60,
            maxSubSteps: 3
        };
        
        // Material definitions
        this.materials = {
            default: new CANNON.Material('default'),
            ground: new CANNON.Material('ground')
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🎯 Starting initialization...');
            
            console.log('📱 Setting up scene...');
            this.setupScene();
            
            console.log('⚡ Setting up physics...');
            this.setupPhysics();
            
            console.log('💡 Setting up lighting...');
            this.setupLighting();
            
            console.log('📷 Setting up camera...');
            this.setupCamera();
            
            console.log('🎮 Setting up controls...');
            this.setupControls();
            
            console.log('👂 Setting up event listeners...');
            this.setupEventListeners();
            
            console.log('🏠 Creating ground...');
            this.createGround();
            
            console.log('🎨 Setting up UI...');
            this.setupUI();
            
            // Force a render to test if rendering works
            console.log('🎬 Testing initial render...');
            this.renderer.render(this.scene, this.camera);
            console.log('✅ Initial render successful!');
            
            // Hide loading screen
            console.log('🫥 Hiding loading screen...');
            document.getElementById('loading').style.display = 'none';
            document.getElementById('ui-overlay').style.display = 'block';
            document.getElementById('stats').style.display = 'block';
            document.getElementById('instructions').style.display = 'block';
            
            // Start animation loop
            console.log('🚀 Starting animation loop...');
            this.animate();
            
            console.log('🎉 Physics Simulator initialized successfully!');
            console.log('📊 Scene info - Children:', this.scene.children.length, 'Objects:', this.objects.length);
            
            // Debug scene contents
            this.scene.children.forEach((child, index) => {
                console.log(`Scene child ${index}:`, child.type, child.position);
            });
            
        } catch (error) {
            console.error('💥 Failed to initialize simulator:', error);
            console.error('Error stack:', error.stack);
            document.getElementById('loading').innerHTML = `
                <div style="color: #ff4757; text-align: center;">
                    <h3>❌ Initialization Error</h3>
                    <p>Check console for details</p>
                    <pre style="font-size: 11px; background: #222; padding: 10px;">${error.message}</pre>
                </div>
            `;
        }
    }
    
    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a); // Lighter background for visibility
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        // Make sure canvas is added to the container
        const container = document.getElementById('canvas-container');
        if (container) {
            container.appendChild(this.renderer.domElement);
            console.log('✅ Renderer canvas added to container');
        } else {
            console.error('❌ Canvas container not found!');
            document.body.appendChild(this.renderer.domElement);
        }
        
        // Add fog after ensuring basic scene works
        this.scene.fog = new THREE.Fog(0x1a1a1a, 30, 100);
    }
    
    setupPhysics() {
        // Create physics world
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, this.params.gravity, 0),
            broadphase: new CANNON.NaiveBroadphase(),
            solver: new CANNON.GSSolver()
        });
        
        // Set up material interactions
        const defaultGroundContact = new CANNON.ContactMaterial(
            this.materials.default,
            this.materials.ground,
            {
                friction: this.params.friction,
                restitution: this.params.restitution
            }
        );
        this.world.addContactMaterial(defaultGroundContact);
        
        // Enable collision detection optimization
        this.world.allowSleep = true;
        this.world.defaultContactMaterial.friction = this.params.friction;
        this.world.defaultContactMaterial.restitution = this.params.restitution;
    }
    
    setupLighting() {
        // Bright ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        console.log('✅ Ambient light added');
        
        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(-10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -25;
        directionalLight.shadow.camera.right = 25;
        directionalLight.shadow.camera.top = 25;
        directionalLight.shadow.camera.bottom = -25;
        this.scene.add(directionalLight);
        console.log('✅ Directional light added');
        
        // Rim lighting
        const rimLight = new THREE.DirectionalLight(0x00ffff, 0.4);
        rimLight.position.set(10, 5, -10);
        this.scene.add(rimLight);
        console.log('✅ Rim light added');
        
        // Point light for dramatic effect
        const pointLight = new THREE.PointLight(0xff6b35, 0.8, 30);
        pointLight.position.set(0, 15, 0);
        this.scene.add(pointLight);
        console.log('✅ Point light added');
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(20, 15, 20);
        this.camera.lookAt(0, 0, 0);
        console.log('✅ Camera positioned at:', this.camera.position);
        console.log('✅ Camera looking at: (0, 0, 0)');
    }
    
    setupControls() {
        // Orbit controls for camera movement (with fallback)
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.screenSpacePanning = false;
            this.controls.minDistance = 5;
            this.controls.maxDistance = 100;
            this.controls.maxPolarAngle = Math.PI / 2;
        } else {
            console.warn('⚠️ OrbitControls not available, using basic camera controls');
            // Simple fallback - camera will be static but functional
            this.controls = {
                update: () => {},
                enabled: true,
                reset: () => {
                    this.camera.position.set(15, 10, 15);
                    this.camera.lookAt(0, 0, 0);
                }
            };
        }
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Mouse events
        this.renderer.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.renderer.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.renderer.domElement.addEventListener('contextmenu', (e) => this.onRightClick(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        
        // UI events
        this.setupUIEventListeners();
    }
    
    setupUIEventListeners() {
        // Spawn buttons
        document.querySelectorAll('.spawn-btn[data-shape]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shape = e.target.getAttribute('data-shape');
                this.spawnObject(shape, { x: 0, y: 10, z: 0 });
            });
        });
        
        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        
        // Pause button
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        
        // Sliders
        const gravitySlider = document.getElementById('gravitySlider');
        const frictionSlider = document.getElementById('frictionSlider');
        const restitutionSlider = document.getElementById('restitutionSlider');
        
        gravitySlider.addEventListener('input', (e) => {
            this.params.gravity = parseFloat(e.target.value);
            this.world.gravity.set(0, this.params.gravity, 0);
            document.getElementById('gravityValue').textContent = e.target.value;
        });
        
        frictionSlider.addEventListener('input', (e) => {
            this.params.friction = parseFloat(e.target.value);
            this.world.defaultContactMaterial.friction = this.params.friction;
            document.getElementById('frictionValue').textContent = e.target.value;
        });
        
        restitutionSlider.addEventListener('input', (e) => {
            this.params.restitution = parseFloat(e.target.value);
            this.world.defaultContactMaterial.restitution = this.params.restitution;
            document.getElementById('restitutionValue').textContent = e.target.value;
        });
    }
    
    createGround() {
        // Visual ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x444444,
            roughness: 0.8,
            metalness: 0.1
        });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.receiveShadow = true;
        groundMesh.position.y = 0;
        this.scene.add(groundMesh);
        console.log('✅ Ground plane added');
        
        // Physics ground
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ 
            mass: 0,
            material: this.materials.ground
        });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.addBody(groundBody);
        console.log('✅ Physics ground added');
        
        // Add visible grid helper
        const gridHelper = new THREE.GridHelper(100, 50, 0x666666, 0x333333);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
        console.log('✅ Grid helper added');
        
        // Add a test cube to verify rendering
        const testGeometry = new THREE.BoxGeometry(2, 2, 2);
        const testMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const testCube = new THREE.Mesh(testGeometry, testMaterial);
        testCube.position.set(0, 1, 0);
        testCube.castShadow = true;
        this.scene.add(testCube);
        console.log('✅ Test cube added for visibility check');
    }
    
    spawnObject(shape, position) {
        const colors = [0xff6b35, 0xf7931e, 0x00ffff, 0xff4757, 0x2ed573, 0x5352ed];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        let geometry, physicsShape;
        let size = 1 + Math.random() * 1.5; // Random size variation
        
        // Create geometry and physics shape based on type
        switch(shape) {
            case 'cube':
                geometry = new THREE.BoxGeometry(size, size, size);
                physicsShape = new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2));
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(size/2, 16, 12);
                physicsShape = new CANNON.Sphere(size/2);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(size/2, size/2, size, 8);
                physicsShape = new CANNON.Cylinder(size/2, size/2, size, 8);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(size/2, size, 8);
                physicsShape = new CANNON.Cylinder(0, size/2, size, 8);
                break;
            default:
                geometry = new THREE.BoxGeometry(size, size, size);
                physicsShape = new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2));
        }
        
        // Create visual mesh
        const material = new THREE.MeshStandardMaterial({ 
            color: color,
            metalness: 0.3,
            roughness: 0.4
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(position.x, position.y, position.z);
        
        // Add random rotation
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        this.scene.add(mesh);
        
        // Create physics body
        const body = new CANNON.Body({ 
            mass: size * 2,
            material: this.materials.default
        });
        body.addShape(physicsShape);
        body.position.set(position.x, position.y, position.z);
        
        // Add random angular velocity
        body.angularVelocity.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        
        this.world.addBody(body);
        
        // Store object pair
        const obj = { mesh, body, shape };
        this.objects.push(obj);
        
        console.log(`🎯 Spawned ${shape} at position (${position.x}, ${position.y}, ${position.z})`);
        return obj;
    }
    
    onMouseDown(event) {
        if (event.button !== 0) return; // Only left mouse button
        
        this.mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mousePos, this.camera);
        const intersects = this.raycaster.intersectObjects(
            this.objects.map(obj => obj.mesh)
        );
        
        if (intersects.length > 0) {
            this.selectedObject = this.objects.find(obj => obj.mesh === intersects[0].object);
            this.controls.enabled = false;
            
            // Create constraint for dragging
            const hitPoint = intersects[0].point;
            this.dragConstraint = new CANNON.PointToPointConstraint(
                this.selectedObject.body,
                hitPoint.clone(),
                new CANNON.Body({ mass: 0 }),
                hitPoint.clone()
            );
            this.world.addConstraint(this.dragConstraint);
            
            // Visual feedback
            this.selectedObject.mesh.material.emissive.setHex(0x222222);
        }
    }
    
    onMouseMove(event) {
        this.mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        if (this.selectedObject && this.dragConstraint) {
            this.raycaster.setFromCamera(this.mousePos, this.camera);
            const intersects = this.raycaster.intersectObject(
                new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial())
            );
            
            if (intersects.length > 0) {
                const point = intersects[0].point;
                point.y = Math.max(point.y, 1); // Keep above ground
                this.dragConstraint.pivotB.copy(point);
            }
        }
    }
    
    onMouseUp(event) {
        if (this.selectedObject) {
            // Remove constraint
            if (this.dragConstraint) {
                this.world.removeConstraint(this.dragConstraint);
                this.dragConstraint = null;
            }
            
            // Reset visual feedback
            this.selectedObject.mesh.material.emissive.setHex(0x000000);
            this.selectedObject = null;
        }
        
        this.controls.enabled = true;
    }
    
    onRightClick(event) {
        event.preventDefault();
        
        // Spawn object at cursor position
        this.mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mousePos, this.camera);
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(groundPlane, intersectPoint);
        
        if (intersectPoint) {
            intersectPoint.y = 5; // Spawn above ground
            const shapes = ['cube', 'sphere', 'cylinder', 'cone'];
            const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
            this.spawnObject(randomShape, intersectPoint);
        }
    }
    
    onKeyDown(event) {
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePause();
                break;
            case 'KeyC':
                this.clearAll();
                break;
            case 'KeyR':
                this.resetCamera();
                break;
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
        console.log(this.isPaused ? '⏸️ Simulation paused' : '▶️ Simulation resumed');
    }
    
    clearAll() {
        this.objects.forEach(obj => {
            this.scene.remove(obj.mesh);
            this.world.removeBody(obj.body);
        });
        this.objects = [];
        console.log('🗑️ All objects cleared');
    }
    
    resetCamera() {
        this.camera.position.set(15, 10, 15);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
        console.log('📹 Camera reset');
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    updateStats() {
        const now = performance.now();
        this.stats.frameCount++;
        
        if (now - this.stats.lastTime >= 1000) {
            this.stats.fps = Math.round((this.stats.frameCount * 1000) / (now - this.stats.lastTime));
            this.stats.frameCount = 0;
            this.stats.lastTime = now;
            
            // Update UI
            document.getElementById('objectCount').textContent = this.objects.length;
            document.getElementById('fps').textContent = this.stats.fps;
            document.getElementById('physicsTime').textContent = this.stats.physicsTime.toFixed(1) + 'ms';
            document.getElementById('renderTime').textContent = this.stats.renderTime.toFixed(1) + 'ms';
        }
    }
    
    setupUI() {
        // Add some initial objects for demonstration (no timeout)
        console.log('🎯 Adding initial demo objects...');
        this.spawnObject('cube', { x: -4, y: 8, z: 0 });
        this.spawnObject('sphere', { x: 0, y: 10, z: 0 });
        this.spawnObject('cylinder', { x: 4, y: 8, z: 0 });
        this.spawnObject('cone', { x: 2, y: 12, z: 2 });
        console.log('✅ Demo objects added');
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const startTime = performance.now();
        
        // Update controls
        this.controls.update();
        
        // Step physics simulation
        if (!this.isPaused) {
            const physicsStart = performance.now();
            this.world.step(this.params.timeStep, this.params.timeStep, this.params.maxSubSteps);
            this.stats.physicsTime = performance.now() - physicsStart;
            
            // Update visual objects to match physics
            this.objects.forEach(obj => {
                obj.mesh.position.copy(obj.body.position);
                obj.mesh.quaternion.copy(obj.body.quaternion);
            });
        }
        
        // Render scene
        const renderStart = performance.now();
        this.renderer.render(this.scene, this.camera);
        this.stats.renderTime = performance.now() - renderStart;
        
        // Update performance stats
        this.updateStats();
        
        // Debug rendering on first few frames
        if (this.stats.frameCount < 5) {
            console.log(`🎬 Frame ${this.stats.frameCount}: Scene children: ${this.scene.children.length}, Objects: ${this.objects.length}`);
        }
    }
}

// Enhanced initialization with better error handling
function initializeSimulator() {
    // Check for WebGL support
    if (!window.WebGLRenderingContext) {
        document.getElementById('loading').innerHTML = `
            <div style="color: #ff4757; text-align: center;">
                <h3>❌ WebGL Not Supported</h3>
                <p>Your browser doesn't support WebGL, which is required for 3D graphics.</p>
                <p>Please use a modern browser like Chrome, Firefox, or Safari.</p>
            </div>
        `;
        return;
    }
    
    // Check for required libraries with detailed error messages
    const missingLibraries = [];
    
    if (typeof THREE === 'undefined') {
        missingLibraries.push('Three.js');
    }
    
    if (typeof CANNON === 'undefined') {
        missingLibraries.push('Cannon-ES');
    }
    
    if (missingLibraries.length > 0) {
        console.error('Missing libraries:', missingLibraries);
        document.getElementById('loading').innerHTML = `
            <div style="color: #ff4757; text-align: center;">
                <h3>❌ Libraries Failed to Load</h3>
                <p>Missing: ${missingLibraries.join(', ')}</p>
                <p>The CDN fallback system is trying alternative sources...</p>
                <div style="margin-top: 15px;">
                    <div class="loading-spinner" style="
                        width: 20px; 
                        height: 20px; 
                        border: 2px solid #00ffff; 
                        border-radius: 50%; 
                        border-top: 2px solid transparent; 
                        animation: spin 1s linear infinite; 
                        margin: 0 auto;
                    "></div>
                </div>
                <button onclick="location.reload()" style="
                    background: #ff6b35; 
                    color: white; 
                    border: none; 
                    padding: 10px 20px; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    margin-top: 15px;
                ">🔄 Reload Page</button>
            </div>
        `;
        
        // Retry initialization after a short delay
        setTimeout(() => {
            if (typeof THREE !== 'undefined' && typeof CANNON !== 'undefined') {
                console.log('🔄 Libraries now available, retrying initialization...');
                initializeSimulator();
            }
        }, 2000);
        return;
    }
    
    // Skip OrbitControls for now - initialize immediately
    console.log('⚠️ Skipping OrbitControls, initializing immediately...');
    
    try {
        // Initialize the simulator
        console.log('🚀 Initializing Physics Simulator...');
        window.simulator = new PhysicsSimulator();
    } catch (error) {
        console.error('💥 Failed to initialize simulator:', error);
        document.getElementById('loading').innerHTML = `
            <div style="color: #ff4757; text-align: center;">
                <h3>❌ Initialization Failed</h3>
                <p>An error occurred while starting the physics simulator.</p>
                <details style="margin-top: 10px; text-align: left;">
                    <summary style="cursor: pointer;">Error Details</summary>
                    <pre style="font-size: 11px; background: #222; padding: 10px; border-radius: 5px; margin-top: 10px;">${error.message}</pre>
                </details>
                <button onclick="location.reload()" style="
                    background: #ff6b35; 
                    color: white; 
                    border: none; 
                    padding: 10px 20px; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    margin-top: 15px;
                ">🔄 Reload Page</button>
            </div>
        `;
    }
}

// Initialize when libraries are ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for CDN loading to complete
    setTimeout(initializeSimulator, 500);
});

// Also try to initialize if libraries become available later
window.addEventListener('load', () => {
    if (!window.simulator && typeof THREE !== 'undefined' && typeof CANNON !== 'undefined') {
        initializeSimulator();
    }
});