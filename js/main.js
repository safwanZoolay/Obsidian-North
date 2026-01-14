// Main Application Controller for Obsidian North Command Center

class CommandCenter {
    constructor() {
        this.canvas = document.getElementById('command-canvas');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        this.projects = [];
        this.currentProject = null;

        this.loadProjects().then(() => {
            this.init();
            this.setupEventListeners();
            this.animate();
        });
    }

    async loadProjects() {
        try {
            const response = await fetch('data/projects.json');
            this.projects = await response.json();
            // Set first project as current
            this.currentProject = this.projects[0];
            console.log('Loaded projects:', this.projects.length);
        } catch (error) {
            console.error('Failed to load projects:', error);
            // Fallback to empty array
            this.projects = [];
        }
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050510, 0.015);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.width / this.height,
            0.1,
            1000
        );
        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0, 1, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x050510, 1);

        // Create grid system
        this.gridSystem = new GridSystem(this.scene);

        // Create workstation
        this.workstation = new Workstation(this.scene, this.camera, () => {
            this.showWorkstationPanel();
        });

        // Add ambient lighting
        const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
        this.scene.add(ambientLight);

        // Add point light at workstation
        const pointLight = new THREE.PointLight(0x00f0ff, 1, 10);
        pointLight.position.set(0, 2, 0);
        this.scene.add(pointLight);

        // FPS tracking
        this.frameCount = 0;
        this.fps = 60;
        this.lastFpsUpdate = 0;

        console.log('Command Center initialized');
    }

    setupEventListeners() {
        // Mouse movement
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / this.width) * 2 - 1;
            this.mouse.y = -(e.clientY / this.height) * 2 + 1;

            // Check for workstation hover
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersection = this.workstation.checkIntersection(this.raycaster);

            if (intersection) {
                this.workstation.setHighlight(true);
                document.getElementById('interaction-hint').textContent = 'Click to access workstation';
                this.canvas.style.cursor = 'pointer';
            } else {
                this.workstation.setHighlight(false);
                document.getElementById('interaction-hint').textContent = 'Explore the command center';
                this.canvas.style.cursor = 'crosshair';
            }
        });

        // Click to activate workstation
        window.addEventListener('click', (e) => {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersection = this.workstation.checkIntersection(this.raycaster);

            if (intersection) {
                this.workstation.activate();
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

        // Enter button
        const enterBtn = document.getElementById('enter-btn');
        enterBtn.addEventListener('click', () => {
            this.hideWelcomeOverlay();
        });

        // Close panel button
        const closeBtn = document.getElementById('close-panel');
        closeBtn.addEventListener('click', () => {
            this.hideWorkstationPanel();
        });

        // Demo button
        const demoBtn = document.getElementById('demo-btn');
        demoBtn.addEventListener('click', () => {
            this.runDemo();
        });

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideWorkstationPanel();
            }
        });
    }

    hideWelcomeOverlay() {
        const overlay = document.getElementById('welcome-overlay');
        overlay.classList.add('hidden');

        // Show HUD
        document.getElementById('hud').style.opacity = '1';
    }

    showWorkstationPanel() {
        if (!this.currentProject) return;

        const panel = document.getElementById('workstation-panel');

        // Populate panel with current project data
        this.populateProjectPanel(this.currentProject);

        panel.classList.remove('hidden');

        // Animate camera closer
        this.animateCamera({ x: 0, y: 2, z: 4 }, 1000);

        // Start animating metrics
        this.animateMetrics();
    }

    populateProjectPanel(project) {
        // Update title
        document.querySelector('.panel-title').textContent = project.title;

        // Update mission brief
        document.querySelector('.section-text').textContent = project.mission;

        // Update tech stack
        const techTagsContainer = document.querySelector('.tech-tags');
        techTagsContainer.innerHTML = '';
        project.techStack.forEach(tech => {
            const tag = document.createElement('span');
            tag.className = 'tech-tag';
            tag.textContent = tech;
            techTagsContainer.appendChild(tag);
        });

        // Update metrics
        const metricsContainer = document.querySelector('.metrics');
        metricsContainer.innerHTML = '';
        Object.entries(project.metrics).forEach(([key, value]) => {
            const metric = document.createElement('div');
            metric.className = 'metric';
            metric.innerHTML = `
                <span class="metric-label">${this.formatMetricLabel(key)}</span>
                <span class="metric-value">${value}</span>
            `;
            metricsContainer.appendChild(metric);
        });
    }

    formatMetricLabel(key) {
        // Convert camelCase to Title Case
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    animateMetrics() {
        // Animate any numeric metrics
        const metricValues = document.querySelectorAll('.metric-value');
        metricValues.forEach(el => {
            const text = el.textContent;
            // Check if it contains a number we can animate
            const match = text.match(/(\d+)/);
            if (match) {
                this.animateNumber(el, parseInt(match[1]));
            }
        });
    }

    animateNumber(element, target) {
        const duration = 1000;
        const start = 0;
        const startTime = Date.now();
        const originalText = element.textContent;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * eased);

            // Replace the number in the original text
            element.textContent = originalText.replace(/\d+/, current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    hideWorkstationPanel() {
        const panel = document.getElementById('workstation-panel');
        panel.classList.add('hidden');

        // Reset camera
        this.animateCamera({ x: 0, y: 3, z: 8 }, 1000);

        this.workstation.deactivate();
    }

    animateCamera(targetPos, duration) {
        const startPos = {
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z
        };
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);

            this.camera.position.x = startPos.x + (targetPos.x - startPos.x) * eased;
            this.camera.position.y = startPos.y + (targetPos.y - startPos.y) * eased;
            this.camera.position.z = startPos.z + (targetPos.z - startPos.z) * eased;

            this.camera.lookAt(0, 1, 0);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    runDemo() {
        const output = document.getElementById('demo-output');
        const btn = document.getElementById('demo-btn');

        btn.disabled = true;
        btn.textContent = 'RUNNING...';

        output.classList.remove('hidden');
        output.innerHTML = '';

        // Simulate API call
        const messages = [
            '> Initializing connection...',
            '> Connecting to API endpoint...',
            '> GET https://api.obsidiannorth.com/v1/status',
            '> Response: 200 OK',
            '> {',
            '>   "status": "operational",',
            '>   "uptime": 99.97,',
            '>   "response_time_ms": 87,',
            '>   "active_sessions": 1247',
            '> }',
            '> Connection successful!'
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < messages.length) {
                output.innerHTML += messages[index] + '\n';
                output.scrollTop = output.scrollHeight;
                index++;
            } else {
                clearInterval(interval);
                btn.disabled = false;
                btn.innerHTML = '<span class="btn-icon">▶</span> RUN DEMO';
            }
        }, 200);
    }

    updateFPS() {
        this.frameCount++;
        const currentTime = this.clock.getElapsedTime();

        if (currentTime - this.lastFpsUpdate >= 1) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;

            document.getElementById('fps').textContent = this.fps;
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // Update grid system
        this.gridSystem.update(elapsedTime);

        // Update workstation
        this.workstation.update(elapsedTime, deltaTime);

        // Gentle camera sway when not interacting
        if (!this.workstation.isActive) {
            this.camera.position.x += Math.sin(elapsedTime * 0.5) * 0.001;
        }

        // Render
        this.renderer.render(this.scene, this.camera);

        // Update FPS
        this.updateFPS();
    }
}

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const app = new CommandCenter();
    window.commandCenter = app; // For debugging
});
