import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';

function AnimatedSphere() {
  const sphereRef = useRef();

  useFrame((state) => {
    const { clock } = state;
    sphereRef.current.distort = 0.3 + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
  });

  return (
    <Sphere ref={sphereRef} args={[1, 100, 200]} scale={2}>
      <MeshDistortMaterial
        color="#6366f1"
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-20 opacity-30 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} color="#06b6d4" intensity={2} />
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <AnimatedSphere />
        </Float>
      </Canvas>
    </div>
  );
}
