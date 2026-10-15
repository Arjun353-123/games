import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Play, RotateCcw, Volume2, VolumeX, Shield, Zap, Trophy,
  Flame, Radio, Crosshair, Car, Navigation, DollarSign,
  AlertTriangle, CheckCircle, Sparkles, Key, ShoppingBag, X,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Eye, Sun, Moon,
  Sunset, Compass, Target, Dumbbell, UtensilsCrossed, Gauge
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { saveHighScore } from '../utils/storage';
import confetti from 'canvas-confetti';

// Real World GTA Weapons
const WEAPONS = [
  { id: 'fists', name: 'Fists / Unarmed', icon: '👊', damage: 25, range: 3.5, fireRate: 350, maxAmmo: Infinity, cost: 0 },
  { id: 'pistol', name: 'Combat Pistol 9mm', icon: '🔫', damage: 45, range: 60, fireRate: 250, maxAmmo: 250, cost: 250 },
  { id: 'uzi', name: 'Micro SMG', icon: '⚡', damage: 28, range: 50, fireRate: 90, maxAmmo: 400, cost: 650 },
  { id: 'm4', name: 'Carbine Rifle (M4)', icon: '🎯', damage: 55, range: 85, fireRate: 120, maxAmmo: 300, cost: 1600 },
  { id: 'shotgun', name: 'Pump Shotgun', icon: '💥', damage: 120, range: 35, fireRate: 750, maxAmmo: 80, cost: 1200 },
  { id: 'sniper', name: 'Heavy Sniper Rifle', icon: '🔭', damage: 260, range: 220, fireRate: 1200, maxAmmo: 40, cost: 3000, hasScope: true },
  { id: 'rpg', name: 'RPG-7 Rocket Launcher', icon: '🚀', damage: 450, range: 120, fireRate: 1600, maxAmmo: 20, cost: 4500 },
  { id: 'grenade', name: 'Sticky Bomb / Grenade', icon: '💣', damage: 350, range: 40, fireRate: 900, maxAmmo: 25, cost: 1000 },
];

// Interactive Map Locations
const LOCATIONS = {
  gym: { x: 48, z: -45, name: 'Los Santos Gym & Fitness', label: 'GYM', icon: '🏋️', color: '#eab308' },
  food: { x: 48, z: 45, name: 'Burger Shot Restaurant', label: 'FOOD', icon: '🍔', color: '#f97316' },
  gunShop: { x: -48, z: -35, name: 'Ammu-Nation Gun Store', label: 'GUN SHOP', icon: '🔫', color: '#ef4444' },
  customs: { x: -25, z: -85, name: 'Los Santos Customs', label: 'CUSTOMS', icon: '🔧', color: '#f59e0b' },
  bank: { x: -45, z: 0, name: 'Bank of Los Santos', label: 'BANK', icon: '🏦', color: '#10b981' },
  safehouse: { x: -35, z: 120, name: 'Vinewood Safehouse Mansion', label: 'MANSION', icon: '🏠', color: '#06b6d4' },
  helipad: { x: 0, z: -75, name: 'Downtown Helipad', label: 'HELIPAD', icon: '🚁', color: '#8b5cf6' },
};

// GTA Missions with Real Cash Prizes
const MISSIONS = [
  {
    id: 1,
    title: 'The Union Depository Bank Job',
    subtitle: 'High Stakes Heist',
    desc: 'Head to the Bank of Los Santos, grab the $50,000 cash duffel bag, escape the police pursuit, and deliver the loot to the Vinewood Mansion!',
    prize: 50000,
    timeLimit: 95,
    type: 'heist',
    target: { x: -45, z: 0, name: 'Bank of Los Santos' },
    escapeTo: { x: -35, z: 120, name: 'Vinewood Mansion' },
  },
  {
    id: 2,
    title: 'Burger Shot Express Delivery',
    subtitle: 'Fast Food Rush',
    desc: 'Pick up the VIP hot meal order from Burger Shot and rush it to the Vinewood Mansion within 50 seconds!',
    prize: 15000,
    timeLimit: 50,
    type: 'food_delivery',
    target: { x: 48, z: 45, name: 'Burger Shot' },
    escapeTo: { x: -35, z: 120, name: 'Vinewood Mansion' },
  },
  {
    id: 3,
    title: 'Muscle Gym Turf Defense',
    subtitle: 'Street Gang Showdown',
    desc: 'A rival street syndicate is attacking the Los Santos Gym! Head there and eliminate all 6 armed syndicate rivals!',
    prize: 25000,
    timeLimit: 75,
    type: 'gym_defense',
    target: { x: 48, z: -45, name: 'Los Santos Gym' },
    targetCount: 6,
  },
  {
    id: 4,
    title: 'Vinewood Midnight Supercar Drag',
    subtitle: 'Freeway Circuit Race',
    desc: 'Push your vehicle to the limit through 8 highway checkpoints across Los Santos in under 55 seconds!',
    prize: 30000,
    timeLimit: 55,
    type: 'race',
    targetCount: 8,
  },
  {
    id: 5,
    title: 'Airborne Maverick Strike',
    subtitle: 'Helicopter Convoy Assault',
    desc: 'Pilot the Maverick Helicopter at the helipad and destroy 4 syndicate target vehicles using airborne missile strikes!',
    prize: 60000,
    timeLimit: 85,
    type: 'heli_strike',
    targetCount: 4,
  },
];

const CHEATS = [
  { code: 'TURTLE', desc: '100% Health & Body Armor' },
  { code: 'TOOLUP', desc: 'All Weapons & Maximum Ammo' },
  { code: 'COMET', desc: 'Spawn Zentorno Supercar' },
  { code: 'ROCKET', desc: 'Spawn Pegassi Bati Superbike' },
  { code: 'FLYBOY', desc: 'Spawn Attack Helicopter' },
  { code: 'PANZER', desc: 'Spawn Military Rhino Tank' },
  { code: 'MONEY', desc: 'Add +$100,000 Cash' },
  { code: 'LAWYERUP', desc: 'Clear Police Wanted Stars' },
  { code: 'FUGITIVE', desc: 'Instant 5-Star Wanted Level' },
  { code: 'DAY', desc: 'Clear Sunny Daylight' },
  { code: 'NIGHT', desc: 'Nocturnal City Night' },
];

// GTA V–style District Zones (Updates HUD as you explore)
const DISTRICTS = [
  { name: 'Maze Bank Arena', street: 'Olympic Fwy', xMin: -60, xMax: 60, zMin: -100, zMax: -50 },
  { name: 'Rockford Hills', street: 'Rockford Dr', xMin: -80, xMax: -20, zMin: -80, zMax: -30 },
  { name: 'Del Perro Beach', street: 'Del Perro Freeway', xMin: 20, xMax: 80, zMin: -80, zMax: -30 },
  { name: 'Little Seoul', street: 'Calais Ave', xMin: -80, xMax: -20, zMin: -30, zMax: 30 },
  { name: 'Downtown Vinewood', street: 'Alta St', xMin: 20, xMax: 80, zMin: -30, zMax: 30 },
  { name: 'Chamberlain Hills', street: 'Jamestown St', xMin: -80, xMax: -20, zMin: 30, zMax: 100 },
  { name: 'Vinewood Hills', street: 'Vinewood Blvd', xMin: 20, xMax: 80, zMin: 30, zMax: 100 },
  { name: 'La Mesa', street: 'Dutch London St', xMin: -80, xMax: 80, zMin: 100, zMax: 160 },
  { name: 'Davis', street: 'Capital Blvd', xMin: -80, xMax: 80, zMin: -200, zMax: -100 },
];

const getDistrict = (x, z) => {
  for (const d of DISTRICTS) {
    if (x >= d.xMin && x <= d.xMax && z >= d.zMin && z <= d.zMax) {
      return d;
    }
  }
  return { name: 'Los Santos', street: 'Downtown Blvd' };
};

export default function ViceCity3D({ isKidsMode = false, onBackToMenu, highScore = 0, onScoreUpdate }) {
  const mountRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover'
  const [health, setHealth] = useState(100);
  const [armor, setArmor] = useState(100);
  const [stamina, setStamina] = useState(100);
  const [cash, setCash] = useState(5000);
  const [wantedLevel, setWantedLevel] = useState(0); // 0 to 5
  const [selectedWeaponIdx, setSelectedWeaponIdx] = useState(1); // default pistol
  const [ammo, setAmmo] = useState({ fists: Infinity, pistol: 150, uzi: 250, m4: 200, shotgun: 50, sniper: 25, rpg: 10, grenade: 15 });
  const [inVehicle, setInVehicle] = useState(null); // 'supercar', 'superbike', etc.
  const [vehicleHealth, setVehicleHealth] = useState(100);
  const [vehicleSpeed, setVehicleSpeed] = useState(0);
  const [vehicleGear, setVehicleGear] = useState('N');
  const [vehicleRpm, setVehicleRpm] = useState(1000);
  const [nitroAmount, setNitroAmount] = useState(100);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [cameraMode, setCameraMode] = useState('third'); // 'third', 'cockpit', 'hood', 'far'
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [currentDistrict, setCurrentDistrict] = useState({ name: 'Downtown Vinewood', street: 'Alta St' });
  const [currentStation, setCurrentStation] = useState('radioLosSantos');
  const [isAiming, setIsAiming] = useState(false);
  const [activeMission, setActiveMission] = useState(null);
  const [missionTimer, setMissionTimer] = useState(0);
  const [missionProgress, setMissionProgress] = useState(0);
  const [missionPassedBanner, setMissionPassedBanner] = useState(null);
  const [activePrompt, setActivePrompt] = useState(null);
  const [showAmmuNation, setShowAmmuNation] = useState(false);
  const [showCheats, setShowCheats] = useState(false);
  const [cheatInput, setCheatInput] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [gameClock, setGameClock] = useState('14:30');
  const [minimapBlips, setMinimapBlips] = useState({
    player: { x: 31, z: 0, angle: 0 },
    cops: [],
    missions: [{ x: -45, z: 0 }],
  });

  const gameRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    playerMesh: null,
    gunMesh: null,
    playerPos: new THREE.Vector3(31, 0.9, 0),
    playerRotY: 0,
    isSprinting: false,
    stamina: 100,
    isJumping: false,
    jumpVelocity: 0,
    health: 100,
    armor: 100,
    cash: 5000,
    wantedLevel: 0,
    wantedTimer: 0,
    lastFireTime: 0,
    selectedWeaponIdx: 1,
    ammo: { fists: Infinity, pistol: 150, uzi: 250, m4: 200, shotgun: 50, sniper: 25, rpg: 10, grenade: 15 },
    currentVehicle: null,
    cameraMode: 'third',
    timeOfDay: 'day',
    isAiming: false,
    nitro: 100,
    isNitroActive: false,
    vehicles: [],
    helicopters: [],
    pedestrians: [],
    policeOfficers: [],
    bullets: [],
    rockets: [],
    explosions: [],
    pickups: [],
    particles: [],
    buildings: [],
    checkpoints: [],
    keysPressed: {},
    driveControls: { gas: false, brake: false, left: false, right: false, nitro: false, handbrake: false },
    lastSpeedMPH: 0,
    lastGear: 'N',
    cameraPitch: 0.22,
    cameraYaw: 0,
    activeMission: null,
    missionTimer: 0,
    missionProgress: 0,
    missionTargetCount: 0,
    station: 'radioLosSantos',
    sunLight: null,
    hemiLight: null,
    streetLamps: [],
    beaconMesh: null,
    npcCars: [],
  });

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Update Environment Lighting
  const updateEnvironmentLighting = useCallback((timeMode) => {
    const g = gameRef.current;
    if (!g.scene || !g.sunLight || !g.hemiLight) return;
    setTimeOfDay(timeMode);
    g.timeOfDay = timeMode;

    if (timeMode === 'day') {
      g.scene.background = new THREE.Color(0x6eb5f0);
      g.scene.fog = new THREE.FogExp2(0x8bc0f0, 0.005);
      g.sunLight.color.setHex(0xfffae8);
      g.sunLight.intensity = 2.0;
      g.sunLight.position.set(90, 110, -60);
      g.hemiLight.color.setHex(0xd0e8ff);
      g.hemiLight.groundColor.setHex(0x555544);
      g.hemiLight.intensity = 1.2;
      setGameClock('14:30');
      g.streetLamps.forEach((lamp) => {
        if (lamp.light) lamp.light.intensity = 0;
      });
    } else if (timeMode === 'sunset') {
      g.scene.background = new THREE.Color(0xd95d2c);
      g.scene.fog = new THREE.FogExp2(0xd66838, 0.006);
      g.sunLight.color.setHex(0xff7733);
      g.sunLight.intensity = 1.8;
      g.sunLight.position.set(120, 40, -80);
      g.hemiLight.color.setHex(0xff9966);
      g.hemiLight.groundColor.setHex(0x332222);
      g.hemiLight.intensity = 1.0;
      setGameClock('19:40');
      g.streetLamps.forEach((lamp) => {
        if (lamp.light) lamp.light.intensity = 0.8;
      });
    } else {
      g.scene.background = new THREE.Color(0x060914);
      g.scene.fog = new THREE.FogExp2(0x0a1020, 0.008);
      g.sunLight.color.setHex(0x224477);
      g.sunLight.intensity = 0.5;
      g.sunLight.position.set(40, 80, -40);
      g.hemiLight.color.setHex(0x1a2544);
      g.hemiLight.groundColor.setHex(0x0a0c14);
      g.hemiLight.intensity = 0.6;
      setGameClock('01:15');
      g.streetLamps.forEach((lamp) => {
        if (lamp.light) lamp.light.intensity = 2.0;
      });
    }
  }, []);

  // Update visible 3D gun attached to player's hand
  const updatePlayerGunMesh = useCallback((weaponIdx) => {
    const g = gameRef.current;
    if (!g.playerMesh) return;

    if (g.gunMesh) {
      g.playerMesh.remove(g.gunMesh);
      g.gunMesh = null;
    }

    const weapon = WEAPONS[weaponIdx];
    if (weapon.id === 'fists') return;

    const gunGroup = new THREE.Group();
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, metalness: 0.9, roughness: 0.2 });

    if (weapon.id === 'pistol') {
      const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.38), gunMat);
      barrel.position.set(0, 0, -0.15);
      gunGroup.add(barrel);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.12), gunMat);
      grip.position.set(0, -0.12, 0);
      grip.rotation.x = 0.2;
      gunGroup.add(grip);
    } else if (weapon.id === 'm4' || weapon.id === 'sniper' || weapon.id === 'shotgun') {
      const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.9), gunMat);
      barrel.position.set(0, 0, -0.35);
      gunGroup.add(barrel);
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.35), gunMat);
      stock.position.set(0, -0.05, 0.2);
      gunGroup.add(stock);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.12), gunMat);
      mag.position.set(0, -0.18, -0.15);
      gunGroup.add(mag);
      if (weapon.id === 'sniper') {
        const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8), gunMat);
        scope.rotation.x = Math.PI / 2;
        scope.position.set(0, 0.14, -0.2);
        gunGroup.add(scope);
      }
    } else if (weapon.id === 'rpg') {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8), gunMat);
      tube.rotation.x = Math.PI / 2;
      tube.position.set(0, 0.1, -0.2);
      gunGroup.add(tube);
    } else if (weapon.id === 'grenade') {
      const grenade = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0x334422 }));
      grenade.position.set(0, 0, 0);
      gunGroup.add(grenade);
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.45), gunMat);
      body.position.set(0, 0, -0.15);
      gunGroup.add(body);
    }

    gunGroup.position.set(0.5, 0.85, -0.3);
    g.playerMesh.add(gunGroup);
    g.gunMesh = gunGroup;
  }, []);

  // Complete Active Mission & Award Prize Money
  const completeMission = useCallback(() => {
    const g = gameRef.current;
    const mission = g.activeMission;
    if (!mission) return;

    soundFx.playMissionPassed();
    confetti({ particleCount: 140, spread: 85, origin: { y: 0.6 } });

    const newCash = g.cash + mission.prize;
    g.cash = newCash;
    setCash(newCash);
    saveHighScore('viceCity', newCash);
    if (onScoreUpdate) onScoreUpdate(newCash);

    setMissionPassedBanner({
      title: mission.title,
      subtitle: mission.subtitle,
      prize: mission.prize,
    });

    g.checkpoints.forEach((cp) => g.scene.remove(cp.mesh));
    g.checkpoints = [];

    if (g.beaconMesh) {
      g.scene.remove(g.beaconMesh);
      g.beaconMesh = null;
    }

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
    showToast(`MISSION: ${mission.title} (PRIZE: $${mission.prize.toLocaleString()})`);

    if (g.beaconMesh) g.scene.remove(g.beaconMesh);
    const beaconGeo = new THREE.CylinderGeometry(0.8, 0.8, 60, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.45 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    const targetLoc = mission.target || { x: 0, z: 0 };
    beacon.position.set(targetLoc.x, 30, targetLoc.z);
    g.scene.add(beacon);
    g.beaconMesh = beacon;

    if (mission.type === 'heist') {
      g.wantedLevel = 3;
      setWantedLevel(3);
      soundFx.playPoliceChatter && soundFx.playPoliceChatter();
      g.missionTargetCount = 1;
    } else if (mission.type === 'race') {
      g.missionTargetCount = mission.targetCount;
      createRaceCheckpoints(g.scene);
    } else if (mission.type === 'gym_defense') {
      g.missionTargetCount = mission.targetCount;
      spawnGangSyndicate(g.scene, LOCATIONS.gym.x, LOCATIONS.gym.z);
    } else if (mission.type === 'heli_strike') {
      g.missionTargetCount = mission.targetCount;
    }
  }, [showToast]);

  const createRaceCheckpoints = (scene) => {
    const g = gameRef.current;
    g.checkpoints.forEach((cp) => scene.remove(cp.mesh));
    g.checkpoints = [];

    const coords = [
      { x: 35, z: -20 },
      { x: 35, z: 30 },
      { x: 10, z: 40 },
      { x: -35, z: 40 },
      { x: -35, z: -20 },
      { x: -10, z: -60 },
      { x: 35, z: -60 },
      { x: 35, z: 0 },
    ];

    coords.forEach((coord, i) => {
      const ringGeo = new THREE.TorusGeometry(3.4, 0.4, 12, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: i === 0 ? 0xffcc00 : 0x00ffff, wireframe: true });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(coord.x, 2.5, coord.z);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      g.checkpoints.push({ mesh: ring, x: coord.x, z: coord.z, index: i });
    });
  };

  const spawnGangSyndicate = (scene, px, pz) => {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = px + Math.cos(angle) * (14 + Math.random() * 8);
      const z = pz + Math.sin(angle) * (14 + Math.random() * 8);
      spawnPedestrian(scene, x, z, true);
    }
  };

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
      createExplosion(g.scene, veh.mesh.position.x, veh.mesh.position.y + 0.6, veh.mesh.position.z);
      if (veh.bodyMesh && veh.bodyMesh.material) {
        veh.bodyMesh.material.color.setHex(0x181818);
      }

      if (veh === g.currentVehicle) {
        g.health = 0;
        setHealth(0);
        setGameState('gameover');
      }

      if (g.activeMission?.type === 'heli_strike') {
        g.missionProgress += 1;
        setMissionProgress(g.missionProgress);
        if (g.missionProgress >= g.missionTargetCount) {
          completeMission();
        }
      }
    }
  }, []);

  // Enter / Exit Vehicle
  const handleEnterExitVehicle = useCallback(() => {
    const g = gameRef.current;
    if (g.currentVehicle) {
      const veh = g.currentVehicle;
      veh.speed = 0;
      soundFx.stopEngineSound && soundFx.stopEngineSound();
      g.playerPos.set(veh.mesh.position.x - 2.8, 0.9, veh.mesh.position.z);
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
      let nearestVeh = null;
      let minDistance = 7.0;

      g.vehicles.forEach((car) => {
        const d = g.playerPos.distanceTo(car.mesh.position);
        if (d < minDistance && car.health > 0) {
          minDistance = d;
          nearestVeh = car;
        }
      });

      g.helicopters.forEach((heli) => {
        const d = g.playerPos.distanceTo(heli.mesh.position);
        if (d < minDistance && heli.health > 0) {
          minDistance = d;
          nearestVeh = heli;
        }
      });

      if (nearestVeh) {
        g.currentVehicle = nearestVeh;
        setInVehicle(nearestVeh.type);
        setVehicleHealth(Math.round(nearestVeh.health));
        if (g.playerMesh) {
          if (nearestVeh.isBike) {
            g.playerMesh.visible = true;
            g.playerMesh.position.set(0, 0.65, 0);
          } else {
            g.playerMesh.visible = false;
          }
        }
        soundFx.playClick();
        showToast(`ENTERED ${nearestVeh.name.toUpperCase()} · READY TO DRIVE`);

        if (nearestVeh.isPolice) {
          g.wantedLevel = Math.max(g.wantedLevel, 1.5);
          setWantedLevel(Math.floor(g.wantedLevel));
          soundFx.playPoliceChatter && soundFx.playPoliceChatter();
        }
      }
    }
  }, [showToast]);

  // Player Fire / Shoot Gun at Person
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
      g.wantedLevel = Math.min(5, g.wantedLevel + 0.12);
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

  const checkMeleeHit = (g) => {
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.playerRotY);
    const hitPos = g.playerPos.clone().add(forward.multiplyScalar(2.2));

    g.pedestrians.forEach((ped) => {
      if (ped.alive && ped.mesh.position.distanceTo(hitPos) < 2.5) {
        ped.health -= 45;
        ped.mesh.position.add(forward.clone().multiplyScalar(1.2));
        if (ped.health <= 0) killPedestrian(g, ped);
      }
    });

    g.policeOfficers.forEach((cop) => {
      if (cop.alive && cop.mesh.position.distanceTo(hitPos) < 2.5) {
        cop.health -= 45;
        g.wantedLevel = Math.max(g.wantedLevel, 2);
        setWantedLevel(Math.floor(g.wantedLevel));
        if (cop.health <= 0) killCop(g, cop);
      }
    });
  };

  const fireBullet = (g, weapon) => {
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.playerRotY);
    const origin = g.playerPos.clone().add(new THREE.Vector3(0, 1.25, 0));

    const flashLight = new THREE.PointLight(0xffea66, 4, 12);
    flashLight.position.copy(origin).add(forward.clone().multiplyScalar(0.9));
    g.scene.add(flashLight);
    setTimeout(() => g.scene.remove(flashLight), 50);

    const geom = new THREE.BufferGeometry().setFromPoints([
      origin,
      origin.clone().add(forward.clone().multiplyScalar(weapon.range))
    ]);
    const mat = new THREE.LineBasicMaterial({ color: 0xfff066, linewidth: 2 });
    const tracer = new THREE.Line(geom, mat);
    g.scene.add(tracer);
    setTimeout(() => g.scene.remove(tracer), 60);

    g.pedestrians.forEach((ped) => {
      if (ped.alive && ped.mesh.position.distanceTo(origin) < weapon.range) {
        const toPed = ped.mesh.position.clone().sub(origin).normalize();
        if (forward.dot(toPed) > 0.88) {
          ped.health -= weapon.damage;
          showToast(`HIT TARGET: -${weapon.damage} HP`);
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

  const fireRocket = (g) => {
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.playerRotY);
    const startPos = g.playerPos.clone().add(new THREE.Vector3(0, 1.25, 0));

    const rocketGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.0, 8);
    const rocketMat = new THREE.MeshStandardMaterial({ color: 0x334433 });
    const rocketMesh = new THREE.Mesh(rocketGeo, rocketMat);
    rocketMesh.position.copy(startPos);
    rocketMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), forward);
    g.scene.add(rocketMesh);

    g.rockets.push({
      mesh: rocketMesh,
      pos: startPos,
      vel: forward.clone().multiplyScalar(1.6),
      life: 90,
    });
  };

  const killPedestrian = (g, ped) => {
    ped.alive = false;
    ped.mesh.rotation.x = Math.PI / 2;
    ped.mesh.position.y = 0.2;

    const cashDrop = 80 + Math.floor(Math.random() * 120);
    spawnCashDrop(g.scene, ped.mesh.position.x, ped.mesh.position.z, cashDrop);
    g.wantedLevel = Math.min(5, g.wantedLevel + 0.35);
    setWantedLevel(Math.floor(g.wantedLevel));

    if (g.activeMission?.type === 'gym_defense' && ped.isGang) {
      g.missionProgress += 1;
      setMissionProgress(g.missionProgress);
      if (g.missionProgress >= g.missionTargetCount) {
        completeMission();
      }
    }
  };

  const killCop = (g, cop) => {
    cop.alive = false;
    cop.mesh.rotation.x = Math.PI / 2;
    cop.mesh.position.y = 0.2;
    spawnCashDrop(g.scene, cop.mesh.position.x, cop.mesh.position.z, 220 + Math.floor(Math.random() * 150));
    g.wantedLevel = Math.min(5, g.wantedLevel + 0.8);
    setWantedLevel(Math.floor(g.wantedLevel));
  };

  const createExplosion = (scene, x, y, z) => {
    const g = gameRef.current;
    const blastGeo = new THREE.SphereGeometry(3.8, 14, 14);
    const blastMat = new THREE.MeshBasicMaterial({ color: 0xffaa11, wireframe: true });
    const blast = new THREE.Mesh(blastGeo, blastMat);
    blast.position.set(x, y + 1, z);
    scene.add(blast);

    const light = new THREE.PointLight(0xff5500, 5, 25);
    light.position.set(x, y + 2, z);
    scene.add(light);
    setTimeout(() => scene.remove(light), 150);

    g.explosions.push({ mesh: blast, scale: 1, maxScale: 3.5, alpha: 1 });

    const origin = new THREE.Vector3(x, y, z);
    g.pedestrians.forEach((p) => {
      if (p.alive && p.mesh.position.distanceTo(origin) < 8) killPedestrian(g, p);
    });
    g.policeOfficers.forEach((cop) => {
      if (cop.alive && cop.mesh.position.distanceTo(origin) < 8) killCop(g, cop);
    });
  };

  const spawnCashDrop = (scene, x, z, value) => {
    const g = gameRef.current;
    const geo = new THREE.BoxGeometry(0.8, 0.2, 0.4);
    const mat = new THREE.MeshStandardMaterial({ color: 0x00cc66 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0.35, z);
    scene.add(mesh);
    g.pickups.push({ mesh, value, x, z });
  };

  const applyCheat = useCallback((cheatStr) => {
    const code = cheatStr.trim().toUpperCase();
    const g = gameRef.current;
    soundFx.playPowerup();

    switch (code) {
      case 'TURTLE':
        g.health = 100;
        g.armor = 100;
        setHealth(100);
        setArmor(100);
        showToast('CHEAT: FULL HEALTH & BODY ARMOR');
        break;
      case 'TOOLUP':
        g.ammo = { fists: Infinity, pistol: 999, uzi: 999, m4: 999, shotgun: 999, sniper: 99, rpg: 99, grenade: 99 };
        setAmmo({ ...g.ammo });
        showToast('CHEAT: ALL WEAPONS & MAX AMMO');
        break;
      case 'MONEY':
        g.cash += 100000;
        setCash(g.cash);
        showToast('CHEAT: +$100,000 CASH ADDED');
        break;
      case 'COMET':
        spawnSupercar(g.scene, g.playerPos.x + 5, g.playerPos.z + 5, 0x1144ee);
        showToast('CHEAT: ZENTORNO SUPERCAR SPAWNED');
        break;
      case 'ROCKET':
        spawnSuperbike(g.scene, g.playerPos.x + 4, g.playerPos.z + 4);
        showToast('CHEAT: BATI 801 SUPERBIKE SPAWNED');
        break;
      case 'FLYBOY':
        spawnHelicopter(g.scene, g.playerPos.x + 8, g.playerPos.z + 8);
        showToast('CHEAT: ATTACK HELICOPTER SPAWNED');
        break;
      case 'PANZER':
        spawnRhinoTank(g.scene, g.playerPos.x + 8, g.playerPos.z + 8);
        showToast('CHEAT: RHINO MILITARY TANK SPAWNED');
        break;
      case 'LAWYERUP':
        g.wantedLevel = 0;
        setWantedLevel(0);
        showToast('CHEAT: POLICE HEAT WIPED');
        break;
      case 'FUGITIVE':
        g.wantedLevel = 5;
        setWantedLevel(5);
        showToast('CHEAT: 5-STAR WANTED LEVEL');
        break;
      case 'DAY':
        updateEnvironmentLighting('day');
        break;
      case 'NIGHT':
        updateEnvironmentLighting('night');
        break;
      default:
        showToast('UNKNOWN CHEAT CODE');
        return;
    }
    setCheatInput('');
  }, [showToast, updateEnvironmentLighting]);

  const handleToggleRadio = useCallback((stationName) => {
    soundFx.playClick();
    setCurrentStation(stationName);
    gameRef.current.station = stationName;
    soundFx.startViceCityRadio(stationName);
  }, []);

  const handleBuyItem = (itemType) => {
    const g = gameRef.current;
    if (itemType === 'armor') {
      if (g.cash >= 300) {
        g.cash -= 300;
        g.armor = 100;
        setCash(g.cash);
        setArmor(100);
        soundFx.playPowerup();
        showToast('PURCHASED BODY ARMOR (100%)');
      } else {
        showToast('NOT ENOUGH CASH ($300 NEEDED)');
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
      showToast(`PURCHASED ${weapon.name.toUpperCase()}`);
    } else {
      showToast(`NOT ENOUGH CASH ($${weapon.cost} NEEDED)`);
    }
  };

  const handleWorkoutAtGym = () => {
    soundFx.playPowerup();
    const g = gameRef.current;
    g.stamina = 100;
    setStamina(100);
    g.health = Math.min(100, g.health + 25);
    setHealth(g.health);
    showToast('WORKOUT COMPLETE! STAMINA & STRENGTH MAXIMIZED 🏋️');
  };

  const handleEatMeal = () => {
    const g = gameRef.current;
    if (g.cash >= 25) {
      g.cash -= 25;
      setCash(g.cash);
      g.health = 100;
      setHealth(100);
      soundFx.playCoin();
      showToast('MEAL PURCHASED! HEALTH RESTORED TO 100% 🍔');
    } else {
      showToast('NOT ENOUGH CASH ($25 NEEDED)');
    }
  };

  // Build Realistic Zentorno Supercar with Detailed 3D Parts, Wheels, Cockpit & Driver
  const spawnSupercar = (scene, x, z, color = 0xd91424) => {
    const g = gameRef.current;
    const carGroup = new THREE.Group();

    // Metallic Glossy Car Paint Material
    const carPaintMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.22,
      metalness: 0.88,
    });

    // Lower Chassis
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.52, 4.9), carPaintMat);
    lowerBody.position.y = 0.48;
    carGroup.add(lowerBody);

    // Front Aerodynamic Sloped Hood
    const hoodGeo = new THREE.BoxGeometry(2.25, 0.26, 1.85);
    const hood = new THREE.Mesh(hoodGeo, carPaintMat);
    hood.position.set(0, 0.74, -1.35);
    hood.rotation.x = 0.08;
    carGroup.add(hood);

    // Front Carbon Fiber Splitter
    const splitterMat = new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.4, metalness: 0.8 });
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.08, 0.6), splitterMat);
    splitter.position.set(0, 0.24, -2.48);
    carGroup.add(splitter);

    // Aerodynamic Curved Windshield Glass
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x050a12,
      roughness: 0.05,
      metalness: 0.95,
      transparent: true,
      opacity: 0.75,
    });
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 1.3), glassMat);
    windshield.position.set(0, 1.05, -0.45);
    windshield.rotation.x = -0.45;
    carGroup.add(windshield);

    // Roof & Rear Cockpit
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.45, 1.8), carPaintMat);
    roof.position.set(0, 1.25, 0.3);
    carGroup.add(roof);

    // Side Mirrors
    [-1.25, 1.25].forEach((mx) => {
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.18), splitterMat);
      mirror.position.set(mx, 0.98, -0.6);
      carGroup.add(mirror);
    });

    // Interior Cockpit & Center Console
    const dashMat = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.7 });
    const dashboard = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.7), dashMat);
    dashboard.position.set(0, 0.85, -0.6);
    carGroup.add(dashboard);

    // Cockpit Speedometer Glow Screen
    const dashScreenMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const dashScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.15), dashScreenMat);
    dashScreen.position.set(-0.45, 0.98, -0.26);
    dashScreen.rotation.x = -0.3;
    carGroup.add(dashScreen);

    // 3D Sports Steering Wheel Group (Rotates dynamically with steering!)
    const steeringWheelGroup = new THREE.Group();
    steeringWheelGroup.position.set(-0.45, 0.95, -0.28);
    steeringWheelGroup.rotation.x = -0.35;
    const wheelRingMat = new THREE.MeshStandardMaterial({ color: 0x1a1a20, roughness: 0.4, metalness: 0.6 });
    const wheelRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 8, 20), wheelRingMat);
    steeringWheelGroup.add(wheelRing);
    const centerCap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12), carPaintMat);
    centerCap.rotation.x = Math.PI / 2;
    steeringWheelGroup.add(centerCap);
    carGroup.add(steeringWheelGroup);

    // 3D Driver Character sitting in Driver Seat
    const driverGroup = new THREE.Group();
    const driverBodyMat = new THREE.MeshStandardMaterial({ color: 0x18202c, roughness: 0.6 });
    const driverBody = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.58, 0.35), driverBodyMat);
    driverBody.position.set(-0.45, 0.85, 0.2);
    driverGroup.add(driverBody);

    const driverHeadMat = new THREE.MeshStandardMaterial({ color: 0xdd1122, roughness: 0.3, metalness: 0.6 });
    const driverHead = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 12), driverHeadMat);
    driverHead.position.set(-0.45, 1.25, 0.18);
    driverGroup.add(driverHead);

    const visorMat = new THREE.MeshStandardMaterial({ color: 0xcca010, roughness: 0.1, metalness: 0.9 });
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.09, 0.15), visorMat);
    visor.position.set(-0.45, 1.25, 0.06);
    driverGroup.add(visor);

    // Driver Left & Right Arms gripping the steering wheel
    const armMat = new THREE.MeshStandardMaterial({ color: 0x222a38, roughness: 0.5 });
    [-0.18, 0.18].forEach((ax) => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.45), armMat);
      arm.position.set(-0.45 + ax, 0.9, -0.05);
      arm.rotation.x = 0.4;
      driverGroup.add(arm);
    });

    // Sport Racing Bucket Seats
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.8 });
    const driverSeat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.8, 0.5), seatMat);
    driverSeat.position.set(-0.45, 0.8, 0.35);
    driverGroup.add(driverSeat);

    const passSeat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.8, 0.5), seatMat);
    passSeat.position.set(0.45, 0.8, 0.35);
    carGroup.add(passSeat);

    carGroup.add(driverGroup);

    // Carbon Rear Wing Spoiler
    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.08, 0.55), splitterMat);
    spoiler.position.set(0, 1.35, 2.15);
    carGroup.add(spoiler);

    [-0.7, 0.7].forEach((sx) => {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.2), splitterMat);
      strut.position.set(sx, 1.15, 2.15);
      carGroup.add(strut);
    });

    // Dual Chrome Exhaust Pipes & Animated Flame Cones
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0xdde2ea, metalness: 0.95 });
    const exhausts = [];
    const exhaustFlames = [];

    [-0.5, 0.5].forEach((ex) => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 10), exhaustMat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(ex, 0.38, 2.44);
      carGroup.add(pipe);
      exhausts.push(pipe);

      // Blue Nitro / Backfire Flame Cone
      const flameGeo = new THREE.ConeGeometry(0.16, 0.95, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0x00d5ff, transparent: true, opacity: 0.85 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(ex, 0.38, 3.0);
      flame.visible = false;
      carGroup.add(flame);
      exhaustFlames.push(flame);
    });

    // 4 Realistic Wheels with Rims & Calipers
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });
    const caliperMat = new THREE.MeshStandardMaterial({ color: 0xee1111 });

    const wheels = [];
    const frontSteerGroups = [];

    const wheelPositions = [
      { x: -1.22, y: 0.42, z: -1.45, isFront: true },
      { x: 1.22, y: 0.42, z: -1.45, isFront: true },
      { x: -1.22, y: 0.42, z: 1.45, isFront: false },
      { x: 1.22, y: 0.42, z: 1.45, isFront: false },
    ];

    wheelPositions.forEach((wp) => {
      const pivotGroup = new THREE.Group();
      pivotGroup.position.set(wp.x, wp.y, wp.z);

      const wheelMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.36, 16), wheelMat);
      wheelMesh.rotation.z = Math.PI / 2;
      pivotGroup.add(wheelMesh);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.38, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      pivotGroup.add(rim);

      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.18), caliperMat);
      caliper.position.set(wp.x > 0 ? -0.12 : 0.12, 0.15, 0);
      pivotGroup.add(caliper);

      carGroup.add(pivotGroup);
      wheels.push(wheelMesh);
      if (wp.isFront) frontSteerGroups.push(pivotGroup);
    });

    // Xenon Headlights + Forward Light Beams
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headLights = [];

    [-0.8, 0.8].forEach((lx) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.15, 0.1), hlMat);
      hl.position.set(lx, 0.62, -2.43);
      carGroup.add(hl);

      // Realistic 3D Spotlight projecting beam on asphalt road
      const spot = new THREE.SpotLight(0xfffae8, 3.2, 70, Math.PI / 6, 0.45, 1.2);
      spot.position.set(lx, 0.65, -2.4);
      const targetObj = new THREE.Object3D();
      targetObj.position.set(lx, 0.1, -26);
      carGroup.add(targetObj);
      spot.target = targetObj;
      carGroup.add(spot);
      headLights.push(spot);
    });

    // Red LED Taillights (Brighten into brake lights!)
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xff1122 });
    const taillights = [];
    [-0.75, 0.75].forEach((lx) => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 0.1), tlMat);
      tl.position.set(lx, 0.68, 2.43);
      carGroup.add(tl);
      taillights.push(tl);
    });

    carGroup.position.set(x, 0, z);
    scene.add(carGroup);

    const carObj = {
      name: 'Pegassi Zentorno Supercar',
      type: 'supercar',
      mesh: carGroup,
      bodyMesh: lowerBody,
      wheels,
      frontSteerGroups,
      steeringWheel: steeringWheelGroup,
      driverMesh: driverGroup,
      taillights,
      exhausts,
      exhaustFlames,
      headLights,
      health: 200,
      exploded: false,
      speed: 0,
      maxSpeed: 2.35, // 165+ MPH, NOS -> 220+ MPH!
      accel: 0.068,   // High-torque fast acceleration!
      brakePower: 0.10,
      handling: 0.052,
      steerAngle: 0,
      gear: 'N',
      rpm: 1000,
      isPolice: false,
      isBike: false,
    };
    g.vehicles.push(carObj);
    return carObj;
  };

  // Build Superbike
  const spawnSuperbike = (scene, x, z) => {
    const g = gameRef.current;
    const bikeGroup = new THREE.Group();

    const frameMat = new THREE.MeshStandardMaterial({ color: 0xee2200, roughness: 0.25, metalness: 0.8 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 2.7), frameMat);
    frame.position.y = 0.7;
    bikeGroup.add(frame);

    const barMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.95, 8), barMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 1.25, -0.65);
    bikeGroup.add(bar);

    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const wheels = [];
    [
      [0, 0.44, -1.05],
      [0, 0.44, 1.05],
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.28, 16), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      bikeGroup.add(wheel);
      wheels.push(wheel);
    });

    bikeGroup.position.set(x, 0, z);
    scene.add(bikeGroup);

    const bikeObj = {
      name: 'Pegassi Bati 801 Superbike',
      type: 'superbike',
      mesh: bikeGroup,
      bodyMesh: frame,
      wheels,
      frontSteerGroups: [],
      health: 90,
      exploded: false,
      speed: 0,
      maxSpeed: 2.3, // Extremely fast
      accel: 0.065,  // Instant motorcycle torque
      brakePower: 0.09,
      handling: 0.055,
      steerAngle: 0,
      isPolice: false,
      isBike: true,
    };
    g.vehicles.push(bikeObj);
    return bikeObj;
  };

  // Build Police Cruiser
  const spawnPoliceCruiser = (scene, x, z) => {
    const g = gameRef.current;
    const carGroup = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 0.35, metalness: 0.6 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.85, 4.9), bodyMat);
    body.position.y = 0.62;
    carGroup.add(body);

    const doorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.37, 0.72, 2.2), doorMat);
    door.position.set(0, 0.66, 0);
    carGroup.add(door);

    const redLight = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.3), new THREE.MeshBasicMaterial({ color: 0xff0022 }));
    redLight.position.set(-0.4, 1.6, 0);
    carGroup.add(redLight);

    const blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.3), new THREE.MeshBasicMaterial({ color: 0x0055ff }));
    blueLight.position.set(0.4, 1.6, 0);
    carGroup.add(blueLight);

    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x151515 });
    const wheels = [];
    [
      [-1.2, 0.42, -1.45],
      [1.2, 0.42, -1.45],
      [-1.2, 0.42, 1.45],
      [1.2, 0.42, 1.45],
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.38, 14), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      carGroup.add(wheel);
      wheels.push(wheel);
    });

    carGroup.position.set(x, 0, z);
    scene.add(carGroup);

    const carObj = {
      name: 'LSPD Interceptor',
      type: 'police_cruiser',
      mesh: carGroup,
      bodyMesh: body,
      wheels,
      frontSteerGroups: [],
      health: 160,
      exploded: false,
      speed: 0,
      maxSpeed: 1.85,
      accel: 0.045,
      brakePower: 0.07,
      handling: 0.042,
      isPolice: true,
      redLight,
      blueLight,
    };
    g.vehicles.push(carObj);
    return carObj;
  };

  // Build Yellow Cab
  const spawnTaxi = (scene, x, z) => {
    const g = gameRef.current;
    const carGroup = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf5b800, roughness: 0.4 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.8, 4.8), bodyMat);
    body.position.y = 0.6;
    carGroup.add(body);

    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.35), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    sign.position.set(0, 1.52, 0);
    carGroup.add(sign);

    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const wheels = [];
    [
      [-1.18, 0.4, -1.4],
      [1.18, 0.4, -1.4],
      [-1.18, 0.4, 1.4],
      [1.18, 0.4, 1.4],
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.35, 12), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      carGroup.add(wheel);
      wheels.push(wheel);
    });

    carGroup.position.set(x, 0, z);
    scene.add(carGroup);

    const carObj = {
      name: 'Downtown Yellow Cab',
      type: 'taxi',
      mesh: carGroup,
      bodyMesh: body,
      wheels,
      frontSteerGroups: [],
      health: 130,
      exploded: false,
      speed: 0,
      maxSpeed: 1.6,
      accel: 0.038,
      brakePower: 0.07,
      handling: 0.038,
      isPolice: false,
    };
    g.vehicles.push(carObj);
    return carObj;
  };

  // Build Helicopter
  const spawnHelicopter = (scene, x, z) => {
    const g = gameRef.current;
    const heliGroup = new THREE.Group();

    const fuseMat = new THREE.MeshStandardMaterial({ color: 0x1c2b3d, roughness: 0.35, metalness: 0.8 });
    const fuse = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.0, 5.2), fuseMat);
    fuse.position.y = 1.6;
    heliGroup.add(fuse);

    const bladeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const mainRotor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 8.5), bladeMat);
    mainRotor.position.set(0, 3.2, 0);
    heliGroup.add(mainRotor);

    const tailRotor = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.4, 0.15), bladeMat);
    tailRotor.position.set(0.35, 2.2, 6.4);
    heliGroup.add(tailRotor);

    heliGroup.position.set(x, 0, z);
    scene.add(heliGroup);

    const heliObj = {
      name: 'Maverick Helicopter',
      type: 'helicopter',
      mesh: heliGroup,
      bodyMesh: fuse,
      mainRotor,
      tailRotor,
      health: 240,
      exploded: false,
      speed: 0,
      altitude: 0,
      maxAltitude: 50,
      maxSpeed: 1.8,
      accel: 0.03,
      handling: 0.035,
      isHeli: true,
      isPolice: false,
    };
    g.helicopters.push(heliObj);
    return heliObj;
  };

  // Build Rhino Tank
  const spawnRhinoTank = (scene, x, z) => {
    const g = gameRef.current;
    const tankGroup = new THREE.Group();

    const hullMat = new THREE.MeshStandardMaterial({ color: 0x464e3b, roughness: 0.7, metalness: 0.6 });
    const hull = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.5, 6.2), hullMat);
    hull.position.y = 1.1;
    tankGroup.add(hull);

    const turret = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.45, 0.85, 12), hullMat);
    turret.position.set(0, 2.15, -0.3);
    tankGroup.add(turret);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 3.6, 10), hullMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 2.15, -2.8);
    tankGroup.add(barrel);

    tankGroup.position.set(x, 0, z);
    scene.add(tankGroup);

    const carObj = {
      name: 'Rhino Tank',
      type: 'rhino_tank',
      mesh: tankGroup,
      bodyMesh: hull,
      wheels: [],
      frontSteerGroups: [],
      health: 750,
      exploded: false,
      speed: 0,
      maxSpeed: 1.0,
      accel: 0.02,
      brakePower: 0.08,
      handling: 0.028,
      isPolice: false,
      isTank: true,
    };
    g.vehicles.push(carObj);
    return carObj;
  };

  const spawnPedestrian = (scene, x, z, isGang = false) => {
    const g = gameRef.current;
    const pedGroup = new THREE.Group();

    const civilianColors = [0x223344, 0x883322, 0x336644, 0xeeeeee, 0x444455, 0x886633];
    const shirtColor = isGang ? 0x881111 : civilianColors[Math.floor(Math.random() * civilianColors.length)];

    const bodyMat = new THREE.MeshStandardMaterial({ color: shirtColor });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.15, 0.38), bodyMat);
    body.position.y = 0.6;
    pedGroup.add(body);

    const headMat = new THREE.MeshStandardMaterial({ color: 0xffccaa });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), headMat);
    head.position.y = 1.35;
    pedGroup.add(head);

    pedGroup.position.set(x, 0, z);
    scene.add(pedGroup);

    g.pedestrians.push({
      mesh: pedGroup,
      health: isGang ? 85 : 45,
      alive: true,
      isGang,
      walkDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
      walkSpeed: isGang ? 0.09 : 0.045,
      changeTimer: 0,
    });
  };

  const spawnPoliceOfficer = (scene, x, z) => {
    const g = gameRef.current;
    const copGroup = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a2d52 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.25, 0.45), bodyMat);
    body.position.y = 0.65;
    copGroup.add(body);

    const headMat = new THREE.MeshStandardMaterial({ color: 0xffccaa });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), headMat);
    head.position.y = 1.45;
    copGroup.add(head);

    copGroup.position.set(x, 0, z);
    scene.add(copGroup);

    g.policeOfficers.push({
      mesh: copGroup,
      health: 100,
      alive: true,
      lastShotTime: 0,
    });
  };

  // Main Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x6eb5f0);
    scene.fog = new THREE.FogExp2(0x8bc0f0, 0.005);
    gameRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1200);
    camera.position.set(31, 4.0, 8.0);
    gameRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    gameRef.current.renderer = renderer;

    const hemiLight = new THREE.HemisphereLight(0xd0e8ff, 0x444433, 1.2);
    scene.add(hemiLight);
    gameRef.current.hemiLight = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfffae8, 2.0);
    dirLight.position.set(90, 110, -60);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);
    gameRef.current.sunLight = dirLight;

    // Ground
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x333b42, roughness: 0.9 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Multi-Lane Real Asphalt Roads
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.85 });
    const roadNS1 = new THREE.Mesh(new THREE.PlaneGeometry(18, 480), roadMat);
    roadNS1.rotation.x = -Math.PI / 2;
    roadNS1.position.set(35, 0.02, 0);
    roadNS1.receiveShadow = true;
    scene.add(roadNS1);

    const roadNS2 = new THREE.Mesh(new THREE.PlaneGeometry(18, 480), roadMat);
    roadNS2.rotation.x = -Math.PI / 2;
    roadNS2.position.set(-35, 0.02, 0);
    roadNS2.receiveShadow = true;
    scene.add(roadNS2);

    const roadEW1 = new THREE.Mesh(new THREE.PlaneGeometry(480, 18), roadMat);
    roadEW1.rotation.x = -Math.PI / 2;
    roadEW1.position.set(0, 0.02, -60);
    roadEW1.receiveShadow = true;
    scene.add(roadEW1);

    const roadEW2 = new THREE.Mesh(new THREE.PlaneGeometry(480, 18), roadMat);
    roadEW2.rotation.x = -Math.PI / 2;
    roadEW2.position.set(0, 0.02, 40);
    roadEW2.receiveShadow = true;
    scene.add(roadEW2);

    // Yellow and White Road Markings
    for (let z = -220; z <= 220; z += 12) {
      const yellowMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
      [-0.2, 0.2].forEach((offset) => {
        const line = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 5.0), yellowMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(35 + offset, 0.04, z);
        scene.add(line);
      });

      const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      [-4.5, 4.5].forEach((offset) => {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.5), whiteMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(35 + offset, 0.04, z);
        scene.add(dash);
      });
    }

    // Concrete Sidewalks
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xa8b0b8, roughness: 0.8 });
    [-46, -24, 24, 46].forEach((sx) => {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.25, 460), sidewalkMat);
      sw.position.set(sx, 0.125, 0);
      scene.add(sw);
    });

    // Street Lamps
    for (let z = -180; z <= 180; z += 40) {
      [-26, 48].forEach((lx) => {
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x444a50, metalness: 0.8 });
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8), poleMat);
        pole.position.set(lx, 3.75, z);
        scene.add(pole);

        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xaaaa99 });
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), bulbMat);
        bulb.position.set(lx + (lx > 0 ? -1.5 : 1.5), 7.0, z);
        scene.add(bulb);

        const lampLight = new THREE.PointLight(0xffeedd, 0, 18);
        lampLight.position.copy(bulb.position);
        scene.add(lampLight);
        gameRef.current.streetLamps.push({ light: lampLight, bulb });
      });
    }

    // GYM LOCATION (x = 48, z = -45)
    const gymGroup = new THREE.Group();
    const gymBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(22, 14, 20),
      new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.5 })
    );
    gymBuilding.position.set(48 + 11, 7, -45);
    gymGroup.add(gymBuilding);

    const gymSign = new THREE.Mesh(
      new THREE.BoxGeometry(16, 2.5, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3 })
    );
    gymSign.position.set(48 + 11, 14.5, -45 + 10.3);
    gymGroup.add(gymSign);

    const gymMarker = new THREE.Mesh(
      new THREE.CylinderGeometry(3.0, 3.0, 0.3, 16),
      new THREE.MeshBasicMaterial({ color: 0xeab308, transparent: true, opacity: 0.6 })
    );
    gymMarker.position.set(48, 0.18, -45);
    gymGroup.add(gymMarker);
    scene.add(gymGroup);

    // FOOD RESTAURANT - BURGER SHOT (x = 48, z = 45)
    const foodGroup = new THREE.Group();
    const foodBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(20, 12, 18),
      new THREE.MeshStandardMaterial({ color: 0x882211, roughness: 0.5 })
    );
    foodBuilding.position.set(48 + 10, 6, 45);
    foodGroup.add(foodBuilding);

    const foodSign = new THREE.Mesh(
      new THREE.BoxGeometry(15, 2.5, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 })
    );
    foodSign.position.set(48 + 10, 12.5, 45 - 9.3);
    foodGroup.add(foodSign);

    const foodMarker = new THREE.Mesh(
      new THREE.CylinderGeometry(3.0, 3.0, 0.3, 16),
      new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.6 })
    );
    foodMarker.position.set(48, 0.18, 45);
    foodGroup.add(foodMarker);
    scene.add(foodGroup);

    // GUN SHOP - AMMU-NATION (x = -48, z = -35)
    const gunGroup = new THREE.Group();
    const gunBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(20, 14, 20),
      new THREE.MeshStandardMaterial({ color: 0x3d1a1a, roughness: 0.5 })
    );
    gunBuilding.position.set(-48 - 10, 7, -35);
    gunGroup.add(gunBuilding);

    const gunSign = new THREE.Mesh(
      new THREE.BoxGeometry(15, 2.5, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.3 })
    );
    gunSign.position.set(-48 - 10, 14.5, -35 + 10.3);
    gunGroup.add(gunSign);

    const gunMarker = new THREE.Mesh(
      new THREE.CylinderGeometry(3.0, 3.0, 0.3, 16),
      new THREE.MeshBasicMaterial({ color: 0xcc2222, transparent: true, opacity: 0.6 })
    );
    gunMarker.position.set(-48, 0.18, -35);
    gunGroup.add(gunMarker);
    scene.add(gunGroup);

    // BANK OF LOS SANTOS (x = -45, z = 0)
    const bankGroup = new THREE.Group();
    const bankBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(24, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.4 })
    );
    bankBuilding.position.set(-45 - 12, 12, 0);
    bankGroup.add(bankBuilding);

    const bankMarker = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.5, 0.3, 16),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6 })
    );
    bankMarker.position.set(-45, 0.18, 0);
    bankGroup.add(bankMarker);
    scene.add(bankGroup);

    // MAZE BANK TOWER (Downtown Skyscraper, x = 0, z = -10)
    const mazeMat = new THREE.MeshStandardMaterial({ color: 0x22364c, roughness: 0.3, metalness: 0.8 });
    const maze = new THREE.Mesh(new THREE.BoxGeometry(26, 85, 26), mazeMat);
    maze.position.set(0, 42.5, -10);
    scene.add(maze);
    // Maze Bank windows grid
    const winMat = new THREE.MeshBasicMaterial({ color: 0x4affff });
    for (let wy = 8; wy < 80; wy += 6) {
      for (let wx = -10; wx <= 10; wx += 5) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.5), winMat);
        win.position.set(wx, wy, 13.1);
        scene.add(win);
        const winB = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.5), winMat);
        winB.rotation.y = Math.PI;
        winB.position.set(wx, wy, -23.1);
        scene.add(winB);
      }
    }

    // GLASS CORPORATE TOWER (Rockford Hills)
    const glassTowerMat = new THREE.MeshStandardMaterial({ color: 0x0a2a1a, roughness: 0.05, metalness: 0.95, transparent: true, opacity: 0.85 });
    const glassTower = new THREE.Mesh(new THREE.BoxGeometry(20, 65, 20), glassTowerMat);
    glassTower.position.set(-75, 32.5, -60);
    scene.add(glassTower);
    // Glass tower reflective stripes
    const stripeMatG = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
    for (let sy = 4; sy < 62; sy += 5) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(18, 1.2), stripeMatG);
      stripe.position.set(-75, sy, -49.6);
      scene.add(stripe);
    }

    // HOSPITAL (LS Medical Center)
    const hospMat = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.5 });
    const hospital = new THREE.Mesh(new THREE.BoxGeometry(28, 18, 22), hospMat);
    hospital.position.set(75, 9, 60);
    scene.add(hospital);
    const redCrossMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(6, 1.5, 0.3), redCrossMat);
    crossH.position.set(75, 18.8, 49.2);
    scene.add(crossH);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(1.5, 6, 0.3), redCrossMat);
    crossV.position.set(75, 18.8, 49.1);
    scene.add(crossV);
    // Hospital marker
    const hospMarker = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.5, 0.3, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
    );
    hospMarker.position.set(62, 0.18, 60);
    scene.add(hospMarker);

    // LUXURY HOTEL (Rockford Hills - Del Perro)
    const hotelMat = new THREE.MeshStandardMaterial({ color: 0xc8a96a, roughness: 0.4, metalness: 0.3 });
    const hotel = new THREE.Mesh(new THREE.BoxGeometry(22, 48, 22), hotelMat);
    hotel.position.set(78, 24, -60);
    scene.add(hotel);
    const hotelSign = new THREE.Mesh(
      new THREE.BoxGeometry(16, 2, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xffcc00 })
    );
    hotelSign.position.set(78, 48.5, -49.2);
    scene.add(hotelSign);

    // MULTI-STORY PARKING GARAGE
    const pgMat = new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.8 });
    for (let fl = 0; fl < 4; fl++) {
      const floor = new THREE.Mesh(new THREE.BoxGeometry(28, 3.2, 22), pgMat);
      floor.position.set(-75, fl * 3.5 + 1.6, 40);
      scene.add(floor);
      // Railing openings
      const railMat = new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.7 });
      const rail = new THREE.Mesh(new THREE.BoxGeometry(28, 0.5, 0.3), railMat);
      rail.position.set(-75, fl * 3.5 + 3.5, 29.2);
      scene.add(rail);
    }

    // GAS STATION (Rockford Hills - West side)
    const gasCanopyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const gasCanopy = new THREE.Mesh(new THREE.BoxGeometry(20, 0.6, 14), gasCanopyMat);
    gasCanopy.position.set(-75, 5.5, -5);
    scene.add(gasCanopy);
    // Gas station columns
    const colMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    [[-70, -1], [-70, -9], [-80, -1], [-80, -9]].forEach(([cx, cz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5.5, 8), colMat);
      col.position.set(cx, 2.75, cz);
      scene.add(col);
    });
    // Gas pumps
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x114422, roughness: 0.5 });
    [[-73, -4], [-77, -4]].forEach(([px, pz]) => {
      const pump = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.4, 0.5), pumpMat);
      pump.position.set(px, 1.2, pz);
      scene.add(pump);
    });
    const gasSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 4, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 })
    );
    gasSign.position.set(-68, 9, -5);
    scene.add(gasSign);
    const gasSignPanel = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 0.3), new THREE.MeshBasicMaterial({ color: 0xdd0000 }));
    gasSignPanel.position.set(-68, 11, -5);
    scene.add(gasSignPanel);

    // FREEWAY OVERPASS (connecting highway)
    const overpassMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 0.8 });
    const overpassDeck = new THREE.Mesh(new THREE.BoxGeometry(100, 1.5, 12), overpassMat);
    overpassDeck.position.set(0, 7.5, -60);
    scene.add(overpassDeck);
    // Overpass support pillars
    for (let px = -40; px <= 40; px += 20) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(2, 7.5, 2), overpassMat);
      pillar.position.set(px, 3.75, -60);
      scene.add(pillar);
    }
    // Overpass road markings
    const oMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let ox = -40; ox <= 40; ox += 10) {
      const om = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 4), oMat);
      om.rotation.x = -Math.PI / 2;
      om.position.set(ox, 8.35, -60);
      scene.add(om);
    }

    // VINEWOOD HILLS SIGN (iconic landmark)
    const vinewoodHillMat = new THREE.MeshStandardMaterial({ color: 0x4a6a30, roughness: 0.9 });
    const vinewoodHill = new THREE.Mesh(new THREE.ConeGeometry(35, 28, 12), vinewoodHillMat);
    vinewoodHill.position.set(0, 14, -170);
    scene.add(vinewoodHill);
    // Sign letters on hill (simple approximation)
    const letterMat = new THREE.MeshBasicMaterial({ color: 0xfafafa });
    const letterPositions = [-18, -10, -2, 6, 14];
    letterPositions.forEach((lx, i) => {
      const letter = new THREE.Mesh(new THREE.BoxGeometry(3.5, 5, 0.5), letterMat);
      letter.position.set(lx, 24, -148);
      letter.rotation.x = -0.25;
      scene.add(letter);
    });

    // ROCKFORD HILLS MANSIONS (luxury residential district)
    const mansionColors = [0xc8b89a, 0xddd0b8, 0xe8e0cc, 0xd4c8aa];
    [
      { x: -75, z: -50 }, { x: -85, z: -65 }, { x: -65, z: -75 }, { x: -90, z: -45 }
    ].forEach((pos, i) => {
      const mansionMat = new THREE.MeshStandardMaterial({ color: mansionColors[i % mansionColors.length], roughness: 0.5 });
      const mansion = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 12), mansionMat);
      mansion.position.set(pos.x, 4, pos.z);
      scene.add(mansion);
      // Roof
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x884422, roughness: 0.7 });
      const mansionRoof = new THREE.Mesh(new THREE.BoxGeometry(15, 3, 13), roofMat);
      mansionRoof.position.set(pos.x, 9.5, pos.z);
      scene.add(mansionRoof);
      // Pool (blue square)
      const poolMat = new THREE.MeshBasicMaterial({ color: 0x0088cc });
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), poolMat);
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(pos.x + 8, 0.05, pos.z);
      scene.add(pool);
    });

    // ADDITIONAL CITY BUILDINGS (various heights and colors for a real skyline)
    const cityBuildings = [
      { x: 75, z: 20, w: 18, h: 32, d: 16, color: 0x2d3a4a },
      { x: 80, z: -10, w: 14, h: 44, d: 14, color: 0x3a4d3e },
      { x: -75, z: 80, w: 20, h: 22, d: 18, color: 0x4a3a2a },
      { x: 75, z: 80, w: 16, h: 28, d: 16, color: 0x2a3a4a },
      { x: -90, z: 10, w: 16, h: 36, d: 18, color: 0x1a2a3a },
      { x: 10, z: -80, w: 22, h: 20, d: 20, color: 0x3a3a2a },
      { x: -10, z: -80, w: 18, h: 26, d: 16, color: 0x2a2a3a },
    ];
    cityBuildings.forEach(b => {
      const bMat = new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.4, metalness: 0.6 });
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), bMat);
      bMesh.position.set(b.x, b.h / 2, b.z);
      scene.add(bMesh);
      // Glowing windows
      const bWinMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
      for (let wy = 4; wy < b.h - 2; wy += 5) {
        for (let wx = -(b.w / 2 - 3); wx <= b.w / 2 - 3; wx += 4) {
          const bw = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.5), bWinMat);
          bw.position.set(b.x + wx, wy, b.z + b.d / 2 + 0.1);
          scene.add(bw);
        }
      }
    });

    // Player Character
    const playerGroup = new THREE.Group();
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.9, 0.44), new THREE.MeshStandardMaterial({ color: 0x1a2230, roughness: 0.6 }));
    torso.position.y = 1.05;
    playerGroup.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 10), new THREE.MeshStandardMaterial({ color: 0xf0c09d, roughness: 0.7 }));
    head.position.y = 1.7;
    playerGroup.add(head);

    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.75, 0.32), new THREE.MeshStandardMaterial({ color: 0x152238 }));
    leftLeg.position.set(-0.2, 0.38, 0);
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.75, 0.32), new THREE.MeshStandardMaterial({ color: 0x152238 }));
    rightLeg.position.set(0.2, 0.38, 0);
    playerGroup.add(rightLeg);

    playerGroup.position.set(31, 0, 0);
    scene.add(playerGroup);
    gameRef.current.playerMesh = playerGroup;

    updatePlayerGunMesh(1);

    // SPAWN VEHICLES DIRECTLY ON ROADS
    spawnSupercar(scene, 35, 0, 0xd91424);
    spawnSuperbike(scene, 35, 25);
    spawnPoliceCruiser(scene, -35, -40);
    spawnTaxi(scene, -35, 30);
    spawnHelicopter(scene, 0, -75);
    spawnRhinoTank(scene, -65, 120);

    for (let i = 0; i < 24; i++) {
      const rx = (Math.random() > 0.5 ? 24 : -24) + (Math.random() - 0.5) * 3;
      const rz = (Math.random() - 0.5) * 260;
      spawnPedestrian(scene, rx, rz);
    }

    // Spawn NPC Traffic Cars (Driving on Roads)
    const npcCarColors = [0x2255cc, 0xcc4400, 0x228833, 0xaaaaaa, 0xdd8800, 0x660088, 0xcc1133, 0x334466];
    const npcSpawns = [
      { x: 40, z: -120, heading: 0, speed: 0.22 },   // NS road going south
      { x: 30, z: 80, heading: Math.PI, speed: 0.20 }, // NS road going north
      { x: 40, z: -50, heading: 0, speed: 0.26 },
      { x: 30, z: 40, heading: Math.PI, speed: 0.18 },
      { x: 40, z: 100, heading: 0, speed: 0.24 },
      { x: -40, z: -80, heading: 0, speed: 0.19 },
      { x: -30, z: 60, heading: Math.PI, speed: 0.22 },
      { x: -40, z: 20, heading: 0, speed: 0.21 },
      { x: -120, z: -60, heading: -Math.PI / 2, speed: 0.20 }, // EW road
      { x: 80, z: -60, heading: Math.PI / 2, speed: 0.22 },
      { x: -100, z: 40, heading: -Math.PI / 2, speed: 0.19 },
      { x: 100, z: 40, heading: Math.PI / 2, speed: 0.20 },
    ];

    const npcCars = [];
    npcSpawns.forEach((spawn, i) => {
      const npcGroup = new THREE.Group();
      const carColor = npcCarColors[i % npcCarColors.length];
      const npcBodyMat = new THREE.MeshStandardMaterial({ color: carColor, roughness: 0.3, metalness: 0.7 });
      const npcBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 4.4), npcBodyMat);
      npcBody.position.y = 0.55;
      npcGroup.add(npcBody);
      // Roof
      const npcRoof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 2.0), npcBodyMat);
      npcRoof.position.set(0, 1.05, -0.2);
      npcGroup.add(npcRoof);
      // Windshield
      const npcGlass = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 0.45, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x0a2040, transparent: true, opacity: 0.7, roughness: 0.1, metalness: 0.9 })
      );
      npcGlass.position.set(0, 1.02, -1.16);
      npcGlass.rotation.x = -0.35;
      npcGroup.add(npcGlass);
      // Headlights
      const npcHl = new THREE.MeshBasicMaterial({ color: 0xffffff });
      [-0.7, 0.7].forEach(hlx => {
        const hl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.1), npcHl);
        hl.position.set(hlx, 0.55, -2.2);
        npcGroup.add(hl);
      });
      // Taillights
      const npcTl = new THREE.MeshBasicMaterial({ color: 0xff1122 });
      [-0.7, 0.7].forEach(tlx => {
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.1), npcTl);
        tl.position.set(tlx, 0.55, 2.2);
        npcGroup.add(tl);
      });
      // Wheels
      const npcWheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
      const npcWheels = [];
      [[-1.12, 0.38, -1.35], [1.12, 0.38, -1.35], [-1.12, 0.38, 1.35], [1.12, 0.38, 1.35]].forEach(([wx, wy, wz]) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.32, 14), npcWheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(wx, wy, wz);
        npcGroup.add(w);
        npcWheels.push(w);
      });
      npcGroup.position.set(spawn.x, 0, spawn.z);
      npcGroup.rotation.y = spawn.heading;
      scene.add(npcGroup);
      npcCars.push({ mesh: npcGroup, wheels: npcWheels, speed: spawn.speed, heading: spawn.heading });
    });
    gameRef.current.npcCars = npcCars;

    // Input Listeners
    const handleKeyDown = (e) => {
      const k = e.key ? e.key.toLowerCase() : '';
      const code = e.code ? e.code.toLowerCase() : '';
      gameRef.current.keysPressed[k] = true;
      gameRef.current.keysPressed[code] = true;

      if (k === 'f' || k === 'enter' || code === 'keyf') {
        handleEnterExitVehicle();
      }
      if (k === 'e' || code === 'keye') {
        const g = gameRef.current;
        if (g.playerPos.distanceTo(new THREE.Vector3(LOCATIONS.gym.x, 0, LOCATIONS.gym.z)) < 5.0) {
          handleWorkoutAtGym();
        } else if (g.playerPos.distanceTo(new THREE.Vector3(LOCATIONS.food.x, 0, LOCATIONS.food.z)) < 5.0) {
          handleEatMeal();
        } else if (g.playerPos.distanceTo(new THREE.Vector3(LOCATIONS.gunShop.x, 0, LOCATIONS.gunShop.z)) < 5.0) {
          setShowAmmuNation(true);
        } else if (g.playerPos.distanceTo(new THREE.Vector3(LOCATIONS.bank.x, 0, LOCATIONS.bank.z)) < 5.0 && !g.activeMission) {
          startMission(1);
        }
      }
      if (k === 'v' || code === 'keyv') {
        setCameraMode((prev) => {
          const modes = ['third', 'cockpit', 'hood', 'far'];
          const nextIdx = (modes.indexOf(prev) + 1) % modes.length;
          const next = modes[nextIdx];
          gameRef.current.cameraMode = next;
          showToast(`CAMERA: ${next.toUpperCase()} VIEW`);
          return next;
        });
      }
      if (k === 'h' || code === 'keyh') {
        soundFx.playCarHorn && soundFx.playCarHorn();
      }
      if (k === 'r' || code === 'keyr') {
        const stations = ['radioLosSantos', 'losSantosRock', 'nonStopPop', 'flashFm', 'off'];
        const nextIdx = (stations.indexOf(gameRef.current.station) + 1) % stations.length;
        handleToggleRadio(stations[nextIdx]);
      }
      if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(k)) {
        const idx = parseInt(k) - 1;
        if (idx < WEAPONS.length) {
          setSelectedWeaponIdx(idx);
          gameRef.current.selectedWeaponIdx = idx;
          updatePlayerGunMesh(idx);
          soundFx.playClick();
        }
      }
      if (k === ' ' || code === 'space') {
        e.preventDefault();
        const g = gameRef.current;
        if (!g.currentVehicle && !g.isJumping) {
          g.isJumping = true;
          g.jumpVelocity = 0.3;
          soundFx.playJump();
        }
      }
      if (e.shiftKey || k === 'shift' || code === 'shiftleft' || code === 'shiftright') {
        gameRef.current.isSprinting = true;
        if (gameRef.current.currentVehicle && gameRef.current.nitro > 10) {
          gameRef.current.isNitroActive = true;
          setIsNitroActive(true);
          soundFx.playNitrousSound && soundFx.playNitrousSound();
        }
      }
    };

    const handleKeyUp = (e) => {
      const k = e.key ? e.key.toLowerCase() : '';
      const code = e.code ? e.code.toLowerCase() : '';
      gameRef.current.keysPressed[k] = false;
      gameRef.current.keysPressed[code] = false;
      if (k === 'shift' || code === 'shiftleft' || code === 'shiftright') {
        gameRef.current.isSprinting = false;
        gameRef.current.isNitroActive = false;
        setIsNitroActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e) => {
      if (e.target.tagName !== 'CANVAS') return;
      if (e.button === 2) {
        e.preventDefault();
        setIsAiming(true);
        gameRef.current.isAiming = true;
        soundFx.playSniperZoom && soundFx.playSniperZoom();
        return;
      }
      if (e.button === 0) {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        handleAttack();
      }
    };

    const handleContextMenu = (e) => {
      if (e.target.tagName === 'CANVAS') e.preventDefault();
    };

    const handleMouseMove = (e) => {
      if (!isDragging && !gameRef.current.isAiming) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      const g = gameRef.current;
      g.cameraYaw -= deltaX * 0.0055;
      g.cameraPitch = Math.max(0.06, Math.min(1.0, g.cameraPitch + deltaY * 0.0045));
    };

    const handleMouseUp = (e) => {
      if (e.button === 2) {
        setIsAiming(false);
        gameRef.current.isAiming = false;
      }
      isDragging = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

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

    // 60FPS Game Loop
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const g = gameRef.current;

      g.helicopters.forEach((heli) => {
        if (heli.mainRotor) heli.mainRotor.rotation.y += 0.45;
        if (heli.tailRotor) heli.tailRotor.rotation.x += 0.55;
      });

      if (gameStateRef.current === 'playing') {
        const keys = g.keysPressed;

        // Vehicle Dynamics & Real Racing Physics
        if (g.currentVehicle) {
          const veh = g.currentVehicle;

          if (veh.isHeli) {
            const isAscending = keys[' '] || keys['space'];
            const isDescending = keys['shift'] || keys['shiftleft'] || keys['shiftright'];
            const isPitchFwd = keys['w'] || keys['arrowup'] || keys['keyw'];
            const isPitchBack = keys['s'] || keys['arrowdown'] || keys['keys'];
            const isTurnLeft = keys['a'] || keys['arrowleft'] || keys['keya'];
            const isTurnRight = keys['d'] || keys['arrowright'] || keys['keyd'];

            if (isAscending) veh.altitude = Math.min(veh.maxAltitude, veh.altitude + 0.35);
            if (isDescending) veh.altitude = Math.max(0, veh.altitude - 0.35);

            if (veh.altitude > 0.5) {
              if (isPitchFwd) veh.speed = Math.min(veh.maxSpeed, veh.speed + veh.accel);
              else if (isPitchBack) veh.speed = Math.max(-veh.maxSpeed * 0.5, veh.speed - veh.accel);
              else veh.speed *= 0.98;

              if (isTurnLeft) veh.mesh.rotation.y += veh.handling;
              if (isTurnRight) veh.mesh.rotation.y -= veh.handling;
              veh.mesh.rotation.x = isPitchFwd ? 0.18 : isPitchBack ? -0.15 : 0;
            } else {
              veh.speed *= 0.9;
              veh.mesh.rotation.x = 0;
            }

            veh.mesh.position.y = THREE.MathUtils.lerp(veh.mesh.position.y, veh.altitude, 0.1);
            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), veh.mesh.rotation.y);
            veh.mesh.position.add(forward.multiplyScalar(veh.speed));

            g.playerPos.copy(veh.mesh.position);
            setVehicleSpeed(Math.round(Math.abs(veh.speed) * 85));
          } else {
            // Ground Racing Dynamics
            const ctrl = g.driveControls || {};
            const isAccelerating = keys['w'] || keys['arrowup'] || keys['keyw'] || ctrl.gas;
            const isBraking = keys['s'] || keys['arrowdown'] || keys['keys'] || ctrl.brake;
            const isSteeringLeft = keys['a'] || keys['arrowleft'] || keys['keya'] || ctrl.left;
            const isSteeringRight = keys['d'] || keys['arrowright'] || keys['keyd'] || ctrl.right;
            const isHandbrake = keys[' '] || keys['space'] || ctrl.handbrake;
            const isNitro = (keys['shift'] || keys['shiftleft'] || keys['shiftright'] || ctrl.nitro) && g.nitro > 5;

            // Nitrous depletion & recharge
            if (isNitro && isAccelerating) {
              g.nitro = Math.max(0, g.nitro - 0.45);
              setNitroAmount(Math.round(g.nitro));
              g.isNitroActive = true;
            } else {
              g.nitro = Math.min(100, g.nitro + 0.18);
              setNitroAmount(Math.round(g.nitro));
              g.isNitroActive = false;
            }

            // Real Supercar Throttle & Momentum
            const currentAccel = isNitro ? veh.accel * 2.1 : veh.accel;
            const currentMaxSpeed = isNitro ? veh.maxSpeed * 1.35 : veh.maxSpeed;

            if (isAccelerating) {
              if (veh.speed < 0) {
                // If reversing, brake first
                veh.speed = Math.min(0, veh.speed + veh.brakePower * 1.5);
              } else {
                veh.speed = Math.min(currentMaxSpeed, veh.speed + currentAccel);
              }
            } else if (isBraking) {
              if (veh.speed > 0.08) {
                // Hard brake
                veh.speed = Math.max(0, veh.speed - veh.brakePower);
              } else {
                // Reverse
                veh.speed = Math.max(-veh.maxSpeed * 0.45, veh.speed - veh.accel * 0.85);
              }
            } else {
              // Natural rolling friction with realistic coasting momentum
              veh.speed *= 0.993;
              if (Math.abs(veh.speed) < 0.005) veh.speed = 0;
            }

            if (isHandbrake) {
              veh.speed *= 0.95;
              soundFx.playDriftScreech && soundFx.playDriftScreech();
            }

            // Dynamic Ackermann Steering
            const targetSteerAngle = isSteeringLeft ? 0.52 : isSteeringRight ? -0.52 : 0;
            veh.steerAngle = THREE.MathUtils.lerp(veh.steerAngle || 0, targetSteerAngle, 0.22);

            if (veh.frontSteerGroups) {
              veh.frontSteerGroups.forEach((fg) => {
                fg.rotation.y = veh.steerAngle;
              });
            }

            // Interior Steering Wheel Rotation
            if (veh.steeringWheel) {
              veh.steeringWheel.rotation.z = -veh.steerAngle * 2.8;
            }

            // Turn vehicle - Responsive at both low and high speeds
            const isMoving = Math.abs(veh.speed) > 0.001;
            const isReversing = veh.speed < -0.01;
            if (isMoving || isAccelerating || isBraking) {
              const speedSens = Math.max(0.65, 1.0 - (Math.abs(veh.speed) / veh.maxSpeed) * 0.35);
              const turnRate = veh.handling * (isReversing ? -1 : 1) * speedSens;
              if (isSteeringLeft) veh.mesh.rotation.y += turnRate;
              if (isSteeringRight) veh.mesh.rotation.y -= turnRate;
            }

            // Bike / Car dynamic body roll & suspension pitch
            if (veh.isBike) {
              if (isSteeringLeft) veh.mesh.rotation.z = Math.min(0.32, veh.mesh.rotation.z + 0.04);
              else if (isSteeringRight) veh.mesh.rotation.z = Math.max(-0.32, veh.mesh.rotation.z - 0.04);
              else veh.mesh.rotation.z *= 0.85;
            } else if (veh.bodyMesh) {
              // Suspension pitch forward on brake, pitch back on launch
              const targetPitch = isAccelerating ? -0.03 : isBraking ? 0.045 : 0;
              veh.bodyMesh.rotation.x = THREE.MathUtils.lerp(veh.bodyMesh.rotation.x || 0, targetPitch, 0.15);
              const steerRoll = (isSteeringLeft ? 0.035 : isSteeringRight ? -0.035 : 0) * (Math.abs(veh.speed) / 1.0);
              veh.bodyMesh.rotation.z = THREE.MathUtils.lerp(veh.bodyMesh.rotation.z || 0, steerRoll, 0.15);
            }

            // Rotate wheels when rolling
            if (veh.wheels) {
              veh.wheels.forEach((w) => {
                w.rotation.x += veh.speed * 1.3;
              });
            }

            // Animated Dual Exhaust Flames on high throttle & NOS
            if (veh.exhaustFlames) {
              const showFlames = (isNitro && isAccelerating) || (isAccelerating && Math.random() > 0.65 && Math.abs(veh.speed) > 0.8);
              veh.exhaustFlames.forEach((flame) => {
                flame.visible = showFlames;
                if (showFlames) {
                  const s = 0.8 + Math.random() * 0.7;
                  flame.scale.set(s, s * 1.5, s);
                }
              });
            }

            // Taillights brighten on brake
            if (veh.taillights) {
              veh.taillights.forEach((tl) => {
                tl.material.color.setHex(isBraking || isHandbrake ? 0xff2200 : 0xaa0011);
              });
            }

            // Move vehicle forward along heading
            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), veh.mesh.rotation.y);
            veh.mesh.position.add(forward.multiplyScalar(veh.speed));
            g.playerPos.copy(veh.mesh.position);

            // Calculate Gear & RPM for Supercar Tachometer
            const speedMPH = Math.round(Math.abs(veh.speed) * 85);
            let currentGear = 'N';
            let currentRpm = 1000;

            if (veh.speed < -0.02) {
              currentGear = 'R';
              currentRpm = Math.min(6500, 1500 + Math.abs(speedMPH) * 160);
            } else if (speedMPH < 1) {
              currentGear = 'N';
              currentRpm = isAccelerating ? 4200 : 950;
            } else if (speedMPH < 32) {
              currentGear = '1';
              currentRpm = 1400 + (speedMPH / 32) * 6400;
            } else if (speedMPH < 62) {
              currentGear = '2';
              currentRpm = 2400 + ((speedMPH - 32) / 30) * 5600;
            } else if (speedMPH < 95) {
              currentGear = '3';
              currentRpm = 2800 + ((speedMPH - 62) / 33) * 5400;
            } else if (speedMPH < 130) {
              currentGear = '4';
              currentRpm = 3200 + ((speedMPH - 95) / 35) * 5200;
            } else if (speedMPH < 165) {
              currentGear = '5';
              currentRpm = 3600 + ((speedMPH - 130) / 35) * 5000;
            } else {
              currentGear = '6';
              currentRpm = 4200 + Math.min(4600, ((speedMPH - 165) / 45) * 4600);
            }

            if (g.lastSpeedMPH !== speedMPH) {
              g.lastSpeedMPH = speedMPH;
              setVehicleSpeed(speedMPH);
            }

            if (g.lastGear !== currentGear) {
              if (g.lastGear && g.lastGear !== 'N' && currentGear !== 'N' && currentGear !== 'R') {
                soundFx.playGearShift && soundFx.playGearShift();
                if (Math.random() > 0.5) soundFx.playTurboBlowoff && soundFx.playTurboBlowoff();
              }
              g.lastGear = currentGear;
              setVehicleGear(currentGear);
            }

            setVehicleRpm(Math.round(currentRpm));

            // Update Engine Sound with realistic RPM revving
            const speedRatio = Math.min(1.0, Math.abs(veh.speed) / veh.maxSpeed);
            soundFx.updateEngineSound && soundFx.updateEngineSound(speedRatio, isAccelerating, isNitro, currentRpm);

            // Police flashing lights
            if (veh.isPolice && veh.redLight && veh.blueLight) {
              const flash = Math.sin(clock.getElapsedTime() * 14) > 0;
              veh.redLight.visible = flash;
              veh.blueLight.visible = !flash;
            }

            // Pedestrian collision
            g.pedestrians.forEach((ped) => {
              if (ped.alive && ped.mesh.position.distanceTo(veh.mesh.position) < 2.8 && Math.abs(veh.speed) > 0.2) {
                killPedestrian(g, ped);
                soundFx.playCarCrash();
                veh.speed *= 0.85;
              }
            });
          }

          // Camera Follows Vehicle - 4 Exciting Camera Modes
          if (g.cameraMode === 'cockpit' && !veh.isBike) {
            // First-person cockpit view behind steering wheel
            const eyeOffset = new THREE.Vector3(-0.45, 1.15, 0.1).applyAxisAngle(new THREE.Vector3(0, 1, 0), veh.mesh.rotation.y);
            camera.position.copy(veh.mesh.position.clone().add(eyeOffset));
            const lookTarget = veh.mesh.position.clone().add(
              new THREE.Vector3(0, 1.0, -20).applyAxisAngle(new THREE.Vector3(0, 1, 0), veh.mesh.rotation.y + g.cameraYaw)
            );
            camera.lookAt(lookTarget);
          } else if (g.cameraMode === 'hood') {
            // Hood / bumper racing camera
            const hoodOffset = new THREE.Vector3(0, 0.78, -1.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), veh.mesh.rotation.y);
            camera.position.copy(veh.mesh.position.clone().add(hoodOffset));
            const lookTarget = veh.mesh.position.clone().add(
              new THREE.Vector3(0, 0.65, -25).applyAxisAngle(new THREE.Vector3(0, 1, 0), veh.mesh.rotation.y + g.cameraYaw)
            );
            camera.lookAt(lookTarget);
          } else if (g.cameraMode === 'far') {
            const camOffset = new THREE.Vector3(0, 5.0, 12.0).applyAxisAngle(new THREE.Vector3(0, 1, 0), veh.mesh.rotation.y + g.cameraYaw);
            camera.position.lerp(veh.mesh.position.clone().add(camOffset), 0.18);
            camera.lookAt(veh.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0)));
          } else {
            // Dynamic Chase Cam: pulls back smoothly as speed increases
            const dist = (veh.isBike ? 4.8 : 6.0) + Math.abs(veh.speed) * 1.8;
            const height = (veh.isBike ? 1.8 : 2.2) + Math.abs(veh.speed) * 0.4;
            const camOffset = new THREE.Vector3(0, height, dist).applyAxisAngle(new THREE.Vector3(0, 1, 0), veh.mesh.rotation.y + g.cameraYaw);
            camera.position.lerp(veh.mesh.position.clone().add(camOffset), 0.18);
            camera.lookAt(veh.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0)));
          }

          // Dynamic FOV for blistering speed rush!
          const targetFov = g.isNitroActive ? 82 : Math.abs(veh.speed) > 1.4 ? 76 : 65;
          camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.08);
          camera.updateProjectionMatrix();
        } else {
          // On-Foot Movement
          soundFx.stopEngineSound && soundFx.stopEngineSound();

          let moveX = 0;
          let moveZ = 0;
          if (keys['w'] || keys['arrowup'] || keys['keyw']) moveZ -= 1;
          if (keys['s'] || keys['arrowdown'] || keys['keys']) moveZ += 1;
          if (keys['a'] || keys['arrowleft'] || keys['keya']) moveX -= 1;
          if (keys['d'] || keys['arrowright'] || keys['keyd']) moveX += 1;

          const isMoving = moveX !== 0 || moveZ !== 0;

          if (isMoving) {
            const moveAngle = Math.atan2(moveX, moveZ);
            g.playerRotY = g.cameraYaw + moveAngle + Math.PI;

            const speed = g.isSprinting ? 0.24 : 0.13;
            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.playerRotY);
            g.playerPos.add(forward.multiplyScalar(speed));

            if (g.isSprinting) {
              g.stamina = Math.max(0, g.stamina - 0.25);
              setStamina(Math.round(g.stamina));
            }
          } else {
            g.stamina = Math.min(100, g.stamina + 0.35);
            setStamina(Math.round(g.stamina));
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

          // Camera Follow On-Foot
          let camOffset;
          if (g.isAiming) {
            camOffset = new THREE.Vector3(0.7, 1.6, 2.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.cameraYaw);
          } else if (g.cameraMode === 'first') {
            camOffset = new THREE.Vector3(0, 1.6, 0.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.playerRotY);
          } else if (g.cameraMode === 'far') {
            camOffset = new THREE.Vector3(0, 5.0, 9.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.cameraYaw);
          } else {
            camOffset = new THREE.Vector3(0, 2.6 + g.cameraPitch * 3, 5.6).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.cameraYaw);
          }
          camera.position.lerp(g.playerPos.clone().add(camOffset), 0.18);
          camera.lookAt(g.playerPos.clone().add(new THREE.Vector3(0, 1.3, 0)));

          // Check Proximity to Map Locations
          if (g.playerPos.distanceTo(new THREE.Vector3(LOCATIONS.gym.x, 0, LOCATIONS.gym.z)) < 5.0) {
            setActivePrompt({ title: 'LOS SANTOS GYM', action: 'WORK OUT [E]', cost: 'FREE' });
          } else if (g.playerPos.distanceTo(new THREE.Vector3(LOCATIONS.food.x, 0, LOCATIONS.food.z)) < 5.0) {
            setActivePrompt({ title: 'BURGER SHOT', action: 'EAT MEAL [E]', cost: '$25' });
          } else if (g.playerPos.distanceTo(new THREE.Vector3(LOCATIONS.gunShop.x, 0, LOCATIONS.gunShop.z)) < 5.0) {
            setActivePrompt({ title: 'AMMU-NATION', action: 'OPEN SHOP [E]', cost: 'SHOP' });
          } else if (g.playerPos.distanceTo(new THREE.Vector3(LOCATIONS.bank.x, 0, LOCATIONS.bank.z)) < 5.0 && !g.activeMission) {
            setActivePrompt({ title: 'BANK OF LOS SANTOS', action: 'START HEIST [E]', cost: 'MISSION' });
          } else {
            setActivePrompt(null);
          }
        }

        // Active Mission Progress
        if (g.activeMission) {
          g.missionTimer -= delta;
          setMissionTimer(Math.max(0, Math.ceil(g.missionTimer)));

          if (g.missionTimer <= 0) {
            soundFx.playGameOver();
            showToast('MISSION FAILED: TIME EXPIRED');
            if (g.beaconMesh) g.scene.remove(g.beaconMesh);
            g.activeMission = null;
            setActiveMission(null);
          }

          if (g.activeMission.type === 'race' && g.checkpoints.length > 0) {
            const nextCp = g.checkpoints[g.missionProgress];
            if (nextCp && g.playerPos.distanceTo(new THREE.Vector3(nextCp.x, 2.5, nextCp.z)) < 6.5) {
              soundFx.playCoin();
              nextCp.mesh.material.color.setHex(0x00ff88);
              g.missionProgress += 1;
              setMissionProgress(g.missionProgress);
              if (g.missionProgress >= g.missionTargetCount) {
                completeMission();
              }
            }
          }

          if (g.activeMission.type === 'heist') {
            const distToSafehouse = g.playerPos.distanceTo(new THREE.Vector3(LOCATIONS.safehouse.x, 0, LOCATIONS.safehouse.z));
            if (distToSafehouse < 16 && g.wantedLevel <= 1.0) {
              completeMission();
            }
          }

          if (g.activeMission.type === 'food_delivery') {
            const distToSafehouse = g.playerPos.distanceTo(new THREE.Vector3(LOCATIONS.safehouse.x, 0, LOCATIONS.safehouse.z));
            if (distToSafehouse < 16) {
              completeMission();
            }
          }
        }

        // Police AI
        if (g.wantedLevel > 0) {
          g.wantedTimer += delta;
          const targetCopCount = Math.floor(g.wantedLevel * 2.5);
          if (g.policeOfficers.length < targetCopCount) {
            const spawnDist = 45 + Math.random() * 20;
            const angle = Math.random() * Math.PI * 2;
            spawnPoliceOfficer(scene, g.playerPos.x + Math.cos(angle) * spawnDist, g.playerPos.z + Math.sin(angle) * spawnDist);
          }

          g.policeOfficers.forEach((cop) => {
            if (!cop.alive) return;
            const toPlayer = g.playerPos.clone().sub(cop.mesh.position);
            const dist = toPlayer.length();

            if (dist > 9) {
              toPlayer.normalize();
              cop.mesh.position.add(toPlayer.multiplyScalar(0.09));
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

          if (g.wantedTimer > 20) {
            g.wantedLevel = Math.max(0, g.wantedLevel - 0.5);
            setWantedLevel(Math.floor(g.wantedLevel));
            g.wantedTimer = 0;
          }
        }

        // Civilians walk
        g.pedestrians.forEach((ped) => {
          if (!ped.alive) return;
          ped.changeTimer += delta;
          if (ped.changeTimer > 3) {
            ped.changeTimer = 0;
            ped.walkDir.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
          }
          ped.mesh.position.add(ped.walkDir.clone().multiplyScalar(ped.walkSpeed));
          ped.mesh.rotation.y = Math.atan2(ped.walkDir.x, ped.walkDir.z);

          if (g.wantedLevel > 0 && ped.mesh.position.distanceTo(g.playerPos) < 18) {
            ped.walkDir = ped.mesh.position.clone().sub(g.playerPos).normalize();
            ped.walkSpeed = 0.14;
          }
        });

        // Rockets simulation
        for (let i = g.rockets.length - 1; i >= 0; i--) {
          const r = g.rockets[i];
          r.pos.add(r.vel);
          r.mesh.position.copy(r.pos);
          r.life -= 1;

          let exploded = false;
          g.vehicles.forEach((veh) => {
            if (veh.mesh.position.distanceTo(r.pos) < 3.5) {
              damageVehicle(veh, 350);
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

        // Explosions animation
        for (let i = g.explosions.length - 1; i >= 0; i--) {
          const ex = g.explosions[i];
          ex.scale += 0.2;
          ex.mesh.scale.set(ex.scale, ex.scale, ex.scale);
          ex.alpha -= 0.05;
          if (ex.alpha <= 0) {
            scene.remove(ex.mesh);
            g.explosions.splice(i, 1);
          }
        }

        // Pickups
        g.pickups.forEach((pk, idx) => {
          pk.mesh.rotation.y += 0.05;
          if (pk.mesh.position.distanceTo(g.playerPos) < 2.5) {
            soundFx.playCoin();
            g.cash += pk.value;
            setCash(g.cash);
            showToast(`+$${pk.value} CASH PICKED UP`);
            scene.remove(pk.mesh);
            g.pickups.splice(idx, 1);
          }
        });

        // Dynamic District Update (GTA 5-style location HUD)
        const district = getDistrict(g.playerPos.x, g.playerPos.z);
        setCurrentDistrict(district);

        // Drive NPC traffic cars
        if (g.npcCars) {
          g.npcCars.forEach((npc) => {
            if (!npc.mesh) return;
            const fwd = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), npc.heading);
            npc.mesh.position.addScaledVector(fwd, npc.speed);
            // Rotate wheels
            if (npc.wheels) npc.wheels.forEach(w => { w.rotation.x += npc.speed * 1.2; });
            // Loop around the road track
            if (npc.mesh.position.z < -230) npc.mesh.position.z = 230;
            if (npc.mesh.position.z > 230) npc.mesh.position.z = -230;
            if (npc.mesh.position.x < -230) npc.mesh.position.x = 230;
            if (npc.mesh.position.x > 230) npc.mesh.position.x = -230;
          });
        }

        // Minimap Blip updates
        setMinimapBlips({
          player: { x: g.playerPos.x, z: g.playerPos.z, angle: g.cameraYaw },
          cops: g.policeOfficers.filter((c) => c.alive).map((c) => ({ x: c.mesh.position.x, z: c.mesh.position.z })),
          missions: g.activeMission ? [g.activeMission.target || LOCATIONS.bank] : [{ x: LOCATIONS.bank.x, z: LOCATIONS.bank.z }],
        });
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      soundFx.stopRadio();
      soundFx.stopEngineSound && soundFx.stopEngineSound();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [completeMission, damageVehicle, handleAttack, handleEnterExitVehicle, handleToggleRadio, showToast, startMission, updatePlayerGunMesh]);

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-black font-sans text-white">
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

      {/* Sniper Scope Overlay */}
      {isAiming && WEAPONS[selectedWeaponIdx]?.hasScope && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
          <div className="relative w-[360px] sm:w-[480px] h-[360px] sm:h-[480px] rounded-full border-4 border-black/95 shadow-[0_0_0_9999px_rgba(0,0,0,0.85)] flex items-center justify-center overflow-hidden">
            <div className="absolute w-full h-[2px] bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <div className="absolute h-full w-[2px] bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <div className="absolute w-14 h-14 rounded-full border border-emerald-400" />
            <div className="absolute top-8 text-xs font-mono font-bold text-emerald-400">RANGE: 150M · 8.4X MAG</div>
          </div>
        </div>
      )}

      {/* Dynamic Aim Crosshair on foot */}
      {!inVehicle && !isAiming && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-white/90 shadow-[0_0_6px_#fff] border border-black/50" />
        </div>
      )}

      {/* Interactive Location Prompt (Gym, Food, Gun Shop, Bank) */}
      {activePrompt && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40 bg-black/90 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center gap-4 animate-bounce">
          <div className="text-left">
            <p className="text-[10px] font-mono text-yellow-400 font-black tracking-widest">{activePrompt.cost}</p>
            <h4 className="text-sm font-black text-white">{activePrompt.title}</h4>
          </div>
          <button
            onClick={() => {
              if (activePrompt.title.includes('GYM')) handleWorkoutAtGym();
              else if (activePrompt.title.includes('BURGER')) handleEatMeal();
              else if (activePrompt.title.includes('AMMU')) setShowAmmuNation(true);
              else if (activePrompt.title.includes('BANK')) startMission(1);
            }}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs rounded-xl shadow-lg"
          >
            {activePrompt.action}
          </button>
        </div>
      )}

      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start pointer-events-none">
        {/* Left: District & Quick Lighting */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="bg-black/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-2xl">
            <p className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-black">SAN ANDREAS · LOS SANTOS</p>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-white" />
              <div className="flex flex-col">
                <span className="text-white font-extrabold text-sm leading-tight">{currentDistrict.name}</span>
                <span className="text-slate-400 font-mono text-[10px] leading-tight">{currentDistrict.street}</span>
              </div>
              <span className="text-slate-400 font-mono text-xs ml-2">🕒 {gameClock}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg">
            <button
              onClick={() => updateEnvironmentLighting('day')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                timeOfDay === 'day' ? 'bg-white text-black font-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Day
            </button>
            <button
              onClick={() => updateEnvironmentLighting('sunset')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                timeOfDay === 'sunset' ? 'bg-orange-400 text-black font-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sunset className="w-3.5 h-3.5" /> Sunset
            </button>
            <button
              onClick={() => updateEnvironmentLighting('night')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                timeOfDay === 'night' ? 'bg-white text-black font-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Night
            </button>
          </div>
        </div>

        {/* Right: Cash, Wanted Level & Cheats */}
        <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
          <div className="bg-black/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border-2 border-emerald-500/60 shadow-2xl flex items-baseline gap-1 text-emerald-400">
            <span className="text-sm font-black">$</span>
            <span className="font-mono text-2xl md:text-3xl font-black tracking-wider">
              {cash.toLocaleString()}
            </span>
          </div>

          {/* 5-Star Wanted Level */}
          <div className="flex items-center gap-1.5 bg-black/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-xl transition-all ${
                  wantedLevel >= star
                    ? 'text-yellow-400 animate-pulse drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]'
                    : 'text-slate-700'
                }`}
              >
                ★
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCameraMode(cameraMode === 'third' ? 'far' : cameraMode === 'far' ? 'first' : 'third')}
              className="px-3 py-1.5 rounded-xl bg-black text-white hover:bg-white hover:text-black font-bold text-xs border border-white/40 flex items-center gap-1 transition-all"
            >
              <Eye className="w-3.5 h-3.5" /> CAM [V]
            </button>
            <button
              onClick={() => setShowCheats(true)}
              className="px-3 py-1.5 rounded-xl bg-black text-white hover:bg-white hover:text-black font-bold text-xs border border-white/40 shadow-md flex items-center gap-1 transition-all"
            >
              <Key className="w-3.5 h-3.5" /> CHEATS
            </button>
            <button
              onClick={onBackToMenu}
              className="px-3 py-1.5 rounded-xl bg-black text-white hover:bg-white hover:text-black font-bold text-xs border border-white/40 transition-all"
            >
              MENU
            </button>
          </div>
        </div>
      </div>

      {/* Active Mission Banner */}
      {activeMission && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-black/90 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-yellow-400 shadow-[0_0_35px_rgba(234,179,8,0.5)] flex items-center gap-5 text-center pointer-events-auto">
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400 font-mono">
              PRIZE: ${activeMission.prize.toLocaleString()} · {activeMission.subtitle}
            </p>
            <h4 className="text-base font-black text-white">{activeMission.title}</h4>
            <p className="text-xs text-slate-300 max-w-sm">{activeMission.desc}</p>
          </div>
          <div className="pl-4 border-l border-white/20">
            <p className="text-[10px] font-bold text-slate-400">TIME</p>
            <p className={`text-2xl font-mono font-black ${missionTimer < 15 ? 'text-rose-500 animate-ping' : 'text-yellow-400'}`}>
              {missionTimer}s
            </p>
          </div>
        </div>
      )}

      {/* Mission Passed Screen (Cash Prize Celebration!) */}
      {missionPassedBanner && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
          <div className="p-8 rounded-3xl bg-zinc-950 border-2 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.6)] text-center animate-bounce">
            <p className="text-yellow-400 font-black text-xs tracking-widest mb-1 uppercase font-mono">GRAND THEFT AUTO · MISSION COMPLETE</p>
            <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-md mb-2">
              MISSION PASSED!
            </h2>
            <p className="text-lg font-bold text-slate-200 mb-3">{missionPassedBanner.title}</p>
            <p className="text-3xl font-black text-emerald-400 font-mono">+${missionPassedBanner.prize.toLocaleString()} PRIZE AWARDED</p>
          </div>
        </div>
      )}

      {/* Realistic Supercar Speedometer & Racing Dashboard Cluster */}
      {inVehicle && (
        <div className="absolute bottom-6 right-6 z-30 bg-black/95 backdrop-blur-md p-4 rounded-3xl border-2 border-white/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex items-center gap-5 pointer-events-auto">
          {/* Circular Analog Tachometer & Gear Display */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Tachometer background ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#1e293b"
                strokeWidth="7"
                strokeDasharray="200"
                strokeDashoffset="50"
              />
              {/* RPM Arc */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={vehicleRpm > 7200 ? '#ef4444' : '#00e5ff'}
                strokeWidth="7"
                strokeDasharray="200"
                strokeDashoffset={200 - Math.min(150, ((vehicleRpm - 800) / 7500) * 150)}
                className="transition-all duration-75"
              />
            </svg>

            {/* RPM Needle */}
            <div
              className="absolute w-1 h-9 bg-rose-500 rounded-full origin-bottom shadow-[0_0_8px_#ef4444] transition-transform duration-75"
              style={{
                top: '12px',
                transform: `rotate(${Math.min(125, -125 + ((vehicleRpm - 800) / 7500) * 250)}deg)`,
              }}
            />

            {/* Central Gear & RPM text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border ${
                vehicleGear === 'R' ? 'bg-rose-900 border-rose-500 text-rose-300' :
                vehicleGear === 'N' ? 'bg-zinc-800 border-zinc-600 text-slate-300' :
                'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_10px_#06b6d4]'
              }`}>
                {vehicleGear}
              </div>
              <span className="text-[8px] font-mono text-slate-400 mt-0.5">
                {Math.round(vehicleRpm / 100) / 10}k
              </span>
            </div>
          </div>

          {/* Speed, NOS & Vehicle Status */}
          <div className="min-w-[130px]">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <p className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">
                {inVehicle.toUpperCase()}
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-mono font-black text-white tabular-nums tracking-tight drop-shadow-md">
                {vehicleSpeed}
              </span>
              <span className="text-xs font-black text-slate-400 font-mono">MPH</span>
            </div>

            {/* Nitrous Boost Gauge */}
            <div className="mt-1.5">
              <div className="flex justify-between text-[9px] font-black text-cyan-300 mb-0.5">
                <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5 text-cyan-400 fill-current" /> NOS</span>
                <span>{nitroAmount}%</span>
              </div>
              <div className="w-32 h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
                <div
                  className={`h-full ${isNitroActive ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 animate-pulse' : 'bg-cyan-500'} transition-all`}
                  style={{ width: `${nitroAmount}%` }}
                />
              </div>
            </div>

            {/* Vehicle Armor */}
            <div className="w-32 h-1.5 bg-slate-900 rounded-full mt-1.5 overflow-hidden border border-white/10">
              <div
                className={`h-full ${vehicleHealth > 50 ? 'bg-emerald-400' : vehicleHealth > 25 ? 'bg-amber-400' : 'bg-rose-500'}`}
                style={{ width: `${vehicleHealth}%` }}
              />
            </div>
          </div>

          {/* Racing Action Buttons */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                const modes = ['third', 'cockpit', 'hood', 'far'];
                const nextIdx = (modes.indexOf(cameraMode) + 1) % modes.length;
                const next = modes[nextIdx];
                setCameraMode(next);
                gameRef.current.cameraMode = next;
                showToast(`CAMERA: ${next.toUpperCase()} VIEW`);
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-[11px] flex items-center justify-center gap-1 border border-white/20 transition-all"
            >
              <Eye className="w-3 h-3 text-cyan-400" /> {cameraMode.toUpperCase()} [V]
            </button>
            <button
              onClick={() => soundFx.playCarHorn && soundFx.playCarHorn()}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-[11px] flex items-center justify-center gap-1 border border-white/20 transition-all"
            >
              📢 HORN [H]
            </button>
            {!activeMission && (
              <button
                onClick={() => startMission(4)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] flex items-center justify-center gap-1 shadow-md transition-all"
              >
                🏁 DRAG RACE
              </button>
            )}
            <button
              onClick={handleEnterExitVehicle}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-lg border border-rose-400/40 transition-all"
            >
              <Car className="w-3 h-3" /> EXIT [F]
            </button>
          </div>
        </div>
      )}

      {/* Universal On-Screen Racing Controls (Pedals & Steering) for Desktop Mouse & Mobile Touch */}
      {inVehicle && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 pointer-events-auto">
          {/* Steering & Handbrake Cluster */}
          <div className="flex items-center gap-2 bg-black/85 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl">
            <button
              onMouseDown={() => { gameRef.current.driveControls.left = true; }}
              onMouseUp={() => { gameRef.current.driveControls.left = false; }}
              onMouseLeave={() => { gameRef.current.driveControls.left = false; }}
              onTouchStart={(e) => { e.preventDefault(); gameRef.current.driveControls.left = true; }}
              onTouchEnd={(e) => { e.preventDefault(); gameRef.current.driveControls.left = false; }}
              className="w-13 h-13 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-white active:text-black border border-white/20 text-white font-black text-xs flex flex-col items-center justify-center transition-all select-none shadow-md"
              title="Steer Left [A]"
            >
              <span className="text-sm">◀</span>
              <span className="text-[9px] text-slate-400 font-mono">LEFT [A]</span>
            </button>

            <button
              onMouseDown={() => {
                gameRef.current.driveControls.handbrake = true;
                soundFx.playDriftScreech && soundFx.playDriftScreech();
              }}
              onMouseUp={() => { gameRef.current.driveControls.handbrake = false; }}
              onMouseLeave={() => { gameRef.current.driveControls.handbrake = false; }}
              onTouchStart={(e) => {
                e.preventDefault();
                gameRef.current.driveControls.handbrake = true;
                soundFx.playDriftScreech && soundFx.playDriftScreech();
              }}
              onTouchEnd={(e) => { e.preventDefault(); gameRef.current.driveControls.handbrake = false; }}
              className="w-13 h-13 px-3 py-2.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 active:scale-95 text-white font-black text-xs flex flex-col items-center justify-center border border-amber-400/40 select-none shadow-md"
              title="Handbrake Drift [SPACE]"
            >
              <span className="text-sm">🛑</span>
              <span className="text-[9px] font-mono">DRIFT</span>
            </button>

            <button
              onMouseDown={() => { gameRef.current.driveControls.right = true; }}
              onMouseUp={() => { gameRef.current.driveControls.right = false; }}
              onMouseLeave={() => { gameRef.current.driveControls.right = false; }}
              onTouchStart={(e) => { e.preventDefault(); gameRef.current.driveControls.right = true; }}
              onTouchEnd={(e) => { e.preventDefault(); gameRef.current.driveControls.right = false; }}
              className="w-13 h-13 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-white active:text-black border border-white/20 text-white font-black text-xs flex flex-col items-center justify-center transition-all select-none shadow-md"
              title="Steer Right [D]"
            >
              <span className="text-sm">▶</span>
              <span className="text-[9px] text-slate-400 font-mono">RIGHT [D]</span>
            </button>
          </div>

          {/* Throttle, Brake & Nitrous Pedals */}
          <div className="flex items-center gap-2 bg-black/85 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl">
            {/* Nitrous NOS Boost Pedal */}
            <button
              onMouseDown={() => {
                if (gameRef.current.nitro > 10) {
                  gameRef.current.driveControls.nitro = true;
                  gameRef.current.isNitroActive = true;
                  setIsNitroActive(true);
                  soundFx.playNitrousSound && soundFx.playNitrousSound();
                }
              }}
              onMouseUp={() => {
                gameRef.current.driveControls.nitro = false;
                gameRef.current.isNitroActive = false;
                setIsNitroActive(false);
              }}
              onMouseLeave={() => {
                gameRef.current.driveControls.nitro = false;
                gameRef.current.isNitroActive = false;
                setIsNitroActive(false);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                if (gameRef.current.nitro > 10) {
                  gameRef.current.driveControls.nitro = true;
                  gameRef.current.isNitroActive = true;
                  setIsNitroActive(true);
                  soundFx.playNitrousSound && soundFx.playNitrousSound();
                }
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                gameRef.current.driveControls.nitro = false;
                gameRef.current.isNitroActive = false;
                setIsNitroActive(false);
              }}
              className="w-14 h-14 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 active:scale-95 text-white font-black text-xs flex flex-col items-center justify-center shadow-lg border border-cyan-400/50 select-none"
              title="Nitrous NOS [SHIFT]"
            >
              <Flame className="w-4 h-4 fill-current text-cyan-200" />
              <span className="text-[9px] font-mono">NOS [SHIFT]</span>
            </button>

            {/* Brake / Reverse Pedal */}
            <button
              onMouseDown={() => { gameRef.current.driveControls.brake = true; }}
              onMouseUp={() => { gameRef.current.driveControls.brake = false; }}
              onMouseLeave={() => { gameRef.current.driveControls.brake = false; }}
              onTouchStart={(e) => { e.preventDefault(); gameRef.current.driveControls.brake = true; }}
              onTouchEnd={(e) => { e.preventDefault(); gameRef.current.driveControls.brake = false; }}
              className="w-14 h-14 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs flex flex-col items-center justify-center shadow-lg border border-rose-400/50 select-none"
              title="Brake / Reverse [S / Down]"
            >
              <span className="text-base font-black">▼</span>
              <span className="text-[9px] font-mono">BRAKE [S]</span>
            </button>

            {/* Accelerator Gas Pedal (Primary Racing Pedal!) */}
            <button
              onMouseDown={() => {
                gameRef.current.driveControls.gas = true;
                soundFx.init();
              }}
              onMouseUp={() => { gameRef.current.driveControls.gas = false; }}
              onMouseLeave={() => { gameRef.current.driveControls.gas = false; }}
              onTouchStart={(e) => {
                e.preventDefault();
                gameRef.current.driveControls.gas = true;
                soundFx.init();
              }}
              onTouchEnd={(e) => { e.preventDefault(); gameRef.current.driveControls.gas = false; }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-700 hover:brightness-110 active:scale-95 text-white font-black text-sm flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] border-2 border-emerald-300 select-none"
              title="Accelerate / Gas [W / Up]"
            >
              <span className="text-lg font-black leading-tight">▲</span>
              <span className="text-[10px] font-black tracking-wider">GAS [W]</span>
            </button>
          </div>
        </div>
      )}

      {/* Weapon Selector */}
      <div className="absolute top-24 right-4 z-30 flex flex-col gap-1.5 pointer-events-auto">
        {WEAPONS.map((w, idx) => {
          const isSelected = selectedWeaponIdx === idx;
          const count = ammo[w.id];
          return (
            <button
              key={w.id}
              onClick={() => {
                setSelectedWeaponIdx(idx);
                gameRef.current.selectedWeaponIdx = idx;
                updatePlayerGunMesh(idx);
                soundFx.playClick();
              }}
              className={`flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-2xl border backdrop-blur-md transition-all active:scale-95 ${
                isSelected
                  ? 'bg-white text-black border-2 border-white font-black shadow-lg'
                  : 'bg-black/80 text-slate-400 border-white/10 hover:border-white/30'
              }`}
            >
              <span className="text-lg">{w.icon}</span>
              <div className="text-right">
                <p className="text-[11px] font-black leading-none">{w.name}</p>
                <p className="text-[10px] font-mono mt-0.5 opacity-75">
                  {w.id === 'fists' ? '∞' : count}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Radar Minimap with Gym, Food, Gun Shop, Bank Icons */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-auto flex flex-col items-center">
        <div className="relative w-40 h-40 rounded-full bg-black/90 border-2 border-white/30 shadow-[0_0_30px_rgba(0,0,0,0.9)] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
          <div className="absolute w-24 h-24 rounded-full border border-cyan-500/20" />
          <div className="absolute w-full h-[1px] bg-cyan-500/20" />
          <div className="absolute h-full w-[1px] bg-cyan-500/20" />

          {/* Player Direction Arrow */}
          <div
            className="w-3.5 h-3.5 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-cyan-400 z-10 drop-shadow-[0_0_6px_#06b6d4]"
            style={{ transform: `rotate(${-minimapBlips.player.angle}rad)` }}
          />

          {/* Cops */}
          {minimapBlips.cops.map((c, i) => {
            const dx = (c.x - minimapBlips.player.x) * 0.65;
            const dz = (c.z - minimapBlips.player.z) * 0.65;
            if (Math.hypot(dx, dz) > 65) return null;
            return (
              <div
                key={i}
                className="absolute w-3 h-3 bg-rose-500 rounded-full animate-ping"
                style={{ transform: `translate(${dx}px, ${dz}px)` }}
              />
            );
          })}

          {/* Gym Blip (Yellow) */}
          {(() => {
            const dx = (LOCATIONS.gym.x - minimapBlips.player.x) * 0.65;
            const dz = (LOCATIONS.gym.z - minimapBlips.player.z) * 0.65;
            if (Math.hypot(dx, dz) > 65) return null;
            return (
              <div
                className="absolute w-3 h-3 bg-yellow-400 rounded-full border border-black flex items-center justify-center text-[7px]"
                style={{ transform: `translate(${dx}px, ${dz}px)` }}
                title="GYM"
              >
                🏋️
              </div>
            );
          })()}

          {/* Food Blip (Orange) */}
          {(() => {
            const dx = (LOCATIONS.food.x - minimapBlips.player.x) * 0.65;
            const dz = (LOCATIONS.food.z - minimapBlips.player.z) * 0.65;
            if (Math.hypot(dx, dz) > 65) return null;
            return (
              <div
                className="absolute w-3 h-3 bg-orange-500 rounded-full border border-black flex items-center justify-center text-[7px]"
                style={{ transform: `translate(${dx}px, ${dz}px)` }}
                title="BURGER SHOT"
              >
                🍔
              </div>
            );
          })()}

          {/* Gun Shop Blip (Red) */}
          {(() => {
            const dx = (LOCATIONS.gunShop.x - minimapBlips.player.x) * 0.65;
            const dz = (LOCATIONS.gunShop.z - minimapBlips.player.z) * 0.65;
            if (Math.hypot(dx, dz) > 65) return null;
            return (
              <div
                className="absolute w-3 h-3 bg-red-600 rounded-full border border-white flex items-center justify-center text-[7px]"
                style={{ transform: `translate(${dx}px, ${dz}px)` }}
                title="AMMU-NATION"
              >
                🔫
              </div>
            );
          })()}

          {/* Bank / Mission Blip (Green) */}
          {(() => {
            const dx = (LOCATIONS.bank.x - minimapBlips.player.x) * 0.65;
            const dz = (LOCATIONS.bank.z - minimapBlips.player.z) * 0.65;
            if (Math.hypot(dx, dz) > 65) return null;
            return (
              <div
                className="absolute w-3.5 h-3.5 bg-emerald-500 rounded-full border border-white shadow-[0_0_8px_#10b981]"
                style={{ transform: `translate(${dx}px, ${dz}px)` }}
                title="BANK"
              />
            );
          })()}
        </div>

        {/* GTA V Triple Mini-Bars */}
        <div className="w-36 flex flex-col gap-1 mt-2 bg-black/90 p-1.5 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black text-emerald-400 w-3">HP</span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-150" style={{ width: `${Math.max(0, health)}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black text-cyan-400 w-3">AR</span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 transition-all duration-150" style={{ width: `${Math.max(0, armor)}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black text-yellow-400 w-3">SP</span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 transition-all duration-150" style={{ width: `${stamina}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Radio Selector */}
      <div className="absolute bottom-6 left-52 z-30 hidden sm:flex items-center gap-2 bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 shadow-xl pointer-events-auto">
        <Radio className="w-4 h-4 text-white" />
        <span className="text-xs font-black text-slate-300">RADIO:</span>
        {[
          { id: 'radioLosSantos', label: 'Radio Los Santos' },
          { id: 'losSantosRock', label: 'LS Rock Radio' },
          { id: 'nonStopPop', label: 'Non-Stop Pop FM' },
          { id: 'off', label: 'OFF' },
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => handleToggleRadio(st.id)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all ${
              currentStation === st.id ? 'bg-white text-black font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40 bg-black/95 backdrop-blur-md border border-cyan-400/60 px-5 py-2 rounded-2xl text-cyan-300 font-black text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ammu-Nation Modal */}
      {showAmmuNation && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="max-w-md w-full bg-zinc-950 rounded-3xl border-2 border-red-600/80 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAmmuNation(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="text-xl font-black text-white">AMMU-NATION GUN SHOP</h3>
                <p className="text-xs text-slate-400">Stock up on tactical guns, ammo & armor</p>
              </div>
            </div>

            <div className="space-y-2.5 mb-6 max-h-72 overflow-y-auto pr-1">
              <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <div>
                    <p className="text-sm font-bold text-white">Heavy Body Armor</p>
                    <p className="text-xs text-slate-400">100% Kevlar Protection</p>
                  </div>
                </div>
                <button
                  onClick={() => handleBuyItem('armor')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl"
                >
                  $300
                </button>
              </div>

              {WEAPONS.filter((w) => w.id !== 'fists').map((w) => (
                <div key={w.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-2xl border border-white/10">
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
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-2xl"
            >
              EXIT SHOP
            </button>
          </div>
        </div>
      )}

      {/* Cheats Modal */}
      {showCheats && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="max-w-lg w-full bg-zinc-950 rounded-3xl border-2 border-white/40 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCheats(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-xl font-black text-white">CHEAT CODES</h3>
                <p className="text-xs text-slate-400">Type or tap any code below</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={cheatInput}
                onChange={(e) => setCheatInput(e.target.value)}
                placeholder="Type cheat code..."
                className="flex-1 bg-zinc-900 border border-white/20 px-4 py-2 rounded-xl text-sm font-mono text-white outline-none focus:border-white uppercase"
              />
              <button
                onClick={() => applyCheat(cheatInput)}
                className="px-5 py-2 bg-white text-black font-black text-xs rounded-xl"
              >
                APPLY
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 max-h-60 overflow-y-auto pr-1">
              {CHEATS.map((c) => (
                <button
                  key={c.code}
                  onClick={() => applyCheat(c.code)}
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-left rounded-xl border border-white/10 hover:border-white/40 transition-all text-xs"
                >
                  <p className="font-mono font-black text-white">{c.code}</p>
                  <p className="text-[10px] text-slate-400">{c.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCheats(false)}
              className="w-full py-2.5 bg-zinc-900 text-slate-300 font-bold text-xs rounded-xl"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-950 border-2 border-red-600 shadow-2xl">
            <h2 className="text-5xl font-black text-red-600 tracking-widest mb-2 font-mono drop-shadow-[0_0_20px_#ef4444]">
              WASTED
            </h2>
            <p className="text-sm text-slate-400 mb-6">You got eliminated on the streets of Los Santos!</p>
            <div className="bg-zinc-900 p-4 rounded-2xl mb-6 border border-white/10">
              <p className="text-xs text-slate-400">CASH RETAINED</p>
              <p className="text-3xl font-mono font-black text-emerald-400">${cash.toLocaleString()}</p>
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
                  gameRef.current.playerPos.set(31, 0.9, 0);
                  setGameState('playing');
                }}
                className="flex-1 py-3.5 bg-white text-black font-black text-sm rounded-2xl shadow-lg hover:bg-slate-200"
              >
                HOSPITAL RESPAWN
              </button>
              <button
                onClick={onBackToMenu}
                className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-2xl border border-white/20"
              >
                MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Menu Screen */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-zinc-950 border-2 border-white/30 shadow-[0_0_80px_rgba(0,0,0,0.9)]">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white text-black font-mono font-black text-xs border border-white mb-3 tracking-widest">
              ⭐ GTA 3D · REAL WORLD EDITION (GTA 5 & 4) ⭐
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-xl">
              GRAND THEFT AUTO 3D
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
              Welcome to the real-world streets of Los Santos! Commandeer the Zentorno supercar, Bati 801 superbike, and attack helicopter. Hit the <strong>Nitrous Boost [SHIFT]</strong> to race down the boulevard at 140+ MPH! Visit the <strong>Gym</strong>, <strong>Burger Shot</strong>, and <strong>Ammu-Nation</strong>. Complete high-stakes missions for massive cash prizes!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-left text-xs bg-zinc-900/80 p-4 rounded-2xl border border-white/10">
              <div>
                <p className="text-white font-black mb-1">🎮 DRIVING & RACING:</p>
                <p className="text-slate-300 font-medium">• WASD / Arrows: Steer & Accelerate</p>
                <p className="text-slate-300 font-medium">• Shift: Nitrous NOS Boost (140+ MPH!)</p>
                <p className="text-slate-300 font-medium">• Space: Handbrake Drift Slide</p>
                <p className="text-slate-300 font-medium">• F / Enter: Enter & Exit Car</p>
              </div>
              <div>
                <p className="text-white font-black mb-1">🔫 GUNPLAY & PRIZES:</p>
                <p className="text-slate-300 font-medium">• Left Click: Shoot Person with Gun</p>
                <p className="text-slate-300 font-medium">• Right Click: Aim / Sniper Zoom</p>
                <p className="text-slate-300 font-medium">• E: Interact with Gym/Burger/Shop</p>
                <p className="text-slate-300 font-medium">• Complete Missions for $$$ Prizes</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setGameState('playing');
                }}
                className="flex-1 py-4 bg-white hover:bg-slate-200 text-black font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                ENTER LOS SANTOS
              </button>
              <button
                onClick={onBackToMenu}
                className="px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-2xl border border-white/20"
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
