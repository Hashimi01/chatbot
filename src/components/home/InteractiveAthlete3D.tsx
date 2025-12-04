// @ts-nocheck
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { useFBX, OrbitControls, Environment, ContactShadows, PerspectiveCamera, shaderMaterial, MeshTransmissionMaterial, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

interface InteractiveAthlete3DProps {
  modelUrl?: string;
}

// Custom Holographic Shader
const HolographicMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.0, 0.85, 1.0),
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
  // Fragment shader
  `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

void main() {
      // Fresnel effect
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0);

      // Scan lines
      float scanLine = sin(vPosition.y * 30.0 + time * 3.0) * 0.5 + 0.5;

      // Glitch effect
      float glitch = sin(vPosition.y * 10.0 + time * 5.0) * 0.1;

      // Combine effects
      vec3 finalColor = color * (fresnel + scanLine * 0.3 + glitch);
      float alpha = fresnel * 0.8 + 0.2;

    gl_FragColor = vec4(finalColor, alpha);
}
`
);

extend({ HolographicMaterial });

const AnimatedAthlete = ({ modelUrl = '/models/athletic-male.fbx' }: { modelUrl: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const holographicMaterialRef = useRef<any>();
  
  const fbx = useFBX(modelUrl);

  useEffect(() => {
    if (fbx && fbx.animations && fbx.animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(fbx);
      const action = mixerRef.current.clipAction(fbx.animations[0]);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [fbx]);

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    if (holographicMaterialRef.current) {
      holographicMaterialRef.current.time = state.clock.elapsedTime;
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mousePos.x * 0.5,
        0.05
      );
      
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 - 0.8;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={fbx} scale={[0.01, 0.01, 0.01]} />
      
      {/* Glowing aura around athlete */}
      <mesh scale={[1.2, 2, 1.2]} position={[0, 0.5, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <holographicMaterial ref={holographicMaterialRef} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* Multi-colored rim lights */}
      <pointLight position={[2, 2, 2]} intensity={3} color="#00D9FF" distance={5} />
      <pointLight position={[-2, 2, -2]} intensity={3} color="#FF0055" distance={5} />
      <pointLight position={[0, 3, 0]} intensity={2} color="#9333EA" distance={6} />
    </group>
  );
};

// DNA Helix
const DNAHelix = () => {
  const helixRef = useRef<THREE.Group>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 50; i++) {
      const t = (i / 50) * Math.PI * 4;
      const radius = 1.5;
      temp.push({
        position: [
          Math.cos(t) * radius,
          (i / 50) * 4 - 2,
          Math.sin(t) * radius,
        ],
        position2: [
          Math.cos(t + Math.PI) * radius,
          (i / 50) * 4 - 2,
          Math.sin(t + Math.PI) * radius,
        ],
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (helixRef.current) {
      helixRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={helixRef}>
      {particles.map((p, i) => (
        <group key={i}>
          <mesh position={p.position as any}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color="#00D9FF"
              emissive="#00D9FF"
              emissiveIntensity={2}
            />
          </mesh>
          <mesh position={p.position2 as any}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color="#FF0055"
              emissive="#FF0055"
              emissiveIntensity={2}
            />
          </mesh>
          {i < particles.length - 1 && (
            <line>
              <bufferGeometry attach="geometry">
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([...p.position, ...p.position2] as any)}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial attach="material" color="#ffffff" opacity={0.3} transparent />
            </line>
          )}
        </group>
      ))}
    </group>
  );
};

// Energy Field Pulses
const EnergyPulse = ({ radius, speed, color }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * speed) * 0.3;
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * speed) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        wireframe
      />
    </mesh>
  );
};

// Floating Energy Particles
const EnergyParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    const colors = new Float32Array(200 * 3);
    
    for (let i = 0; i < 200; i++) {
      const radius = 3 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 0.85;
        colors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0;
        colors[i * 3 + 2] = 0.33;
      } else {
        colors[i * 3] = 0.58;
        colors[i * 3 + 1] = 0.2;
        colors[i * 3 + 2] = 0.92;
      }
    }
    
    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

// Energy Ring
const EnergyRing = ({ radius, color, speed }: any) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * speed;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.03, 16, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
};

export const InteractiveAthlete3D: React.FC<InteractiveAthlete3DProps> = ({ 
  modelUrl = '/models/athletic-male.fbx' 
}) => {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={50} />
        
        {/* Dramatic Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#00D9FF" castShadow />
        <directionalLight position={[-10, 5, -5]} intensity={1.5} color="#FF0055" />
        <spotLight position={[0, 10, 0]} angle={0.3} intensity={3} color="#ffffff" penumbra={1} />
        <pointLight position={[0, 2, 0]} intensity={2} color="#9333EA" distance={10} />
        
        {/* Environment */}
        <Environment preset="night" />

        {/* Main athlete model */}
        <AnimatedAthlete modelUrl={modelUrl} />

        {/* DNA Helix */}
        <DNAHelix />

        {/* Energy Pulses */}
        <EnergyPulse radius={2} speed={1} color="#00D9FF" />
        <EnergyPulse radius={2.5} speed={1.5} color="#FF0055" />
        <EnergyPulse radius={3} speed={0.8} color="#9333EA" />

        {/* Floating Energy Particles */}
        <EnergyParticles />

        {/* Energy rings */}
        <EnergyRing radius={2.2} color="#00D9FF" speed={0.5} />
        <EnergyRing radius={2.5} color="#FF0055" speed={-0.3} />
        <EnergyRing radius={2.8} color="#9333EA" speed={0.4} />

        {/* Sparkles */}
        <Sparkles
          count={100}
          scale={5}
          size={3}
          speed={0.4}
          opacity={1}
          color="#00D9FF"
        />

        {/* Ground shadow */}
        <ContactShadows 
          position={[0, -1.5, 0]} 
          opacity={0.6} 
          scale={12} 
          blur={3} 
          far={5}
          color="#00D9FF"
        />

        {/* Interactive camera controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />

        {/* POST-PROCESSING EFFECTS */}
        <EffectComposer>
          {/* Bloom for glow */}
          <Bloom
            intensity={2}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          
          {/* Chromatic Aberration for futuristic look */}
          <ChromaticAberration
            offset={[0.002, 0.002]}
            blendFunction={BlendFunction.NORMAL}
          />
          
          {/* Depth of Field */}
          <DepthOfField
            focusDistance={0.01}
            focalLength={0.05}
            bokehScale={3}
          />
          
          {/* Vignette */}
          <Vignette
            offset={0.3}
            darkness={0.5}
            blendFunction={BlendFunction.NORMAL}
          />
          
          {/* Film Grain */}
          <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
