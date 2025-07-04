# 🌈 Psychedelic Lava Lamp Simulator

A stunning, interactive lava lamp physics simulator built with p5.js featuring realistic fluid dynamics, advanced visual effects, and psychedelic themes.

![Lava Lamp Demo](https://img.shields.io/badge/demo-live-brightgreen)

## ✨ Features

- **Realistic Physics**: Metaball rendering with temperature-based convection
- **Advanced Visual Effects**: Bloom effects, caustic patterns, glass reflections
- **Interactive Controls**: Heat, viscosity, smoothness, animation speed
- **Particle Systems**: Bubbles rising through liquid with physics interactions  
- **Psychedelic Themes**: Color cycling with HSB color space transitions
- **Performance Optimization**: Dynamic quality scaling and efficient rendering
- **Responsive Design**: Adapts to different screen sizes

## 🎮 Controls

- **Heat Level**: Controls blob movement and temperature gradients
- **Lava Viscosity**: Adjusts fluid thickness and flow resistance  
- **Smoothness**: Reduces erratic movement for soothing animations
- **Animation Speed**: Global speed multiplier for all effects
- **Bloom Effects**: Intensity of glowing light effects
- **Particle Density**: Number of bubble particles in the liquid
- **Visual Quality**: Overall rendering detail and effects complexity
- **Psychedelic Mode**: Enables rainbow color cycling
- **Color Cycling**: Automatic color theme transitions

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/jwarm69/psychedelic-lava-lamp.git
cd psychedelic-lava-lamp

# Serve locally (any static server works)
python -m http.server 8000
# or
npx serve .
```

Open http://localhost:8000 in your browser.

### Deploy to Vercel

1. **One-Click Deploy**:
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jwarm69/psychedelic-lava-lamp)

2. **Manual Deploy**:
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

## 🛠 Technical Details

### Physics Engine
- **Metaball Rendering**: Organic blob shapes with smooth boundaries
- **Temperature Dynamics**: Heat-based density changes and convection
- **Bottle Constraints**: Realistic lava lamp bottle shape boundaries
- **Surface Tension**: Blob attraction and merging physics
- **Viscosity System**: Configurable fluid resistance

### Visual Effects
- **Bloom Rendering**: Multi-pass blur effects for glowing elements
- **Caustic Patterns**: Dynamic light refraction through liquid
- **Glass Reflections**: Realistic bottle surface highlights
- **Particle Systems**: Bubble physics with wobble effects
- **Color Theory**: HSB color space for smooth transitions

### Performance
- **Spatial Optimization**: Efficient metaball calculations
- **Quality Scaling**: Adaptive detail based on performance
- **Buffer Management**: Optimized rendering pipelines
- **Memory Efficiency**: Particle pooling and cleanup

## 📁 Project Structure

```
physics-simulator/
├── index.html          # Main application page
├── sketch.js           # Core p5.js simulation code
├── style.css           # Custom styling and animations
├── vercel.json         # Deployment configuration
└── README.md           # This file
```

## 🎨 Customization

### Adding New Themes
```javascript
// In getPsychedelicColor function
let customTheme = {
    hue: (colorTheme + offset) % 1,
    saturation: 0.8,
    brightness: 0.6
};
```

### Adjusting Physics
```javascript
// In LavaBlob.update() 
this.vy -= buoyancy * customMultiplier;
this.vx *= customViscosity;
```

### Performance Tuning
```javascript
// In settings object
settings.visualQuality = 5; // 1-10 scale
settings.particleDensity = 4; // 1-10 scale
```

## 🐛 Known Issues

- High particle density may impact performance on older devices
- Color cycling can be CPU intensive in psychedelic mode
- Metaball calculations scale with blob count

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-effect`)
3. Commit your changes (`git commit -m 'Add amazing effect'`)
4. Push to the branch (`git push origin feature/amazing-effect`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [p5.js](https://p5js.org/) - Creative coding library
- Inspired by classic lava lamps and fluid dynamics
- Enhanced with modern web technologies

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**