import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function BackgroundMedia({ bgType = '3d-particles', mode = 'college' }) {
  const canvasRef = useRef(null);
  const videoCanvasRef = useRef(null);

  const isKidsMode = mode === 'kids';
  const isNoirMode = mode === 'noir';

  useEffect(() => {
    if (bgType !== '3d-particles') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Three.js 3D Particles Background Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Geometry
    const count = isNoirMode ? 1600 : 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const kidPalette = [
      new THREE.Color('#ff7675'),
      new THREE.Color('#74b9ff'),
      new THREE.Color('#55efc4'),
      new THREE.Color('#ffeaa7'),
      new THREE.Color('#a29bfe')
    ];

    const cyberPalette = [
      new THREE.Color('#3b82f6'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#ec4899'),
      new THREE.Color('#06b6d4'),
      new THREE.Color('#10b981')
    ];

    const noirPalette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#e5e5e5'),
      new THREE.Color('#a3a3a3'),
      new THREE.Color('#737373'),
      new THREE.Color('#404040')
    ];

    const palette = isKidsMode ? kidPalette : isNoirMode ? noirPalette : cyberPalette;

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 85;
      positions[i + 1] = (Math.random() - 0.5) * 85;
      positions[i + 2] = (Math.random() - 0.5) * 85;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i] = col.r;
      colors[i + 1] = col.g;
      colors[i + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: isNoirMode ? 0.45 : isKidsMode ? 0.6 : 0.4,
      vertexColors: true,
      transparent: true,
      opacity: isNoirMode ? 0.85 : isKidsMode ? 0.75 : 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse movement interaction
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.012;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.012;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Resize listener
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      particles.rotation.y += isNoirMode ? 0.002 : 0.0015;
      particles.rotation.x += isNoirMode ? 0.001 : 0.0008;

      particles.position.x += (mouseX - particles.position.x) * 0.05;
      particles.position.y += (-mouseY - particles.position.y) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [bgType, mode, isKidsMode, isNoirMode]);

  // 2. Real 3D Animated Video Tunnel Scene
  useEffect(() => {
    if (bgType !== 'cyber-video') return;
    const canvas = videoCanvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3D Tunnel Cylinder Wireframe
    const tunnelGeo = new THREE.CylinderGeometry(15, 15, 120, 24, 40, true);
    const tunnelMat = new THREE.MeshBasicMaterial({
      color: isNoirMode ? 0xffffff : isKidsMode ? 0xff6b81 : 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.x = Math.PI / 2;
    scene.add(tunnel);

    // Floating 3D Orbs / Shapes flying through the tunnel
    const shapesGroup = new THREE.Group();
    scene.add(shapesGroup);

    const shapeGeos = [
      new THREE.IcosahedronGeometry(1.2, 0),
      new THREE.OctahedronGeometry(1.0, 0),
      new THREE.TorusGeometry(1.0, 0.3, 12, 24)
    ];

    const shapeColors = isNoirMode
      ? [0xffffff, 0xd4d4d4, 0x737373]
      : isKidsMode
      ? [0xff7675, 0x74b9ff, 0x55efc4]
      : [0x3b82f6, 0x8b5cf6, 0xec4899];

    for (let i = 0; i < 40; i++) {
      const geo = shapeGeos[i % shapeGeos.length];
      const mat = new THREE.MeshBasicMaterial({
        color: shapeColors[i % shapeColors.length],
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        -Math.random() * 100
      );
      shapesGroup.add(mesh);
    }

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      tunnel.rotation.z += 0.005;
      
      shapesGroup.children.forEach((shape) => {
        shape.position.z += 0.4;
        shape.rotation.x += 0.02;
        shape.rotation.y += 0.02;
        if (shape.position.z > 10) {
          shape.position.z = -100;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      tunnelGeo.dispose();
      tunnelMat.dispose();
    };
  }, [bgType, mode, isKidsMode, isNoirMode]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {bgType === '3d-particles' && (
        <canvas ref={canvasRef} className="w-full h-full block" />
      )}

      {bgType === 'cyber-video' && (
        <div className={`w-full h-full relative overflow-hidden ${isNoirMode ? 'bg-black' : 'bg-slate-950'}`}>
          <canvas ref={videoCanvasRef} className="w-full h-full block relative z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)] z-20" />
        </div>
      )}

      {bgType === 'matrix' && (
        <div className={`w-full h-full ${isNoirMode ? 'bg-black' : 'bg-slate-950'} relative overflow-hidden`}>
          <div className={`absolute inset-0 ${isNoirMode ? 'bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.06)_51%)]' : 'bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,255,170,0.05)_51%)]'} bg-[length:100%_4px]`} />
          <div className={`absolute top-0 left-0 right-0 h-40 ${isNoirMode ? 'bg-gradient-to-b from-white/20 to-transparent' : 'bg-gradient-to-b from-cyan-500/10 to-transparent'} animate-pulse-slow`} />
        </div>
      )}

      {bgType === 'mesh' && (
        <div className={`w-full h-full ${
          isKidsMode
            ? 'bg-gradient-to-br from-pink-300 via-purple-300 to-sky-300'
            : isNoirMode
            ? 'bg-gradient-to-br from-black via-neutral-900 to-zinc-950'
            : 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900'
        }`}>
          <div className={`absolute inset-0 opacity-40 ${isNoirMode ? 'bg-[radial-gradient(#ffffff_1px,transparent_1px)]' : 'bg-[radial-gradient(#3b82f6_1px,transparent_1px)]'} [background-size:24px_24px]`} />
        </div>
      )}

      {bgType === 'aurora' && (
        <div className={`w-full h-full relative overflow-hidden ${
          isNoirMode ? 'bg-black' : isKidsMode ? 'bg-pink-50' : 'bg-slate-950'
        }`}>
          <div className={`aurora-blob absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-50 ${
            isNoirMode ? 'bg-white/20' : isKidsMode ? 'bg-pink-400' : 'bg-blue-600'
          }`} />
          <div className={`aurora-blob absolute bottom-0 right-1/4 w-[450px] h-[450px] rounded-full blur-[100px] opacity-40 animation-delay-2000 ${
            isNoirMode ? 'bg-zinc-500/30' : isKidsMode ? 'bg-amber-300' : 'bg-purple-600'
          }`} />
          <div className={`aurora-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[80px] opacity-30 ${
            isNoirMode ? 'bg-neutral-400/20' : isKidsMode ? 'bg-sky-300' : 'bg-cyan-500'
          }`} style={{ animationDelay: '4s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </div>
      )}
    </div>
  );
}
