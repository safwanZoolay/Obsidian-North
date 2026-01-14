// Grid and Starfield System

class GridSystem {
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init() {
        this.createGrid();
        this.createStarfield();
    }

    createGrid() {
        // Create Tron-style grid plane
        const gridGeometry = new THREE.PlaneGeometry(100, 100, 100, 100);

        this.gridMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0x00f0ff) },
                gridSize: { value: 2.0 },
                lineWidth: { value: 0.05 }
            },
            vertexShader: GridShaders.vertexShader,
            fragmentShader: GridShaders.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.gridMesh = new THREE.Mesh(gridGeometry, this.gridMaterial);
        this.gridMesh.rotation.x = -Math.PI / 2;
        this.gridMesh.position.y = -2;

        this.scene.add(this.gridMesh);
    }

    createStarfield() {
        const starCount = 1000;
        const geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        const brightness = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;

            // Distribute stars in a sphere around the scene
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 30 + Math.random() * 70;

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            sizes[i] = Math.random() * 2 + 0.5;
            brightness[i] = Math.random() * 0.5 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('brightness', new THREE.BufferAttribute(brightness, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: StarShaders.vertexShader,
            fragmentShader: StarShaders.fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.starfield = new THREE.Points(geometry, material);
        this.scene.add(this.starfield);
    }

    update(time) {
        // Update grid animation
        if (this.gridMaterial) {
            this.gridMaterial.uniforms.time.value = time;
        }

        // Slowly rotate starfield
        if (this.starfield) {
            this.starfield.rotation.y = time * 0.02;
        }
    }
}
