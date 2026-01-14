// Particle System for Obsidian North

class ObsidianParticleSystem {
    constructor(scene, particleCount = 5000) {
        this.scene = scene;
        this.particleCount = particleCount;
        this.particles = [];
        this.mouse = new THREE.Vector3();
        this.targetMouse = new THREE.Vector3();
        this.mouseInfluenceRadius = 2;
        this.mouseAttraction = 0.05;

        // Reality color schemes
        this.realityColors = {
            default: { r: 0.4, g: 0.5, b: 0.8 },  // Brighter obsidian blue/purple
            technical: { r: 0.0, g: 1.0, b: 0.5 },
            innovation: { r: 1.0, g: 0.0, b: 1.0 },
            impact: { r: 1.0, g: 0.7, b: 0.0 },
            aesthetic: { r: 0.0, g: 0.7, b: 1.0 }
        };

        this.currentReality = 'default';
        this.crystallizationProgress = 0;
        this.isTransitioning = false;

        this.init();
    }

    init() {
        // Create geometry and attributes
        this.geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(this.particleCount * 3);
        const velocities = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);
        const alphas = new Float32Array(this.particleCount);
        const crystallizations = new Float32Array(this.particleCount);

        // Initialize particle properties
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;

            // Position - spread throughout the space
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 20;

            // Velocity - gentle floating motion
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

            // Color - blue/purple with good variation for depth
            const baseColor = this.realityColors.default;
            colors[i3] = baseColor.r + Math.random() * 0.3;
            colors[i3 + 1] = baseColor.g + Math.random() * 0.3;
            colors[i3 + 2] = baseColor.b + Math.random() * 0.2;

            // Size - slightly smaller for sharper appearance
            sizes[i] = Math.random() * 2.5 + 1.5;

            // Alpha - increased for more solid, visible particles
            alphas[i] = Math.random() * 0.4 + 0.5;

            // Crystallization state (0 = liquid, 1 = crystallized)
            crystallizations[i] = 0;
        }

        this.positions = positions;
        this.velocities = velocities;
        this.colors = colors;
        this.sizes = sizes;
        this.alphas = alphas;
        this.crystallizations = crystallizations;

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
        this.geometry.setAttribute('crystallization', new THREE.BufferAttribute(crystallizations, 1));

        // Create material using custom shaders
        this.material = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: CrystallizationShaders.vertexShader,
            fragmentShader: CrystallizationShaders.fragmentShader,
            transparent: true,
            blending: THREE.NormalBlending,  // Changed from Additive for sharper, less bloomy particles
            depthWrite: false
        });

        // Create particle system
        this.particleSystem = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.particleSystem);
    }

    updateMousePosition(x, y, camera) {
        // Convert screen coordinates to 3D space
        this.targetMouse.x = x;
        this.targetMouse.y = y;
        this.targetMouse.z = 0;

        this.targetMouse.unproject(camera);

        const dir = this.targetMouse.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        this.targetMouse.copy(camera.position).add(dir.multiplyScalar(distance));
    }

    update(deltaTime) {
        // Smooth mouse movement
        this.mouse.lerp(this.targetMouse, 0.1);

        const positions = this.positions;
        const velocities = this.velocities;
        const colors = this.colors;
        const crystallizations = this.crystallizations;

        // Update crystallization progress if transitioning
        if (this.isTransitioning) {
            this.crystallizationProgress += deltaTime * 0.3;
            if (this.crystallizationProgress >= 1) {
                this.crystallizationProgress = 1;
                this.isTransitioning = false;
            }
        }

        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;

            // Current position
            const x = positions[i3];
            const y = positions[i3 + 1];
            const z = positions[i3 + 2];

            // Distance to mouse
            const dx = this.mouse.x - x;
            const dy = this.mouse.y - y;
            const dz = this.mouse.z - z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // Mouse influence (attraction + repulsion)
            if (distance < this.mouseInfluenceRadius) {
                const force = (1 - distance / this.mouseInfluenceRadius) * this.mouseAttraction;
                velocities[i3] += dx * force;
                velocities[i3 + 1] += dy * force;
                velocities[i3 + 2] += dz * force;
            }

            // Apply velocity with damping
            positions[i3] += velocities[i3];
            positions[i3 + 1] += velocities[i3 + 1];
            positions[i3 + 2] += velocities[i3 + 2];

            velocities[i3] *= 0.98;
            velocities[i3 + 1] *= 0.98;
            velocities[i3 + 2] *= 0.98;

            // Add some noise/turbulence for organic movement
            velocities[i3] += (Math.random() - 0.5) * 0.001;
            velocities[i3 + 1] += (Math.random() - 0.5) * 0.001;
            velocities[i3 + 2] += (Math.random() - 0.5) * 0.001;

            // Boundary constraints (keep particles in view)
            const boundary = 15;
            if (Math.abs(x) > boundary) {
                velocities[i3] *= -0.5;
                positions[i3] = Math.sign(x) * boundary;
            }
            if (Math.abs(y) > boundary) {
                velocities[i3 + 1] *= -0.5;
                positions[i3 + 1] = Math.sign(y) * boundary;
            }
            if (Math.abs(z) > boundary) {
                velocities[i3 + 2] *= -0.5;
                positions[i3 + 2] = Math.sign(z) * boundary;
            }

            // Update crystallization
            crystallizations[i] = this.crystallizationProgress;

            // Color transition during crystallization
            if (this.isTransitioning || this.crystallizationProgress > 0) {
                const targetColor = this.realityColors[this.currentReality];
                const progress = this.crystallizationProgress;

                colors[i3] += (targetColor.r - colors[i3]) * 0.02;
                colors[i3 + 1] += (targetColor.g - colors[i3 + 1]) * 0.02;
                colors[i3 + 2] += (targetColor.b - colors[i3 + 2]) * 0.02;
            }
        }

        // Update geometry attributes
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.customColor.needsUpdate = true;
        this.geometry.attributes.crystallization.needsUpdate = true;
    }

    crystallizeToReality(reality) {
        this.currentReality = reality;
        this.isTransitioning = true;
        this.crystallizationProgress = 0;
    }

    reset() {
        this.currentReality = 'default';
        this.crystallizationProgress = 0;
        this.isTransitioning = false;

        // Reset all particles to liquid state
        for (let i = 0; i < this.particleCount; i++) {
            this.crystallizations[i] = 0;

            const i3 = i * 3;
            const baseColor = this.realityColors.default;
            this.colors[i3] = baseColor.r + Math.random() * 0.1;
            this.colors[i3 + 1] = baseColor.g + Math.random() * 0.1;
            this.colors[i3 + 2] = baseColor.b + Math.random() * 0.2;
        }

        this.geometry.attributes.customColor.needsUpdate = true;
        this.geometry.attributes.crystallization.needsUpdate = true;
    }

    getParticleCount() {
        return this.particleCount;
    }
}
