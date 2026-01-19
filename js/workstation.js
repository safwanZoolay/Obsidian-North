// Holographic Workstation

class Workstation {
    constructor(scene, camera, onActivate, colorPrimary = '#00f0ff', colorSecondary = '#00ff88') {
        this.scene = scene;
        this.camera = camera;
        this.onActivate = onActivate;
        this.isActive = false;
        this.colorPrimary = new THREE.Color(colorPrimary);
        this.colorSecondary = new THREE.Color(colorSecondary);
        this.init();
    }

    init() {
        // Create main holographic cube
        this.createHologramCube();

        // Create orbiting elements
        this.createOrbitingRings();

        // Create floating data points
        this.createDataPoints();

        // Group all elements
        this.group = new THREE.Group();
        this.group.add(this.hologramCube);
        this.group.add(this.rings);
        this.group.add(this.dataPoints);

        this.group.position.set(0, 1, 0);
        this.scene.add(this.group);

        // Store for raycasting
        this.clickableObjects = [this.hologramCube];
    }

    createHologramCube() {
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);

        this.hologramMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: this.colorPrimary.clone() },
                opacity: { value: 0.6 },
                scanlineIntensity: { value: 0.3 }
            },
            vertexShader: HologramShaders.vertexShader,
            fragmentShader: HologramShaders.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.hologramCube = new THREE.Mesh(geometry, this.hologramMaterial);

        // Add edge glow
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({
            color: this.colorPrimary.clone(),
            linewidth: 2,
            transparent: true,
            opacity: 0.8
        });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        this.hologramCube.add(edges);

        // Add outer glow effect
        const glowGeometry = new THREE.BoxGeometry(1.7, 1.7, 1.7);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: this.colorPrimary.clone() },
                glowIntensity: { value: 0.5 }
            },
            vertexShader: GlowShaders.vertexShader,
            fragmentShader: GlowShaders.fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            depthWrite: false
        });
        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.hologramCube.add(this.glowMesh);
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

        // Rotate main cube
        if (this.hologramCube) {
            this.hologramCube.rotation.x += deltaTime * 0.2;
            this.hologramCube.rotation.y += deltaTime * 0.3;
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

        // Gentle bobbing motion
        if (this.group && !this.isActive) {
            this.group.position.y = 1 + Math.sin(time) * 0.1;
        }
    }

    checkIntersection(raycaster) {
        const intersects = raycaster.intersectObjects(this.clickableObjects);
        return intersects.length > 0 ? intersects[0] : null;
    }

    activate() {
        console.log('Workstation.activate called');
        this.isActive = true;
        // Don't call onActivate here - it's already been called by the click handler
        // This just sets the internal state
    }

    deactivate() {
        this.isActive = false;
    }

    setHighlight(highlight) {
        if (this.hologramMaterial) {
            this.hologramMaterial.uniforms.opacity.value = highlight ? 0.9 : 0.6;
            this.hologramMaterial.uniforms.scanlineIntensity.value = highlight ? 0.6 : 0.3;
        }

        if (this.glowMesh) {
            this.glowMesh.material.uniforms.glowIntensity.value = highlight ? 1.0 : 0.5;
        }
    }

    getPosition() {
        return this.group.position;
    }
}
