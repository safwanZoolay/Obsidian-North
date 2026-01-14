// Main application controller

class ObsidianNorth {
    constructor() {
        this.canvas = document.getElementById('obsidian-canvas');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.clock = new THREE.Clock();
        this.frameCount = 0;
        this.fps = 0;
        this.lastFpsUpdate = 0;

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02);  // Dark blue fog instead of pure black

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.width / this.height,
            0.1,
            1000
        );
        this.camera.position.z = 10;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x0a0a1a, 1);  // Dark blue background to match fog

        // Create particle system
        this.particleSystem = new ObsidianParticleSystem(this.scene, 5000);

        // Create quantum reality system
        this.quantumSystem = new QuantumRealitySystem(
            this.particleSystem,
            this.onRealitySelected.bind(this)
        );

        // Add ambient lighting (brighter for better visibility)
        const ambientLight = new THREE.AmbientLight(0x444466);  // Brighter blue-tinted ambient light
        this.scene.add(ambientLight);

        // Initial mouse position
        this.mouse = {
            x: 0,
            y: 0,
            normalizedX: 0,
            normalizedY: 0
        };

        console.log('Obsidian North initialized');
        this.updateStats();
    }

    setupEventListeners() {
        // Mouse movement
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            // Normalize to -1 to 1 range
            this.mouse.normalizedX = (e.clientX / this.width) * 2 - 1;
            this.mouse.normalizedY = -(e.clientY / this.height) * 2 + 1;

            // Update particle system
            this.particleSystem.updateMousePosition(
                this.mouse.normalizedX,
                this.mouse.normalizedY,
                this.camera
            );
        });

        // Touch support for mobile
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this.mouse.x = touch.clientX;
                this.mouse.y = touch.clientY;

                this.mouse.normalizedX = (touch.clientX / this.width) * 2 - 1;
                this.mouse.normalizedY = -(touch.clientY / this.height) * 2 + 1;

                this.particleSystem.updateMousePosition(
                    this.mouse.normalizedX,
                    this.mouse.normalizedY,
                    this.camera
                );
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(this.width, this.height);
        });

        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => {
            this.quantumSystem.reset();
        });

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.quantumSystem.reset();
            }
        });
    }

    onRealitySelected(reality, data) {
        console.log('Reality selected:', reality);

        // Add gentle camera animation
        this.animateCamera();
    }

    animateCamera() {
        // Gentle rotation animation when reality is selected
        const startZ = this.camera.position.z;
        const targetZ = 8;
        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);

            this.camera.position.z = startZ + (targetZ - startZ) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    updateStats() {
        const particleCount = document.getElementById('particle-count');
        particleCount.textContent = this.particleSystem.getParticleCount();
    }

    updateFPS() {
        this.frameCount++;
        const currentTime = this.clock.getElapsedTime();

        if (currentTime - this.lastFpsUpdate >= 1) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;

            const fpsDisplay = document.getElementById('fps');
            fpsDisplay.textContent = this.fps;
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const deltaTime = this.clock.getDelta();

        // Update particle system
        this.particleSystem.update(deltaTime);

        // Gentle camera rotation based on mouse position
        const targetRotationY = this.mouse.normalizedX * 0.1;
        const targetRotationX = this.mouse.normalizedY * 0.1;

        this.camera.rotation.y += (targetRotationY - this.camera.rotation.y) * 0.05;
        this.camera.rotation.x += (targetRotationX - this.camera.rotation.x) * 0.05;

        // Render scene
        this.renderer.render(this.scene, this.camera);

        // Update stats
        this.updateFPS();
    }
}

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const app = new ObsidianNorth();
    window.obsidianNorth = app; // For debugging
});
