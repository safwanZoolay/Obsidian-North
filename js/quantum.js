// Quantum Reality System - handles reality selection and transitions

class QuantumRealitySystem {
    constructor(particleSystem, onRealitySelected) {
        this.particleSystem = particleSystem;
        this.onRealitySelected = onRealitySelected;
        this.selectedReality = null;

        this.realityData = {
            technical: {
                title: 'THE TECHNICAL DIMENSION',
                description: 'Explore impossible architectures that scale beyond conventional limits. Every system is a testament to performance, reliability, and elegant engineering.',
                particlePattern: 'grid',
                color: { r: 0.0, g: 1.0, b: 0.5 }
            },
            innovation: {
                title: 'THE INNOVATION DIMENSION',
                description: 'Witness experiments that push boundaries. Here, we explore bleeding-edge technologies and unconventional solutions that redefine what\'s possible.',
                particlePattern: 'chaotic',
                color: { r: 1.0, g: 0.0, b: 1.0 }
            },
            impact: {
                title: 'THE IMPACT DIMENSION',
                description: 'Discover transformations that matter. Each project delivers measurable business value, driving growth and creating lasting change.',
                particlePattern: 'wave',
                color: { r: 1.0, g: 0.7, b: 0.0 }
            },
            aesthetic: {
                title: 'THE AESTHETIC DIMENSION',
                description: 'Experience design that transcends function. Beauty and usability merge into interfaces that feel magical to use.',
                particlePattern: 'spiral',
                color: { r: 0.0, g: 0.7, b: 1.0 }
            }
        };

        this.init();
    }

    init() {
        const overlay = document.getElementById('quantum-overlay');
        const realityOptions = document.querySelectorAll('.reality-option');

        realityOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const reality = option.dataset.reality;
                this.selectReality(reality);
            });

            // Add hover effects that influence particles
            option.addEventListener('mouseenter', (e) => {
                const reality = option.dataset.reality;
                this.previewReality(reality);
            });

            option.addEventListener('mouseleave', (e) => {
                if (!this.selectedReality) {
                    this.clearPreview();
                }
            });
        });
    }

    previewReality(reality) {
        // Subtle particle color shift on hover
        const color = this.realityData[reality].color;
        // This could trigger a subtle particle effect
        // For now, we'll just store it for potential future enhancement
        this.hoveredReality = reality;
    }

    clearPreview() {
        this.hoveredReality = null;
    }

    selectReality(reality) {
        this.selectedReality = reality;
        const data = this.realityData[reality];

        // Start crystallization animation
        this.particleSystem.crystallizeToReality(reality);

        // Fade out overlay
        const overlay = document.getElementById('quantum-overlay');
        overlay.classList.add('hidden');

        // Show info after a delay
        setTimeout(() => {
            this.showRealityInfo(data);
        }, 1500);

        // Callback
        if (this.onRealitySelected) {
            this.onRealitySelected(reality, data);
        }
    }

    showRealityInfo(data) {
        const infoOverlay = document.getElementById('info-overlay');
        const title = document.getElementById('reality-title');
        const description = document.getElementById('reality-description');

        title.textContent = data.title;
        description.textContent = data.description;

        infoOverlay.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            infoOverlay.classList.add('hidden');
        }, 8000);
    }

    reset() {
        this.selectedReality = null;
        this.hoveredReality = null;

        // Show overlay again
        const overlay = document.getElementById('quantum-overlay');
        overlay.classList.remove('hidden');

        // Hide info
        const infoOverlay = document.getElementById('info-overlay');
        infoOverlay.classList.add('hidden');

        // Reset particles
        this.particleSystem.reset();
    }

    getSelectedReality() {
        return this.selectedReality;
    }

    getRealityData(reality) {
        return this.realityData[reality];
    }
}
