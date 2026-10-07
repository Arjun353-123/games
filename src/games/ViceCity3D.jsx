import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Play, RotateCcw, Volume2, VolumeX, Shield, Zap, Trophy,
  Flame, Radio, Crosshair, Car, Navigation, DollarSign,
  AlertTriangle, CheckCircle, Sparkles, Key, ShoppingBag, X,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { saveHighScore } from '../utils/storage';
import confetti from 'canvas-confetti';

const WEAPONS = [
  { id: 'fists', name: 'Fists', icon: '👊', damage: 25, range: 3, fireRate: 400, maxAmmo: Infinity, cost: 0 },
  { id: 'pistol', name: 'Colt .45', icon: '🔫', damage: 35, range: 45, fireRate: 350, maxAmmo: 150, cost: 250 },
  { id: 'uzi', name: 'Micro SMG', icon: '⚡', damage: 20, range: 40, fireRate: 110, maxAmmo: 300, cost: 600 },
  { id: 'shotgun', name: 'SPAS-12', icon: '💥', damage: 85, range: 25, fireRate: 750, maxAmmo: 80, cost: 1200 },
  { id: 'rpg', name: 'Rocket Launcher', icon: '🚀', damage: 300, range: 80, fireRate: 1400, maxAmmo: 20, cost: 3000 },
];

const MISSIONS = [
  {
    id: 1,
    title: 'The Ocean Drive Getaway',
    desc: 'Pick up the secret briefcase, evade the 2-star police chase, and escape to the Vercetti safehouse!',
    reward: 1500,
    timeLimit: 85,
    type: 'escape',
  },
  {
    id: 2,
    title: 'Neon Speed Demon',
    desc: 'Race through 8 neon checkpoints across Ocean Drive in under 55 seconds!',
    reward: 2500,
    timeLimit: 55,
    type: 'race',
  },
  {
    id: 3,
    title: 'Malibu Club Turf War',
    desc: 'Armed syndicate thugs are attacking the Malibu Club! Eliminate all 8 rivals!',
    reward: 3500,
    timeLimit: 90,
    type: 'eliminate',
  },
  {
    id: 4,
    title: 'Crazy Miami Taxi',
    desc: 'Pick up 3 VIP beach tourists and drop them off safely before time expires!',
    reward: 2000,
    timeLimit: 75,
    type: 'taxi',
  },
  {
    id: 5,
    title: 'Rampage: Vehicle Carnage',
    desc: 'Blow up 5 criminal vehicles using your heavy weapons or Tank cannon within 60 seconds!',
    reward: 5000,
    timeLimit: 60,
    type: 'carnage',
  },
];

const CHEAT_CODES = [
  { code: 'ASPIRINE', desc: 'Full 100% Health' },
  { code: 'PRECIOUSPROTECTION', desc: 'Full 100% Body Armor' },
  { code: 'THUGSTOOLS', desc: 'All Weapons & Max Ammo' },
  { code: 'PANZER', desc: 'Spawn Military Rhino Tank' },
  { code: 'GETTHEREFAST', desc: 'Spawn Infernus Supercar' },
  { code: 'LEAVEMEALONE', desc: 'Clear All Wanted Stars' },
  { code: 'BIGBANG', desc: 'Explode All Nearby Cars' },
];

export default function ViceCity3D({ isKidsMode = false, onBackToMenu, highScore = 0, onScoreUpdate }) {
  const mountRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover'
  const [health, setHealth] = useState(100);
  const [armor, setArmor] = useState(100);
  const [cash, setCash] = useState(500);
  const [wantedLevel, setWantedLevel] = useState(0); // 0 to 5 stars
  const [selectedWeaponIdx, setSelectedWeaponIdx] = useState(1); // default pistol
  const [ammo, setAmmo] = useState({ fists: Infinity, pistol: 80, uzi: 120, shotgun: 30, rpg: 5 });
  const [inVehicle, setInVehicle] = useState(null); // car object or null
  const [vehicleHealth, setVehicleHealth] = useState(100);
  const [vehicleSpeed, setVehicleSpeed] = useState(0); // MPH
  const [currentStation, setCurrentStation] = useState('flashFm');
  const [activeMission, setActiveMission] = useState(null);
  const [missionTimer, setMissionTimer] = useState(0);
  const [missionProgress, setMissionProgress] = useState(0);
  const [missionPassedBanner, setMissionPassedBanner] = useState(null);
  const [showAmmuNation, setShowAmmuNation] = useState(false);
  const [showCheats, setShowCheats] = useState(false);
  const [cheatInput, setCheatInput] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [minimapBlips, setMinimapBlips] = useState({ player: { x: 0, z: 0, angle: 0 }, cops: [], missions: [], specials: [] });
  const [filterMode, setFilterMode] = useState('normal'); // 'normal', 'retro80s'

  // Refs for requestAnimationFrame loop
  const gameRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    player: null,
    playerMesh: null,
    leftLeg: null,
    rightLeg: null,
    leftArm: null,
    rightArm: null,
    torso: null,
    head: null,
    playerPos: new THREE.Vector3(0, 0.9, 0),
    playerVelocity: new THREE.Vector3(),
    playerRotY: 0,
    isSprinting: false,
    stamina: 100,
    isJumping: false,
    jumpVelocity: 0,
    health: 100,
    armor: 100,
    cash: 500,
    wantedLevel: 0,
    wantedTimer: 0,
    lastFireTime: 0,
    selectedWeaponIdx: 1,
    ammo: { fists: Infinity, pistol: 80, uzi: 120, shotgun: 30, rpg: 5 },
    currentVehicle: null,
    vehicles: [],
    pedestrians: [],
    policeOfficers: [],
    bullets: [],
    rockets: [],
    explosions: [],
    pickups: [],
    buildings: [],
    checkpoints: [],
    keysPressed: {},
    cameraPitch: 0.35,
    cameraYaw: 0,
    activeMission: null,
    missionTimer: 0,
    missionProgress: 0,
    missionTargetCount: 0,
    station: 'flashFm',
    waterMesh: null,
    dayTime: 0,
  });

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Damage vehicle
  const damageVehicle = useCallback((veh, amount) => {
    const g = gameRef.current;
    veh.health = Math.max(0, veh.health - amount);
    if (veh === g.currentVehicle) {
      setVehicleHealth(Math.round(veh.health));
    }

    if (veh.health <= 0 && !veh.exploded) {
      veh.exploded = true;
      soundFx.playExplosion();
      createExplosion(g.scene, veh.mesh.position.x, veh.mesh.position.y, veh.mesh.position.z);
      if (veh.mesh.children[0] && veh.mesh.children[0].material) {
        veh.mesh.children[0].material.color.setHex(0x222222);
      }

      if (veh === g.currentVehicle) {
        g.health = 0;
        setHealth(0);
        setGameState('gameover');
      }

      if (g.activeMission?.type === 'carnage') {
        g.missionProgress += 1;
        setMissionProgress(g.missionProgress);
        if (g.missionProgress >= g.missionTargetCount) {
          completeMission();
        }
      }
    }
  }, []);

  // Trigger iconic cheats
  const applyCheat = useCallback((cheatStr) => {
    const code = cheatStr.trim().toUpperCase();
    const g = gameRef.current;
    soundFx.playCheat();

    switch (code) {
      case 'ASPIRINE':
        g.health = 100;
        setHealth(100);
        showToast('CHEAT ACTIVATED: FULL HEALTH (100 HP)');
        break;
      case 'PRECIOUSPROTECTION':
        g.armor = 100;
        setArmor(100);
        showToast('CHEAT ACTIVATED: FULL BODY ARMOR');
        break;
      case 'THUGSTOOLS':
        g.ammo = { fists: Infinity, pistol: 999, uzi: 999, shotgun: 999, rpg: 99 };
        setAmmo({ ...g.ammo });
        showToast('CHEAT ACTIVATED: THUG TOOLS & 999 AMMO');
        break;
      case 'PANZER':
        if (g.scene) {
          spawnRhinoTank(g.scene, g.playerPos.x + 8, g.playerPos.z + 8);
          showToast('CHEAT ACTIVATED: RHINO TANK SPAWNED');
        }
        break;
      case 'GETTHEREFAST':
        if (g.scene) {
          spawnSupercar(g.scene, g.playerPos.x + 6, g.playerPos.z + 6, 0xff0055);
          showToast('CHEAT ACTIVATED: INFERNUS SUPERCAR SPAWNED');
        }
        break;
      case 'LEAVEMEALONE':
        g.wantedLevel = 0;
        setWantedLevel(0);
        showToast('CHEAT ACTIVATED: WANTED STARS CLEARED');
        break;
      case 'BIGBANG':
        g.vehicles.forEach((v) => {
          if (v !== g.currentVehicle) {
            damageVehicle(v, 200);
          }
        });
        soundFx.playExplosion();
        showToast('CHEAT ACTIVATED: BIG BANG DETONATION!');
        break;
      default:
        showToast('UNKNOWN CHEAT CODE');
        return;
    }
    setCheatInput('');
  }, [damageVehicle, showToast]);

  // Radio Station switcher
  const handleToggleRadio = useCallback((stationName) => {
    soundFx.playClick();
    setCurrentStation(stationName);
    gameRef.current.station = stationName;
    soundFx.startViceCityRadio(stationName);
  }, []);

  // Enter or Exit vehicle
  const handleEnterExitVehicle = useCallback(() => {
    const g = gameRef.current;
    if (g.currentVehicle) {
      const car = g.currentVehicle;
      car.speed = 0;
      g.playerPos.set(car.mesh.position.x - 3, 0.9, car.mesh.position.z);
      if (g.playerMesh) {
        g.playerMesh.visible = true;
        g.playerMesh.position.copy(g.playerPos);
      }
      g.currentVehicle = null;
      setInVehicle(null);
      setVehicleSpeed(0);
      soundFx.playClick();
      showToast('EXITED VEHICLE');
    } else {
      let nearestCar = null;
      let minDistance = 5.5;
      g.vehicles.forEach((car) => {
        const d = g.playerPos.distanceTo(car.mesh.position);
        if (d < minDistance && car.health > 0) {
          minDistance = d;
          nearestCar = car;
        }
      });

      if (nearestCar) {
        g.currentVehicle = nearestCar;
        setInVehicle(nearestCar.type);
        setVehicleHealth(Math.round(nearestCar.health));
        if (g.playerMesh) g.playerMesh.visible = false;
        soundFx.playClick();
        showToast(`ENTERED ${nearestCar.type.toUpperCase()}`);

        if (nearestCar.isPolice) {
          g.wantedLevel = Math.max(g.wantedLevel, 1.5);
          setWantedLevel(Math.floor(g.wantedLevel));
        }
      }
    }
  }, [showToast]);

  // Complete active mission
  const completeMission = useCallback(() => {
    const g = gameRef.current;
    const mission = g.activeMission;
    if (!mission) return;

    soundFx.playMissionPassed();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    const newCash = g.cash + mission.reward;
    g.cash = newCash;
    setCash(newCash);
    saveHighScore('viceCity', newCash);
    if (onScoreUpdate) onScoreUpdate(newCash);

    setMissionPassedBanner({
      title: mission.title,
      reward: mission.reward,
    });

    g.checkpoints.forEach((cp) => g.scene.remove(cp.mesh));
    g.checkpoints = [];

    g.activeMission = null;
    setActiveMission(null);
    g.wantedLevel = 0;
    setWantedLevel(0);

    setTimeout(() => {
      setMissionPassedBanner(null);
    }, 4500);
  }, [onScoreUpdate]);

  // Start Mission
  const startMission = useCallback((missionId) => {
    const mission = MISSIONS.find((m) => m.id === missionId);
    if (!mission) return;
    const g = gameRef.current;
    g.activeMission = mission;
    g.missionTimer = mission.timeLimit;
    g.missionProgress = 0;
    setActiveMission(mission);
    setMissionTimer(mission.timeLimit);
    setMissionProgress(0);

    soundFx.playClick();
    showToast(`MISSION STARTED: ${mission.title}`);

    if (mission.type === 'escape') {
      g.wantedLevel = 2;
      setWantedLevel(2);
      g.missionTargetCount = 1;
    } else if (mission.type === 'race') {
      g.missionTargetCount = 8;
      createRaceCheckpoints(g.scene);
    } else if (mission.type === 'eliminate') {
      g.missionTargetCount = 8;
      spawnGangSyndicate(g.scene, g.playerPos.x, g.playerPos.z);
    } else if (mission.type === 'taxi') {
      g.missionTargetCount = 3;
    } else if (mission.type === 'carnage') {
      g.missionTargetCount = 5;
    }
  }, [showToast]);

  // Create race checkpoints
  const createRaceCheckpoints = (scene) => {
    const g = gameRef.current;
    g.checkpoints.forEach((cp) => scene.remove(cp.mesh));
    g.checkpoints = [];

    const coords = [
      { x: 0, z: -30 },
      { x: 30, z: -60 },
      { x: 60, z: -30 },
      { x: 60, z: 40 },
      { x: 20, z: 70 },
      { x: -40, z: 60 },
      { x: -50, z: 0 },
      { x: 0, z: 0 },
    ];

    coords.forEach((coord, i) => {
      const ringGeo = new THREE.TorusGeometry(3, 0.4, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: i === 0 ? 0xff00ff : 0x00ffff, wireframe: true });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(coord.x, 2, coord.z);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      g.checkpoints.push({ mesh: ring, x: coord.x, z: coord.z, index: i });
    });
  };

  // Spawn Gang syndicate
  const spawnGangSyndicate = (scene, px, pz) => {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = px + Math.cos(angle) * (20 + Math.random() * 10);
      const z = pz + Math.sin(angle) * (20 + Math.random() * 10);
      spawnPedestrian(scene, x, z, true);
    }
  };

  // Player attack / shoot
  const handleAttack = useCallback(() => {
    const g = gameRef.current;
    if (gameStateRef.current !== 'playing') return;

    const now = Date.now();
    const weapon = WEAPONS[g.selectedWeaponIdx];
    if (now - g.lastFireTime < weapon.fireRate) return;

    if (weapon.id !== 'fists' && g.ammo[weapon.id] <= 0) {
      soundFx.playClick();
      showToast('OUT OF AMMO! VISIT AMMU-NATION');
      return;
    }

    g.lastFireTime = now;

    if (weapon.id !== 'fists') {
      g.ammo[weapon.id] -= 1;
      setAmmo({ ...g.ammo });
      g.wantedLevel = Math.min(5, g.wantedLevel + 0.15);
      setWantedLevel(Math.floor(g.wantedLevel));
    }

    if (weapon.id === 'fists') {
      soundFx.playPunch();
      checkMeleeHit(g);
    } else if (weapon.id === 'rpg') {
      soundFx.playGunshot('rocket');
      fireRocket(g);
    } else {
      soundFx.playGunshot(weapon.id);
      fireBullet(g, weapon);
    }
  }, [showToast]);

  // Melee hit check
  const checkMeleeHit = (g) => {
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.playerRotY);
    const hitPos = g.playerPos.clone().add(forward.multiplyScalar(2.2));

    g.pedestrians.forEach((ped) => {
      if (ped.alive && ped.mesh.position.distanceTo(hitPos) < 2.5) {
        ped.health -= 35;
        ped.mesh.position.add(forward.clone().multiplyScalar(0.8));
        if (ped.health <= 0) {
          killPedestrian(g, ped);
        }
      }
    });

    g.policeOfficers.forEach((cop) => {
      if (cop.alive && cop.mesh.position.distanceTo(hitPos) < 2.5) {
        cop.health -= 35;
        g.wantedLevel = Math.max(g.wantedLevel, 2);
        setWantedLevel(Math.floor(g.wantedLevel));
        if (cop.health <= 0) {
          killCop(g, cop);
        }
      }
    });
  };

  // Fire regular bullet
  const fireBullet = (g, weapon) => {
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.playerRotY);
    const origin = g.playerPos.clone().add(new THREE.Vector3(0, 0.4, 0));

    const geom = new THREE.BufferGeometry().setFromPoints([
      origin,
      origin.clone().add(forward.clone().multiplyScalar(weapon.range))
    ]);
    const mat = new THREE.LineBasicMaterial({ color: 0xffff55, linewidth: 2 });
    const tracer = new THREE.Line(geom, mat);
    g.scene.add(tracer);
    setTimeout(() => g.scene.remove(tracer), 60);

    g.pedestrians.forEach((ped) => {
      if (ped.alive && ped.mesh.position.distanceTo(origin) < weapon.range) {
        const toPed = ped.mesh.position.clone().sub(origin).normalize();
        if (forward.dot(toPed) > 0.88) {
          ped.health -= weapon.damage;
          if (ped.health <= 0) killPedestrian(g, ped);
        }
      }
    });

    g.policeOfficers.forEach((cop) => {
      if (cop.alive && cop.mesh.position.distanceTo(origin) < weapon.range) {
        const toCop = cop.mesh.position.clone().sub(origin).normalize();
        if (forward.dot(toCop) > 0.88) {
          cop.health -= weapon.damage;
          g.wantedLevel = Math.max(g.wantedLevel, 2.5);
          setWantedLevel(Math.floor(g.wantedLevel));
          if (cop.health <= 0) killCop(g, cop);
        }
      }
    });

    g.vehicles.forEach((veh) => {
      if (veh.health > 0 && veh.mesh.position.distanceTo(origin) < weapon.range) {
        const toVeh = veh.mesh.position.clone().sub(origin).normalize();
        if (forward.dot(toVeh) > 0.85) {
          damageVehicle(veh, weapon.damage);
        }
      }
    });
  };

  // Fire 3D Rocket Projectile
  const fireRocket = (g) => {
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.playerRotY);
    const startPos = g.playerPos.clone().add(new THREE.Vector3(0, 0.5, 0));

    const rocketGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 8);
    const rocketMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
    const rocketMesh = new THREE.Mesh(rocketGeo, rocketMat);
    rocketMesh.position.copy(startPos);
    rocketMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), forward);
    g.scene.add(rocketMesh);

    g.rockets.push({
      mesh: rocketMesh,
      pos: startPos,
      vel: forward.clone().multiplyScalar(1.2),
      life: 80,
    });
  };

  // Kill Pedestrian & drop cash
  const killPedestrian = (g, ped) => {
    ped.alive = false;
    ped.mesh.rotation.x = Math.PI / 2;
    ped.mesh.position.y = 0.2;

    spawnCashDrop(g.scene, ped.mesh.position.x, ped.mesh.position.z, 50 + Math.floor(Math.random() * 80));

    g.wantedLevel = Math.min(5, g.wantedLevel + 0.35);
    setWantedLevel(Math.floor(g.wantedLevel));

    if (g.activeMission?.type === 'eliminate' && ped.isGang) {
      g.missionProgress += 1;
      setMissionProgress(g.missionProgress);
      if (g.missionProgress >= g.missionTargetCount) {
        completeMission();
      }
    }
  };

  // Kill Cop
  const killCop = (g, cop) => {
    cop.alive = false;
    cop.mesh.rotation.x = Math.PI / 2;
    cop.mesh.position.y = 0.2;
    spawnCashDrop(g.scene, cop.mesh.position.x, cop.mesh.position.z, 120 + Math.floor(Math.random() * 100));
    g.wantedLevel = Math.min(5, g.wantedLevel + 0.8);
    setWantedLevel(Math.floor(g.wantedLevel));
  };

  // Create 3D Explosion FX
  const createExplosion = (scene, x, y, z) => {
    const g = gameRef.current;
    const blastGeo = new THREE.SphereGeometry(3.5, 12, 12);
    const blastMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true });
    const blast = new THREE.Mesh(blastGeo, blastMat);
    blast.position.set(x, y + 1, z);
    scene.add(blast);

    g.explosions.push({
      mesh: blast,
      scale: 1,
      maxScale: 3,
      alpha: 1,
    });

    const origin = new THREE.Vector3(x, y, z);
    g.pedestrians.forEach((p) => {
      if (p.alive && p.mesh.position.distanceTo(origin) < 7) {
        killPedestrian(g, p);
      }
    });
    g.policeOfficers.forEach((cop) => {
      if (cop.alive && cop.mesh.position.distanceTo(origin) < 7) {
        killCop(g, cop);
      }
    });
  };

  // Spawn cash drop pickup
  const spawnCashDrop = (scene, x, z, value) => {
    const g = gameRef.current;
    const geo = new THREE.BoxGeometry(0.8, 0.2, 0.4);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0.3, z);
    scene.add(mesh);

    g.pickups.push({
      mesh,
      type: 'cash',
      value,
      x,
      z,
      rot: 0,
    });
  };

  // Spawn Police Officer
  const spawnPoliceOfficer = (scene, x, z) => {
    const g = gameRef.current;
    const copGroup = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(0.6, 1.2, 0.4);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x112266 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    copGroup.add(body);

    const headGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.35;
    copGroup.add(head);

    const capGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.12, 8);
    const capMat = new THREE.MeshLambertMaterial({ color: 0x001144 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 1.52;
    copGroup.add(cap);

    copGroup.position.set(x, 0, z);
    scene.add(copGroup);

    g.policeOfficers.push({
      mesh: copGroup,
      health: 80,
      alive: true,
      lastShotTime: 0,
    });
  };

  // Spawn Pedestrian
  const spawnPedestrian = (scene, x, z, isGang = false) => {
    const g = gameRef.current;
    const pedGroup = new THREE.Group();

    const shirtColors = isGang ? [0x990000, 0x111111] : [0xff00aa, 0x00ffff, 0xffdd00, 0x9933ff, 0x00ff88];
    const shirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];

    const bodyGeo = new THREE.BoxGeometry(0.55, 1.1, 0.35);
    const bodyMat = new THREE.MeshLambertMaterial({ color: shirtColor });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.55;
    pedGroup.add(body);

    const headGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.25;
    pedGroup.add(head);

    pedGroup.position.set(x, 0, z);
    scene.add(pedGroup);

    g.pedestrians.push({
      mesh: pedGroup,
      health: isGang ? 75 : 40,
      alive: true,
      isGang,
      walkDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
      walkSpeed: isGang ? 0.08 : 0.04,
      changeTimer: 0,
    });
  };

  // Spawn Supercar (Infernus)
  const spawnSupercar = (scene, x, z, color = 0xff0055) => {
    const g = gameRef.current;
    const carGroup = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(2.2, 0.7, 4.6);
    const bodyMat = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.55;
    carGroup.add(body);

    const cabinGeo = new THREE.BoxGeometry(1.8, 0.55, 2.2);
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0x111122 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.0, -0.2);
    carGroup.add(cabin);

    const spoilerGeo = new THREE.BoxGeometry(2.0, 0.1, 0.4);
    const spoiler = new THREE.Mesh(spoilerGeo, bodyMat);
    spoiler.position.set(0, 1.15, 2.0);
    carGroup.add(spoiler);

    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.35, 12);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    [
      [-1.15, 0.4, -1.4],
      [1.15, 0.4, -1.4],
      [-1.15, 0.4, 1.4],
      [1.15, 0.4, 1.4],
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      carGroup.add(wheel);
    });

    const lightGeo = new THREE.BoxGeometry(0.35, 0.15, 0.1);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
    [-0.7, 0.7].forEach((lx) => {
      const hl = new THREE.Mesh(lightGeo, lightMat);
      hl.position.set(lx, 0.6, -2.31);
      carGroup.add(hl);
    });

    carGroup.position.set(x, 0, z);
    scene.add(carGroup);

    const carObj = {
      type: 'infernus',
      mesh: carGroup,
      health: 100,
      exploded: false,
      speed: 0,
      maxSpeed: 0.95,
      accel: 0.025,
      handling: 0.045,
      isPolice: false,
    };
    g.vehicles.push(carObj);
    return carObj;
  };

  // Spawn Police Cruiser
  const spawnPoliceCruiser = (scene, x, z) => {
    const g = gameRef.current;
    const carGroup = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(2.2, 0.8, 4.8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    carGroup.add(body);

    const stripeGeo = new THREE.BoxGeometry(2.22, 0.25, 4.82);
    const stripeMat = new THREE.MeshLambertMaterial({ color: 0x008855 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.6;
    carGroup.add(stripe);

    const barGeo = new THREE.BoxGeometry(1.2, 0.15, 0.35);
    const barMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(0, 1.45, 0);
    carGroup.add(bar);

    const redLight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.3), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    redLight.position.set(-0.35, 1.48, 0);
    carGroup.add(redLight);

    const blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.3), new THREE.MeshBasicMaterial({ color: 0x0066ff }));
    blueLight.position.set(0.35, 1.48, 0);
    carGroup.add(blueLight);

    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.35, 12);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    [
      [-1.15, 0.4, -1.4],
      [1.15, 0.4, -1.4],
      [-1.15, 0.4, 1.4],
      [1.15, 0.4, 1.4],
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      carGroup.add(wheel);
    });

    carGroup.position.set(x, 0, z);
    scene.add(carGroup);

    const carObj = {
      type: 'vcpd_cruiser',
      mesh: carGroup,
      health: 120,
      exploded: false,
      speed: 0,
      maxSpeed: 0.85,
      accel: 0.02,
      handling: 0.04,
      isPolice: true,
      redLight,
      blueLight,
    };
    g.vehicles.push(carObj);
    return carObj;
  };

  // Spawn Taxi
  const spawnTaxi = (scene, x, z) => {
    const g = gameRef.current;
    const carGroup = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(2.1, 0.8, 4.6);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    carGroup.add(body);

    const signGeo = new THREE.BoxGeometry(0.8, 0.25, 0.3);
    const signMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 1.45, 0);
    carGroup.add(sign);

    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.35, 12);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    [
      [-1.1, 0.4, -1.4],
      [1.1, 0.4, -1.4],
      [-1.1, 0.4, 1.4],
      [1.1, 0.4, 1.4],
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      carGroup.add(wheel);
    });

    carGroup.position.set(x, 0, z);
    scene.add(carGroup);

    const carObj = {
      type: 'taxi',
      mesh: carGroup,
      health: 100,
      exploded: false,
      speed: 0,
      maxSpeed: 0.78,
      accel: 0.018,
      handling: 0.038,
      isPolice: false,
    };
    g.vehicles.push(carObj);
    return carObj;
  };

  // Spawn Rhino Military Tank
  const spawnRhinoTank = (scene, x, z) => {
    const g = gameRef.current;
    const tankGroup = new THREE.Group();

    const hullGeo = new THREE.BoxGeometry(3.2, 1.4, 5.8);
    const hullMat = new THREE.MeshLambertMaterial({ color: 0x445533 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 1.0;
    tankGroup.add(hull);

    const turretGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.8, 12);
    const turret = new THREE.Mesh(turretGeo, hullMat);
    turret.position.set(0, 2.0, -0.2);
    tankGroup.add(turret);

    const barrelGeo = new THREE.CylinderGeometry(0.2, 0.25, 3.2, 8);
    const barrel = new THREE.Mesh(barrelGeo, hullMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 2.0, -2.5);
    tankGroup.add(barrel);

    tankGroup.position.set(x, 0, z);
    scene.add(tankGroup);

    const carObj = {
      type: 'panzer_tank',
      mesh: tankGroup,
      health: 500,
      exploded: false,
      speed: 0,
      maxSpeed: 0.55,
      accel: 0.012,
      handling: 0.025,
      isPolice: false,
      isTank: true,
    };
    g.vehicles.push(carObj);
    return carObj;
  };

  // Buy weapon / armor at Ammu-Nation
  const handleBuyItem = (itemType) => {
    const g = gameRef.current;
    if (itemType === 'armor') {
      if (g.cash >= 200) {
        g.cash -= 200;
        g.armor = 100;
        setCash(g.cash);
        setArmor(100);
        soundFx.playPowerup();
        showToast('PURCHASED BODY ARMOR');
      } else {
        showToast('NOT ENOUGH CASH ($200 NEEDED)');
      }
      return;
    }

    const weapon = WEAPONS.find((w) => w.id === itemType);
    if (!weapon) return;
    if (g.cash >= weapon.cost) {
      g.cash -= weapon.cost;
      g.ammo[weapon.id] = (g.ammo[weapon.id] || 0) + weapon.maxAmmo;
      setCash(g.cash);
      setAmmo({ ...g.ammo });
      soundFx.playPowerup();
      showToast(`PURCHASED ${weapon.name.toUpperCase()} & AMMO`);
    } else {
      showToast(`NOT ENOUGH CASH ($${weapon.cost} NEEDED)`);
    }
  };

  // Main Three.js Scene Setup & Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0933);
    scene.fog = new THREE.FogExp2(0x280e45, 0.007);
    gameRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, 5, 8);
    gameRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    gameRef.current.renderer = renderer;

    const hemiLight = new THREE.HemisphereLight(0xff77aa, 0x004488, 1.2);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffbb77, 1.8);
    dirLight.position.set(60, 80, -40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const groundGeo = new THREE.PlaneGeometry(350, 350);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x181822 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const oceanGeo = new THREE.PlaneGeometry(160, 350, 20, 20);
    const oceanMat = new THREE.MeshLambertMaterial({ color: 0x006699, transparent: true, opacity: 0.85 });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(150, 0.1, 0);
    scene.add(ocean);
    gameRef.current.waterMesh = ocean;

    const beachGeo = new THREE.PlaneGeometry(30, 350);
    const beachMat = new THREE.MeshLambertMaterial({ color: 0xddbb77 });
    const beach = new THREE.Mesh(beachGeo, beachMat);
    beach.rotation.x = -Math.PI / 2;
    beach.position.set(80, 0.05, 0);
    scene.add(beach);

    for (let z = -150; z <= 150; z += 18) {
      const trunkGeo = new THREE.CylinderGeometry(0.25, 0.45, 7, 8);
      const trunkMat = new THREE.MeshLambertMaterial({ color: 0x664422 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(68, 3.5, z);
      scene.add(trunk);

      const topGeo = new THREE.ConeGeometry(3.5, 2.2, 7);
      const topMat = new THREE.MeshLambertMaterial({ color: 0x00aa55 });
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.set(68, 7.2, z);
      scene.add(top);
    }

    for (let z = -140; z <= 140; z += 28) {
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 6, 6);
      const poleMat = new THREE.MeshLambertMaterial({ color: 0x888899 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(62, 3, z);
      scene.add(pole);

      const bulbGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(62, 6, z);
      scene.add(bulb);
    }

    for (let z = -160; z <= 160; z += 8) {
      const dashGeo = new THREE.PlaneGeometry(0.3, 3.5);
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const dash1 = new THREE.Mesh(dashGeo, dashMat);
      dash1.rotation.x = -Math.PI / 2;
      dash1.position.set(50, 0.02, z);
      scene.add(dash1);

      const dash2 = new THREE.Mesh(dashGeo, dashMat);
      dash2.rotation.x = -Math.PI / 2;
      dash2.position.set(0, 0.02, z);
      scene.add(dash2);
    }

    const buildingList = [
      { x: 35, z: -100, w: 18, h: 22, d: 24, color: 0xff99bb, name: 'HOTEL PINK FLAMINGO', neon: 0xff0088 },
      { x: 35, z: -55, w: 20, h: 28, d: 26, color: 0x88ddff, name: 'OCEAN VIEW HOTEL', neon: 0x00ffff },
      { x: 35, z: -10, w: 22, h: 20, d: 24, color: 0xffee88, name: 'THE MALIBU CLUB', neon: 0xff00ff },
      { x: 35, z: 35, w: 18, h: 32, d: 25, color: 0xbbffaa, name: 'SUNSET CASINO', neon: 0x00ff88 },
      { x: 35, z: 85, w: 20, h: 24, d: 24, color: 0xffccaa, name: 'PARADISE SUITES', neon: 0xffaa00 },
      { x: -35, z: -80, w: 24, h: 14, d: 22, color: 0x555566, name: 'PAY \'N\' SPRAY GARAGE', neon: 0xffff00, isPayNSpray: true },
      { x: -35, z: -30, w: 20, h: 16, d: 22, color: 0x663333, name: 'AMMU-NATION GUNS', neon: 0xff3300, isAmmuNation: true },
      { x: -35, z: 25, w: 28, h: 35, d: 30, color: 0x99aacc, name: 'DOWNTOWN PLAZA', neon: 0x33bbff },
      { x: -35, z: 85, w: 26, h: 18, d: 28, color: 0xeeccaa, name: 'VERCETTI ESTATE MANSION', neon: 0xff77cc, isMansion: true },
      { x: -80, z: -70, w: 26, h: 48, d: 26, color: 0x334466, name: 'VICE BANK TOWER', neon: 0x00eeff },
      { x: -80, z: 0, w: 28, h: 54, d: 28, color: 0x443355, name: 'CORONA CONDOS', neon: 0xee00aa },
      { x: -80, z: 70, w: 25, h: 42, d: 25, color: 0x224444, name: 'HAVANA IMPORTS', neon: 0x00ffaa },
    ];

    buildingList.forEach((b) => {
      const bGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const bMat = new THREE.MeshLambertMaterial({ color: b.color });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(b.x, b.h / 2, b.z);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      scene.add(bMesh);

      const signGeo = new THREE.BoxGeometry(b.w * 0.75, 2.2, 0.5);
      const signMat = new THREE.MeshBasicMaterial({ color: b.neon });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(b.x, b.h + 1.2, b.z + b.d / 2);
      scene.add(sign);

      gameRef.current.buildings.push({
        x: b.x,
        z: b.z,
        w: b.w,
        d: b.d,
        name: b.name,
        isPayNSpray: b.isPayNSpray,
        isAmmuNation: b.isAmmuNation,
        isMansion: b.isMansion,
      });
    });

    [-20, 40].forEach((rx) => {
      const rampGeo = new THREE.BoxGeometry(4, 1.8, 6);
      const rampMat = new THREE.MeshLambertMaterial({ color: 0xff5500 });
      const ramp = new THREE.Mesh(rampGeo, rampMat);
      ramp.rotation.x = -Math.PI / 8;
      ramp.position.set(rx, 0.9, -15);
      scene.add(ramp);
    });

    const missionMarkerGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.4, 16);
    const missionMarkerMat = new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.65 });
    const missionMarker = new THREE.Mesh(missionMarkerGeo, missionMarkerMat);
    missionMarker.position.set(22, 0.2, -10);
    scene.add(missionMarker);

    const pnsMarkerGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.3, 16);
    const pnsMarkerMat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.6 });
    const pnsMarker = new THREE.Mesh(pnsMarkerGeo, pnsMarkerMat);
    pnsMarker.position.set(-22, 0.2, -80);
    scene.add(pnsMarker);

    const ammuMarkerGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.3, 16);
    const ammuMarkerMat = new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true, opacity: 0.6 });
    const ammuMarker = new THREE.Mesh(ammuMarkerGeo, ammuMarkerMat);
    ammuMarker.position.set(-22, 0.2, -30);
    scene.add(ammuMarker);

    const playerGroup = new THREE.Group();

    const torsoGeo = new THREE.BoxGeometry(0.7, 0.85, 0.42);
    const torsoMat = new THREE.MeshLambertMaterial({ color: 0x00ccdd });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.0;
    torso.castShadow = true;
    playerGroup.add(torso);
    gameRef.current.torso = torso;

    const headGeo = new THREE.SphereGeometry(0.26, 10, 10);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.65;
    playerGroup.add(head);

    const glassesGeo = new THREE.BoxGeometry(0.36, 0.1, 0.15);
    const glassesMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const glasses = new THREE.Mesh(glassesGeo, glassesMat);
    glasses.position.set(0, 1.66, 0.22);
    playerGroup.add(glasses);

    const legGeo = new THREE.BoxGeometry(0.26, 0.7, 0.3);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x224488 });

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.2, 0.35, 0);
    playerGroup.add(leftLeg);
    gameRef.current.leftLeg = leftLeg;

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.2, 0.35, 0);
    playerGroup.add(rightLeg);
    gameRef.current.rightLeg = rightLeg;

    const armGeo = new THREE.BoxGeometry(0.22, 0.65, 0.25);
    const armMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });

    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.48, 0.95, 0);
    playerGroup.add(leftArm);
    gameRef.current.leftArm = leftArm;

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.48, 0.95, 0);
    playerGroup.add(rightArm);
    gameRef.current.rightArm = rightArm;

    playerGroup.position.set(0, 0, 0);
    scene.add(playerGroup);
    gameRef.current.playerMesh = playerGroup;

    spawnSupercar(scene, 12, 10, 0xff0066);
    spawnSupercar(scene, 48, -40, 0x00ffff);
    spawnPoliceCruiser(scene, 12, -70);
    spawnTaxi(scene, 48, 60);
    spawnRhinoTank(scene, -35, 120);

    for (let i = 0; i < 20; i++) {
      const rx = (Math.random() - 0.5) * 120;
      const rz = (Math.random() - 0.5) * 200;
      spawnPedestrian(scene, rx, rz);
    }

    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      gameRef.current.keysPressed[k] = true;

      if (k === 'f' || k === 'enter') {
        handleEnterExitVehicle();
      }
      if (k === 'h') {
        soundFx.playCarHorn();
      }
      if (k === 'r') {
        const stations = ['flashFm', 'wave103', 'vRock', 'off'];
        const nextIdx = (stations.indexOf(gameRef.current.station) + 1) % stations.length;
        handleToggleRadio(stations[nextIdx]);
      }
      if (['1', '2', '3', '4', '5'].includes(k)) {
        const idx = parseInt(k) - 1;
        setSelectedWeaponIdx(idx);
        gameRef.current.selectedWeaponIdx = idx;
        soundFx.playClick();
      }
      if (k === ' ') {
        e.preventDefault();
        const g = gameRef.current;
        if (!g.currentVehicle && !g.isJumping) {
          g.isJumping = true;
          g.jumpVelocity = 0.28;
          soundFx.playJump();
        }
      }
      if (e.key === 'Shift') {
        gameRef.current.isSprinting = true;
      }
    };

    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase();
      gameRef.current.keysPressed[k] = false;
      if (e.key === 'Shift') {
        gameRef.current.isSprinting = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e) => {
      if (e.target.tagName !== 'CANVAS') return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      const g = gameRef.current;
      g.cameraYaw -= deltaX * 0.006;
      g.cameraPitch = Math.max(0.1, Math.min(1.2, g.cameraPitch + deltaY * 0.005));
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const g = gameRef.current;

      if (g.waterMesh) {
        g.waterMesh.position.y = 0.1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.15;
      }

      if (gameStateRef.current === 'playing') {
        const keys = g.keysPressed;

        if (g.currentVehicle) {
          const car = g.currentVehicle;
          const isAccelerating = keys['w'] || keys['arrowup'];
          const isBraking = keys['s'] || keys['arrowdown'];
          const isSteeringLeft = keys['a'] || keys['arrowleft'];
          const isSteeringRight = keys['d'] || keys['arrowright'];
          const isHandbrake = keys[' '];

          if (isAccelerating) {
            car.speed = Math.min(car.maxSpeed, car.speed + car.accel);
          } else if (isBraking) {
            car.speed = Math.max(-car.maxSpeed * 0.45, car.speed - car.accel * 1.2);
          } else {
            car.speed *= 0.98;
          }

          if (isHandbrake) {
            car.speed *= 0.94;
            soundFx.playDriftScreech();
          }

          if (Math.abs(car.speed) > 0.05) {
            const steerDir = car.speed > 0 ? 1 : -1;
            if (isSteeringLeft) car.mesh.rotation.y += car.handling * steerDir;
            if (isSteeringRight) car.mesh.rotation.y -= car.handling * steerDir;
          }

          const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), car.mesh.rotation.y);
          car.mesh.position.add(forward.multiplyScalar(car.speed));

          if (isSteeringLeft) car.mesh.rotation.z = Math.min(0.08, car.mesh.rotation.z + 0.01);
          else if (isSteeringRight) car.mesh.rotation.z = Math.max(-0.08, car.mesh.rotation.z - 0.01);
          else car.mesh.rotation.z *= 0.8;

          g.playerPos.copy(car.mesh.position);
          setVehicleSpeed(Math.round(Math.abs(car.speed) * 110));

          if (car.isPolice && car.redLight && car.blueLight) {
            const flash = Math.sin(clock.getElapsedTime() * 12) > 0;
            car.redLight.visible = flash;
            car.blueLight.visible = !flash;
          }

          if (car.mesh.position.distanceTo(new THREE.Vector3(-22, 0, -80)) < 6.0) {
            if (car.health < 100 || g.wantedLevel > 0) {
              car.health = 100;
              setVehicleHealth(100);
              g.wantedLevel = 0;
              setWantedLevel(0);
              soundFx.playPayNSpray();
              const colors = [0xff0055, 0x00ddff, 0xffbb00, 0x9900ff, 0xffffff];
              if (car.mesh.children[0] && car.mesh.children[0].material) {
                car.mesh.children[0].material.color.setHex(colors[Math.floor(Math.random() * colors.length)]);
              }
              showToast('PAY \'N\' SPRAY: VEHICLE REPAIRED & HEAT WIPED!');
            }
          }

          g.pedestrians.forEach((ped) => {
            if (ped.alive && ped.mesh.position.distanceTo(car.mesh.position) < 2.5 && Math.abs(car.speed) > 0.15) {
              killPedestrian(g, ped);
              soundFx.playCarCrash();
              car.speed *= 0.85;
            }
          });

          const camOffset = new THREE.Vector3(0, 4.5, 9.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), car.mesh.rotation.y + g.cameraYaw);
          camera.position.lerp(car.mesh.position.clone().add(camOffset), 0.1);
          camera.lookAt(car.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
        } else {
          let moveX = 0;
          let moveZ = 0;
          if (keys['w'] || keys['arrowup']) moveZ -= 1;
          if (keys['s'] || keys['arrowdown']) moveZ += 1;
          if (keys['a'] || keys['arrowleft']) moveX -= 1;
          if (keys['d'] || keys['arrowright']) moveX += 1;

          const isMoving = moveX !== 0 || moveZ !== 0;

          if (isMoving) {
            const moveAngle = Math.atan2(moveX, moveZ);
            g.playerRotY = g.cameraYaw + moveAngle + Math.PI;

            const speed = g.isSprinting ? 0.22 : 0.12;
            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.playerRotY);
            g.playerPos.add(forward.multiplyScalar(speed));

            const swing = Math.sin(clock.getElapsedTime() * (g.isSprinting ? 16 : 10)) * 0.45;
            if (g.leftLeg) g.leftLeg.rotation.x = swing;
            if (g.rightLeg) g.rightLeg.rotation.x = -swing;
            if (g.leftArm) g.leftArm.rotation.x = -swing;
            if (g.rightArm) g.rightArm.rotation.x = swing;
          } else {
            if (g.leftLeg) g.leftLeg.rotation.x = 0;
            if (g.rightLeg) g.rightLeg.rotation.x = 0;
            if (g.leftArm) g.leftArm.rotation.x = 0;
            if (g.rightArm) g.rightArm.rotation.x = 0;
          }

          if (g.isJumping) {
            g.playerPos.y += g.jumpVelocity;
            g.jumpVelocity -= 0.018;
            if (g.playerPos.y <= 0.9) {
              g.playerPos.y = 0.9;
              g.isJumping = false;
              g.jumpVelocity = 0;
            }
          }

          if (g.playerMesh) {
            g.playerMesh.position.copy(g.playerPos);
            g.playerMesh.rotation.y = g.playerRotY;
          }

          const camOffset = new THREE.Vector3(0, 2.5 + g.cameraPitch * 3, 5.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.cameraYaw);
          camera.position.lerp(g.playerPos.clone().add(camOffset), 0.15);
          camera.lookAt(g.playerPos.clone().add(new THREE.Vector3(0, 1.2, 0)));

          if (g.playerPos.distanceTo(new THREE.Vector3(-22, 0, -30)) < 4.0) {
            if (!showAmmuNation) setShowAmmuNation(true);
          } else {
            if (showAmmuNation) setShowAmmuNation(false);
          }

          if (g.playerPos.distanceTo(new THREE.Vector3(22, 0, -10)) < 3.5 && !g.activeMission) {
            startMission(1);
          }
        }

        if (g.activeMission) {
          g.missionTimer -= delta;
          setMissionTimer(Math.max(0, Math.ceil(g.missionTimer)));

          if (g.missionTimer <= 0) {
            soundFx.playGameOver();
            showToast('MISSION FAILED: TIME EXPIRED');
            g.activeMission = null;
            setActiveMission(null);
          }

          if (g.activeMission.type === 'race' && g.checkpoints.length > 0) {
            const nextCp = g.checkpoints[g.missionProgress];
            if (nextCp && g.playerPos.distanceTo(new THREE.Vector3(nextCp.x, 2, nextCp.z)) < 6) {
              soundFx.playCoin();
              nextCp.mesh.material.color.setHex(0x00ff88);
              g.missionProgress += 1;
              setMissionProgress(g.missionProgress);
              if (g.missionProgress >= g.missionTargetCount) {
                completeMission();
              }
            }
          }

          if (g.activeMission.type === 'escape') {
            const distToSafehouse = g.playerPos.distanceTo(new THREE.Vector3(-35, 0, 85));
            if (distToSafehouse < 15 && g.wantedLevel <= 0.5) {
              completeMission();
            }
          }
        }

        if (g.wantedLevel > 0) {
          g.wantedTimer += delta;

          if (g.policeOfficers.length < Math.floor(g.wantedLevel * 2)) {
            const spawnDist = 35 + Math.random() * 20;
            const angle = Math.random() * Math.PI * 2;
            spawnPoliceOfficer(scene, g.playerPos.x + Math.cos(angle) * spawnDist, g.playerPos.z + Math.sin(angle) * spawnDist);
          }

          g.policeOfficers.forEach((cop) => {
            if (!cop.alive) return;
            const toPlayer = g.playerPos.clone().sub(cop.mesh.position);
            const dist = toPlayer.length();

            if (dist > 8) {
              toPlayer.normalize();
              cop.mesh.position.add(toPlayer.multiplyScalar(0.08));
              cop.mesh.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
            } else {
              cop.mesh.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
              if (Date.now() - cop.lastShotTime > 1200) {
                cop.lastShotTime = Date.now();
                soundFx.playGunshot('pistol');

                if (g.armor > 0) {
                  g.armor = Math.max(0, g.armor - 12);
                  setArmor(g.armor);
                } else {
                  g.health = Math.max(0, g.health - 12);
                  setHealth(g.health);
                  if (g.health <= 0) {
                    setGameState('gameover');
                    soundFx.playGameOver();
                  }
                }
              }
            }
          });

          if (g.wantedTimer > 18) {
            g.wantedLevel = Math.max(0, g.wantedLevel - 0.5);
            setWantedLevel(Math.floor(g.wantedLevel));
            g.wantedTimer = 0;
          }
        }

        g.pedestrians.forEach((ped) => {
          if (!ped.alive) return;
          ped.changeTimer += delta;
          if (ped.changeTimer > 3) {
            ped.changeTimer = 0;
            ped.walkDir.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
          }
          ped.mesh.position.add(ped.walkDir.clone().multiplyScalar(ped.walkSpeed));
          ped.mesh.rotation.y = Math.atan2(ped.walkDir.x, ped.walkDir.z);

          if (g.wantedLevel > 0 && ped.mesh.position.distanceTo(g.playerPos) < 15) {
            ped.walkDir = ped.mesh.position.clone().sub(g.playerPos).normalize();
            ped.walkSpeed = 0.12;
          }
        });

        for (let i = g.rockets.length - 1; i >= 0; i--) {
          const r = g.rockets[i];
          r.pos.add(r.vel);
          r.mesh.position.copy(r.pos);
          r.life -= 1;

          let exploded = false;
          g.vehicles.forEach((veh) => {
            if (veh.mesh.position.distanceTo(r.pos) < 3.2) {
              damageVehicle(veh, 250);
              exploded = true;
            }
          });

          if (r.life <= 0 || exploded || r.pos.y <= 0.2) {
            soundFx.playExplosion();
            createExplosion(scene, r.pos.x, r.pos.y, r.pos.z);
            scene.remove(r.mesh);
            g.rockets.splice(i, 1);
          }
        }

        for (let i = g.explosions.length - 1; i >= 0; i--) {
          const ex = g.explosions[i];
          ex.scale += 0.15;
          ex.mesh.scale.set(ex.scale, ex.scale, ex.scale);
          ex.alpha -= 0.05;
          if (ex.alpha <= 0) {
            scene.remove(ex.mesh);
            g.explosions.splice(i, 1);
          }
        }

        g.pickups.forEach((pk, idx) => {
          pk.mesh.rotation.y += 0.05;
          if (pk.mesh.position.distanceTo(g.playerPos) < 2.2) {
            soundFx.playCoin();
            g.cash += pk.value;
            setCash(g.cash);
            showToast(`+$${pk.value} CASH COLLECTED`);
            scene.remove(pk.mesh);
            g.pickups.splice(idx, 1);
          }
        });

        setMinimapBlips({
          player: { x: g.playerPos.x, z: g.playerPos.z, angle: g.cameraYaw },
          cops: g.policeOfficers.filter((c) => c.alive).map((c) => ({ x: c.mesh.position.x, z: c.mesh.position.z })),
          missions: [{ x: 22, z: -10 }],
          specials: [
            { x: -22, z: -80, type: 'pns' },
            { x: -22, z: -30, type: 'ammu' },
            { x: -35, z: 85, type: 'safehouse' },
          ],
        });
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    soundFx.startViceCityRadio(currentStation);

    return () => {
      cancelAnimationFrame(animId);
      soundFx.stopRadio();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [completeMission, damageVehicle, handleEnterExitVehicle, handleToggleRadio, showAmmuNation, showToast, currentStation, startMission]);

  return (
    <div className={`relative w-full h-screen overflow-hidden select-none ${filterMode === 'retro80s' ? 'contrast-125 saturate-150' : ''}`}>
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

      {filterMode === 'retro80s' && (
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40 z-20" />
      )}

      {/* Top HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-rose-500/30 shadow-lg">
            <span className="text-rose-500 font-black text-sm">❤️ HP</span>
            <div className="w-28 sm:w-36 h-3 bg-slate-800 rounded-full overflow-hidden border border-rose-500/20">
              <div
                className="h-full bg-gradient-to-r from-rose-600 to-pink-500 transition-all duration-200"
                style={{ width: `${Math.max(0, health)}%` }}
              />
            </div>
            <span className="text-white font-black text-xs tabular-nums">{health}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-cyan-500/30 shadow-lg">
            <Shield className="w-4 h-4 text-cyan-400" />
            <div className="w-28 sm:w-36 h-3 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/20">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-200"
                style={{ width: `${Math.max(0, armor)}%` }}
              />
            </div>
            <span className="text-white font-black text-xs tabular-nums">{armor}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-emerald-400/40 shadow-lg text-emerald-400 font-black text-lg">
            <DollarSign className="w-5 h-5" />
            <span>{cash.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-xl transition-all ${
                  wantedLevel >= star
                    ? 'text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : 'text-slate-600'
                }`}
              >
                ★
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCheats(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white font-black text-xs border border-purple-400/40 shadow-md flex items-center gap-1"
            >
              <Key className="w-3.5 h-3.5" /> CHEATS
            </button>
            <button
              onClick={() => setFilterMode(filterMode === 'normal' ? 'retro80s' : 'normal')}
              className="px-3 py-1.5 rounded-xl bg-pink-600/80 hover:bg-pink-500 text-white font-black text-xs border border-pink-400/40 shadow-md"
            >
              {filterMode === 'normal' ? '80s CRT' : 'NORMAL'}
            </button>
            <button
              onClick={onBackToMenu}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-white/10"
            >
              MENU
            </button>
          </div>
        </div>
      </div>

      {/* Active Mission HUD Banner */}
      {activeMission && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-pink-500/50 shadow-2xl flex items-center gap-4 text-center pointer-events-auto">
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-pink-400">CURRENT MISSION</p>
            <h4 className="text-sm font-black text-white">{activeMission.title}</h4>
            <p className="text-xs text-slate-300">{activeMission.desc}</p>
          </div>
          <div className="pl-4 border-l border-white/10">
            <p className="text-[10px] font-bold text-slate-400">TIME LEFT</p>
            <p className={`text-xl font-black ${missionTimer < 15 ? 'text-rose-500 animate-ping' : 'text-amber-400'}`}>
              {missionTimer}s
            </p>
          </div>
        </div>
      )}

      {/* Mission Passed Banner */}
      {missionPassedBanner && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-purple-950 border-2 border-pink-400 shadow-[0_0_50px_rgba(244,114,182,0.5)] text-center animate-bounce">
            <p className="text-pink-400 font-extrabold text-sm tracking-widest mb-1">VICE CITY 1986</p>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 drop-shadow-md mb-2">
              MISSION PASSED!
            </h2>
            <p className="text-lg font-bold text-white mb-3">{missionPassedBanner.title}</p>
            <p className="text-2xl font-black text-emerald-400">+${missionPassedBanner.reward.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Speedometer */}
      {inVehicle && (
        <div className="absolute bottom-6 right-6 z-30 bg-slate-900/90 backdrop-blur-md p-4 rounded-3xl border border-cyan-400/40 shadow-2xl flex items-center gap-4 pointer-events-auto">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-cyan-300">{inVehicle.replace('_', ' ')}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white tabular-nums">{vehicleSpeed}</span>
              <span className="text-xs font-bold text-slate-400">MPH</span>
            </div>
            <div className="w-24 h-2 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full ${vehicleHealth > 50 ? 'bg-emerald-400' : vehicleHealth > 25 ? 'bg-amber-400' : 'bg-rose-500'}`}
                style={{ width: `${vehicleHealth}%` }}
              />
            </div>
          </div>
          <button
            onClick={handleEnterExitVehicle}
            className="p-3 rounded-2xl bg-rose-600/80 hover:bg-rose-500 text-white font-black text-xs flex flex-col items-center gap-1 shadow-lg"
          >
            <Car className="w-4 h-4" />
            <span>EXIT [F]</span>
          </button>
        </div>
      )}

      {/* Weapon Selector */}
      <div className="absolute top-24 right-4 z-30 flex flex-col gap-2 pointer-events-auto">
        {WEAPONS.map((w, idx) => {
          const isSelected = selectedWeaponIdx === idx;
          const count = ammo[w.id];
          return (
            <button
              key={w.id}
              onClick={() => {
                setSelectedWeaponIdx(idx);
                gameRef.current.selectedWeaponIdx = idx;
                soundFx.playClick();
              }}
              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-2xl border backdrop-blur-md transition-all active:scale-95 ${
                isSelected
                  ? 'bg-pink-500/20 text-pink-300 border-pink-400/60 shadow-lg shadow-pink-500/20'
                  : 'bg-slate-900/70 text-slate-400 border-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-lg">{w.icon}</span>
              <div className="text-right">
                <p className="text-[11px] font-extrabold leading-none">{w.name}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                  {w.id === 'fists' ? '∞' : count}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Radar Minimap */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-auto">
        <div className="relative w-36 h-36 rounded-full bg-slate-950/90 border-2 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
          <div className="absolute w-20 h-20 rounded-full border border-cyan-500/20" />
          <div className="absolute w-full h-[1px] bg-cyan-500/20" />
          <div className="absolute h-full w-[1px] bg-cyan-500/20" />

          <div
            className="w-3 h-3 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400 z-10"
            style={{ transform: `rotate(${-minimapBlips.player.angle}rad)` }}
          />

          {minimapBlips.cops.map((c, i) => {
            const dx = (c.x - minimapBlips.player.x) * 0.7;
            const dz = (c.z - minimapBlips.player.z) * 0.7;
            if (Math.hypot(dx, dz) > 60) return null;
            return (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"
                style={{ transform: `translate(${dx}px, ${dz}px)` }}
              />
            );
          })}

          {minimapBlips.missions.map((m, i) => {
            const dx = (m.x - minimapBlips.player.x) * 0.7;
            const dz = (m.z - minimapBlips.player.z) * 0.7;
            return (
              <div
                key={i}
                className="absolute w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_8px_#ec4899]"
                style={{ transform: `translate(${dx}px, ${dz}px)` }}
              />
            );
          })}
        </div>
      </div>

      {/* Radio Controls */}
      <div className="absolute bottom-6 left-48 z-30 hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 shadow-lg pointer-events-auto">
        <Radio className="w-4 h-4 text-pink-400" />
        <span className="text-xs font-bold text-slate-300">RADIO:</span>
        {['flashFm', 'wave103', 'vRock', 'off'].map((st) => (
          <button
            key={st}
            onClick={() => handleToggleRadio(st)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase transition-all ${
              currentStation === st
                ? 'bg-pink-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {st === 'flashFm' ? 'Flash FM' : st === 'wave103' ? 'Wave 103' : st === 'vRock' ? 'V-Rock' : 'OFF'}
          </button>
        ))}
      </div>

      {/* Mobile Touch Action Controls */}
      <div className="absolute bottom-6 right-6 z-30 flex gap-3 pointer-events-auto md:hidden">
        <button
          onClick={handleEnterExitVehicle}
          className="w-14 h-14 rounded-2xl bg-blue-600/90 active:scale-95 text-white flex flex-col items-center justify-center font-bold text-[10px] shadow-lg border border-blue-300/40"
        >
          <Car className="w-5 h-5 mb-0.5" />
          CAR
        </button>

        <button
          onClick={handleAttack}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 active:scale-95 text-white flex flex-col items-center justify-center font-black text-xs shadow-xl border-2 border-white/40"
        >
          <Zap className="w-6 h-6 mb-0.5" />
          ATTACK
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md border border-cyan-400/50 px-5 py-2.5 rounded-2xl text-cyan-300 font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ammu-Nation Modal */}
      {showAmmuNation && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-slate-900 rounded-3xl border-2 border-rose-500/50 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAmmuNation(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="w-6 h-6 text-rose-400" />
              <div>
                <h3 className="text-xl font-black text-white">AMMU-NATION</h3>
                <p className="text-xs text-slate-400">Stock up on firepower and armor</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <div>
                    <p className="text-sm font-bold text-white">Heavy Body Armor</p>
                    <p className="text-xs text-slate-400">100% Armor Protection</p>
                  </div>
                </div>
                <button
                  onClick={() => handleBuyItem('armor')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl"
                >
                  $200
                </button>
              </div>

              {WEAPONS.filter((w) => w.id !== 'fists').map((w) => (
                <div key={w.id} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{w.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{w.name}</p>
                      <p className="text-xs text-slate-400">+{w.maxAmmo} Rounds</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyItem(w.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl"
                  >
                    ${w.cost}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAmmuNation(false)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl"
            >
              EXIT SHOP
            </button>
          </div>
        </div>
      )}

      {/* Cheats Modal */}
      {showCheats && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-slate-900 rounded-3xl border-2 border-purple-500/50 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCheats(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-purple-400" />
              <div>
                <h3 className="text-xl font-black text-white">VICE CITY CHEATS</h3>
                <p className="text-xs text-slate-400">Enter classic 80s codes or tap below</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={cheatInput}
                onChange={(e) => setCheatInput(e.target.value)}
                placeholder="Type cheat code..."
                className="flex-1 bg-slate-800 border border-white/20 px-3.5 py-2 rounded-xl text-sm font-mono text-white outline-none focus:border-purple-400 uppercase"
              />
              <button
                onClick={() => applyCheat(cheatInput)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl"
              >
                APPLY
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 max-h-60 overflow-y-auto">
              {CHEAT_CODES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => applyCheat(c.code)}
                  className="p-2.5 bg-slate-800/80 hover:bg-purple-900/40 text-left rounded-xl border border-white/10 hover:border-purple-400/50 transition-all text-xs"
                >
                  <p className="font-mono font-black text-purple-300">{c.code}</p>
                  <p className="text-[10px] text-slate-400">{c.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCheats(false)}
              className="w-full py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border-2 border-rose-500/60 shadow-2xl">
            <h2 className="text-4xl font-black text-rose-500 tracking-wider mb-2">WASTED</h2>
            <p className="text-sm text-slate-400 mb-6">You got taken down on the streets of Vice City!</p>
            <div className="bg-slate-800/80 p-4 rounded-2xl mb-6">
              <p className="text-xs text-slate-400">FINAL CASH EARNED</p>
              <p className="text-3xl font-black text-emerald-400">${cash.toLocaleString()}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setHealth(100);
                  setArmor(100);
                  setWantedLevel(0);
                  gameRef.current.health = 100;
                  gameRef.current.armor = 100;
                  gameRef.current.wantedLevel = 0;
                  gameRef.current.playerPos.set(0, 0.9, 0);
                  setGameState('playing');
                }}
                className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-sm rounded-2xl shadow-lg"
              >
                RESPAWN
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
          <div className="max-w-lg w-full p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 border-2 border-pink-400/50 shadow-[0_0_50px_rgba(244,114,182,0.3)]">
            <div className="inline-block px-4 py-1.5 rounded-full bg-pink-500/20 text-pink-300 font-black text-xs border border-pink-400/40 mb-3 tracking-widest">
              🌴 1986 OPEN WORLD 3D 🌴
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 mb-3 drop-shadow-lg">
              VICE CITY 3D
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
              Step into the neon sun of Miami 1986! Steal supercars, bikes, and tanks. Evade a 5-star police wanted system, complete contracts, blast heavy weapons, and tune into 80s synth radio!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-left text-xs bg-slate-900/60 p-4 rounded-2xl border border-white/10">
              <div>
                <p className="text-slate-400 font-bold mb-1">🎮 CONTROLS:</p>
                <p className="text-white font-medium">• WASD / Arrows: Move & Steer</p>
                <p className="text-white font-medium">• F / Enter: Hijack & Exit Car</p>
                <p className="text-white font-medium">• Space: Handbrake & Jump</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold mb-1">🔫 COMBAT & SOUND:</p>
                <p className="text-white font-medium">• Left Click / Ctrl: Shoot / Punch</p>
                <p className="text-white font-medium">• 1 to 5: Switch Weapons</p>
                <p className="text-white font-medium">• R: Toggle 80s Radio</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setGameState('playing');
                }}
                className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-cyan-500 hover:brightness-110 text-white font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                ENTER VICE CITY
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
