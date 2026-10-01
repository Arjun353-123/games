import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Play, RotateCcw, Volume2, VolumeX, Shield, Zap, Magnet, Trophy, Sparkles, Flag, CheckCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { saveHighScore } from '../utils/storage';
import MobileControls from '../components/MobileControls';
import useSwipe from '../hooks/useSwipe';
import confetti from 'canvas-confetti';

export default function TempleRunner3D({ isKidsMode = false, onBackToMenu, highScore = 0, onScoreUpdate }) {
  const mountRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover', 'victory'
  const [score, setScore] = useState(0); // Distance in Meters
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3); // 3 Hearts Health System
  const [targetDistance, setTargetDistance] = useState(2500); // Default 2500m
  const [noObstacles, setNoObstacles] = useState(false); // Relaxed mode (no obstacles)
  const [newRecord, setNewRecord] = useState(false);

  // Gameplay Refs for RAF loop
  const gameRef = useRef({
    lane: 0, // -1: Left, 0: Mid, 1: Right
    targetX: 0,
    playerY: 1,
    isJumping: false,
    isSliding: false,
    jumpVelocity: 0,
    slideTime: 0,
    speed: 0.45,
    distanceMeters: 0,
    hearts: 3,
    invulnerableTimer: 0,
    obstacles: [],
    collectibles: [],
    trackTiles: [],
    shieldActive: false,
    scene: null,
    playerMesh: null,
    leftArm: null,
    rightArm: null,
    leftLeg: null,
    rightLeg: null,
  });

  // State Refs for RAF loop to prevent constant Three.js scene teardowns
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const noObstaclesRef = useRef(noObstacles);
  useEffect(() => {
    noObstaclesRef.current = noObstacles;
  }, [noObstacles]);

  const targetDistanceRef = useRef(targetDistance);
  useEffect(() => {
    targetDistanceRef.current = targetDistance;
  }, [targetDistance]);

  const lanePositions = [-3.2, 0, 3.2];

  // Clear scene obstacles & coins for clean restart
  const clearSceneItems = useCallback(() => {
    const g = gameRef.current;
    if (!g.scene) return;

    if (g.obstacles && g.obstacles.length > 0) {
      g.obstacles.forEach((obs) => {
        if (g.scene) g.scene.remove(obs);
      });
      g.obstacles = [];
    }
    if (g.collectibles && g.collectibles.length > 0) {
      g.collectibles.forEach((coin) => {
        if (g.scene) g.scene.remove(coin);
      });
      g.collectibles = [];
    }
  }, []);

  // Helper actions
  const moveLeft = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    if (gameRef.current.lane > -1) {
      gameRef.current.lane -= 1;
      soundFx.playMove();
    }
  }, []);

  const moveRight = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    if (gameRef.current.lane < 1) {
      gameRef.current.lane += 1;
      soundFx.playMove();
    }
  }, []);

  const jump = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    if (!gameRef.current.isJumping) {
      gameRef.current.isJumping = true;
      gameRef.current.jumpVelocity = 0.28;
      soundFx.playJump();
    }
  }, []);

  const slide = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    if (!gameRef.current.isSliding) {
      gameRef.current.isSliding = true;
      gameRef.current.slideTime = 25; // frames
      soundFx.playSlide();
    }
  }, []);

  // Mobile swipe controls hook
  useSwipe({
    onSwipeLeft: moveLeft,
    onSwipeRight: moveRight,
    onSwipeUp: jump,
    onSwipeDown: slide
  });

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameStateRef.current !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft();
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight();
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') jump();
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') slide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLeft, moveRight, jump, slide]);

  // Spawn Glowing 3D Diamond Collectibles at a stable fixed surface height
  const spawnDiamondPattern = useCallback((sceneObj, zPos) => {
    if (!sceneObj) return;

    const diamondGeo = new THREE.OctahedronGeometry(0.45, 0);
    diamondGeo.scale(1, 1.3, 1); // Sleek 3D diamond gemstone shape

    const cyanMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x0099ff,
      emissiveIntensity: 0.85,
      metalness: 0.95,
      roughness: 0.05
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffa500,
      emissiveIntensity: 0.85,
      metalness: 0.95,
      roughness: 0.05
    });

    const patternType = Math.random();
    const fixedY = 1.1; // Stable fixed height right above track deck surface

    if (patternType < 0.5) {
      // Stream of Cyan Diamonds along a random lane
      const laneIdx = Math.floor(Math.random() * 3);
      const x = lanePositions[laneIdx];
      for (let c = 0; c < 5; c++) {
        const diamond = new THREE.Mesh(diamondGeo, cyanMat);
        diamond.position.set(x, fixedY, zPos - c * 2.2);
        diamond.userData = { type: 'cyan' };
        sceneObj.add(diamond);
        gameRef.current.collectibles.push(diamond);
      }
    } else {
      // Dual lane streams of Cyan & Gold Diamonds on stable track surface
      const lane1 = Math.floor(Math.random() * 3);
      const lane2 = (lane1 + 1) % 3;
      for (let c = 0; c < 4; c++) {
        const d1 = new THREE.Mesh(diamondGeo, cyanMat);
        d1.position.set(lanePositions[lane1], fixedY, zPos - c * 2.5);
        d1.userData = { type: 'cyan' };

        const d2 = new THREE.Mesh(diamondGeo, goldMat);
        d2.position.set(lanePositions[lane2], fixedY, zPos - c * 2.5);
        d2.userData = { type: 'gold' };

        sceneObj.add(d1, d2);
        gameRef.current.collectibles.push(d1, d2);
      }
    }
  }, []);

  // Spawn Helper Function
  const spawnRow = useCallback((sceneObj, zPos) => {
    if (!sceneObj) return;
    const laneIdx = Math.floor(Math.random() * 3);
    const x = lanePositions[laneIdx];

    // Spawn Obstacle (only if SURVIVAL mode)
    if (!noObstaclesRef.current) {
      const obstacleGeos = {
        hurdle: new THREE.BoxGeometry(2.8, 0.7, 0.6),
        overhead: new THREE.BoxGeometry(3.0, 1.2, 0.6),
        wall: new THREE.BoxGeometry(2.8, 2.8, 0.8)
      };

      const randType = Math.random();
      let obsMesh;
      let obsType = 'hurdle';

      if (randType < 0.4) {
        obsType = 'hurdle';
        const mat = new THREE.MeshStandardMaterial({ color: 0x4a2a12, roughness: 0.9 });
        obsMesh = new THREE.Mesh(obstacleGeos.hurdle, mat);
        obsMesh.position.set(x, 0.35, zPos);
      } else if (randType < 0.7) {
        obsType = 'overhead';
        const mat = new THREE.MeshStandardMaterial({ color: 0x382414, roughness: 0.8 });
        obsMesh = new THREE.Mesh(obstacleGeos.overhead, mat);
        obsMesh.position.set(x, 2.2, zPos);
      } else {
        obsType = 'wall';
        const mat = new THREE.MeshStandardMaterial({ color: 0x545454, roughness: 0.7 });
        obsMesh = new THREE.Mesh(obstacleGeos.wall, mat);
        obsMesh.position.set(x, 1.4, zPos);
      }

      obsMesh.castShadow = true;
      obsMesh.userData = { type: obsType, lane: laneIdx };
      sceneObj.add(obsMesh);
      gameRef.current.obstacles.push(obsMesh);
    }

    // Always spawn glowing Diamond pattern alongside
    spawnDiamondPattern(sceneObj, zPos);
  }, [spawnDiamondPattern]);

  // Main Three.js setup & Game Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Reset obstacle arrays cleanly for new Three.js scene
    gameRef.current.obstacles = [];
    gameRef.current.collectibles = [];
    gameRef.current.trackTiles = [];

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    gameRef.current.scene = scene;
    
    const fogColor = isKidsMode ? 0x87ceeb : 0x1a3636;
    scene.background = new THREE.Color(fogColor);
    scene.fog = new THREE.FogExp2(fogColor, 0.016);

    const camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(0, 5.2, 9.5);
    camera.lookAt(0, 2, -10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Warm Lights
    const ambientLight = new THREE.AmbientLight(isKidsMode ? 0xffffff : 0xffdfb3, isKidsMode ? 0.9 : 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 0.9);
    sunLight.position.set(15, 35, 15);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Dark Swamp Water
    const waterGeo = new THREE.PlaneGeometry(100, 300);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0f2a24,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.9
    });
    const swampWater = new THREE.Mesh(waterGeo, waterMat);
    swampWater.rotation.x = -Math.PI / 2;
    swampWater.position.set(0, -3.5, -50);
    scene.add(swampWater);

    // Explorer Character Group
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 1, 0);

    const jacketGeo = new THREE.BoxGeometry(0.85, 1.1, 0.55);
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.6 });
    const body = new THREE.Mesh(jacketGeo, jacketMat);
    body.position.y = 0.55;
    body.castShadow = true;

    const shirtGeo = new THREE.BoxGeometry(0.5, 0.9, 0.56);
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
    const shirt = new THREE.Mesh(shirtGeo, shirtMat);
    shirt.position.y = 0.55;
    body.add(shirt);
    playerGroup.add(body);

    const headGeo = new THREE.SphereGeometry(0.38, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf5d0a9, roughness: 0.5 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.55;
    head.castShadow = true;

    const hairGeo = new THREE.BoxGeometry(0.42, 0.15, 0.42);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x3d2314 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.22, 0);
    head.add(hair);
    playerGroup.add(head);

    const legMat = new THREE.MeshStandardMaterial({ color: 0x2b4c7e, roughness: 0.5 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x3a2010 });

    const createLeg = (x) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(x, 0, 0);

      const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.75, 0.32), legMat);
      legMesh.position.y = -0.2;
      legMesh.castShadow = true;

      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.25, 0.42), bootMat);
      boot.position.set(0, -0.52, 0.05);
      boot.castShadow = true;

      legGroup.add(legMesh, boot);
      return legGroup;
    };

    const leftLeg = createLeg(-0.24);
    const rightLeg = createLeg(0.24);

    const armMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21 });
    const armGeo = new THREE.BoxGeometry(0.24, 0.75, 0.24);
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.56, 0.6, 0);
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.56, 0.6, 0);

    playerGroup.add(leftLeg, rightLeg, leftArm, rightArm);
    scene.add(playerGroup);

    gameRef.current.playerMesh = playerGroup;
    gameRef.current.leftArm = leftArm;
    gameRef.current.rightArm = rightArm;
    gameRef.current.leftLeg = leftLeg;
    gameRef.current.rightLeg = rightLeg;

    // 3D Chasing Red Fire Dragon Monster (Temple Run Demon Beast)
    const dragonGroup = new THREE.Group();
    dragonGroup.position.set(0, 1.8, 5.5);

    const dragonHeadMat = new THREE.MeshStandardMaterial({ color: 0x800c0c, roughness: 0.4 });
    const dragonHead = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.8), dragonHeadMat);
    dragonHead.position.y = 0.6;
    dragonHead.castShadow = true;

    const snout = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.4), dragonHeadMat);
    snout.position.set(0, -0.2, -1.2);
    dragonHead.add(snout);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), eyeMat);
    leftEye.position.set(-0.55, 0.3, -0.6);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), eyeMat);
    rightEye.position.set(0.55, 0.3, -0.6);
    dragonHead.add(leftEye, rightEye);

    const hornMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
    const hornGeo = new THREE.ConeGeometry(0.25, 1.2, 6);
    const leftHorn = new THREE.Mesh(hornGeo, hornMat);
    leftHorn.rotation.x = -Math.PI / 4;
    leftHorn.position.set(-0.6, 0.8, 0.4);

    const rightHorn = new THREE.Mesh(hornGeo, hornMat);
    rightHorn.rotation.x = -Math.PI / 4;
    rightHorn.position.set(0.6, 0.8, 0.4);
    dragonHead.add(leftHorn, rightHorn);

    dragonGroup.add(dragonHead);

    const wingMat = new THREE.MeshStandardMaterial({ color: 0x4a0505, side: THREE.DoubleSide });
    const wingGeo = new THREE.BoxGeometry(3.2, 0.1, 1.8);

    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-2.0, 0.8, 0.5);
    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(2.0, 0.8, 0.5);
    dragonGroup.add(leftWing, rightWing);

    scene.add(dragonGroup);

    gameRef.current.dragonGroup = dragonGroup;
    gameRef.current.leftWing = leftWing;
    gameRef.current.rightWing = rightWing;

    // Track Deck Tiles
    const trackGroup = new THREE.Group();
    scene.add(trackGroup);

    const woodPlankMat = new THREE.MeshStandardMaterial({ color: 0x734828, roughness: 0.85 });
    const woodBeamMat = new THREE.MeshStandardMaterial({ color: 0x472b16, roughness: 0.9 });
    const stonePostMat = new THREE.MeshStandardMaterial({ color: 0x5e5b56, roughness: 0.8 });

    const createTrackTile = (zPos) => {
      const tileGroup = new THREE.Group();
      tileGroup.position.z = zPos;

      const deckGeo = new THREE.BoxGeometry(10.2, 0.4, 20);
      const deck = new THREE.Mesh(deckGeo, woodPlankMat);
      deck.position.y = -0.2;
      deck.receiveShadow = true;
      tileGroup.add(deck);

      const railGeo = new THREE.BoxGeometry(0.4, 0.5, 20);
      const leftRail = new THREE.Mesh(railGeo, woodBeamMat);
      leftRail.position.set(-4.9, 0.25, 0);
      const rightRail = new THREE.Mesh(railGeo, woodBeamMat);
      rightRail.position.set(4.9, 0.25, 0);
      tileGroup.add(leftRail, rightRail);

      for (let s = -8; s <= 8; s += 8) {
        const pillarGeo = new THREE.BoxGeometry(0.8, 2.8, 0.8);
        const leftPillar = new THREE.Mesh(pillarGeo, stonePostMat);
        leftPillar.position.set(-5.6, 1.2, s);
        const rightPillar = new THREE.Mesh(pillarGeo, stonePostMat);
        rightPillar.position.set(5.6, 1.2, s);

        const torchGeo = new THREE.SphereGeometry(0.25, 8, 8);
        const torchMat = new THREE.MeshBasicMaterial({ color: 0xffa500 });
        const leftTorch = new THREE.Mesh(torchGeo, torchMat);
        leftTorch.position.set(-5.6, 2.8, s);
        const rightTorch = new THREE.Mesh(torchGeo, torchMat);
        rightTorch.position.set(5.6, 2.8, s);

        tileGroup.add(leftPillar, rightPillar, leftTorch, rightTorch);
      }

      return tileGroup;
    };

    for (let i = 0; i < 10; i++) {
      const tile = createTrackTile(-i * 20);
      trackGroup.add(tile);
      gameRef.current.trackTiles.push(tile);
    }

    // Initial Background Obstacles & Diamond Streams
    for (let z = -30; z > -160; z -= 22) {
      spawnRow(scene, z);
    }

    // Resize Handler
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Main Game Animation Loop
    let animationId;
    let runAnimStep = 0;
    let wingFlapStep = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const g = gameRef.current;

      if (gameStateRef.current === 'playing') {
        // Precise Distance Meter Accumulation
        g.distanceMeters += Math.round(g.speed * 1.6);
        const currentDist = g.distanceMeters;
        setScore(currentDist);

        // Target Victory Check
        const currentTargetDist = targetDistanceRef.current;
        if (currentTargetDist < 90000 && currentDist >= currentTargetDist) {
          soundFx.playWin();
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
          setGameState('victory');
          saveHighScore('templeRun', currentDist);
          return;
        }

        // Smooth Lane Shift
        g.targetX = lanePositions[g.lane + 1];
        playerGroup.position.x += (g.targetX - playerGroup.position.x) * 0.22;

        // Animate 3D Dragon Chasing Player
        if (dragonGroup) {
          wingFlapStep += 0.18;
          leftWing.rotation.z = Math.sin(wingFlapStep) * 0.45;
          rightWing.rotation.z = -Math.sin(wingFlapStep) * 0.45;

          // Dragon smoothly follows player's X lane with slight delay
          dragonGroup.position.x += (playerGroup.position.x - dragonGroup.position.x) * 0.1;
          dragonGroup.position.z = playerGroup.position.z + 4.8 + Math.sin(wingFlapStep * 0.5) * 0.4;
        }

        // Jump Physics
        if (g.isJumping) {
          playerGroup.position.y += g.jumpVelocity;
          g.jumpVelocity -= 0.015;
          if (playerGroup.position.y <= 1) {
            playerGroup.position.y = 1;
            g.isJumping = false;
            g.jumpVelocity = 0;
          }
        }

        // Slide Scale
        if (g.isSliding) {
          g.slideTime -= 1;
          playerGroup.scale.set(1, 0.4, 1);
          if (g.slideTime <= 0) {
            g.isSliding = false;
            playerGroup.scale.set(1, 1, 1);
          }
        }

        // Limb Movement
        if (!g.isJumping && !g.isSliding) {
          runAnimStep += 0.22;
          g.leftArm.rotation.x = Math.sin(runAnimStep) * 0.85;
          g.rightArm.rotation.x = -Math.sin(runAnimStep) * 0.85;
          g.leftLeg.rotation.x = -Math.sin(runAnimStep) * 0.85;
          g.rightLeg.rotation.x = Math.sin(runAnimStep) * 0.85;
        }

        // Scroll Track Deck
        g.trackTiles.forEach((tile) => {
          tile.position.z += g.speed;
          if (tile.position.z > 20) {
            tile.position.z -= 200;
          }
        });

        // CONTINUOUS DIAMOND & OBSTACLE GENERATOR (Never runs out!)
        let minDiamondZ = 0;
        g.collectibles.forEach((coin) => {
          if (coin.position.z < minDiamondZ) minDiamondZ = coin.position.z;
        });
        if (minDiamondZ > -130) {
          spawnDiamondPattern(scene, -160);
        }

        if (!noObstaclesRef.current) {
          let minObsZ = 0;
          g.obstacles.forEach((obs) => {
            if (obs.position.z < minObsZ) minObsZ = obs.position.z;
          });
          if (minObsZ > -130) {
            spawnRow(scene, -160);
          }
        }

        // Obstacle Motion & Accurate 3D Collision
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const obs = g.obstacles[i];
          obs.position.z += g.speed;

          const distZ = Math.abs(obs.position.z - playerGroup.position.z);
          const distX = Math.abs(obs.position.x - playerGroup.position.x);

          // Precise 3D collision check based on actual distance & clearance
          if (distX < 1.3 && distZ < 0.65) {
            let hit = false;

            if (obs.userData.type === 'hurdle') {
              // Hurdle top is at y = 0.70. Player clears hurdle if jumping
              if (!g.isJumping && playerGroup.position.y < 1.25) {
                hit = true;
              }
            } else if (obs.userData.type === 'overhead') {
              // Overhead beam starts at y = 1.6. Player passes under if sliding
              if (!g.isSliding && playerGroup.scale.y > 0.6) {
                hit = true;
              }
            } else if (obs.userData.type === 'wall') {
              // Wall covers whole lane
              hit = true;
            }

            if (hit) {
              // Remove collided obstacle immediately so it cannot hit again
              scene.remove(obs);
              g.obstacles.splice(i, 1);

              if (g.invulnerableTimer === 0) {
                g.hearts -= 1;
                setLives(g.hearts);
                g.invulnerableTimer = 90; // ~1.5 seconds invulnerability
                soundFx.playPowerup();

                // Flash player scale feedback
                if (playerGroup) {
                  playerGroup.scale.set(0.8, 0.8, 0.8);
                  setTimeout(() => playerGroup && playerGroup.scale.set(1, 1, 1), 200);
                }

                if (g.hearts <= 0) {
                  soundFx.playGameOver();
                  setGameState('gameover');
                  const isNew = saveHighScore('templeRun', currentDist);
                  if (isNew) {
                    setNewRecord(true);
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                  }
                  break;
                }
              }
              continue;
            }
          }

          if (obs.position.z > 15) {
            scene.remove(obs);
            g.obstacles.splice(i, 1);
          }
        }

        // Tick down invulnerability timer
        if (g.invulnerableTimer > 0) {
          g.invulnerableTimer -= 1;
          playerGroup.visible = Math.floor(g.invulnerableTimer / 6) % 2 === 0;
        } else {
          playerGroup.visible = true;
        }

        // Collect & Animate Diamonds (Fixed stable surface height, smooth Y-axis spin)
        for (let i = g.collectibles.length - 1; i >= 0; i--) {
          const coin = g.collectibles[i];
          coin.position.z += g.speed;
          coin.rotation.y += 0.04;

          const distZ = Math.abs(coin.position.z - playerGroup.position.z);
          const distX = Math.abs(coin.position.x - playerGroup.position.x);

          if (distZ < 1.3 && distX < 1.3) {
            soundFx.playCoin();
            const inc = coin.userData.type === 'cyan' ? 2 : 1;
            setCoins((prev) => prev + inc);
            scene.remove(coin);
            g.collectibles.splice(i, 1);
          } else if (coin.position.z > 15) {
            scene.remove(coin);
            g.collectibles.splice(i, 1);
          }
        }

        // Speed Progression
        if (g.speed < 0.85) {
          g.speed += 0.00006;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      clearSceneItems();
      renderer.dispose();
    };
  }, [isKidsMode, spawnRow, clearSceneItems]);

  // Clean Start / Restart Game Handler
  const handleStartGame = () => {
    clearSceneItems(); // Clear old obstacles and coins from previous run!

    const g = gameRef.current;
    g.distanceMeters = 0;
    g.speed = 0.45;
    g.lane = 0;
    g.targetX = 0;
    g.playerY = 1;
    g.isJumping = false;
    g.isSliding = false;
    g.jumpVelocity = 0;
    g.slideTime = 0;
    g.hearts = 3;
    g.invulnerableTimer = 0;

    if (g.playerMesh) {
      g.playerMesh.position.set(0, 1, 0);
      g.playerMesh.scale.set(1, 1, 1);
      g.playerMesh.visible = true;
    }

    // Spawn fresh initial obstacles far ahead
    if (g.scene) {
      for (let z = -40; z > -160; z -= 25) {
        spawnRow(g.scene, z);
      }
    }

    setScore(0);
    setCoins(0);
    setLives(3);
    setNewRecord(false);
    setGameState('playing');
    soundFx.playClick();
  };

  const progressPct = targetDistance >= 90000 ? 100 : Math.min(100, Math.floor((score / targetDistance) * 100));

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 flex flex-col font-sans select-none">
      {/* 3D Viewport */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-pointer" />

      {/* GOLDEN HUD HEADER WITH LIVE DISTANCE PROGRESS BAR */}
      <div className="relative z-10 p-4 flex flex-col sm:flex-row justify-between items-center gap-3 pointer-events-none">
        <button
          onClick={onBackToMenu}
          className="pointer-events-auto px-4 py-2 bg-amber-950/90 hover:bg-amber-900 text-amber-200 font-bold text-sm border-2 border-amber-500/60 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95 transition-all flex items-center gap-2"
        >
          <span>← EXIT TEMPLE</span>
        </button>

        {/* Live Distance Progress Bar */}
        {gameState === 'playing' && (
          <div className="w-full max-w-xs bg-amber-950/80 p-2 rounded-2xl border-2 border-amber-500/50 backdrop-blur-md">
            <div className="flex justify-between items-center text-xs font-black text-amber-300 mb-1">
              <span className="flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-yellow-400" />
                DISTANCE
              </span>
              <span>
                {score}m {targetDistance < 90000 ? `/ ${targetDistance}m` : '(ENDLESS)'}
              </span>
            </div>
            <div className="w-full bg-slate-900/80 h-3 rounded-full overflow-hidden border border-yellow-400/30 p-0.5">
              <div
                className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full rounded-full transition-all duration-150"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 items-center">
          {/* 3 Hearts Health Display */}
          {gameState === 'playing' && (
            <div className="px-3 py-2 bg-rose-950/80 backdrop-blur-md rounded-2xl border-2 border-rose-500/60 text-rose-300 font-black flex items-center gap-1 shadow-[0_0_15px_rgba(225,29,72,0.4)] animate-pulse">
              {[...Array(3)].map((_, idx) => (
                <span key={idx} className={idx < lives ? 'text-rose-500 opacity-100 text-lg' : 'text-slate-600 opacity-40 text-lg'}>
                  ❤️
                </span>
              ))}
            </div>
          )}

          {/* Yellow Diamond Coins Counter */}
          <div className="px-4 py-2 bg-gradient-to-r from-amber-600/90 to-yellow-600/90 backdrop-blur-md rounded-2xl border-2 border-yellow-300 text-yellow-100 font-black flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.5)]">
            <span className="text-xl animate-spin">💎</span>
            <span className="text-base tracking-wider">{coins}</span>
          </div>

          <div className="px-4 py-2 bg-gradient-to-r from-yellow-700/90 to-amber-800/90 backdrop-blur-md rounded-2xl border-2 border-yellow-400 text-yellow-200 font-black text-lg tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.5)]">
            {score}m
          </div>
        </div>
      </div>

      {/* Start / Menu Overlay with Target Goal Selector */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
          <div className="max-w-md w-full bg-gradient-to-b from-amber-950/90 to-slate-950/95 p-8 rounded-3xl text-center border-4 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.4)] animate-scale-in">
            <div className="text-5xl mb-2">🏛️</div>
            <h2 className="text-4xl font-black mb-2 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 drop-shadow-md">
              REAL TEMPLE RUN
            </h2>
            <p className="text-amber-200/90 text-sm mb-6 font-semibold">
              Select your Target Run Goal to play long distances!
            </p>

            {/* Obstacle Challenge Mode Selector */}
            <div className="mb-4 bg-amber-950/70 p-3 rounded-2xl border border-amber-500/40">
              <label className="block text-xs font-extrabold text-yellow-400 mb-2 uppercase tracking-wider">
                🛡️ OBSTACLE CHALLENGE MODE:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { soundFx.playClick(); setNoObstacles(false); }}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
                    !noObstacles
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 border-2 border-yellow-200 shadow-md'
                      : 'bg-amber-900/40 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  ⚔️ SURVIVAL (OBSTACLES)
                </button>

                <button
                  onClick={() => { soundFx.playClick(); setNoObstacles(true); }}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
                    noObstacles
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 border-2 border-emerald-200 shadow-md'
                      : 'bg-amber-900/40 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  🛡️ RELAXED (NO OBSTACLES)
                </button>
              </div>
            </div>

            {/* Target Goal Distance Selector */}
            <div className="mb-6 bg-amber-950/70 p-3 rounded-2xl border border-amber-500/40">
              <label className="block text-xs font-extrabold text-yellow-400 mb-2 uppercase tracking-wider">
                🎯 SET TARGET DISTANCE GOAL:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '1,000m', val: 1000 },
                  { label: '2,500m', val: 2500 },
                  { label: '5,000m', val: 5000 },
                  { label: 'ENDLESS', val: 99999 }
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => { soundFx.playClick(); setTargetDistance(item.val); }}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      targetDistance === item.val
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 border-2 border-yellow-200 shadow-md scale-105'
                        : 'bg-amber-900/40 text-amber-300 border border-amber-500/30 hover:bg-amber-800/60'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 py-3 px-4 bg-amber-500/20 rounded-2xl border border-amber-400/40 flex justify-between items-center text-sm font-bold text-yellow-300">
              <span className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                RECORD DISTANCE:
              </span>
              <span className="text-lg font-black">{highScore}m</span>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-4 rounded-2xl font-black text-xl text-amber-950 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 border-2 border-yellow-200 shadow-[0_0_25px_rgba(234,179,8,0.6)] hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Play className="w-7 h-7 fill-current" />
              RUN FOR YOUR LIFE!
            </button>
          </div>
        </div>
      )}

      {/* MISSION VICTORY OVERLAY */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg p-6">
          <div className="max-w-md w-full bg-gradient-to-b from-amber-950/90 to-slate-950/95 p-8 rounded-3xl text-center border-4 border-yellow-400 shadow-[0_0_60px_rgba(234,179,8,0.6)] animate-scale-in">
            <div className="text-6xl mb-2">🏆</div>
            <h2 className="text-3xl font-black text-yellow-400 mb-2">TEMPLE CONQUERED!</h2>
            <p className="text-amber-200 text-sm mb-4 font-semibold">
              You reached your target goal of <strong className="text-yellow-300">{targetDistance}m</strong>!
            </p>

            <div className="my-6 space-y-3">
              <div className="p-4 bg-amber-950/70 rounded-2xl border border-amber-500/30 flex justify-between items-center text-amber-200">
                <span className="font-bold">TOTAL DISTANCE</span>
                <span className="text-3xl font-black text-yellow-400">{score}m</span>
              </div>
              <div className="p-4 bg-amber-950/70 rounded-2xl border border-amber-500/30 flex justify-between items-center text-amber-200">
                <span className="font-bold">YELLOW DIAMONDS</span>
                <span className="text-2xl font-black text-amber-300">💎 {coins}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onBackToMenu}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 font-bold text-sm border border-white/10"
              >
                MENU
              </button>

              <button
                onClick={handleStartGame}
                className="flex-1 py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 rounded-2xl text-amber-950 font-black text-sm shadow-[0_0_20px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                RUN AGAIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg p-6">
          <div className="max-w-md w-full bg-gradient-to-b from-amber-950/90 to-slate-950/95 p-8 rounded-3xl text-center border-4 border-rose-600/60 shadow-[0_0_50px_rgba(225,29,72,0.4)] animate-scale-in">
            <h2 className="text-3xl font-black text-rose-500 mb-2">RUN CRASHED!</h2>
            {newRecord && (
              <div className="inline-block py-1.5 px-5 bg-yellow-400/20 border-2 border-yellow-400 text-yellow-300 font-extrabold text-xs rounded-full mb-4 animate-pulse">
                👑 NEW TEMPLE RECORD!
              </div>
            )}

            <div className="my-6 space-y-3">
              <div className="p-4 bg-amber-950/70 rounded-2xl border border-amber-500/30 flex justify-between items-center text-amber-200">
                <span className="font-bold">DISTANCE SCORE</span>
                <span className="text-3xl font-black text-yellow-400">{score}m</span>
              </div>
              <div className="p-4 bg-amber-950/70 rounded-2xl border border-amber-500/30 flex justify-between items-center text-amber-200">
                <span className="font-bold">YELLOW DIAMONDS</span>
                <span className="text-2xl font-black text-amber-300">💎 {coins}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onBackToMenu}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 font-bold text-sm border border-white/10"
              >
                MENU
              </button>

              <button
                onClick={handleStartGame}
                className="flex-1 py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 rounded-2xl text-amber-950 font-black text-sm shadow-[0_0_20px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                RUN AGAIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Touch Mobile Controls */}
      {gameState === 'playing' && (
        <MobileControls
          onLeft={moveLeft}
          onRight={moveRight}
          onAction1={jump}
          onAction2={slide}
          action1Label="JUMP"
          action2Label="SLIDE"
          isKidsMode={isKidsMode}
        />
      )}
    </div>
  );
}


