import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeDBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles (Stars)
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      // Size
      sizes[i] = Math.random() * 3 + 1;

      // Color (white with slight variation)
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Floating Squares/Rectangles
    const squareCount = 15;
    const squares = [];

    for (let i = 0; i < squareCount; i++) {
      const size = Math.random() * 2 + 0.5;
      const geometry = new THREE.PlaneGeometry(size, size);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: Math.random() * 0.15 + 0.05,
        side: THREE.DoubleSide,
      });
      const square = new THREE.Mesh(geometry, material);

      square.position.x = (Math.random() - 0.5) * 100;
      square.position.y = (Math.random() - 0.5) * 100;
      square.position.z = (Math.random() - 0.5) * 50;

      square.rotation.z = Math.random() * Math.PI;
      
      square.userData = {
        velocityY: Math.random() * 0.02 + 0.01,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
      };

      squares.push(square);
      scene.add(square);
    }

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.001;

      // Rotate particles slowly
      particles.rotation.y = time * 0.05;
      particles.rotation.x = time * 0.03;

      // Animate particle opacity (twinkling effect)
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(time * 2 + i) * 0.01;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Animate squares
      squares.forEach((square) => {
        square.position.y -= square.userData.velocityY;
        square.rotation.z += square.userData.rotationSpeed;

        // Reset position when out of view
        if (square.position.y < -60) {
          square.position.y = 60;
          square.position.x = (Math.random() - 0.5) * 100;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      squares.forEach((square) => {
        square.geometry.dispose();
        square.material.dispose();
      });
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
