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
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.projects = await response.json();
            // Set first project as current
            this.currentProject = this.projects[0];
            console.log('✅ Loaded projects:', this.projects.length);
            console.log('Projects:', this.projects.map(p => p.title));
        } catch (error) {
            console.error('❌ Failed to load projects:', error);
            console.warn('⚠️ Using fallback project data');
            // Fallback to single demo project so scene renders
            this.projects = [{
                "id": "command-center",
                "title": "COMMAND CENTER",
                "category": "frontend",
                "mission": "An immersive 3D cyberpunk portfolio experience.",
                "challenge": "Traditional portfolios fail to capture attention.",
                "solution": "Built with Three.js and custom GLSL shaders.",
                "impact": "10x visitor engagement vs traditional portfolios.",
                "techStack": ["Three.js", "WebGL", "GLSL Shaders"],
                "metrics": {
                    "renderPerformance": "60 FPS",
                    "particles": "1,000 stars"
                },
                "githubUrl": "#",
                "liveUrl": "#",
                "colorTheme": {
                    "primary": "#00f0ff",
                    "secondary": "#00ff88"
                }
            }];
            this.currentProject = this.projects[0];
        }
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050510, 0.008);

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

        // Create workstation manager with all projects
        this.workstationManager = new WorkstationManager(
            this.scene,
            this.camera,
            this.projects,
            (project, workstation) => {
                this.showWorkstationPanel(project);
            }
        );

        // Add ambient lighting
        const ambientLight = new THREE.AmbientLight(0x222244, 1.0);
        this.scene.add(ambientLight);

        // Add point lights for each workstation
        this.workstationManager.getAllWorkstations().forEach(ws => {
            const pointLight = new THREE.PointLight(ws.colorPrimary, 0.8, 12);
            pointLight.position.copy(ws.group.position);
            pointLight.position.y += 1;
            this.scene.add(pointLight);
        });

        // FPS tracking
        this.frameCount = 0;
        this.fps = 60;
        this.lastFpsUpdate = 0;

        console.log('✅ Command Center initialized');
        console.log('Scene objects:', this.scene.children.length);
        console.log('Camera position:', this.camera.position);
        console.log('Workstations:', this.workstationManager.getAllWorkstations().length);

        // Display debug info on screen
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) {
            debugInfo.textContent = `Projects: ${this.projects.length} | Workstations: ${this.workstationManager.getAllWorkstations().length} | Scene: ${this.scene.children.length}`;
        }
    }

    setupEventListeners() {
        // Mouse movement
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / this.width) * 2 - 1;
            this.mouse.y = -(e.clientY / this.height) * 2 + 1;

            // Check for workstation hover
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const hoveredWorkstation = this.workstationManager.checkIntersections(this.raycaster);

            if (hoveredWorkstation) {
                const projectTitle = hoveredWorkstation.projectData.title;
                document.getElementById('interaction-hint').textContent = `Click to access ${projectTitle}`;
                this.canvas.style.cursor = 'pointer';
            } else {
                document.getElementById('interaction-hint').textContent = 'Explore the command center';
                this.canvas.style.cursor = 'crosshair';
            }
        });

        // Click to activate workstation
        window.addEventListener('click', (e) => {
            // Ignore clicks on overlay and panel
            if (e.target.closest('#welcome-overlay') || e.target.closest('#workstation-panel')) {
                return;
            }

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const clickedWorkstation = this.workstationManager.checkIntersections(this.raycaster);

            console.log('Click detected - workstation:', clickedWorkstation);

            if (clickedWorkstation) {
                console.log('Activating workstation:', clickedWorkstation.projectData.title);
                // WorkstationManager will call showWorkstationPanel via callback
                clickedWorkstation.onActivate(clickedWorkstation);
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
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideWorkstationPanel();
            });
        }

        // Demo button (if it exists)
        const demoBtn = document.getElementById('demo-btn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                this.runDemo();
            });
        }

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

    showWorkstationPanel(project) {
        console.log('showWorkstationPanel called with project:', project);

        if (!project) {
            console.error('No project provided to showWorkstationPanel');
            return;
        }

        const panel = document.getElementById('workstation-panel');
        console.log('Panel element:', panel);

        // Populate panel with project data
        this.populateProjectPanel(project);

        panel.classList.remove('hidden');
        console.log('Panel should now be visible');

        // Get active workstation position for camera
        const activeWS = this.workstationManager.getActiveWorkstation();
        if (activeWS) {
            const pos = activeWS.group.position;
            // Camera looks at workstation from a closer distance
            const offsetDistance = 4;
            const direction = pos.clone().normalize();
            const cameraPos = {
                x: pos.x - direction.x * offsetDistance,
                y: pos.y + 1,
                z: pos.z - direction.z * offsetDistance
            };
            this.animateCamera(cameraPos, 1000, pos);
        }

        // Start animating metrics
        this.animateMetrics();
    }

    populateProjectPanel(project) {
        // Update title
        document.querySelector('.panel-title').textContent = project.title;

        // Update all text sections
        document.getElementById('mission-text').textContent = project.mission;
        document.getElementById('challenge-text').textContent = project.challenge;
        document.getElementById('solution-text').textContent = project.solution;
        document.getElementById('impact-text').textContent = project.impact;

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

        // Update links
        const githubLink = document.getElementById('github-link');
        const liveLink = document.getElementById('live-link');

        if (project.githubUrl) {
            githubLink.href = project.githubUrl;
            githubLink.style.display = 'flex';
        } else {
            githubLink.style.display = 'none';
        }

        if (project.liveUrl) {
            liveLink.href = project.liveUrl;
            liveLink.style.display = 'flex';
        } else {
            liveLink.style.display = 'none';
        }
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

        // Reset camera to overview position
        this.animateCamera({ x: 0, y: 3, z: 8 }, 1000, new THREE.Vector3(0, 1, 0));

        this.workstationManager.deactivateAll();
    }

    animateCamera(targetPos, duration, lookAtTarget = null) {
        const startPos = {
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z
        };
        const startTime = Date.now();
        const finalLookAt = lookAtTarget || new THREE.Vector3(0, 1, 0);

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);

            this.camera.position.x = startPos.x + (targetPos.x - startPos.x) * eased;
            this.camera.position.y = startPos.y + (targetPos.y - startPos.y) * eased;
            this.camera.position.z = startPos.z + (targetPos.z - startPos.z) * eased;

            this.camera.lookAt(finalLookAt);

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

        // Update all workstations
        this.workstationManager.update(elapsedTime, deltaTime);

        // Gentle camera sway when not interacting
        const activeWS = this.workstationManager.getActiveWorkstation();
        if (!activeWS) {
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
