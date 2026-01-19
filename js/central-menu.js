// Central Holographic Menu

class CentralMenu {
    constructor(scene, camera, projects, onProjectSelect) {
        this.scene = scene;
        this.camera = camera;
        this.projects = projects;
        this.onProjectSelect = onProjectSelect;
        this.isVisible = true;
        this.init();
    }

    init() {
        this.group = new THREE.Group();

        // Create central holographic panel
        this.createHolographicPanel();

        // Create project list items
        this.createProjectList();

        // Position in center, slightly above ground
        this.group.position.set(0, 2, 0);
        this.scene.add(this.group);
    }

    createHolographicPanel() {
        // Create main panel geometry
        const panelWidth = 4;
        const panelHeight = 5;

        // Create transparent panel background
        const geometry = new THREE.PlaneGeometry(panelWidth, panelHeight);
        const material = new THREE.MeshBasicMaterial({
            color: 0x001133,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });

        this.panel = new THREE.Mesh(geometry, material);

        // Add border
        const borderGeometry = new THREE.EdgesGeometry(geometry);
        const borderMaterial = new THREE.LineBasicMaterial({
            color: 0x00f0ff,
            linewidth: 2,
            transparent: true,
            opacity: 0.8
        });
        const border = new THREE.LineSegments(borderGeometry, borderMaterial);
        this.panel.add(border);

        // Create title sprite
        this.createTitle();

        this.group.add(this.panel);
    }

    createTitle() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 64;

        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = 'bold 40px Courier New';
        context.fillStyle = '#00f0ff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowColor = '#00f0ff';
        context.shadowBlur = 15;
        context.fillText('// SELECT PROJECT', canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
        });

        this.titleSprite = new THREE.Sprite(material);
        this.titleSprite.scale.set(3, 0.5, 1);
        this.titleSprite.position.y = 2;
        this.group.add(this.titleSprite);
    }

    createProjectList() {
        this.projectItems = [];
        const itemHeight = 0.8;
        const startY = 1;

        this.projects.forEach((project, index) => {
            const yPos = startY - (index * itemHeight);
            const item = this.createProjectItem(project, yPos, index);
            this.projectItems.push(item);
            this.group.add(item.group);
        });
    }

    createProjectItem(project, yPos, index) {
        const group = new THREE.Group();
        group.position.y = yPos;

        // Create clickable area
        const geometry = new THREE.PlaneGeometry(3.5, 0.6);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(project.colorTheme?.primary || '#00f0ff'),
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });

        const clickArea = new THREE.Mesh(geometry, material);
        group.add(clickArea);

        // Create text label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 64;

        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = 'bold 32px Courier New';
        const color = project.colorTheme?.primary || '#00f0ff';
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowColor = color;
        context.shadowBlur = 10;

        // Format title with index number
        const text = `${index + 1}. ${project.title}`;
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(3, 0.5, 1);
        group.add(sprite);

        // Add small indicator
        const indicatorGeometry = new THREE.CircleGeometry(0.08, 16);
        const indicatorMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.8
        });
        const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        indicator.position.x = -1.6;
        group.add(indicator);

        return {
            group,
            clickArea,
            sprite,
            indicator,
            project,
            originalOpacity: 0.1,
            hovered: false
        };
    }

    update(time) {
        // Gentle floating animation
        if (this.group) {
            this.group.position.y = 2 + Math.sin(time * 0.5) * 0.1;
            this.group.rotation.y = Math.sin(time * 0.2) * 0.05;
        }

        // Pulse indicators
        this.projectItems.forEach((item, index) => {
            if (item.indicator) {
                const pulse = Math.sin(time * 3 + index * 0.5) * 0.3 + 0.7;
                item.indicator.scale.setScalar(pulse);
            }
        });

        // Make title and menu always face camera
        if (this.titleSprite && this.camera) {
            this.titleSprite.quaternion.copy(this.camera.quaternion);
        }

        this.projectItems.forEach(item => {
            if (item.sprite && this.camera) {
                item.sprite.quaternion.copy(this.camera.quaternion);
            }
        });
    }

    checkIntersection(raycaster) {
        let hoveredItem = null;

        this.projectItems.forEach(item => {
            const intersects = raycaster.intersectObject(item.clickArea);

            if (intersects.length > 0) {
                hoveredItem = item;
                // Highlight effect
                item.clickArea.material.opacity = 0.3;
                item.sprite.material.opacity = 1.0;
            } else {
                // Reset
                item.clickArea.material.opacity = item.originalOpacity;
                item.sprite.material.opacity = 0.8;
            }
        });

        return hoveredItem;
    }

    selectProject(item) {
        if (this.onProjectSelect && item) {
            this.onProjectSelect(item.project);
        }
    }

    show() {
        this.isVisible = true;
        this.group.visible = true;
    }

    hide() {
        this.isVisible = false;
        this.group.visible = false;
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}
