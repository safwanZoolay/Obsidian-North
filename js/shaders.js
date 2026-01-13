// Custom shaders for the obsidian particle effect

const ObsidianShaders = {
    // Vertex shader - handles particle positioning and size
    vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        attribute float alpha;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
            vColor = customColor;
            vAlpha = alpha;

            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

            // Size attenuation - particles get smaller with distance
            gl_PointSize = size * (300.0 / -mvPosition.z);

            gl_Position = projectionMatrix * mvPosition;
        }
    `,

    // Fragment shader - handles particle appearance and obsidian effect
    fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
            // Create circular particles with soft edges
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);

            if (dist > 0.5) {
                discard;
            }

            // Soft edge falloff
            float alpha = vAlpha * (1.0 - smoothstep(0.3, 0.5, dist));

            // Add some glow/shimmer effect
            float glow = 1.0 - dist * 2.0;
            glow = pow(glow, 3.0);

            vec3 finalColor = vColor + vec3(glow * 0.3);

            gl_FragColor = vec4(finalColor, alpha);
        }
    `
};

// Crystallization shader for when reality solidifies
const CrystallizationShaders = {
    vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        attribute float alpha;
        attribute float crystallization;

        varying vec3 vColor;
        varying float vAlpha;
        varying float vCrystallization;

        void main() {
            vColor = customColor;
            vAlpha = alpha;
            vCrystallization = crystallization;

            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

            // Particles grow as they crystallize
            float sizeFactor = 1.0 + crystallization * 0.5;
            gl_PointSize = size * sizeFactor * (300.0 / -mvPosition.z);

            gl_Position = projectionMatrix * mvPosition;
        }
    `,

    fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        varying float vCrystallization;

        void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);

            if (dist > 0.5) {
                discard;
            }

            // As crystallization increases, particles become more defined
            float edgeSharpness = mix(0.3, 0.45, vCrystallization);
            float alpha = vAlpha * (1.0 - smoothstep(edgeSharpness, 0.5, dist));

            // Add crystalline facets
            float angle = atan(center.y, center.x);
            float facets = abs(sin(angle * 6.0)) * vCrystallization;

            vec3 crystalColor = vColor + vec3(facets * 0.5);

            // Increased brightness for crystallized particles
            crystalColor += vec3(vCrystallization * 0.3);

            gl_FragColor = vec4(crystalColor, alpha);
        }
    `
};
