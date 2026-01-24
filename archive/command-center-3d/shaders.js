// Shader library for Obsidian North Command Center

// Tron Grid Shader
const GridShaders = {
    vertexShader: `
        varying vec3 vPosition;

        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float gridSize;
        uniform float lineWidth;

        varying vec3 vPosition;

        void main() {
            // Create grid lines
            vec2 coord = vPosition.xz / gridSize;
            vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
            float line = min(grid.x, grid.y);

            // Base grid color
            float gridStrength = 1.0 - min(line, 1.0);

            // Add distance fade
            float dist = length(vPosition.xz);
            float fade = 1.0 - smoothstep(20.0, 50.0, dist);

            // Add pulse effect
            float pulse = sin(time * 0.5 + dist * 0.1) * 0.3 + 0.7;

            // Final color
            vec3 finalColor = color * gridStrength * fade * pulse;
            float alpha = gridStrength * fade * 0.6;

            gl_FragColor = vec4(finalColor, alpha);
        }
    `
};

// Holographic Workstation Shader
const HologramShaders = {
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float opacity;
        uniform float scanlineIntensity;

        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
            // Fresnel effect for holographic edges
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);

            // Scanlines
            float scanline = sin(vPosition.y * 30.0 + time * 2.0) * 0.5 + 0.5;
            scanline = mix(1.0, scanline, scanlineIntensity);

            // Glitch effect
            float glitch = step(0.98, sin(time * 10.0 + vPosition.y * 50.0));

            // Combine effects
            vec3 finalColor = color * (fresnel * 2.0 + 0.3);
            finalColor += vec3(glitch * 0.5);

            float finalAlpha = (fresnel * 0.8 + 0.2) * opacity * scanline;

            gl_FragColor = vec4(finalColor, finalAlpha);
        }
    `
};

// Starfield Particle Shader
const StarShaders = {
    vertexShader: `
        attribute float size;
        attribute float brightness;

        varying float vBrightness;

        void main() {
            vBrightness = brightness;

            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,

    fragmentShader: `
        varying float vBrightness;

        void main() {
            // Create circular stars
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);

            if (dist > 0.5) {
                discard;
            }

            // Soft glow
            float alpha = (1.0 - dist * 2.0) * vBrightness;
            alpha = pow(alpha, 2.0);

            vec3 color = vec3(0.6, 0.8, 1.0) * vBrightness;

            gl_FragColor = vec4(color, alpha);
        }
    `
};

// Glow Effect Shader (for workstation highlight)
const GlowShaders = {
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform vec3 glowColor;
        uniform float glowIntensity;

        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
            vec3 viewDirection = normalize(-vPosition);
            float intensity = pow(1.0 - abs(dot(viewDirection, vNormal)), 4.0);

            vec3 glow = glowColor * intensity * glowIntensity;

            gl_FragColor = vec4(glow, intensity * glowIntensity);
        }
    `
};
