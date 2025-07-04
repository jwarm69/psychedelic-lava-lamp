// Psychedelic Desktop Lava Lamp Simulator
let lavaBlobs = [];
let particles = [];
let bubbles = [];
let colorTheme = 0;
let time = 0;
let bloomBuffer;
let settings = {
    heat: 60,
    viscosity: 5,
    isOn: true,
    psychedelic: true,
    colorCycle: true,
    smoothness: 8,
    speed: 5,
    bloomIntensity: 7, // Bloom effect strength (1-10)
    particleDensity: 6, // Particle effect density (1-10)
    visualQuality: 8 // Overall visual quality (1-10)
};

// Enhanced lamp dimensions (classic lava lamp proportions)
const LAMP_BASE_WIDTH = 140;
const LAMP_BASE_HEIGHT = 60;
const LAMP_BOTTLE_WIDTH_BOTTOM = 90;
const LAMP_BOTTLE_WIDTH_TOP = 70;
const LAMP_BOTTLE_HEIGHT = 350;
const LAMP_CAP_HEIGHT = 40;
const LAMP_NECK_HEIGHT = 20;

let lampX, lampY;
let lampBounds = {};
let metaballCanvas, metaballCtx;

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');
    
    // Create bloom buffer for advanced effects
    bloomBuffer = createGraphics(width, height);
    
    // Center the lamp on screen
    lampX = width / 2;
    lampY = height / 2 + 50;
    
    // Calculate lamp boundaries
    calculateLampBounds();
    
    // Initialize all particle systems
    initializeLavaBlobs();
    initializeBubbles();
    
    // Setup controls
    setupControls();
}

function draw() {
    time += 0.01;
    
    // Draw psychedelic room environment
    drawPsychedelicRoom();
    
    // Draw enhanced desk surface
    drawEnhancedDesk();
    
    // Draw the authentic lava lamp structure
    drawLampBase();
    drawLampBottle();
    drawLampCap();
    drawLampBulb();
    
    // Update all physics systems
    updateLavaPhysics();
    updateParticles();
    updateBubbles();
    
    // Render with advanced effects
    renderWithBloom();
    
    // Update color cycling
    if (settings.colorCycle) {
        colorTheme = (colorTheme + 0.005) % 1;
    }
}

function renderWithBloom() {
    // Clear bloom buffer
    bloomBuffer.clear();
    
    // Render all glowing elements to bloom buffer
    bloomBuffer.push();
    renderGlowingElements(bloomBuffer);
    bloomBuffer.pop();
    
    // Apply bloom effect
    applyBloomEffect();
    
    // Render non-glowing elements normally
    renderRegularElements();
    
    // Add final lighting and particles
    addAdvancedLighting();
    renderAllParticles();
}

function renderGlowingElements(buffer) {
    buffer.clear();
    
    // Render metaballs to bloom buffer
    renderMetaballs(buffer);
    
    // Render glowing particles
    renderGlowingParticles(buffer);
}

function applyBloomEffect() {
    if (settings.bloomIntensity <= 1) return;
    
    // Create bloom effect through multiple blur passes
    let bloomIntensity = map(settings.bloomIntensity, 1, 10, 0.1, 0.8);
    
    // Multiple blur passes for smooth bloom
    for (let i = 0; i < 3; i++) {
        let blurAmount = (i + 1) * 2;
        
        // Apply blur and blend with screen mode
        drawingContext.globalCompositeOperation = 'screen';
        drawingContext.filter = `blur(${blurAmount}px)`;
        
        tint(255, bloomIntensity * 255 * (0.6 - i * 0.15));
        image(bloomBuffer, 0, 0);
        
        drawingContext.filter = 'none';
        noTint();
    }
    
    drawingContext.globalCompositeOperation = 'source-over';
}

function drawPsychedelicRoom() {
    // Dynamic psychedelic background
    for (let i = 0; i <= height; i += 2) {
        let inter = map(i, 0, height, 0, 1);
        let wave = sin(time * 2 + inter * PI * 2) * 0.3 + 0.7;
        
        let r = map(sin(time + inter), -1, 1, 20, 60) * wave;
        let g = map(sin(time * 1.3 + inter), -1, 1, 25, 70) * wave;
        let b = map(sin(time * 0.7 + inter), -1, 1, 40, 90) * wave;
        
        stroke(r, g, b);
        line(0, i, width, i);
        if (i + 1 <= height) {
            line(0, i + 1, width, i + 1);
        }
    }
    
    // Add subtle moving patterns
    for (let x = 0; x < width; x += 40) {
        for (let y = 0; y < height; y += 40) {
            let brightness = sin(time + x * 0.01 + y * 0.01) * 15 + 15;
            fill(brightness, brightness * 1.2, brightness * 1.5, 30);
            noStroke();
            ellipse(x + sin(time + x * 0.02) * 10, y + cos(time + y * 0.02) * 10, 8, 8);
        }
    }
}

function drawEnhancedDesk() {
    let deskY = lampY + LAMP_BASE_HEIGHT / 2 + 20;
    let deskHeight = height - deskY;
    
    // Enhanced wooden desk with reflective surface
    for (let i = 0; i < deskHeight; i += 2) {
        let inter = map(i, 0, deskHeight, 0, 1);
        let baseR = 101 + sin(time * 0.5) * 10;
        let baseG = 67 + sin(time * 0.3) * 8;
        let baseB = 33 + sin(time * 0.7) * 5;
        
        let c = lerpColor(color(baseR, baseG, baseB), color(baseR * 0.7, baseG * 0.7, baseB * 0.7), inter);
        stroke(c);
        line(0, deskY + i, width, deskY + i);
    }
    
    // Wood grain with subtle animation
    stroke(115, 76, 38, 80);
    strokeWeight(1);
    for (let i = 0; i < 8; i++) {
        let y = deskY + i * 12 + sin(time + i) * 2;
        line(0, y, width, y);
    }
    
    // Lamp reflection on desk
    if (settings.isOn) {
        let reflectionAlpha = map(settings.heat, 0, 100, 10, 40);
        fill(255, 150, 50, reflectionAlpha);
        noStroke();
        ellipse(lampX, deskY + 15, LAMP_BASE_WIDTH * 0.8, 30);
    }
}

function drawLampBase() {
    let baseX = lampX - LAMP_BASE_WIDTH / 2;
    let baseY = lampY + LAMP_BOTTLE_HEIGHT / 2 - LAMP_BASE_HEIGHT / 2;
    
    // Enhanced shadow with glow
    fill(0, 0, 0, 60);
    noStroke();
    ellipse(lampX, baseY + LAMP_BASE_HEIGHT + 8, LAMP_BASE_WIDTH + 20, 25);
    
    // Main chrome base with gradient
    for (let i = 0; i < LAMP_BASE_HEIGHT; i += 2) {
        let inter = map(i, 0, LAMP_BASE_HEIGHT, 0, 1);
        let brightness = map(sin(inter * PI + time), -1, 1, 60, 140);
        fill(brightness, brightness, brightness + 10);
        noStroke();
        rect(baseX, baseY + i, LAMP_BASE_WIDTH, 2, 8);
    }
    
    // Chrome highlights
    fill(200, 200, 220, 180);
    noStroke();
    rect(baseX + 10, baseY + 5, LAMP_BASE_WIDTH - 20, 12, 6);
    
    // Chrome reflection
    fill(255, 255, 255, 100);
    rect(baseX + 15, baseY + 8, LAMP_BASE_WIDTH - 30, 4, 2);
    
    // Power indicator with pulsing effect
    if (settings.isOn && settings.heat > 30) {
        let pulse = sin(time * 4) * 0.3 + 0.7;
        fill(255, map(settings.heat, 30, 100, 100, 200), 0, 200 * pulse);
        ellipse(lampX + LAMP_BASE_WIDTH / 3, baseY + LAMP_BASE_HEIGHT - 20, 12, 12);
        
        // Inner glow
        fill(255, 255, 100, 100 * pulse);
        ellipse(lampX + LAMP_BASE_WIDTH / 3, baseY + LAMP_BASE_HEIGHT - 20, 6, 6);
    }
}

function drawLampBottle() {
    let bottleY = lampY - LAMP_BOTTLE_HEIGHT / 2;
    
    // Draw bottle shape using curves for authentic lava lamp look
    fill(240, 245, 255, 40);
    stroke(180, 200, 230, 150);
    strokeWeight(3);
    
    // Main bottle body using bezier curves
    beginShape();
    
    // Left side of bottle (bottom to top)
    let leftX = lampX - LAMP_BOTTLE_WIDTH_BOTTOM / 2;
    vertex(leftX, bottleY + LAMP_BOTTLE_HEIGHT);
    
    // Curve inward slightly
    bezierVertex(
        leftX - 5, bottleY + LAMP_BOTTLE_HEIGHT * 0.8,
        leftX - 8, bottleY + LAMP_BOTTLE_HEIGHT * 0.6,
        lampX - LAMP_BOTTLE_WIDTH_TOP / 2, bottleY + LAMP_BOTTLE_HEIGHT * 0.2
    );
    
    // Neck area
    bezierVertex(
        lampX - LAMP_BOTTLE_WIDTH_TOP / 2 + 5, bottleY + LAMP_BOTTLE_HEIGHT * 0.1,
        lampX - LAMP_BOTTLE_WIDTH_TOP / 2 + 10, bottleY,
        lampX - LAMP_BOTTLE_WIDTH_TOP / 2 + 15, bottleY
    );
    
    // Top curve
    vertex(lampX + LAMP_BOTTLE_WIDTH_TOP / 2 - 15, bottleY);
    
    // Right side (top to bottom)
    bezierVertex(
        lampX + LAMP_BOTTLE_WIDTH_TOP / 2 - 10, bottleY,
        lampX + LAMP_BOTTLE_WIDTH_TOP / 2 - 5, bottleY + LAMP_BOTTLE_HEIGHT * 0.1,
        lampX + LAMP_BOTTLE_WIDTH_TOP / 2, bottleY + LAMP_BOTTLE_HEIGHT * 0.2
    );
    
    bezierVertex(
        lampX + LAMP_BOTTLE_WIDTH_TOP / 2 + 8, bottleY + LAMP_BOTTLE_HEIGHT * 0.6,
        lampX + LAMP_BOTTLE_WIDTH_TOP / 2 + 5, bottleY + LAMP_BOTTLE_HEIGHT * 0.8,
        lampX + LAMP_BOTTLE_WIDTH_BOTTOM / 2, bottleY + LAMP_BOTTLE_HEIGHT
    );
    
    endShape(CLOSE);
    
    // Enhanced glass reflections and caustic patterns
    drawGlassReflections(bottleY);
    drawCausticPatterns(bottleY);
}

function drawLampCap() {
    let capX = lampX - LAMP_BOTTLE_WIDTH_TOP / 2;
    let capY = lampY - LAMP_BOTTLE_HEIGHT / 2 - LAMP_CAP_HEIGHT;
    
    // Chrome cap with enhanced metallic look
    for (let i = 0; i < LAMP_CAP_HEIGHT; i += 2) {
        let inter = map(i, 0, LAMP_CAP_HEIGHT, 0, 1);
        let brightness = map(sin(inter * PI * 2 + time), -1, 1, 80, 160);
        fill(brightness, brightness, brightness + 15);
        noStroke();
        rect(capX, capY + i, LAMP_BOTTLE_WIDTH_TOP, 2, 12);
    }
    
    // Cap highlights
    fill(220, 220, 240, 200);
    noStroke();
    rect(capX + 8, capY + 5, LAMP_BOTTLE_WIDTH_TOP - 16, 8, 4);
    
    // Chrome reflection
    fill(255, 255, 255, 150);
    rect(capX + 12, capY + 7, LAMP_BOTTLE_WIDTH_TOP - 24, 3, 2);
    
    // Decorative ridges
    stroke(100, 100, 120);
    strokeWeight(1);
    for (let i = 0; i < 3; i++) {
        let y = capY + 15 + i * 8;
        line(capX + 5, y, capX + LAMP_BOTTLE_WIDTH_TOP - 5, y);
    }
}

function drawLampBulb() {
    if (!settings.isOn || settings.heat < 20) return;
    
    let bulbY = lampY + LAMP_BOTTLE_HEIGHT / 2 - 25;
    let bulbSize = 20;
    
    // Bulb glow effect
    let intensity = map(settings.heat, 20, 100, 0.3, 1);
    let pulse = sin(time * 3) * 0.2 + 0.8;
    
    // Outer glow
    fill(255, 180, 50, 40 * intensity * pulse);
    noStroke();
    ellipse(lampX, bulbY, bulbSize * 3, bulbSize * 2);
    
    // Middle glow
    fill(255, 200, 80, 80 * intensity * pulse);
    ellipse(lampX, bulbY, bulbSize * 2, bulbSize * 1.5);
    
    // Bulb core
    fill(255, 220, 120, 150 * intensity);
    ellipse(lampX, bulbY, bulbSize, bulbSize * 0.8);
    
    // Filament effect
    stroke(255, 240, 150, 200 * intensity);
    strokeWeight(2);
    line(lampX - 3, bulbY - 2, lampX + 3, bulbY + 2);
    line(lampX - 3, bulbY + 2, lampX + 3, bulbY - 2);
}

function calculateLampBounds() {
    // Calculate bounds for bottle shape with proper interior space
    let bottleTop = lampY - LAMP_BOTTLE_HEIGHT / 2;
    let bottleBottom = lampY + LAMP_BOTTLE_HEIGHT / 2;
    
    lampBounds = {
        left: lampX - LAMP_BOTTLE_WIDTH_BOTTOM / 2 + 8,
        right: lampX + LAMP_BOTTLE_WIDTH_BOTTOM / 2 - 8,
        top: bottleTop + 10,
        bottom: bottleBottom - 10,
        centerX: lampX,
        centerY: lampY,
        width: LAMP_BOTTLE_WIDTH_BOTTOM - 16,
        height: LAMP_BOTTLE_HEIGHT - 20,
        
        // Enhanced function to get precise width at any height
        getWidthAtY: function(y) {
            let relativeY = (y - this.top) / this.height;
            relativeY = constrain(relativeY, 0, 1);
            
            if (relativeY < 0.15) {
                // Neck area - narrower
                return LAMP_BOTTLE_WIDTH_TOP - 16;
            } else if (relativeY < 0.25) {
                // Transition from neck to body
                let t = map(relativeY, 0.15, 0.25, 0, 1);
                return lerp(LAMP_BOTTLE_WIDTH_TOP - 16, LAMP_BOTTLE_WIDTH_BOTTOM - 16, t * 0.7);
            } else {
                // Main body area - full width
                let t = map(relativeY, 0.25, 1, 0, 1);
                let bodyWidth = lerp(LAMP_BOTTLE_WIDTH_BOTTOM - 16, LAMP_BOTTLE_WIDTH_BOTTOM - 16, t);
                return bodyWidth;
            }
        },
        
        // Check if a point is inside the bottle shape
        isInside: function(x, y) {
            if (y < this.top || y > this.bottom) return false;
            
            let widthAtY = this.getWidthAtY(y);
            let halfWidth = widthAtY / 2;
            return (x >= this.centerX - halfWidth && x <= this.centerX + halfWidth);
        }
    };
}

function initializeLavaBlobs() {
    lavaBlobs = [];
    
    // Dynamic blob count based on quality setting
    let blobCount = map(settings.visualQuality, 1, 10, 8, 16);
    
    // Large base blob that stays at bottom (like real lava lamps)
    let baseWidth = lampBounds.getWidthAtY(lampBounds.bottom - 20);
    lavaBlobs.push(new LavaBlob(
        lampBounds.centerX, 
        lampBounds.bottom - 15, 
        baseWidth * 0.3
    ));
    
    // Medium blobs distributed throughout the lamp
    for (let i = 0; i < Math.floor(blobCount * 0.6); i++) {
        let y = random(lampBounds.bottom - 80, lampBounds.bottom - 20);
        let widthAtY = lampBounds.getWidthAtY(y);
        let x = random(lampBounds.centerX - widthAtY/2 + 10, lampBounds.centerX + widthAtY/2 - 10);
        let size = random(12, 25);
        
        if (lampBounds.isInside(x, y)) {
            lavaBlobs.push(new LavaBlob(x, y, size));
        }
    }
    
    // Smaller blobs for detail
    for (let i = 0; i < Math.floor(blobCount * 0.4); i++) {
        let y = random(lampBounds.top + 30, lampBounds.bottom - 30);
        let widthAtY = lampBounds.getWidthAtY(y);
        let x = random(lampBounds.centerX - widthAtY/2 + 8, lampBounds.centerX + widthAtY/2 - 8);
        let size = random(6, 15);
        
        if (lampBounds.isInside(x, y)) {
            lavaBlobs.push(new LavaBlob(x, y, size));
        }
    }
}

function initializeBubbles() {
    bubbles = [];
    
    // Initialize bubble particles based on particle density setting
    let bubbleCount = map(settings.particleDensity, 1, 10, 5, 20);
    
    for (let i = 0; i < bubbleCount; i++) {
        let y = random(lampBounds.bottom - 30, lampBounds.bottom - 10);
        let widthAtY = lampBounds.getWidthAtY(y);
        let x = random(lampBounds.centerX - widthAtY/2 + 5, lampBounds.centerX + widthAtY/2 - 5);
        
        if (lampBounds.isInside(x, y)) {
            bubbles.push(new Bubble(x, y));
        }
    }
}

function updateLavaPhysics() {
    if (!settings.isOn) return;
    
    lavaBlobs.forEach(blob => {
        blob.update();
    });
    
    // Smoother blob interactions and merging
    for (let i = lavaBlobs.length - 1; i >= 0; i--) {
        for (let j = i - 1; j >= 0; j--) {
            if (lavaBlobs[i] && lavaBlobs[j]) {
                let d = dist(lavaBlobs[i].x, lavaBlobs[i].y, lavaBlobs[j].x, lavaBlobs[j].y);
                let minDist = lavaBlobs[i].radius + lavaBlobs[j].radius;
                
                // More gradual merging threshold
                let mergeThreshold = map(settings.smoothness, 1, 10, 0.95, 0.85);
                
                if (d < minDist * mergeThreshold) {
                    // Smooth merge with conservation of mass
                    let blob1 = lavaBlobs[i];
                    let blob2 = lavaBlobs[j];
                    
                    let totalMass = blob1.radius * blob1.radius + blob2.radius * blob2.radius;
                    let newRadius = sqrt(totalMass);
                    
                    // Weighted average for position and properties
                    let mass1 = blob1.radius * blob1.radius;
                    let mass2 = blob2.radius * blob2.radius;
                    let totalMassForPos = mass1 + mass2;
                    
                    let newX = (blob1.x * mass1 + blob2.x * mass2) / totalMassForPos;
                    let newY = (blob1.y * mass1 + blob2.y * mass2) / totalMassForPos;
                    
                    // Average velocities for smooth transition
                    let newVx = (blob1.vx * mass1 + blob2.vx * mass2) / totalMassForPos;
                    let newVy = (blob1.vy * mass1 + blob2.vy * mass2) / totalMassForPos;
                    
                    // Average temperatures
                    let newTemp = (blob1.temperature * mass1 + blob2.temperature * mass2) / totalMassForPos;
                    
                    // Ensure merged blob is within bottle
                    let widthAtY = lampBounds.getWidthAtY(newY);
                    let halfWidth = widthAtY / 2;
                    newX = constrain(newX, lampBounds.centerX - halfWidth + newRadius, 
                                           lampBounds.centerX + halfWidth - newRadius);
                    
                    let newBlob = new LavaBlob(newX, newY, newRadius);
                    newBlob.vx = newVx * 0.8; // Dampen velocity slightly
                    newBlob.vy = newVy * 0.8;
                    newBlob.temperature = newTemp;
                    
                    lavaBlobs.push(newBlob);
                    lavaBlobs.splice(i, 1);
                    lavaBlobs.splice(j, 1);
                    break;
                }
            }
        }
    }
    
    // Smoother blob splitting with reduced frequency
    for (let i = lavaBlobs.length - 1; i >= 0; i--) {
        let splitChance = map(settings.smoothness, 1, 10, 0.02, 0.005);
        if (lavaBlobs[i] && lavaBlobs[i].radius > 35 && random() < splitChance) {
            let blob = lavaBlobs[i];
            let widthAtY = lampBounds.getWidthAtY(blob.y);
            
            // Only split if there's room and not moving too fast
            let velocity = sqrt(blob.vx * blob.vx + blob.vy * blob.vy);
            if (blob.radius * 2 < widthAtY * 0.8 && velocity < 1.0) {
                lavaBlobs.splice(i, 1);
                
                // Create two smaller blobs with inherited properties
                let newRadius = blob.radius * 0.7;
                let offset = newRadius * 0.6;
                
                let blob1X = constrain(blob.x - offset, 
                                     lampBounds.centerX - widthAtY/2 + newRadius,
                                     lampBounds.centerX + widthAtY/2 - newRadius);
                let blob2X = constrain(blob.x + offset, 
                                     lampBounds.centerX - widthAtY/2 + newRadius,
                                     lampBounds.centerX + widthAtY/2 - newRadius);
                
                let blob1 = new LavaBlob(blob1X, blob.y, newRadius);
                let blob2 = new LavaBlob(blob2X, blob.y, newRadius);
                
                // Inherit parent properties but with damped velocities
                blob1.vx = blob.vx * 0.5 - 0.2;
                blob1.vy = blob.vy * 0.5;
                blob1.temperature = blob.temperature;
                
                blob2.vx = blob.vx * 0.5 + 0.2;
                blob2.vy = blob.vy * 0.5;
                blob2.temperature = blob.temperature;
                
                lavaBlobs.push(blob1);
                lavaBlobs.push(blob2);
            }
        }
    }
    
    // Maintain minimum blob count for proper lamp appearance
    if (lavaBlobs.length < 8) {
        // Add a new small blob at the bottom
        let y = lampBounds.bottom - 30;
        let widthAtY = lampBounds.getWidthAtY(y);
        let x = random(lampBounds.centerX - widthAtY/2 + 10, lampBounds.centerX + widthAtY/2 - 10);
        lavaBlobs.push(new LavaBlob(x, y, random(8, 15)));
    }
}

function renderMetaballs() {
    // Smooth metaball rendering with optimized stability
    if (lavaBlobs.length === 0) return;
    
    // Use pixel manipulation for true metaball effect
    loadPixels();
    
    // Dynamic resolution based on smoothness setting
    let resolution = map(settings.smoothness, 1, 10, 3, 1);
    
    for (let x = lampBounds.left; x < lampBounds.right; x += resolution) {
        for (let y = lampBounds.top; y < lampBounds.bottom; y += resolution) {
            // Only render within bottle shape
            if (!lampBounds.isInside(x, y)) continue;
            
            let density = 0;
            let totalTemp = 0;
            let weightSum = 0;
            
            // Calculate metaball field with smoothness adjustment
            lavaBlobs.forEach(blob => {
                let dx = x - blob.x;
                let dy = y - blob.y;
                let distance = sqrt(dx * dx + dy * dy);
                
                if (distance < blob.radius * 2.5) {
                    // Smoother influence calculation
                    let smoothingFactor = map(settings.smoothness, 1, 10, 1, 3);
                    let influence = (blob.radius * blob.radius) / (distance * distance + smoothingFactor);
                    density += influence;
                    totalTemp += blob.temperature * influence;
                    weightSum += influence;
                }
            });
            
            if (weightSum > 0) {
                totalTemp /= weightSum;
            }
            
            // Smoother density thresholds
            let densityThreshold = map(settings.smoothness, 1, 10, 0.4, 0.2);
            
            if (density > densityThreshold) {
                let c = getPsychedelicColor(totalTemp, density);
                let alpha = map(density, densityThreshold, 4, 60, 255);
                
                // Fill pixel area with anti-aliasing for high smoothness
                for (let px = x; px < x + resolution && px < lampBounds.right; px++) {
                    for (let py = y; py < y + resolution && py < lampBounds.bottom; py++) {
                        if (px >= 0 && px < width && py >= 0 && py < height && lampBounds.isInside(px, py)) {
                            // Blend with existing pixels for smoother appearance
                            if (settings.smoothness > 7) {
                                let existingColor = get(px, py);
                                let blendFactor = 0.7;
                                let newR = red(c) * blendFactor + red(existingColor) * (1 - blendFactor);
                                let newG = green(c) * blendFactor + green(existingColor) * (1 - blendFactor);
                                let newB = blue(c) * blendFactor + blue(existingColor) * (1 - blendFactor);
                                set(px, py, color(newR, newG, newB, alpha));
                            } else {
                                set(px, py, color(red(c), green(c), blue(c), alpha));
                            }
                        }
                    }
                }
            }
        }
    }
    
    updatePixels();
    
    // No circular glow effects
}

function getPsychedelicColor(temperature, density) {
    let tempNorm = map(temperature, 20, 100, 0, 1);
    let baseHue, saturation, brightness;
    
    if (settings.psychedelic && settings.colorCycle) {
        // Psychedelic color cycling
        baseHue = (colorTheme + tempNorm * 0.3 + density * 0.2) % 1;
        saturation = 0.8 + sin(time * 2 + tempNorm) * 0.2;
        brightness = 0.6 + tempNorm * 0.4 + sin(time + density) * 0.1;
    } else {
        // Classic lava lamp colors
        if (tempNorm < 0.4) {
            return color(150 + tempNorm * 100, 50 + tempNorm * 100, 200 - tempNorm * 150);
        } else if (tempNorm < 0.7) {
            return color(255, 100 + tempNorm * 100, 50);
        } else {
            return color(255, 200, 50 + tempNorm * 50);
        }
    }
    
    // Convert HSB to RGB
    colorMode(HSB, 1);
    let c = color(baseHue, saturation, brightness);
    colorMode(RGB, 255);
    
    return c;
}


function addPsychedelicLighting() {
    if (!settings.isOn) return;
    
    drawingContext.globalCompositeOperation = 'screen';
    
    let glowIntensity = map(settings.heat, 0, 100, 0, 100);
    
    // Subtle base glow only
    if (settings.psychedelic) {
        let hue = colorTheme;
        colorMode(HSB, 1);
        let c = color(hue, 0.6, 0.4);
        colorMode(RGB, 255);
        
        fill(red(c), green(c), blue(c), glowIntensity * 0.05);
        noStroke();
        ellipse(lampX, lampY, LAMP_BOTTLE_WIDTH_BOTTOM * 1.2, LAMP_BOTTLE_HEIGHT * 0.8);
    } else {
        // Minimal warm glow
        fill(255, 150, 50, glowIntensity * 0.08);
        noStroke();
        ellipse(lampX, lampY, LAMP_BOTTLE_WIDTH_BOTTOM * 1.1, LAMP_BOTTLE_HEIGHT * 0.7);
    }
    
    drawingContext.globalCompositeOperation = 'source-over';
}

function updateParticles() {
    // Generate sparkle particles from hot blobs
    lavaBlobs.forEach(blob => {
        if (blob.temperature > 70 && random() < 0.3) {
            if (particles.length < 200) {
                particles.push(new SparkleParticle(blob.x, blob.y, blob.temperature));
            }
        }
    });
    
    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
}

function renderParticles() {
    if (!settings.psychedelic) return;
    
    particles.forEach(particle => {
        particle.display();
    });
}

function setupControls() {
    // Heat control
    document.getElementById('heat-slider').addEventListener('input', (e) => {
        settings.heat = parseInt(e.target.value);
        settings.isOn = settings.heat > 10;
    });
    
    // Viscosity control
    document.getElementById('viscosity-slider').addEventListener('input', (e) => {
        settings.viscosity = parseInt(e.target.value);
    });
    
    // Smoothness control
    document.getElementById('smoothness-slider').addEventListener('input', (e) => {
        settings.smoothness = parseInt(e.target.value);
    });
    
    // Speed control
    document.getElementById('speed-slider').addEventListener('input', (e) => {
        settings.speed = parseInt(e.target.value);
    });
    
    // Bloom intensity control
    document.getElementById('bloom-slider').addEventListener('input', (e) => {
        settings.bloomIntensity = parseInt(e.target.value);
    });
    
    // Particle density control
    document.getElementById('particle-slider').addEventListener('input', (e) => {
        settings.particleDensity = parseInt(e.target.value);
        // Regenerate bubbles with new density
        initializeBubbles();
    });
    
    // Visual quality control
    document.getElementById('quality-slider').addEventListener('input', (e) => {
        settings.visualQuality = parseInt(e.target.value);
    });
    
    // Psychedelic mode toggle
    document.getElementById('psychedelic-toggle').addEventListener('change', (e) => {
        settings.psychedelic = e.target.checked;
    });
    
    // Color cycling toggle
    document.getElementById('color-cycle-toggle').addEventListener('change', (e) => {
        settings.colorCycle = e.target.checked;
    });
    
    // Reset button
    document.getElementById('reset-button').addEventListener('click', () => {
        initializeLavaBlobs();
        particles = [];
        colorTheme = 0;
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    lampX = width / 2;
    lampY = height / 2 + 50;
    calculateLampBounds();
    initializeLavaBlobs();
}

class LavaBlob {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = 0;
        this.vy = 0;
        this.temperature = 50;
        this.targetTemp = 50;
        this.density = 1.0;
        this.isRising = false;
    }
    
    update() {
        // Smooth temperature physics with gradual changes
        let heatFromBottom = map(this.y, lampBounds.bottom, lampBounds.top, 100, 20);
        this.targetTemp = (heatFromBottom + settings.heat) / 2;
        
        // Much slower temperature change for stability
        let tempLerpRate = map(settings.smoothness, 1, 10, 0.02, 0.005);
        this.temperature = lerp(this.temperature, this.targetTemp, tempLerpRate);
        
        // Smoother density changes
        this.density = map(this.temperature, 20, 100, 1.2, 0.8);
        
        // Gentler buoyancy force scaled by speed setting
        let speedMultiplier = map(settings.speed, 1, 10, 0.3, 1.0);
        let buoyancy = (1.0 - this.density) * 0.03 * speedMultiplier;
        this.vy -= buoyancy;
        
        // Reduced gravity for more graceful movement
        let gravity = 0.012 * map(this.radius, 15, 60, 1.1, 0.9) * speedMultiplier;
        this.vy += gravity;
        
        // Enhanced viscosity system with smoothness control
        let baseViscosity = map(settings.viscosity, 1, 10, 0.85, 0.98);
        let smoothnessBonus = map(settings.smoothness, 1, 10, 0, 0.05);
        let viscosityFactor = Math.min(baseViscosity + smoothnessBonus, 0.99);
        
        this.vx *= viscosityFactor;
        this.vy *= viscosityFactor;
        
        // Dramatically reduced Brownian motion for smoothness
        let brownianStrength = map(this.temperature, 20, 100, 0.01, 0.03);
        brownianStrength *= map(settings.smoothness, 1, 10, 1, 0.1); // Less jitter at high smoothness
        
        this.vx += random(-brownianStrength, brownianStrength);
        this.vy += random(-brownianStrength, brownianStrength);
        
        // Velocity limiting for smooth motion
        let maxVelocity = map(settings.speed, 1, 10, 0.5, 2.0);
        this.vx = constrain(this.vx, -maxVelocity, maxVelocity);
        this.vy = constrain(this.vy, -maxVelocity, maxVelocity);
        
        // Surface tension effect (attracts to other nearby blobs)
        this.applySurfaceTension();
        
        // Smooth position updates
        this.x += this.vx;
        this.y += this.vy;
        
        // Enhanced boundary constraints for bottle shape
        this.constrainToBottle();
    }
    
    applySurfaceTension() {
        lavaBlobs.forEach(other => {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distance = sqrt(dx * dx + dy * dy);
                let minDist = this.radius + other.radius;
                
                if (distance < minDist * 1.8 && distance > minDist * 0.8) {
                    // Gentle surface tension with smoothness control
                    let baseForce = map(settings.smoothness, 1, 10, 0.0005, 0.003);
                    let force = baseForce * map(distance, minDist * 0.8, minDist * 1.8, 1, 0.1);
                    
                    this.vx += (dx / distance) * force;
                    this.vy += (dy / distance) * force;
                }
            }
        });
    }
    
    constrainToBottle() {
        // Smooth bottle constraint system
        let availableWidth = lampBounds.getWidthAtY(this.y);
        let halfWidth = availableWidth / 2;
        let centerX = lampBounds.centerX;
        
        // Softer horizontal constraints with damping
        let leftBound = centerX - halfWidth + this.radius;
        let rightBound = centerX + halfWidth - this.radius;
        
        let dampingFactor = map(settings.smoothness, 1, 10, 0.5, 0.1);
        
        if (this.x < leftBound) {
            this.x = leftBound;
            this.vx = Math.abs(this.vx) * dampingFactor;
        }
        if (this.x > rightBound) {
            this.x = rightBound;
            this.vx = -Math.abs(this.vx) * dampingFactor;
        }
        
        // Softer vertical constraints
        if (this.y < lampBounds.top + this.radius) {
            this.y = lampBounds.top + this.radius;
            this.vy = Math.abs(this.vy) * dampingFactor * 0.5;
        }
        if (this.y > lampBounds.bottom - this.radius) {
            this.y = lampBounds.bottom - this.radius;
            this.vy = -Math.abs(this.vy) * dampingFactor * 0.5;
        }
        
        // Gentle centering force for out-of-bounds blobs
        if (!lampBounds.isInside(this.x, this.y)) {
            let centeringStrength = map(settings.smoothness, 1, 10, 0.05, 0.01);
            let pushX = (centerX - this.x) * centeringStrength;
            let pushY = (lampBounds.centerY - this.y) * centeringStrength * 0.5;
            this.vx += pushX;
            this.vy += pushY;
        }
    }
    
    display() {
        // Temperature-based color
        let tempNorm = map(this.temperature, 20, 100, 0, 1);
        let r, g, b;
        
        if (tempNorm < 0.5) {
            // Cool to warm
            r = map(tempNorm, 0, 0.5, 150, 255);
            g = map(tempNorm, 0, 0.5, 50, 150);
            b = map(tempNorm, 0, 0.5, 200, 50);
        } else {
            // Warm to hot
            r = 255;
            g = map(tempNorm, 0.5, 1, 150, 200);
            b = map(tempNorm, 0.5, 1, 50, 0);
        }
        
        // Main blob
        fill(r, g, b, 200);
        noStroke();
        ellipse(this.x, this.y, this.radius * 2);
        
        // Inner glow
        fill(r + 30, g + 30, b + 30, 100);
        ellipse(this.x, this.y, this.radius * 1.5);
        
        // Core highlight
        fill(255, 255, 255, 80);
        ellipse(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.5);
    }
}

class SparkleParticle {
    constructor(x, y, temperature) {
        this.x = x + random(-10, 10);
        this.y = y + random(-10, 10);
        this.vx = random(-0.5, 0.5);
        this.vy = random(-1, -0.1);
        this.temperature = temperature;
        this.life = 255;
        this.maxLife = 255;
        this.size = random(1, 4);
        this.hue = (colorTheme + random(-0.2, 0.2)) % 1;
        this.sparkle = random(TWO_PI);
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.01; // slight gravity
        this.vx *= 0.98; // friction
        this.life -= 3;
        this.sparkle += 0.2;
        
        // Float around slightly
        this.vx += random(-0.02, 0.02);
        this.vy += random(-0.02, 0.02);
    }
    
    display() {
        let alpha = map(this.life, 0, this.maxLife, 0, 200);
        let sparkleIntensity = sin(this.sparkle) * 0.5 + 0.5;
        
        colorMode(HSB, 1);
        let c = color(this.hue, 0.8, 0.9);
        colorMode(RGB, 255);
        
        fill(red(c), green(c), blue(c), alpha * sparkleIntensity);
        noStroke();
        ellipse(this.x, this.y, this.size);
        
        // Sparkle cross
        if (sparkleIntensity > 0.7) {
            stroke(255, 255, 255, alpha * 0.8);
            strokeWeight(1);
            let crossSize = this.size * 2;
            line(this.x - crossSize, this.y, this.x + crossSize, this.y);
            line(this.x, this.y - crossSize, this.x, this.y + crossSize);
        }
    }
    
    isDead() {
        return this.life <= 0;
    }
}

function updateBubbles() {
    // Generate new bubbles at the bottom if lamp is hot
    if (settings.isOn && settings.heat > 40 && random() < 0.1) {
        let maxBubbles = map(settings.particleDensity, 1, 10, 10, 30);
        if (bubbles.length < maxBubbles) {
            let y = lampBounds.bottom - 20;
            let widthAtY = lampBounds.getWidthAtY(y);
            let x = random(lampBounds.centerX - widthAtY/2 + 5, lampBounds.centerX + widthAtY/2 - 5);
            
            if (lampBounds.isInside(x, y)) {
                bubbles.push(new Bubble(x, y));
            }
        }
    }
    
    // Update existing bubbles
    for (let i = bubbles.length - 1; i >= 0; i--) {
        bubbles[i].update();
        if (bubbles[i].isDead()) {
            bubbles.splice(i, 1);
        }
    }
}

function renderRegularElements() {
    // Render non-glowing elements here
    // (This would include lamp structure if we want it non-glowing)
}

function renderAllParticles() {
    // Render all particle systems
    renderParticles();
    renderBubbles();
}

function renderGlowingParticles(buffer) {
    // Render particles that should glow to the bloom buffer
    buffer.push();
    particles.forEach(particle => {
        if (particle.temperature > 60) { // Only hot particles glow
            particle.display();
        }
    });
    buffer.pop();
}

function renderBubbles() {
    bubbles.forEach(bubble => {
        bubble.display();
    });
}

function addAdvancedLighting() {
    // Enhanced lighting with volumetric effects
    if (!settings.isOn) return;
    
    drawingContext.globalCompositeOperation = 'screen';
    
    let glowIntensity = map(settings.heat, 0, 100, 0, 100);
    let lightingQuality = map(settings.visualQuality, 1, 10, 3, 8);
    
    // Subtle atmospheric lighting only
    if (settings.psychedelic) {
        let hue = colorTheme;
        colorMode(HSB, 1);
        let c = color(hue, 0.5, 0.3);
        colorMode(RGB, 255);
        
        fill(red(c), green(c), blue(c), glowIntensity * 0.03);
        noStroke();
        ellipse(lampX, lampY, LAMP_BOTTLE_WIDTH_BOTTOM * 1.3, LAMP_BOTTLE_HEIGHT * 0.9);
        
        // Add caustic light patterns
        addCausticEffects();
    } else {
        // Minimal warm lighting
        fill(255, 180, 50, glowIntensity * 0.06);
        noStroke();
        ellipse(lampX, lampY, LAMP_BOTTLE_WIDTH_BOTTOM * 1.2, LAMP_BOTTLE_HEIGHT * 0.8);
    }
    
    drawingContext.globalCompositeOperation = 'source-over';
}

function addCausticEffects() {
    // Create moving caustic light patterns
    if (settings.visualQuality < 5) return;
    
    stroke(255, 255, 200, 40 + sin(time * 2) * 20);
    strokeWeight(1);
    
    for (let i = 0; i < 8; i++) {
        let angle = time + i * PI / 4;
        let x1 = lampX + cos(angle) * 40;
        let y1 = lampY + sin(angle * 1.3) * 30;
        let x2 = x1 + cos(angle + PI/3) * 20;
        let y2 = y1 + sin(angle + PI/3) * 15;
        
        line(x1, y1, x2, y2);
    }
}

class Bubble {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = random(2, 8);
        this.vy = random(-0.5, -0.2);
        this.vx = random(-0.1, 0.1);
        this.life = 255;
        this.maxLife = 255;
        this.wobble = random(TWO_PI);
        this.wobbleSpeed = random(0.05, 0.15);
    }
    
    update() {
        // Bubble physics - rise through liquid with wobble
        this.y += this.vy;
        this.x += this.vx + sin(this.wobble) * 0.2;
        
        this.wobble += this.wobbleSpeed;
        this.vy *= 0.995; // Slight deceleration
        
        // Fade out as bubble rises
        if (this.y < lampBounds.top + 50) {
            this.life -= 5;
        }
        
        // Interact with lava blobs (get carried along)
        lavaBlobs.forEach(blob => {
            let d = dist(this.x, this.y, blob.x, blob.y);
            if (d < blob.radius) {
                // Get carried by the blob
                this.vx += blob.vx * 0.1;
                this.vy += blob.vy * 0.1;
            }
        });
        
        // Stay within bottle bounds
        let widthAtY = lampBounds.getWidthAtY(this.y);
        let halfWidth = widthAtY / 2;
        
        if (this.x < lampBounds.centerX - halfWidth + this.size) {
            this.x = lampBounds.centerX - halfWidth + this.size;
            this.vx *= -0.5;
        }
        if (this.x > lampBounds.centerX + halfWidth - this.size) {
            this.x = lampBounds.centerX + halfWidth - this.size;
            this.vx *= -0.5;
        }
    }
    
    display() {
        let alpha = map(this.life, 0, this.maxLife, 0, 150);
        
        // Bubble with highlight
        fill(255, 255, 255, alpha * 0.3);
        stroke(255, 255, 255, alpha * 0.8);
        strokeWeight(1);
        ellipse(this.x, this.y, this.size);
        
        // Bubble highlight
        fill(255, 255, 255, alpha * 0.6);
        noStroke();
        ellipse(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.4);
    }
    
    isDead() {
        return this.life <= 0 || this.y < lampBounds.top;
    }
}

function drawGlassReflections(bottleY) {
    // Quality-based reflection detail
    let reflectionQuality = map(settings.visualQuality, 1, 10, 2, 6);
    
    // Main left reflection stripe
    stroke(255, 255, 255, 100 + sin(time) * 30);
    strokeWeight(3);
    let reflectX = lampX - LAMP_BOTTLE_WIDTH_BOTTOM / 2 + 12;
    beginShape();
    noFill();
    vertex(reflectX, bottleY + 40);
    bezierVertex(
        reflectX - 3, bottleY + LAMP_BOTTLE_HEIGHT * 0.3,
        reflectX - 5, bottleY + LAMP_BOTTLE_HEIGHT * 0.7,
        reflectX - 2, bottleY + LAMP_BOTTLE_HEIGHT - 50
    );
    endShape();
    
    // Secondary left reflection
    stroke(255, 255, 255, 60 + sin(time * 1.2) * 20);
    strokeWeight(1);
    reflectX = lampX - LAMP_BOTTLE_WIDTH_BOTTOM / 2 + 8;
    line(reflectX, bottleY + 60, reflectX - 2, bottleY + LAMP_BOTTLE_HEIGHT - 80);
    
    // Right reflection (subtler)
    stroke(255, 255, 255, 70 + sin(time * 1.3) * 15);
    strokeWeight(2);
    reflectX = lampX + LAMP_BOTTLE_WIDTH_BOTTOM / 2 - 18;
    beginShape();
    noFill();
    vertex(reflectX, bottleY + 50);
    bezierVertex(
        reflectX + 2, bottleY + LAMP_BOTTLE_HEIGHT * 0.4,
        reflectX + 4, bottleY + LAMP_BOTTLE_HEIGHT * 0.8,
        reflectX + 1, bottleY + LAMP_BOTTLE_HEIGHT - 60
    );
    endShape();
    
    // Rim reflections
    if (reflectionQuality > 3) {
        stroke(255, 255, 255, 120);
        strokeWeight(2);
        let rimY = bottleY + LAMP_BOTTLE_HEIGHT - 5;
        line(lampX - LAMP_BOTTLE_WIDTH_BOTTOM / 2 + 5, rimY, lampX + LAMP_BOTTLE_WIDTH_BOTTOM / 2 - 5, rimY);
        
        // Top rim reflection
        rimY = bottleY + 15;
        stroke(255, 255, 255, 80);
        strokeWeight(1);
        line(lampX - LAMP_BOTTLE_WIDTH_TOP / 2 + 10, rimY, lampX + LAMP_BOTTLE_WIDTH_TOP / 2 - 10, rimY);
    }
}

function drawCausticPatterns(bottleY) {
    if (!settings.isOn || settings.visualQuality < 4) return;
    
    let causticIntensity = map(settings.heat, 0, 100, 20, 80);
    let causticDetail = map(settings.visualQuality, 1, 10, 3, 8);
    
    // Dynamic caustic patterns inside the bottle
    stroke(255, 220, 120, causticIntensity + sin(time * 3) * 20);
    strokeWeight(1);
    
    for (let i = 0; i < causticDetail; i++) {
        let angle = time * 1.5 + i * PI / causticDetail;
        let wavePhase = time * 2 + i * 0.5;
        
        // Create flowing caustic curves
        let startX = lampX + sin(angle) * 15;
        let startY = bottleY + 60 + i * 40 + sin(wavePhase) * 25;
        let endX = startX + cos(angle + PI/3) * 20 + sin(time + i) * 10;
        let endY = startY + 15 + cos(wavePhase) * 8;
        
        // Ensure caustics stay within bottle bounds
        let widthAtY = lampBounds.getWidthAtY(startY);
        startX = constrain(startX, lampBounds.centerX - widthAtY/2 + 10, lampBounds.centerX + widthAtY/2 - 10);
        endX = constrain(endX, lampBounds.centerX - widthAtY/2 + 10, lampBounds.centerX + widthAtY/2 - 10);
        
        if (startY > bottleY + 20 && startY < bottleY + LAMP_BOTTLE_HEIGHT - 20) {
            // Main caustic line
            line(startX, startY, endX, endY);
            
            // Add connecting curves for more organic patterns
            if (i < causticDetail - 1) {
                let nextAngle = time * 1.5 + (i + 1) * PI / causticDetail;
                let nextX = lampX + sin(nextAngle) * 15;
                let nextY = bottleY + 60 + (i + 1) * 40 + sin(time * 2 + (i + 1) * 0.5) * 25;
                nextX = constrain(nextX, lampBounds.centerX - widthAtY/2 + 10, lampBounds.centerX + widthAtY/2 - 10);
                
                stroke(255, 220, 120, causticIntensity * 0.5);
                bezier(endX, endY, endX + 10, endY + 5, nextX - 10, nextY - 5, nextX, nextY);
            }
        }
    }
    
    // Glass surface caustics (reflections on the bottle)
    if (settings.visualQuality > 6) {
        stroke(255, 240, 180, 40 + sin(time * 2.5) * 15);
        strokeWeight(0.5);
        
        for (let i = 0; i < 4; i++) {
            let y = bottleY + 80 + i * 70 + sin(time + i) * 30;
            let leftX = lampX - LAMP_BOTTLE_WIDTH_BOTTOM / 2 + 5;
            let rightX = lampX + LAMP_BOTTLE_WIDTH_BOTTOM / 2 - 5;
            
            // Left surface caustics
            line(leftX, y, leftX + 8 + sin(time * 1.8 + i) * 4, y + 8);
            
            // Right surface caustics  
            line(rightX, y, rightX - 8 - sin(time * 1.8 + i) * 4, y + 8);
        }
    }
}