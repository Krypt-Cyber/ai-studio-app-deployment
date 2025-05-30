
import React, { useRef, useEffect, useCallback, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number; // Depth
  originalZ: number;
  size: number;
  originalSize: number;
  speedZ: number;
  baseSpeedZ: number;
  color: string;
  originalColor: string;
  isClickable?: boolean;
  isCollected?: boolean;
  pointValue?: number;
  opacity: number;
  maxOpacity: number;
  isSubParticle?: boolean;
  life?: number;
  lastGlitchTime?: number; // For ambient glitch
  glitchDuration?: number; // For ambient glitch
  glitchActive?: boolean;  // For ambient glitch
}

interface FloatingScore {
  id: string;
  x: number;
  y: number;
  text: string;
  opacity: number;
  life: number;
  initialY: number;
}

const PARTICLE_CONFIG = {
  // COUNT is now dynamic
  SIZE_MIN: 0.8,
  SIZE_MAX: 2.2,
  BASE_SPEED_Z_MIN: 0.003,
  BASE_SPEED_Z_MAX: 0.008,
  Z_MAX_DEPTH: 5, 
  FOV: 300, 
  CONNECTION_DISTANCE_Z_THRESHOLD: 0.5, 
  CONNECTION_OPACITY: 0.06,
  MOUSE_INTERACTION_RADIUS: 120,
  MOUSE_REPEL_STRENGTH: 0.03, 
  MOUSE_FLARE_OPACITY_BOOST: 0.3,
  COLORS: ['#00FF00', '#00DD00', '#00BB00', '#00AA00'], 
  CLICKABLE_CHANCE: 0.05,
  CLICKABLE_COLOR: '#FF00FF',
  CLICKABLE_PULSE_AMOUNT: 0.7,
  CLICKABLE_POINT_VALUE: 10,
  TRANSITION_SPEED_MULTIPLIER: 2.8,
  TRANSITION_COLOR_FLASH_DURATION: 700,
  TRANSITION_GLITCH_INTENSITY: 0.1,
  SUB_PARTICLE_COUNT: 10,
  SUB_PARTICLE_LIFE: 45,
  SUB_PARTICLE_SPEED_MULTIPLIER: 0.02, 
  SUB_PARTICLE_SIZE: 1.2,
  FLOATING_SCORE_LIFE: 75,
  FLOATING_SCORE_SPEED: 0.8,
  PARTICLE_GLOW_BLUR_MULTIPLIER: 2.5,
  COLLECTED_FADE_SPEED: 0.07,
  VORTEX_PULSE_FREQUENCY: 0.001, 
  VORTEX_PULSE_AMPLITUDE: 0.0008, 
  AMBIENT_GLITCH_CHANCE_PER_FRAME: 0.001, 
  AMBIENT_GLITCH_DURATION_MAX: 150, 
  AMBIENT_GLITCH_POSITION_OFFSET: 2, 
  AMBIENT_GLITCH_COLOR: '#FFA500', 
  MIN_PARTICLES: 75,
  MAX_PARTICLES: 350,
  PARTICLE_DENSITY_FACTOR: 12000, // Lower for more particles per area
};

const LOCAL_STORAGE_SCORE_KEY = 'CKRYPTBIT_PARTICLE_SCORE_V1';

const calculateParticleCount = (canvasWidth: number, canvasHeight: number): number => {
  const area = canvasWidth * canvasHeight;
  const count = Math.round(area / PARTICLE_CONFIG.PARTICLE_DENSITY_FACTOR);
  return Math.max(PARTICLE_CONFIG.MIN_PARTICLES, Math.min(count, PARTICLE_CONFIG.MAX_PARTICLES));
};


const AnimatedBackground: React.FC<{ isTransitioningView?: boolean }> = ({ isTransitioningView = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesArray = useRef<Particle[]>([]);
  const floatingScoresArray = useRef<FloatingScore[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const mousePosition = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [score, setScore] = useState<number>(0);
  const lastTransitionState = useRef<boolean>(isTransitioningView);
  const transitionFlashUntil = useRef<number>(0);
  const center = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const storedScore = localStorage.getItem(LOCAL_STORAGE_SCORE_KEY);
    if (storedScore) {
      setScore(parseInt(storedScore, 10) || 0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SCORE_KEY, score.toString());
  }, [score]);

  const initParticles = useCallback((canvas: HTMLCanvasElement) => {
    particlesArray.current = [];
    center.current = { x: canvas.width / 2, y: canvas.height / 2 };
    const numParticles = calculateParticleCount(canvas.width, canvas.height);
    // console.log(`Initializing with ${numParticles} particles for canvas ${canvas.width}x${canvas.height}`);

    for (let i = 0; i < numParticles; i++) {
      const originalZ = Math.random() * PARTICLE_CONFIG.Z_MAX_DEPTH;
      const size = Math.random() * (PARTICLE_CONFIG.SIZE_MAX - PARTICLE_CONFIG.SIZE_MIN) + PARTICLE_CONFIG.SIZE_MIN;
      const originalColor = PARTICLE_CONFIG.COLORS[Math.floor(Math.random() * PARTICLE_CONFIG.COLORS.length)];
      const isClickable = Math.random() < PARTICLE_CONFIG.CLICKABLE_CHANCE;
      const particleMaxOpacity = isClickable ? 0.95 : (Math.random() * 0.3 + 0.65); // Increased base opacity

      particlesArray.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: originalZ,
        originalZ: originalZ,
        size,
        originalSize: size,
        baseSpeedZ: Math.random() * (PARTICLE_CONFIG.BASE_SPEED_Z_MAX - PARTICLE_CONFIG.BASE_SPEED_Z_MIN) + PARTICLE_CONFIG.BASE_SPEED_Z_MIN,
        speedZ: Math.random() * (PARTICLE_CONFIG.BASE_SPEED_Z_MAX - PARTICLE_CONFIG.BASE_SPEED_Z_MIN) + PARTICLE_CONFIG.BASE_SPEED_Z_MIN,
        originalColor,
        color: isClickable ? PARTICLE_CONFIG.CLICKABLE_COLOR : originalColor,
        isClickable,
        isCollected: false,
        pointValue: isClickable ? PARTICLE_CONFIG.CLICKABLE_POINT_VALUE : 0,
        opacity: particleMaxOpacity, // Start with max opacity
        maxOpacity: particleMaxOpacity,
        lastGlitchTime: 0,
        glitchDuration: 0,
        glitchActive: false,
      });
    }
  }, []);

  const project3Dto2D = useCallback((particle: Particle) => {
    const scale = PARTICLE_CONFIG.FOV / (PARTICLE_CONFIG.FOV + particle.z);
    const x2d = (particle.x - center.current.x) * scale + center.current.x;
    const y2d = (particle.y - center.current.y) * scale + center.current.y;
    const size2d = particle.size * scale;
    return { x2d, y2d, size2d, scale };
  }, []);


  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle, projection: { x2d: number, y2d: number, size2d: number, scale: number}) => {
    if (particle.isCollected && !particle.isSubParticle && particle.opacity <= 0) return;

    let displayX = projection.x2d;
    let displayY = projection.y2d;
    let displayColor = particle.color;

    if (particle.glitchActive) {
        displayX += (Math.random() - 0.5) * PARTICLE_CONFIG.AMBIENT_GLITCH_POSITION_OFFSET * projection.scale;
        displayY += (Math.random() - 0.5) * PARTICLE_CONFIG.AMBIENT_GLITCH_POSITION_OFFSET * projection.scale;
        displayColor = PARTICLE_CONFIG.AMBIENT_GLITCH_COLOR;
    }

    ctx.globalAlpha = particle.opacity * (particle.isSubParticle ? 1 : Math.min(1, Math.max(0.3, projection.scale))); // Ensured min visibility for distant particles
    ctx.shadowColor = displayColor;
    ctx.shadowBlur = projection.size2d * PARTICLE_CONFIG.PARTICLE_GLOW_BLUR_MULTIPLIER * particle.opacity;
    ctx.fillStyle = displayColor;
    ctx.beginPath();
    ctx.fillRect(displayX - projection.size2d / 2, displayY - projection.size2d / 2, projection.size2d, projection.size2d);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }, []);


  const connectParticles = useCallback((ctx: CanvasRenderingContext2D, now: number) => {
    if (PARTICLE_CONFIG.CONNECTION_DISTANCE_Z_THRESHOLD <= 0) return;

    const pulseFactor = (Math.sin(now / 250) + 1) / 2; 

    for (let i = 0; i < particlesArray.current.length; i++) {
      for (let j = i + 1; j < particlesArray.current.length; j++) {
        const p1 = particlesArray.current[i];
        const p2 = particlesArray.current[j];

        if (p1.isCollected || p2.isCollected || p1.isSubParticle || p2.isSubParticle || 
            p1.opacity < 0.1 || p2.opacity < 0.1 ||
            Math.abs(p1.z - p2.z) > PARTICLE_CONFIG.CONNECTION_DISTANCE_Z_THRESHOLD) continue;

        const proj1 = project3Dto2D(p1);
        const proj2 = project3Dto2D(p2);
        
        const dx = proj1.x2d - proj2.x2d;
        const dy = proj1.y2d - proj2.y2d;
        const distance2d = Math.sqrt(dx * dx + dy * dy);
        
        if (distance2d < PARTICLE_CONFIG.MOUSE_INTERACTION_RADIUS * 0.8) { 
          ctx.strokeStyle = PARTICLE_CONFIG.COLORS[1];
          ctx.lineWidth = 0.2 * Math.min(proj1.scale, proj2.scale); 
          const baseConnectionOpacity = (1 - distance2d / (PARTICLE_CONFIG.MOUSE_INTERACTION_RADIUS * 0.8)) * PARTICLE_CONFIG.CONNECTION_OPACITY * Math.min(p1.opacity, p2.opacity);
          ctx.globalAlpha = baseConnectionOpacity * (0.6 + pulseFactor * 0.4);
          
          ctx.beginPath();
          ctx.moveTo(proj1.x2d, proj1.y2d);
          ctx.lineTo(proj2.x2d, proj2.y2d);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }, [project3Dto2D]);

  const updateParticle = useCallback((particle: Particle, canvas: HTMLCanvasElement, now: number) => {
    if (particle.isCollected && !particle.isSubParticle) {
      particle.opacity -= PARTICLE_CONFIG.COLLECTED_FADE_SPEED;
      if (particle.opacity < 0) particle.opacity = 0;
      return;
    }

    if (!particle.isClickable && !particle.isSubParticle && !particle.glitchActive && Math.random() < PARTICLE_CONFIG.AMBIENT_GLITCH_CHANCE_PER_FRAME) {
        particle.glitchActive = true;
        particle.lastGlitchTime = now;
        particle.glitchDuration = Math.random() * PARTICLE_CONFIG.AMBIENT_GLITCH_DURATION_MAX;
    }
    if (particle.glitchActive && now > (particle.lastGlitchTime || 0) + (particle.glitchDuration || 0)) {
        particle.glitchActive = false;
    }

    if (particle.isClickable && !particle.isCollected && !particle.isSubParticle) {
        const pulseScale = 1 + Math.sin(now / 100) * PARTICLE_CONFIG.CLICKABLE_PULSE_AMOUNT; 
        particle.size = particle.originalSize * pulseScale;
    }

    let speedMultiplierZ = 1;
    const vortexPulse = Math.sin(now * PARTICLE_CONFIG.VORTEX_PULSE_FREQUENCY) * PARTICLE_CONFIG.VORTEX_PULSE_AMPLITUDE;
    particle.speedZ = particle.baseSpeedZ + vortexPulse;

    if (isTransitioningView && now < transitionFlashUntil.current) {
      particle.color = PARTICLE_CONFIG.COLORS[Math.floor(Math.random() * PARTICLE_CONFIG.COLORS.length)];
      speedMultiplierZ = PARTICLE_CONFIG.TRANSITION_SPEED_MULTIPLIER;
    } else if (isTransitioningView) {
       speedMultiplierZ = PARTICLE_CONFIG.TRANSITION_SPEED_MULTIPLIER * 0.8; 
       particle.color = (particle.isClickable && !particle.isCollected && !particle.isSubParticle) ? PARTICLE_CONFIG.CLICKABLE_COLOR : particle.originalColor;
    } else {
       particle.color = (particle.isClickable && !particle.isCollected && !particle.isSubParticle) ? PARTICLE_CONFIG.CLICKABLE_COLOR : particle.originalColor;
    }
    
    let currentOpacityBoost = 0;

    if (mousePosition.current.x != null && mousePosition.current.y != null && !particle.isSubParticle) {
        const proj = project3Dto2D(particle);
        const dxMouse = proj.x2d - mousePosition.current.x;
        const dyMouse = proj.y2d - mousePosition.current.y;
        const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distanceMouse < PARTICLE_CONFIG.MOUSE_INTERACTION_RADIUS) {
            const forceFactor = (PARTICLE_CONFIG.MOUSE_INTERACTION_RADIUS - distanceMouse) / PARTICLE_CONFIG.MOUSE_INTERACTION_RADIUS;
            const angleToMouse = Math.atan2(dyMouse, dxMouse);
            
            const repelStrength = forceFactor * PARTICLE_CONFIG.MOUSE_REPEL_STRENGTH * 50; 
            particle.x += Math.cos(angleToMouse) * repelStrength / proj.scale; 
            particle.y += Math.sin(angleToMouse) * repelStrength / proj.scale;

            particle.z -= forceFactor * 0.05; 
            if (particle.z < 0) particle.z = 0;

            currentOpacityBoost = forceFactor * PARTICLE_CONFIG.MOUSE_FLARE_OPACITY_BOOST;
            if(!particle.isClickable) particle.color = PARTICLE_CONFIG.COLORS[1]; 
        }
    }
     particle.opacity = Math.min(particle.maxOpacity + currentOpacityBoost, 1);

    if (particle.isSubParticle) {
        particle.z += particle.speedZ; 
        particle.x += (Math.random() - 0.5) * particle.size * 0.1; 
        particle.y += (Math.random() - 0.5) * particle.size * 0.1;
        particle.life!--;
        particle.opacity = (particle.life! / PARTICLE_CONFIG.SUB_PARTICLE_LIFE) * particle.maxOpacity * 0.9;
        particle.size *= 0.97;
    } else {
        particle.z -= particle.speedZ * speedMultiplierZ;

        const dxCenter = particle.x - center.current.x;
        const dyCenter = particle.y - center.current.y;
        const angle = Math.atan2(dyCenter, dxCenter);
        const rotationSpeed = 0.001 * (1 / (particle.z + 0.5)); 
        
        const newAngle = angle + rotationSpeed;
        const distFromCenter = Math.sqrt(dxCenter*dxCenter + dyCenter*dyCenter);
        
        particle.x = center.current.x + Math.cos(newAngle) * distFromCenter * (1 - particle.speedZ * 0.1); 
        particle.y = center.current.y + Math.sin(newAngle) * distFromCenter * (1 - particle.speedZ * 0.1);

        if (particle.z < 0) { 
            particle.z = PARTICLE_CONFIG.Z_MAX_DEPTH * (Math.random() * 0.2 + 0.8); 
            particle.x = center.current.x + (Math.random() - 0.5) * canvas.width * 0.8; 
            particle.y = center.current.y + (Math.random() - 0.5) * canvas.height * 0.8;
            particle.baseSpeedZ = Math.random() * (PARTICLE_CONFIG.BASE_SPEED_Z_MAX - PARTICLE_CONFIG.BASE_SPEED_Z_MIN) + PARTICLE_CONFIG.BASE_SPEED_Z_MIN;
            
            const newIsClickable = Math.random() < PARTICLE_CONFIG.CLICKABLE_CHANCE;
            particle.isClickable = newIsClickable;
            particle.isCollected = false;
            particle.originalColor = PARTICLE_CONFIG.COLORS[Math.floor(Math.random() * PARTICLE_CONFIG.COLORS.length)];
            particle.color = newIsClickable ? PARTICLE_CONFIG.CLICKABLE_COLOR : particle.originalColor;
            particle.pointValue = newIsClickable ? PARTICLE_CONFIG.CLICKABLE_POINT_VALUE : 0;
            particle.size = particle.originalSize; 
            particle.maxOpacity = newIsClickable ? 0.95 : (Math.random() * 0.3 + 0.65); // Use updated opacity range
            particle.opacity = particle.maxOpacity;
        }
    }
  }, [isTransitioningView, project3Dto2D]);

  const drawFloatingScores = useCallback((ctx: CanvasRenderingContext2D) => {
    floatingScoresArray.current.forEach(fs => {
      const fontSize = 11 + ( (PARTICLE_CONFIG.FLOATING_SCORE_LIFE - fs.life) / PARTICLE_CONFIG.FLOATING_SCORE_LIFE * 7);
      ctx.font = `bold ${fontSize}px "Fira Code", monospace`;
      ctx.fillStyle = `rgba(0, 255, 0, ${fs.opacity})`;
      ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
      ctx.shadowBlur = 6;
      const jitterX = (Math.random() - 0.5) * 1.5;
      const jitterY = (Math.random() - 0.5) * 1.5;
      ctx.fillText(fs.text, fs.x + jitterX, fs.y + jitterY);
      ctx.shadowBlur = 0;
    });
  }, []);

  const updateFloatingScores = useCallback(() => {
    floatingScoresArray.current = floatingScoresArray.current.filter(fs => {
      fs.y -= PARTICLE_CONFIG.FLOATING_SCORE_SPEED;
      fs.opacity = Math.max(0, (fs.life / PARTICLE_CONFIG.FLOATING_SCORE_LIFE));
      fs.life--;
      return fs.life > 0;
    });
  }, []);

  const createBurst = (x: number, y: number, z: number, color: string) => {
    for (let i = 0; i < PARTICLE_CONFIG.SUB_PARTICLE_COUNT; i++) {
      const angleXY = Math.random() * Math.PI * 2;
      const angleZ = (Math.random() - 0.5) * Math.PI * 0.5; 
      const speedFactor = Math.random() * 0.5 + 0.5;

      particlesArray.current.push({
        x: x, 
        y: y, 
        z: z, 
        originalZ: z,
        size: PARTICLE_CONFIG.SUB_PARTICLE_SIZE * (Math.random() * 0.5 + 0.8),
        originalSize: PARTICLE_CONFIG.SUB_PARTICLE_SIZE * (Math.random() * 0.5 + 0.8),
        speedZ: (Math.cos(angleZ) * PARTICLE_CONFIG.SUB_PARTICLE_SPEED_MULTIPLIER * speedFactor) * (Math.random() > 0.5 ? 1 : -0.5), 
        baseSpeedZ: 0, 
        originalColor: color,
        color: color,
        isSubParticle: true,
        life: PARTICLE_CONFIG.SUB_PARTICLE_LIFE + Math.random() * 20,
        opacity: 1,
        maxOpacity: 1,
      });
    }
  };

  const handleCanvasClick = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    let particleClickedThisTurn = false;
    for (let i = particlesArray.current.length - 1; i >= 0; i--) {
      const particle = particlesArray.current[i];
      if (particle.isClickable && !particle.isCollected && !particle.isSubParticle && particle.opacity > 0.5) {
        const proj = project3Dto2D(particle);
        const distance = Math.sqrt(
          (clickX - proj.x2d) ** 2 +
          (clickY - proj.y2d) ** 2
        );
        if (distance < Math.max(proj.size2d * 1.5, 15) && !particleClickedThisTurn) {
          particle.isCollected = true;
          setScore(prevScore => prevScore + (particle.pointValue || 0));

          floatingScoresArray.current.push({
            id: `fs-${Date.now()}-${Math.random()}`,
            x: proj.x2d,
            y: proj.y2d,
            initialY: proj.y2d,
            text: `+${particle.pointValue}`,
            opacity: 1,
            life: PARTICLE_CONFIG.FLOATING_SCORE_LIFE
          });
          createBurst(particle.x, particle.y, particle.z, particle.color);
          particleClickedThisTurn = true; 
        }
      }
    }
  }, [setScore, project3Dto2D]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      center.current = { x: canvas.width / 2, y: canvas.height / 2 };
      initParticles(canvas); // Re-initialize particles when canvas size changes for responsiveness
    };
    setCanvasDimensions();

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = { x: event.clientX, y: event.clientY };
    };
    const handleMouseLeave = () => {
      mousePosition.current = { x: null, y: null };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleCanvasClick);
    window.addEventListener('resize', setCanvasDimensions);

    const animate = (now: number) => {
      if (isTransitioningView && !lastTransitionState.current) {
          transitionFlashUntil.current = now + PARTICLE_CONFIG.TRANSITION_COLOR_FLASH_DURATION;
      }
      lastTransitionState.current = isTransitioningView;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isTransitioningView && now < transitionFlashUntil.current) {
        const intensity = PARTICLE_CONFIG.TRANSITION_GLITCH_INTENSITY;
        const xOffset = (Math.random() - 0.5) * canvas.width * intensity;
        const yOffset = (Math.random() - 0.5) * canvas.height * intensity;
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(canvas, xOffset, yOffset, canvas.width * (1-intensity*2), canvas.height* (1-intensity*2));
        ctx.globalCompositeOperation = 'source-over';
      }

      const nextParticles: Particle[] = [];
      for (const particle of particlesArray.current) {
        updateParticle(particle, canvas, now);
        if (particle.isSubParticle && particle.life! <= 0) continue;
        if (particle.isCollected && !particle.isSubParticle && particle.opacity <=0) continue;
        nextParticles.push(particle);
      }
      particlesArray.current = nextParticles;

      connectParticles(ctx, now);
      particlesArray.current.forEach(particle => {
          const proj = project3Dto2D(particle);
          if (proj.x2d > -proj.size2d && proj.x2d < canvas.width + proj.size2d &&
              proj.y2d > -proj.size2d && proj.y2d < canvas.height + proj.size2d &&
              particle.z < PARTICLE_CONFIG.Z_MAX_DEPTH * 1.1 && particle.z > -1) { 
            drawParticle(ctx, particle, proj);
          }
      });

      updateFloatingScores();
      drawFloatingScores(ctx);

      ctx.font = 'bold 18px "Fira Code", monospace';
      ctx.fillStyle = PARTICLE_CONFIG.COLORS[0];
      ctx.shadowColor = 'rgba(0, 255, 0, 0.7)';
      ctx.shadowBlur = 7;
      ctx.textAlign = 'right';
      ctx.fillText(`SCORE: ${score}`, canvas.width - 25, canvas.height - 25);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('resize', setCanvasDimensions);
      particlesArray.current = [];
      floatingScoresArray.current = [];
    };
  }, [initParticles, drawParticle, connectParticles, updateParticle, handleCanvasClick, score, isTransitioningView, updateFloatingScores, drawFloatingScores, project3Dto2D]);

  return (
    <canvas
      ref={canvasRef}
      id="interactive-animated-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -10,
        display: 'block',
        backgroundColor: '#0A0A0A', // Explicitly set canvas background color
      }}
      aria-hidden="true"
    />
  );
};

export default AnimatedBackground;