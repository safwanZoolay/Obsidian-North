// Workstation Manager - Handles multiple project workstations

class WorkstationManager {
    constructor(scene, camera, projects, onActivate) {
        this.scene = scene;
        this.camera = camera;
        this.projects = projects;
        this.onActivate = onActivate;
        this.workstations = [];
        this.activeWorkstation = null;

        this.init();
    }

    init() {
        console.log('WorkstationManager init - projects:', this.projects.length);

        if (this.projects.length === 0) {
            console.warn('⚠️ No projects to create workstations');
            return;
        }

        const radius = 6; // Distance from center
        const angleStep = (Math.PI * 2) / this.projects.length;

        console.log('Creating workstations in circle, radius:', radius);

        this.projects.forEach((project, index) => {
            // Calculate position in circle
            const angle = index * angleStep;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = 1; // Height

            // Get color from project data
            const colorPrimary = project.colorTheme?.primary || '#00f0ff';
            const colorSecondary = project.colorTheme?.secondary || '#00ff88';

            // Create workstation
            const workstation = new Workstation(
                this.scene,
                this.camera,
                (ws) => {
                    this.activateWorkstation(ws, project);
                },
                colorPrimary,
                colorSecondary
            );

            // Position it
            workstation.group.position.set(x, y, z);

            // Rotate to face center
            workstation.group.rotation.y = -angle + Math.PI;

            // Store reference
            workstation.projectData = project;
            workstation.index = index;

            this.workstations.push(workstation);
        });

        console.log(`Created ${this.workstations.length} workstations`);
    }

    activateWorkstation(workstation, project) {
        // Deactivate previous
        if (this.activeWorkstation) {
            this.activeWorkstation.deactivate();
        }

        this.activeWorkstation = workstation;
        workstation.activate();

        // Call external callback with project data
        if (this.onActivate) {
            this.onActivate(project, workstation);
        }
    }

    update(time, deltaTime) {
        this.workstations.forEach(ws => {
            ws.update(time, deltaTime);
        });
    }

    checkIntersections(raycaster) {
        let closestIntersection = null;
        let closestWorkstation = null;
        let minDistance = Infinity;

        this.workstations.forEach(ws => {
            const intersection = ws.checkIntersection(raycaster);
            if (intersection && intersection.distance < minDistance) {
                minDistance = intersection.distance;
                closestIntersection = intersection;
                closestWorkstation = ws;
            }
        });

        // Clear highlights on all workstations
        this.workstations.forEach(ws => {
            ws.setHighlight(false);
        });

        // Highlight the closest one
        if (closestWorkstation) {
            closestWorkstation.setHighlight(true);
        }

        return closestWorkstation;
    }

    deactivateAll() {
        this.workstations.forEach(ws => {
            ws.deactivate();
        });
        this.activeWorkstation = null;
    }

    getActiveWorkstation() {
        return this.activeWorkstation;
    }

    getWorkstationByIndex(index) {
        return this.workstations[index];
    }

    getAllWorkstations() {
        return this.workstations;
    }
}
