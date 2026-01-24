// Holographic Workstation

class Workstation {
    constructor(scene, camera, onActivate, colorPrimary = '#00f0ff', colorSecondary = '#00ff88', projectData = null) {
        this.scene = scene;
        this.camera = camera;
        this.onActivate = onActivate;
        this.isActive = false;
        this.colorPrimary = new THREE.Color(colorPrimary);
        this.colorSecondary = new THREE.Color(colorSecondary);
        this.projectData = projectData;
        this.init();
    }

    init() {
        // Create main holographic shape (varies by category)
        this.createHologramShape();

        // Create orbiting elements
        this.createOrbitingRings();

        // Create floating data points
        this.createDataPoints();

        // Create floating text label
        this.createLabel();

        // Create hover ring (hidden by default)
        this.createHoverRing();

        // Create particle system for click effect
        this.createClickParticles();

        // Group all elements
        this.group = new THREE.Group();
        this.group.add(this.hologramShape);
        this.group.add(this.rings);
        this.group.add(this.dataPoints);
        this.group.add(this.label);
        this.group.add(this.hoverRing);
        this.group.add(this.clickParticles);

        this.group.position.set(0, 1, 0);
        this.scene.add(this.group);

        // Store for raycasting
        this.clickableObjects = [this.hologramShape];
    }

    createHologramShape() {
        // Different shapes based on category
        let geometry;
        const category = this.projectData?.category || 'frontend';

        switch (category) {
            case 'frontend':
                geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
                break;
            case 'fullstack':
                geometry = new THREE.SphereGeometry(0.9, 32, 32);
                break;
            case 'performance':
                geometry = new THREE.TorusKnotGeometry(0.6, 0.25, 100, 16);
                break;
            default:
                geometry = new THREE.OctahedronGeometry(1, 0);
        }

        this.hologramMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: this.colorPrimary.clone() },
                opacity: { value: 0.7 },
                scanlineIntensity: { value: 0.3 }
            },
            vertexShader: HologramShaders.vertexShader,
            fragmentShader: HologramShaders.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.hologramShape = new THREE.Mesh(geometry, this.hologramMaterial);

        // Add edge glow - more solid
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({
            color: this.colorPrimary.clone(),
            linewidth: 3,
            transparent: true,
            opacity: 1.0
        });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        this.hologramShape.add(edges);

        // Add outer glow effect
        const glowGeometry = geometry.clone();
        glowGeometry.scale(1.15, 1.15, 1.15);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: this.colorPrimary.clone() },
                glowIntensity: { value: 0.6 }
            },
            vertexShader: GlowShaders.vertexShader,
            fragmentShader: GlowShaders.fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            depthWrite: false
        });
        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.hologramShape.add(this.glowMesh);
    }

    createLabel() {
        // Create a canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;

        // Draw text
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = 'bold 48px Courier New';
        context.fillStyle = this.colorPrimary.getStyle();
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const title = this.projectData?.title || 'PROJECT';
        context.fillText(title, canvas.width / 2, canvas.height / 2);

        // Add glow effect
        context.shadowColor = this.colorPrimary.getStyle();
        context.shadowBlur = 20;
        context.fillText(title, canvas.width / 2, canvas.height / 2);

        // Create texture and sprite
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
        });

        this.label = new THREE.Sprite(material);
        this.label.scale.set(4, 1, 1);
        this.label.position.y = 2.5;
    }

    createHoverRing() {
        const geometry = new THREE.RingGeometry(1.8, 2.0, 64);
        const material = new THREE.MeshBasicMaterial({
            color: this.colorPrimary,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0
        });

        this.hoverRing = new THREE.Mesh(geometry, material);
        this.hoverRing.rotation.x = Math.PI / 2;
        this.hoverRing.position.y = -0.8;
    }

    createClickParticles() {
        const particleCount = 30;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;

            velocities.push({
                x: (Math.random() - 0.5) * 0.2,
                y: Math.random() * 0.2,
                z: (Math.random() - 0.5) * 0.2
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: this.colorPrimary,
            size: 0.1,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });

        this.clickParticles = new THREE.Points(geometry, material);
        this.particleVelocities = velocities;
        this.particleActive = false;
        this.particleTime = 0;
    }

    createOrbitingRings() {
        this.rings = new THREE.Group();

        for (let i = 0; i < 3; i++) {
            const radius = 2 + i * 0.3;
            const geometry = new THREE.RingGeometry(radius, radius + 0.02, 64);
            const material = new THREE.MeshBasicMaterial({
                color: this.colorSecondary.clone(),
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.3
            });

            const ring = new THREE.Mesh(geometry, material);
            ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
            ring.rotation.y = (Math.random() - 0.5) * 0.3;

            this.rings.add(ring);
        }
    }

    createDataPoints() {
        this.dataPoints = new THREE.Group();
        const pointCount = 20;

        for (let i = 0; i < pointCount; i++) {
            const geometry = new THREE.SphereGeometry(0.05, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? this.colorPrimary.clone() : this.colorSecondary.clone(),
                transparent: true,
                opacity: 0.8
            });

            const point = new THREE.Mesh(geometry, material);

            // Position around the cube
            const angle = (i / pointCount) * Math.PI * 2;
            const radius = 2.5;
            const height = (Math.random() - 0.5) * 2;

            point.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );

            point.userData.orbitSpeed = 0.5 + Math.random();
            point.userData.startAngle = angle;

            this.dataPoints.add(point);
        }
    }

    update(time, deltaTime) {
        // Update shader time
        if (this.hologramMaterial) {
            this.hologramMaterial.uniforms.time.value = time;
        }

        // Rotate main shape
        if (this.hologramShape) {
            this.hologramShape.rotation.x += deltaTime * 0.2;
            this.hologramShape.rotation.y += deltaTime * 0.3;
        }

        // Rotate rings
        if (this.rings) {
            this.rings.children.forEach((ring, i) => {
                ring.rotation.z += deltaTime * (0.5 + i * 0.2);
            });
        }

        // Orbit data points
        if (this.dataPoints) {
            this.dataPoints.children.forEach((point, i) => {
                const angle = point.userData.startAngle + time * point.userData.orbitSpeed;
                const radius = 2.5;

                point.position.x = Math.cos(angle) * radius;
                point.position.z = Math.sin(angle) * radius;

                // Pulse effect
                point.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.3);
            });
        }

        // Rotate hover ring
        if (this.hoverRing) {
            this.hoverRing.rotation.z += deltaTime * 2;
        }

        // Update click particles
        if (this.particleActive) {
            this.particleTime += deltaTime;
            const positions = this.clickParticles.geometry.attributes.position.array;

            for (let i = 0; i < this.particleVelocities.length; i++) {
                const vel = this.particleVelocities[i];
                positions[i * 3] += vel.x;
                positions[i * 3 + 1] += vel.y;
                positions[i * 3 + 2] += vel.z;

                // Apply gravity
                vel.y -= deltaTime * 0.5;
            }

            this.clickParticles.geometry.attributes.position.needsUpdate = true;

            // Fade out particles
            const opacity = Math.max(0, 1 - this.particleTime * 2);
            this.clickParticles.material.opacity = opacity;

            // Deactivate after 1 second
            if (this.particleTime > 1) {
                this.particleActive = false;
                this.clickParticles.material.opacity = 0;
            }
        }

        // Make label always face camera
        if (this.label && this.camera) {
            this.label.quaternion.copy(this.camera.quaternion);
        }

        // Gentle bobbing motion
        if (this.group && !this.isActive) {
            this.group.position.y = 1 + Math.sin(time) * 0.1;
        }
    }

    triggerClickEffect() {
        // Reset particle positions
        const positions = this.clickParticles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] = 0;
            positions[i + 1] = 0;
            positions[i + 2] = 0;
        }
        this.clickParticles.geometry.attributes.position.needsUpdate = true;

        // Reset velocities
        for (let i = 0; i < this.particleVelocities.length; i++) {
            this.particleVelocities[i] = {
                x: (Math.random() - 0.5) * 0.2,
                y: Math.random() * 0.2,
                z: (Math.random() - 0.5) * 0.2
            };
        }

        // Activate particles
        this.particleActive = true;
        this.particleTime = 0;
        this.clickParticles.material.opacity = 1;
    }

    checkIntersection(raycaster) {
        const intersects = raycaster.intersectObjects(this.clickableObjects);
        return intersects.length > 0 ? intersects[0] : null;
    }

    activate() {
        console.log('Workstation.activate called');
        this.isActive = true;
        // Trigger particle burst on activation
        this.triggerClickEffect();
        // Don't call onActivate here - it's already been called by the click handler
        // This just sets the internal state
    }

    deactivate() {
        this.isActive = false;
    }

    setHighlight(highlight) {
        if (this.hologramMaterial) {
            this.hologramMaterial.uniforms.opacity.value = highlight ? 0.95 : 0.7;
            this.hologramMaterial.uniforms.scanlineIntensity.value = highlight ? 0.6 : 0.3;
        }

        if (this.glowMesh) {
            this.glowMesh.material.uniforms.glowIntensity.value = highlight ? 1.2 : 0.6;
        }

        // Animate hover ring
        if (this.hoverRing) {
            const targetOpacity = highlight ? 0.8 : 0;
            const targetScale = highlight ? 1.1 : 1.0;

            // Smooth transition
            this.hoverRing.material.opacity += (targetOpacity - this.hoverRing.material.opacity) * 0.1;
            this.hoverRing.scale.x += (targetScale - this.hoverRing.scale.x) * 0.1;
            this.hoverRing.scale.y += (targetScale - this.hoverRing.scale.y) * 0.1;
        }

        // Scale effect on main shape
        if (this.hologramShape) {
            const targetScale = highlight ? 1.15 : 1.0;
            this.hologramShape.scale.x += (targetScale - this.hologramShape.scale.x) * 0.1;
            this.hologramShape.scale.y += (targetScale - this.hologramShape.scale.y) * 0.1;
            this.hologramShape.scale.z += (targetScale - this.hologramShape.scale.z) * 0.1;
        }

        // Make label brighter on hover
        if (this.label) {
            this.label.material.opacity = highlight ? 1.0 : 0.9;
        }
    }

    getPosition() {
        return this.group.position;
    }
}
