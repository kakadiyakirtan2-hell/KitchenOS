import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { TechniqueAnimation } from '../types';
import { playSizzleBurst, playBubbleSound } from '../utils/audio';

interface TechniqueVideoCanvasProps {
  technique: TechniqueAnimation;
  autoPlay?: boolean;
}

export const TechniqueVideoCanvas: React.FC<TechniqueVideoCanvasProps> = ({
  technique,
  autoPlay = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [speed, setSpeed] = useState<number>(1);
  const [soundOn, setSoundOn] = useState(true);

  const animationFrameRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const soundOnRef = useRef(soundOn);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Seed particles for physics
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      maxLife: number;
      color: string;
      kind: 'seed' | 'bubble' | 'steam' | 'spark';
    }> = [];

    // Pre-populate particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: 200 + (Math.random() - 0.5) * 120,
        y: 160 + (Math.random() - 0.5) * 120,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 2,
        life: Math.random() * 60,
        maxLife: 60,
        color: '#333333',
        kind: 'seed'
      });
    }

    let lastTime = performance.now();
    let soundTimer = 0;

    const render = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlayingRef.current) {
        // Total duration around 8 seconds per loop
        const stepRate = (dt / 8) * speedRef.current;
        progressRef.current += stepRate;
        if (progressRef.current >= 1) {
          progressRef.current = 0;
        }
        setProgress(progressRef.current);

        // Sound triggers
        soundTimer += dt;
        if (soundTimer > 0.6 && soundOnRef.current) {
          soundTimer = 0;
          if (technique.soundType === 'sizzle' && progressRef.current > 0.2) {
            playSizzleBurst();
          } else if (technique.soundType === 'boil') {
            playBubbleSound();
          }
        }
      }

      const p = progressRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Draw background gradient (warm kitchen counter)
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w / 1.5);
      bgGrad.addColorStop(0, '#2D1B14');
      bgGrad.addColorStop(1, '#1A0E0A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Gas flame glow at bottom
      const flameGlow = ctx.createRadialGradient(w / 2, h / 2 + 80, 20, w / 2, h / 2 + 80, 160);
      flameGlow.addColorStop(0, 'rgba(255, 120, 20, 0.45)');
      flameGlow.addColorStop(0.5, 'rgba(50, 120, 255, 0.25)');
      flameGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = flameGlow;
      ctx.fillRect(0, 0, w, h);

      // RENDER SPECIFIC TECHNIQUE
      if (technique.id === 'tadka-splutter') {
        renderTadkaSplutter(ctx, w, h, p, particles);
      } else if (technique.id === 'roti-puff') {
        renderRotiPuff(ctx, w, h, p);
      } else if (technique.id === 'chai-simmer') {
        renderChaiSimmer(ctx, w, h, p, particles);
      } else if (technique.id === 'dosa-spread') {
        renderDosaSpread(ctx, w, h, p);
      } else if (technique.id === 'dough-knead') {
        renderDoughKnead(ctx, w, h, p);
      } else {
        renderBatterWhisk(ctx, w, h, p);
      }

      // Live On-Screen Stage Indicator Banner
      drawStageBanner(ctx, w, h, technique, p);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [technique]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    progressRef.current = val;
  };

  const handleRestart = () => {
    setProgress(0);
    progressRef.current = 0;
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col rounded-3xl overflow-hidden bg-[#1E1B18] text-white shadow-kitchen-lg border border-[#3E2E28]">
      {/* Canvas Screen */}
      <div className="relative aspect-[16/10] w-full bg-black flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={640}
          height={400}
          className="w-full h-full object-contain cursor-pointer"
          onClick={() => setIsPlaying(!isPlaying)}
        />

        {/* Floating Play Overlay Badge */}
        {!isPlaying && (
          <div 
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center cursor-pointer transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-[#E06D53] text-white flex items-center justify-center shadow-2xl transform hover:scale-110 active:scale-95 transition-all">
              <Play className="w-8 h-8 ml-1 fill-white" />
            </div>
          </div>
        )}

        {/* Live status badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-white/10">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span>RASOI SIMULATION 60FPS</span>
        </div>

        {/* Sound toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSoundOn(!soundOn);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/90 hover:bg-black/80 hover:text-[#F59E0B] transition-all border border-white/10 cursor-pointer"
          title={soundOn ? 'Mute Sizzle/Simmer Sound' : 'Enable Sound FX'}
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-[#F59E0B]" /> : <VolumeX className="w-4 h-4 text-white/50" />}
        </button>
      </div>

      {/* Media Controller Bar */}
      <div className="p-4 bg-[#28211D] border-t border-[#3E2E28] flex flex-col gap-3">
        {/* Scrubbing slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/60 font-mono w-10">
            {Math.floor(progress * 8)}s
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={progress}
            onChange={handleSeek}
            className="w-full accent-[#E06D53] h-1.5 rounded-full bg-white/20 cursor-pointer"
          />
          <span className="text-xs text-white/60 font-mono w-10 text-right">
            8s
          </span>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-[#E06D53] hover:bg-[#c9573f] text-white flex items-center justify-center transition-all cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
            </button>

            <button
              onClick={handleRestart}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Replay from Beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed pills */}
            <div className="flex items-center bg-black/30 rounded-xl p-0.5 ml-1 border border-white/5">
              {[0.75, 1, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSpeed(spd)}
                  className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    speed === spd
                      ? 'bg-[#F59E0B] text-black shadow-xs'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#F59E0B]">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium hidden sm:inline">{technique.title}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// INDIVIDUAL CANVAS SIMULATION RENDERERS
// ==========================================

function drawStageBanner(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tech: TechniqueAnimation,
  p: number
) {
  let stageText = '';
  if (tech.id === 'tadka-splutter') {
    if (p < 0.25) stageText = '1. Heating pure desi ghee in small pan...';
    else if (p < 0.55) stageText = '2. Mustard seeds popping & crackling!';
    else if (p < 0.8) stageText = '3. Cumin seeds blooming golden amber';
    else stageText = '4. Hing & curry leaves crackle — Pour over dish!';
  } else if (tech.id === 'roti-puff') {
    if (p < 0.3) stageText = '1. Side 1: 15s until pale bubbles appear';
    else if (p < 0.6) stageText = '2. Flip to Side 2: Cook 70% with light speckles';
    else stageText = '3. Transfer to flame: Steam balloons the roti!';
  } else if (tech.id === 'chai-simmer') {
    if (p < 0.3) stageText = '1. Crushed ginger & cardamom boiling in water';
    else if (p < 0.65) stageText = '2. Adding fresh milk & tea leaves';
    else stageText = '3. Three rolling frothy rises for cafe-style chai!';
  } else if (tech.id === 'dosa-spread') {
    if (p < 0.25) stageText = '1. Water sizzle test: Wipe hot tawa clean';
    else if (p < 0.6) stageText = '2. Center ladle pour: Spiral continuously outward';
    else stageText = '3. Drizzle butter: Golden lace edges peel away!';
  } else if (tech.id === 'dough-knead') {
    if (p < 0.35) stageText = '1. Add water in 3 batches into wheat flour';
    else if (p < 0.75) stageText = '2. Heel-of-palm stretch & knuckle fold rhythm';
    else stageText = '3. Dimple test springs back: Soft pliable dough!';
  } else {
    if (p < 0.35) stageText = '1. Whisk besan dry to break any lumps';
    else if (p < 0.7) stageText = '2. Whisk clockwise to incorporate light air bubbles';
    else stageText = '3. Silky glossy ribbon consistency reached!';
  }

  // Draw bottom stage ribbon
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(20, h - 42, w - 40, 32);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, h - 42, w - 40, 32);

  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 13px Quicksand, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(stageText, w / 2, h - 26);
  ctx.restore();
}

/** 1. TADKA SPLUTTER SIMULATION **/
function renderTadkaSplutter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number,
  particles: any[]
) {
  const cx = w / 2;
  const cy = h / 2 - 10;
  const panRadius = 110;

  // Pan Handle
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx + panRadius * 0.7, cy + panRadius * 0.7);
  ctx.lineTo(w - 30, h - 50);
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#1F1E1D';
  ctx.lineCap = 'round';
  ctx.stroke();

  // Brass/Iron Pan Outer Rim
  ctx.beginPath();
  ctx.arc(cx, cy, panRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#2A2725';
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#614B3A';
  ctx.stroke();

  // Hot Ghee Pool (Shimmers golden yellow)
  const gheeGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, panRadius - 8);
  gheeGrad.addColorStop(0, '#FFE873');
  gheeGrad.addColorStop(0.6, '#F5A623');
  gheeGrad.addColorStop(1, '#C87213');
  ctx.beginPath();
  ctx.arc(cx, cy, panRadius - 8, 0, Math.PI * 2);
  ctx.fillStyle = gheeGrad;
  ctx.fill();

  // Heat Waves / Ghee Shimmer
  ctx.beginPath();
  ctx.arc(cx + Math.sin(p * 20) * 4, cy + Math.cos(p * 20) * 4, panRadius - 20, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Spices & Sizzling Seeds
  const seedCount = 35;
  for (let i = 0; i < seedCount; i++) {
    const angle = (i / seedCount) * Math.PI * 2 + (i % 3);
    const dist = (panRadius - 35) * (0.2 + 0.7 * Math.sin(i * 1.7));
    let sx = cx + Math.cos(angle) * dist;
    let sy = cy + Math.sin(angle) * dist;

    // In stage 2 (p > 0.25), seeds POP and dance!
    if (p > 0.25) {
      const popJitter = Math.sin(p * 80 + i) * 8;
      const popY = Math.abs(Math.sin(p * 60 + i * 2)) * 12;
      sx += popJitter;
      sy -= popY;

      // Draw tiny spark flash when popping
      if (Math.sin(p * 50 + i) > 0.8) {
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF8D6';
        ctx.fill();
      }
    }

    // Draw Mustard Seed (small dark round)
    if (i % 2 === 0) {
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1C1917';
      ctx.fill();
    } else {
      // Draw Cumin Seed (elongated brown grain)
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle + p * 2);
      ctx.beginPath();
      ctx.ellipse(0, 0, 4.5, 1.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = p > 0.6 ? '#653E17' : '#9E6B30';
      ctx.fill();
      ctx.restore();
    }
  }

  // Curry leaves & slit chili in later stage (p > 0.6)
  if (p > 0.5) {
    // Green Curry Leaf
    ctx.save();
    ctx.translate(cx - 20, cy - 10);
    ctx.rotate(0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2D6A4F';
    ctx.fill();
    ctx.strokeStyle = '#1B4332';
    ctx.stroke();
    ctx.restore();

    // Red slit chili
    ctx.save();
    ctx.translate(cx + 25, cy + 15);
    ctx.rotate(-0.4);
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#D90429';
    ctx.fill();
    ctx.restore();
  }

  // Steam & Smoke Wisps
  for (let s = 0; s < 5; s++) {
    const steamProgress = ((p * 4 + s * 0.2) % 1);
    const steamY = cy - 20 - steamProgress * 70;
    const steamX = cx + Math.sin(steamProgress * 10 + s) * 20;
    const steamAlpha = (1 - steamProgress) * 0.4;

    ctx.beginPath();
    ctx.arc(steamX, steamY, 15 + steamProgress * 25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${steamAlpha})`;
    ctx.fill();
  }
  ctx.restore();
}

/** 2. ROTI PUFFING SIMULATION **/
function renderRotiPuff(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number
) {
  const cx = w / 2;
  const cy = h / 2 - 10;
  const tawaRadius = 125;

  // Dark Iron Tawa
  ctx.beginPath();
  ctx.arc(cx, cy, tawaRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#1D1C1B';
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#363432';
  ctx.stroke();

  // Roti Circle
  const baseRotiRadius = 90;

  // Puff inflation scale (peaks in stage 3: p > 0.6)
  let puffScale = 1;
  let shadowOffset = 0;
  if (p > 0.6) {
    const puffProgress = (p - 0.6) / 0.4;
    puffScale = 1 + Math.sin(puffProgress * Math.PI) * 0.18;
    shadowOffset = Math.sin(puffProgress * Math.PI) * 16;
  }

  // Roti 3D Shading
  ctx.save();
  ctx.translate(cx, cy - shadowOffset);

  // Soft inflated 3D gradient
  const rotiGrad = ctx.createRadialGradient(-20, -20, 10, 0, 0, baseRotiRadius * puffScale);
  if (p < 0.3) {
    // Pale dough
    rotiGrad.addColorStop(0, '#F5ECD7');
    rotiGrad.addColorStop(1, '#E6D7B8');
  } else {
    // Roasted golden with warm crust
    rotiGrad.addColorStop(0, '#FDF6E2');
    rotiGrad.addColorStop(0.7, '#ECCF9B');
    rotiGrad.addColorStop(1, '#C89B55');
  }

  ctx.beginPath();
  ctx.arc(0, 0, baseRotiRadius * puffScale, 0, Math.PI * 2);
  ctx.fillStyle = rotiGrad;
  ctx.fill();

  // Roasted brown speckles
  if (p >= 0.25) {
    const speckleCount = 14;
    for (let i = 0; i < speckleCount; i++) {
      const spAng = (i / speckleCount) * Math.PI * 2 + i;
      const spDist = (baseRotiRadius * 0.7) * (0.3 + 0.6 * Math.sin(i * 2.3));
      const spX = Math.cos(spAng) * spDist;
      const spY = Math.sin(spAng) * spDist;

      ctx.beginPath();
      ctx.arc(spX, spY, 3 + (i % 3), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(107, 62, 23, 0.65)';
      ctx.fill();
    }
  }

  // Ghee glaze shine in stage 3
  if (p > 0.75) {
    ctx.beginPath();
    ctx.ellipse(-20, -20, 45 * puffScale, 20 * puffScale, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
  }

  ctx.restore();

  // Steam puffs escaping from seam
  if (p > 0.65) {
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const sProg = ((p * 5 + i * 0.25) % 1);
      ctx.beginPath();
      ctx.arc(cx + 45 + sProg * 20, cy - 30 - sProg * 50, 8 + sProg * 14, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${(1 - sProg) * 0.4})`;
      ctx.fill();
    }
    ctx.restore();
  }
}

/** 3. CHAI SIMMER SIMULATION **/
function renderChaiSimmer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number,
  particles: any[]
) {
  const cx = w / 2;
  const cy = h / 2 - 10;
  const potRadius = 110;

  // Stainless Steel Pot Rim
  ctx.beginPath();
  ctx.arc(cx, cy, potRadius + 10, 0, Math.PI * 2);
  ctx.fillStyle = '#8E9AAF';
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#4A4E69';
  ctx.stroke();

  // Chai Liquid Color (Red-Amber to Creamy Caramel Tea)
  const chaiGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, potRadius);
  if (p < 0.3) {
    // Red amber decoction
    chaiGrad.addColorStop(0, '#B33924');
    chaiGrad.addColorStop(1, '#5C1D11');
  } else {
    // Rich milky cardamom chai
    chaiGrad.addColorStop(0, '#D49B6A');
    chaiGrad.addColorStop(0.7, '#A06435');
    chaiGrad.addColorStop(1, '#6F3E18');
  }

  ctx.beginPath();
  ctx.arc(cx, cy, potRadius, 0, Math.PI * 2);
  ctx.fillStyle = chaiGrad;
  ctx.fill();

  // Rolling Boil Foam Wave (Puffs up at p > 0.65)
  if (p > 0.65) {
    const boilWave = Math.sin((p - 0.65) * Math.PI * 6) * 12;
    ctx.beginPath();
    ctx.arc(cx, cy, potRadius - 5 + boilWave, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 235, 205, 0.7)';
    ctx.lineWidth = 14;
    ctx.stroke();
  }

  // Floating Cardamom Pods & Tea Leaf Bits
  for (let i = 0; i < 18; i++) {
    const ang = (i / 18) * Math.PI * 2 + p * 3;
    const dist = (potRadius - 30) * (0.3 + 0.6 * Math.cos(i));
    const bx = cx + Math.cos(ang) * dist;
    const by = cy + Math.sin(ang) * dist;

    // Small tea leaf flakes
    ctx.beginPath();
    ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = '#261309';
    ctx.fill();

    // Occasional green cardamom pod
    if (i === 4 || i === 11) {
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4F772D';
      ctx.fill();
      ctx.restore();
    }
  }

  // Boiling bubble ripples
  for (let b = 0; b < 6; b++) {
    const bubbleProgress = ((p * 6 + b * 0.17) % 1);
    const bubbleR = bubbleProgress * 28;
    const bubbleAlpha = (1 - bubbleProgress) * 0.5;

    ctx.beginPath();
    ctx.arc(cx + (b % 3 - 1) * 45, cy + Math.sin(b * 3) * 40, bubbleR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${bubbleAlpha})`;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
}

/** 4. DOSA SPREAD SIMULATION **/
function renderDosaSpread(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number
) {
  const cx = w / 2;
  const cy = h / 2 - 10;
  const tawaRadius = 120;

  // Cast Iron Tawa
  ctx.beginPath();
  ctx.arc(cx, cy, tawaRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#181716';
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#383533';
  ctx.stroke();

  // Spiral Ladle Path
  const maxSpiralRadius = 95;
  const currentRadius = Math.min(maxSpiralRadius, p * 130);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
  const dosaGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, currentRadius);
  if (p > 0.6) {
    dosaGrad.addColorStop(0, '#F5E6CC');
    dosaGrad.addColorStop(0.7, '#E5A93C');
    dosaGrad.addColorStop(1, '#9E5B19'); // Crispy brown edge
  } else {
    dosaGrad.addColorStop(0, '#FFFDF8');
    dosaGrad.addColorStop(1, '#F3E9D2');
  }
  ctx.fillStyle = dosaGrad;
  ctx.fill();

  // Concentric Spiral Rings (Ladle Marks)
  ctx.strokeStyle = p > 0.6 ? 'rgba(168, 92, 23, 0.4)' : 'rgba(214, 192, 160, 0.5)';
  ctx.lineWidth = 2;
  const rings = 6;
  for (let r = 1; r <= rings; r++) {
    const ringRadius = (r / rings) * currentRadius;
    if (ringRadius > 5) {
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Draw Moving Ladle during spreading stage (p < 0.6)
  if (p < 0.6) {
    const ladleAngle = p * Math.PI * 10;
    const lx = cx + Math.cos(ladleAngle) * currentRadius;
    const ly = cy + Math.sin(ladleAngle) * currentRadius;

    // Ladle head
    ctx.beginPath();
    ctx.arc(lx, ly, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#C0C0C0';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#808080';
    ctx.stroke();

    // Ladle handle
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(w - 20, 30);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#555555';
    ctx.stroke();
  }

  // Golden lace edge curling up in stage 3 (p > 0.7)
  if (p > 0.7) {
    ctx.beginPath();
    ctx.arc(cx, cy, maxSpiralRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#D47A1F';
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  ctx.restore();
}

/** 5. DOUGH KNEAD SIMULATION **/
function renderDoughKnead(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number
) {
  const cx = w / 2;
  const cy = h / 2 - 10;
  const paratRadius = 125;

  // Brass Parat (Wide kneading vessel)
  ctx.beginPath();
  ctx.arc(cx, cy, paratRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#A3702C';
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#5E3E13';
  ctx.stroke();

  // Dough Mass (Shapes from shaggy crumbs into smooth sphere)
  const kneadCycle = Math.sin(p * Math.PI * 8); // Rhythm of kneading
  const squashX = 1 + kneadCycle * 0.15;
  const squashY = 1 - kneadCycle * 0.15;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(squashX, squashY);

  ctx.beginPath();
  ctx.ellipse(0, 0, 75, 65, 0, 0, Math.PI * 2);
  const doughGrad = ctx.createRadialGradient(-15, -15, 10, 0, 0, 75);
  doughGrad.addColorStop(0, '#FFF5DE');
  doughGrad.addColorStop(0.7, '#ECD0A4');
  doughGrad.addColorStop(1, '#C7A26B');
  ctx.fillStyle = doughGrad;
  ctx.fill();

  // Finger Dimple Spring Test in stage 3
  if (p > 0.75) {
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(150, 110, 60, 0.4)';
    ctx.fill();
  }

  ctx.restore();
}

/** 6. BATTER WHISK SIMULATION **/
function renderBatterWhisk(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number
) {
  const cx = w / 2;
  const cy = h / 2 - 10;
  const bowlRadius = 115;

  // Glass/Ceramic Mixing Bowl
  ctx.beginPath();
  ctx.arc(cx, cy, bowlRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#2C3E50';
  ctx.fill();
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#1A252F';
  ctx.stroke();

  // Silky Yellow Besan Batter
  const batterGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, bowlRadius - 10);
  batterGrad.addColorStop(0, '#FFE600');
  batterGrad.addColorStop(0.6, '#F1C40F');
  batterGrad.addColorStop(1, '#D4AC0D');

  ctx.beginPath();
  ctx.arc(cx, cy, bowlRadius - 10, 0, Math.PI * 2);
  ctx.fillStyle = batterGrad;
  ctx.fill();

  // Whisk Spiral Vortex
  const whiskAngle = p * Math.PI * 14;
  const wx = cx + Math.cos(whiskAngle) * 35;
  const wy = cy + Math.sin(whiskAngle) * 35;

  // Ripple lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 45 + Math.sin(p * 20) * 10, 0, Math.PI * 2);
  ctx.stroke();

  // Stainless Steel Whisk Head
  ctx.save();
  ctx.translate(wx, wy);
  ctx.rotate(whiskAngle);
  for (let wLine = 0; wLine < 6; wLine++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 8, (wLine * Math.PI) / 3, 0, Math.PI * 2);
    ctx.strokeStyle = '#BDC3C7';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}
