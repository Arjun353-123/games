import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Play, RotateCcw, Volume2, VolumeX, Shield, Zap, Trophy, Flame, Gauge, ArrowLeft, ArrowRight, CornerDownRight } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { saveHighScore } from '../utils/storage';
import confetti from 'canvas-confetti';

const CARS = [
  { id: 'testarossa', name: 'OUTRUN 86', color: 0xff0055, speed: 1.0, accel: 1.0, handling: 1.0, icon: '🏎️' },
  { id: 'interceptor', name: 'CYBER GT', color: 0x00e5ff, speed: 1.2, accel: 0.9, handling: 1.15, icon: '⚡' },
  { id: 'phantom', name: 'PHANTOM V8', color: 0xffbb00, speed: 1.1, accel: 1.25, handling: 0.95, icon: '🔥' },
];

const TRACKS = [
  { id: 'sunset', name: 'SUNSET STRIP', skyColor: 0x220538, sunColor: 0xff3366, fogColor: 0x1d0b30 },
  { id: 'cyber', name: 'CYBER MATRIX', skyColor: 0x051829, sunColor: 0x00ffee, fogColor: 0x031826 },
  { id: 'midnight', name: 'MIDNIGHT TOKYO', skyColor: 0x0d0322, sunColor: 0xee00bb, fogColor: 0x100424 },
];

export default function CyberRacer3D({ isKidsMode = false, onBackToMenu, highScore = 0, onScoreUpdate }) {
  const mountRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover'
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speedMph, setSpeedMph] = useState(0);
  const [nitro, setNitro] = useState(100);
  const [multiplier, setMultiplier] = useState(1);
  const [selectedCarIdx, setSelectedCarIdx] = useState(0);
  const [selectedTrackIdx, setSelectedTrackIdx] = useState(0);
  const [toast, setToast] = useState(null);

  const gameRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    playerCar: null,
    playerX: 0,
    targetX: 0,
    speed: 0,
    maxSpeed: 1.35,
    nitro: 100,
    isNitroActive: false,
    score: 0,
    distance: 0,
    multiplier: 1,
    driftTimer: 0,
    traffic: [],
    trackSegments: [],
    sunMesh: null,
    keys: {},
  });

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Trigger Nitro
  const triggerNitro = useCallback(() => {
    const g = gameRef.current;
    if (g.nitro > 25 && !g.isNitroActive) {
      g.isNitroActive = true;
      soundFx.playPowerup();
      showToast('NITRO BOOST ACTIVATED! 🔥');
      setTimeout(() => {
        g.isNitroActive = false;
      }, 3500);
    }
  }, [showToast]);

  // Steer Left / Right
  const steerLeft = useCallback(() => {
    const g = gameRef.current;
    g.targetX = Math.max(-5.5, g.targetX - 2.8);
    soundFx.playMove();
  }, []);

  const steerRight = useCallback(() => {
    const g = gameRef.current;
    g.targetX = Math.min(5.5, g.targetX + 2.8);
    soundFx.playMove();
  }, []);

  // Main Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    const track = TRACKS[selectedTrackIdx];
    const carData = CARS[selectedCarIdx];

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(track.skyColor);
    scene.fog = new THREE.FogExp2(track.fogColor, 0.009);
    gameRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(65, w / h, 0.1, 800);
    camera.position.set(0, 3.2, 7.5);
    gameRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    gameRef.current.renderer = renderer;

    // Lights
    const hemiLight = new THREE.HemisphereLight(track.sunColor, 0x111133, 1.2);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(0, 30, -50);
    scene.add(dirLight);

    // Giant 80s Synth Sun on the Horizon
    const sunGeo = new THREE.SphereGeometry(28, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: track.sunColor });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(0, 8, -260);
    scene.add(sun);
    gameRef.current.sunMesh = sun;

    // Endless Road Grid Segments
    const roadWidth = 14;
    const segmentLength = 40;
    const numSegments = 16;
    gameRef.current.trackSegments = [];

    for (let i = 0; i < numSegments; i++) {
      const segGroup = new THREE.Group();

      // Road surface
      const roadGeo = new THREE.PlaneGeometry(roadWidth, segmentLength);
      const roadMat = new THREE.MeshLambertMaterial({ color: 0x111119 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      segGroup.add(road);

      // Neon Side Borders
      const borderGeo = new THREE.BoxGeometry(0.4, 0.4, segmentLength);
      const borderMat = new THREE.MeshBasicMaterial({ color: track.sunColor });

      const leftB = new THREE.Mesh(borderGeo, borderMat);
      leftB.position.set(-roadWidth / 2, 0.2, 0);
      segGroup.add(leftB);

      const rightB = new THREE.Mesh(borderGeo, borderMat);
      rightB.position.set(roadWidth / 2, 0.2, 0);
      segGroup.add(rightB);

      // Center dashed line
      for (let z = -segmentLength / 2; z < segmentLength / 2; z += 8) {
        const dashGeo = new THREE.PlaneGeometry(0.3, 3.5);
        const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const dash = new THREE.Mesh(dashGeo, dashMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(0, 0.05, z);
        segGroup.add(dash);
      }

      // Wireframe palm trees along edges
      [-roadWidth / 2 - 3.5, roadWidth / 2 + 3.5].forEach((px) => {
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 7, 6);
        const trunkMat = new THREE.MeshBasicMaterial({ color: 0x552277, wireframe: true });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(px, 3.5, 0);
        segGroup.add(trunk);

        const crownGeo = new THREE.ConeGeometry(3, 2.5, 6);
        const crownMat = new THREE.MeshBasicMaterial({ color: track.sunColor, wireframe: true });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.set(px, 7.5, 0);
        segGroup.add(crown);
      });

      segGroup.position.z = -i * segmentLength;
      scene.add(segGroup);
      gameRef.current.trackSegments.push(segGroup);
    }

    // Build Player Supercar
    const carGroup = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.65, 4.4);
    const bodyMat = new THREE.MeshLambertMaterial({ color: carData.color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    carGroup.add(body);

    // Windshield & Roof
    const roofGeo = new THREE.BoxGeometry(1.6, 0.5, 2.2);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x111122 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 0.95, -0.2);
    carGroup.add(roof);

    // Neon Glow Tail lights
    const tailGeo = new THREE.BoxGeometry(0.7, 0.15, 0.1);
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    [-0.6, 0.6].forEach((tx) => {
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.position.set(tx, 0.6, 2.21);
      carGroup.add(tail);
    });

    // Wheels
    const wGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.35, 12);
    const wMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    [
      [-1.1, 0.38, -1.3],
      [1.1, 0.38, -1.3],
      [-1.1, 0.38, 1.3],
      [1.1, 0.38, 1.3],
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wGeo, wMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      carGroup.add(wheel);
    });

    carGroup.position.set(0, 0, 0);
    scene.add(carGroup);
    gameRef.current.playerCar = carGroup;

    // Keyboard Listeners
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      gameRef.current.keys[k] = true;
      if (k === 'a' || k === 'arrowleft') steerLeft();
      if (k === 'd' || k === 'arrowright') steerRight();
      if (k === ' ' || e.key === 'Shift') triggerNitro();
    };

    const onKeyUp = (e) => {
      gameRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Spawn Traffic
    const trafficColors = [0x00ff88, 0xff00aa, 0xffee00, 0x8844ff];
    gameRef.current.traffic = [];
    for (let i = 0; i < 7; i++) {
      const tGroup = new THREE.Group();
      const tMat = new THREE.MeshLambertMaterial({ color: trafficColors[i % trafficColors.length] });
      const tBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 4.0), tMat);
      tBody.position.y = 0.55;
      tGroup.add(tBody);

      const lanes = [-4.5, -1.5, 1.5, 4.5];
      const startX = lanes[Math.floor(Math.random() * lanes.length)];
      const startZ = -60 - i * 45;
      tGroup.position.set(startX, 0, startZ);
      scene.add(tGroup);

      gameRef.current.traffic.push({
        mesh: tGroup,
        laneX: startX,
        speed: 0.4 + Math.random() * 0.25,
      });
    }

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const g = gameRef.current;

      if (gameStateRef.current === 'playing') {
        // Accelerate & Nitro
        const maxCurrentSpeed = (g.isNitroActive ? 2.1 : g.maxSpeed) * carData.speed;
        g.speed = Math.min(maxCurrentSpeed, g.speed + 0.015 * carData.accel);

        // Deduct Nitro
        if (g.isNitroActive) {
          g.nitro = Math.max(0, g.nitro - delta * 22);
          setNitro(Math.round(g.nitro));
          if (g.nitro <= 0) g.isNitroActive = false;
        } else {
          g.nitro = Math.min(100, g.nitro + delta * 4); // regenerate
          setNitro(Math.round(g.nitro));
        }

        // Distance & Score
        g.distance += g.speed * 2.5;
        g.score += Math.round(g.speed * 10 * g.multiplier);
        setDistance(Math.round(g.distance));
        setScore(g.score);
        setSpeedMph(Math.round(g.speed * 125));

        // Smooth Car Steer & Tilt
        g.playerX += (g.targetX - g.playerX) * 0.12 * carData.handling;
        if (g.playerCar) {
          g.playerCar.position.x = g.playerX;
          g.playerCar.rotation.y = (g.targetX - g.playerX) * -0.15;
          g.playerCar.rotation.z = (g.targetX - g.playerX) * 0.08;
        }

        // Camera Follow with dynamic FOV on Nitro
        camera.position.x = g.playerX * 0.65;
        camera.fov = g.isNitroActive ? 75 : 65;
        camera.updateProjectionMatrix();

        // Move Road Segments (Endless Illusion)
        g.trackSegments.forEach((seg) => {
          seg.position.z += g.speed * 25 * delta;
          if (seg.position.z > 20) {
            seg.position.z -= numSegments * segmentLength;
          }
        });

        // Move Traffic & Collision Detection
        g.traffic.forEach((t) => {
          t.mesh.position.z += (g.speed - t.speed) * 25 * delta;

          // Recycle traffic car when behind player
          if (t.mesh.position.z > 20) {
            t.mesh.position.z = -180 - Math.random() * 50;
            const lanes = [-4.5, -1.5, 1.5, 4.5];
            t.mesh.position.x = lanes[Math.floor(Math.random() * lanes.length)];
            // Near-miss bonus
            g.multiplier = Math.min(5, g.multiplier + 0.2);
            setMultiplier(parseFloat(g.multiplier.toFixed(1)));
          }

          // Check Crash with Player
          if (Math.abs(t.mesh.position.z) < 3.2 && Math.abs(t.mesh.position.x - g.playerX) < 1.9) {
            soundFx.playCarCrash();
            soundFx.playGameOver();
            setGameState('gameover');
            saveHighScore('cyberRacer', g.score);
            if (onScoreUpdate) onScoreUpdate(g.score);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedCarIdx, selectedTrackIdx, onScoreUpdate, steerLeft, steerRight, triggerNitro]);

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-black">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start pointer-events-none">
        {/* Speed & Multiplier */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-cyan-400/40 shadow-xl flex items-baseline gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <span className="text-3xl font-black text-white tabular-nums">{speedMph}</span>
            <span className="text-xs font-bold text-cyan-300">MPH</span>
          </div>

          <div className="bg-slate-900/85 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-amber-400/40 shadow-lg text-amber-400 font-black text-xs flex items-center gap-1.5">
            <Flame className="w-4 h-4" />
            <span>MULTIPLIER: {multiplier}x</span>
          </div>
        </div>

        {/* Score & Nitro */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-pink-400/40 shadow-xl text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">SCORE</p>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-300 tabular-nums">
              {score.toLocaleString()}
            </p>
          </div>

          {/* Nitro Tank Gauge */}
          <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-blue-400/30 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div className="w-24 h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                style={{ width: `${nitro}%` }}
              />
            </div>
            <span className="text-white text-xs font-black">{nitro}%</span>
          </div>

          <button
            onClick={onBackToMenu}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-white/10"
          >
            EXIT MENU
          </button>
        </div>
      </div>

      {/* Mobile Touch Controls */}
      <div className="absolute bottom-6 left-6 right-6 z-30 flex justify-between items-end pointer-events-auto md:hidden">
        <div className="flex gap-2">
          <button
            onClick={steerLeft}
            className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-white/20 active:scale-95 text-white flex items-center justify-center shadow-2xl"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <button
            onClick={steerRight}
            className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-white/20 active:scale-95 text-white flex items-center justify-center shadow-2xl"
          >
            <ArrowRight className="w-8 h-8" />
          </button>
        </div>

        <button
          onClick={triggerNitro}
          className="px-6 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 active:scale-95 text-white font-black text-sm flex items-center gap-2 shadow-2xl border border-cyan-300/40"
        >
          <Zap className="w-5 h-5 fill-current" />
          NITRO
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 border border-pink-400 px-5 py-2 rounded-2xl text-pink-300 font-black text-xs shadow-2xl">
          {toast}
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border-2 border-pink-500/60 shadow-2xl">
            <h2 className="text-4xl font-black text-pink-500 tracking-wider mb-2">CRASHED!</h2>
            <p className="text-sm text-slate-400 mb-6">You wiped out on the synthwave highway!</p>
            <div className="bg-slate-800/80 p-4 rounded-2xl mb-6 flex justify-around">
              <div>
                <p className="text-xs text-slate-400">DISTANCE</p>
                <p className="text-xl font-black text-white">{distance}m</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">TOTAL SCORE</p>
                <p className="text-xl font-black text-amber-400">{score.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  gameRef.current.score = 0;
                  gameRef.current.distance = 0;
                  gameRef.current.speed = 0;
                  gameRef.current.playerX = 0;
                  gameRef.current.targetX = 0;
                  setScore(0);
                  setDistance(0);
                  setGameState('playing');
                }}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-black text-sm rounded-2xl shadow-lg"
              >
                RACE AGAIN
              </button>
              <button
                onClick={onBackToMenu}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-2xl"
              >
                MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Menu Screen */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-6 text-center">
          <div className="max-w-lg w-full p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-cyan-400/50 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 font-black text-xs border border-cyan-400/40 mb-3 tracking-widest">
              🏎️ OUTRUN SYNTH RACER 3D
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300 mb-3 drop-shadow-lg">
              NEON RACER 3D
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
              Dodge highway traffic, trigger nitro boost, build drift multipliers, and race into the glowing retro synth sun!
            </p>

            {/* Select Car */}
            <div className="mb-4 text-left">
              <p className="text-xs font-bold text-slate-400 mb-2">CHOOSE YOUR SUPERCAR:</p>
              <div className="grid grid-cols-3 gap-2">
                {CARS.map((car, idx) => (
                  <button
                    key={car.id}
                    onClick={() => {
                      setSelectedCarIdx(idx);
                      soundFx.playClick();
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      selectedCarIdx === idx
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                        : 'bg-slate-800/60 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{car.icon}</span>
                    <p className="text-xs font-black">{car.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Track */}
            <div className="mb-6 text-left">
              <p className="text-xs font-bold text-slate-400 mb-2">CHOOSE TRACK THEME:</p>
              <div className="grid grid-cols-3 gap-2">
                {TRACKS.map((trk, idx) => (
                  <button
                    key={trk.id}
                    onClick={() => {
                      setSelectedTrackIdx(idx);
                      soundFx.playClick();
                    }}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      selectedTrackIdx === idx
                        ? 'bg-pink-500/20 border-pink-400 text-white'
                        : 'bg-slate-800/60 border-white/10 text-slate-400'
                    }`}
                  >
                    {trk.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setGameState('playing');
                }}
                className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-pink-500 hover:brightness-110 text-white font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                START RACE
              </button>
              <button
                onClick={onBackToMenu}
                className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-2xl"
              >
                BACK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
