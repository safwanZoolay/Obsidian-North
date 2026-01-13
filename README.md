# Obsidian North: The Crystallization Engine

## Proof of Concept

A revolutionary portfolio experience where visitors navigate through liquid obsidian particles that crystallize into different realities, showcasing Obsidian North's capabilities in innovative, memorable ways.

## Concept

This POC demonstrates the core concept:
- **Liquid State**: 5,000+ particles flowing like liquid obsidian, representing infinite possibility
- **Quantum Realities**: Multiple parallel dimensions that visitors can choose to explore
- **Crystallization**: The liquid solidifies into structured form when reality is selected
- **Interactive Physics**: Particles respond to mouse/touch input with realistic physics
- **Visual Poetry**: Every element is a metaphor for the software development process

## Features Implemented

### 1. Liquid Obsidian Particle System
- 5,000 particles with WebGL shaders
- Real-time physics simulation
- Organic floating motion with turbulence
- Mouse attraction/interaction
- Boundary constraints

### 2. Quantum Reality Selection
Four distinct realities to explore:
- **Technical Dimension** - Architecture, performance, scale (Green)
- **Innovation Dimension** - Cutting-edge, experimental (Magenta)
- **Impact Dimension** - Business value, transformation (Amber)
- **Aesthetic Dimension** - Design, experience, beauty (Cyan)

### 3. Crystallization Animation
- Smooth transition from liquid to crystalline state
- Color morphing based on selected reality
- Particle size and opacity changes
- Faceted crystal appearance

### 4. Interactive Effects
- Mouse/touch creates ripples in the particle field
- Camera rotates gently based on cursor position
- Reality selection triggers camera animation
- Hover effects on reality options

### 5. Performance Monitoring
- Real-time FPS counter
- Particle count display
- Optimized rendering with LOD

## Installation & Running

### Option 1: Simple HTTP Server (Recommended)

```bash
# If you have Python 3 installed
python3 -m http.server 8000

# If you have Python 2
python -m SimpleHTTPServer 8000

# If you have Node.js installed
npx http-server -p 8000
```

Then open your browser to: `http://localhost:8000`

### Option 2: Direct File Access

Some browsers allow opening the `index.html` file directly:
1. Navigate to the project directory
2. Double-click `index.html`

**Note**: Chrome may block this due to CORS. Use Option 1 instead.

### Option 3: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## User Experience Flow

1. **Entry**: Screen fills with flowing liquid obsidian particles
2. **Selection**: Choose one of four quantum realities
3. **Crystallization**: Watch particles solidify with your chosen color theme
4. **Exploration**: Interact with the crystallized reality
5. **Reset**: Press 'R' or click "Reset Reality" to start over

## Keyboard Shortcuts

- `R` - Reset to liquid state and show reality selection

## Technical Architecture

```
Frontend Stack:
├── Three.js (r128) - 3D rendering and WebGL
├── Custom GLSL Shaders - Particle effects and crystallization
├── Vanilla JavaScript - Application logic
└── CSS3 - UI overlays and animations

Core Systems:
├── ObsidianParticleSystem - Particle physics and rendering
├── QuantumRealitySystem - Reality selection and transitions
└── Main Application - Scene management and coordination

Performance:
├── BufferGeometry for efficient particle handling
├── Additive blending for glow effects
├── RequestAnimationFrame for smooth 60fps
└── Responsive to window resize
```

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Requirements**: WebGL support (all modern browsers)

## File Structure

```
obsidian-north/
├── index.html              # Main HTML structure
├── css/
│   └── style.css          # Styles and animations
├── js/
│   ├── main.js            # Application controller
│   ├── particles.js       # Particle system logic
│   ├── quantum.js         # Reality selection system
│   └── shaders.js         # Custom GLSL shaders
└── README.md              # This file
```

## Next Steps for Full Implementation

### Phase 2: Enhanced Interactions
- [ ] Add AI Digital Twin chatbot
- [ ] Implement voice interaction
- [ ] Add particle morphing patterns for each reality
- [ ] Create "Living Codebase" 3D visualization

### Phase 3: Impossible Geometry
- [ ] Penrose stairs navigation
- [ ] M.C. Escher-style impossible spaces
- [ ] 4D scrolling (time + space)
- [ ] Non-Euclidean geometry transitions

### Phase 4: Project Integration
- [ ] Real project data visualization
- [ ] Git history → generative art
- [ ] Code metrics → particle DNA
- [ ] Interactive case studies

### Phase 5: Advanced Features
- [ ] Reality blending (show multiple simultaneously)
- [ ] Generative art export
- [ ] WebGPU optimization for 50,000+ particles
- [ ] VR/AR support

## Customization

### Adjust Particle Count
Edit `js/main.js`, line 29:
```javascript
this.particleSystem = new ObsidianParticleSystem(this.scene, 5000);
// Change 5000 to your desired count
```

### Modify Reality Colors
Edit `js/particles.js`, lines 12-18:
```javascript
this.realityColors = {
    technical: { r: 0.0, g: 1.0, b: 0.5 },
    // Modify RGB values (0.0 to 1.0 range)
}
```

### Change Physics Behavior
Edit `js/particles.js`, lines 9-11:
```javascript
this.mouseInfluenceRadius = 2;    // Radius of mouse effect
this.mouseAttraction = 0.05;      // Strength of attraction
```

## Performance Tips

- **Low FPS?** Reduce particle count to 2000-3000
- **Mobile Device?** Consider 1000-2000 particles
- **High-end GPU?** Increase to 10,000+ particles
- **Battery Saving**: Close other tabs and applications

## Troubleshooting

**Black screen?**
- Check browser console for errors
- Ensure WebGL is enabled in browser settings
- Try a different browser

**Particles not moving?**
- Move your mouse/touch the screen
- Check if JavaScript is enabled

**Poor performance?**
- Reduce particle count
- Close other browser tabs
- Update graphics drivers

## Credits

Concept & Development: Obsidian North
Technology: Three.js, WebGL, GLSL
Inspiration: Quantum mechanics, liquid crystals, impossible geometry

## License

Proprietary - Obsidian North 2026

---

**Ready to crystallize your reality?**

Open the application and let the obsidian flow guide you through the impossible.
