'use client'

import React, { useRef, Suspense, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import * as THREE from 'three'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { DrinkModel } from './SodaCan'
import BlurText from './BlurText'
import RotatingText from './RotatingText'
import ScrollFloat from './ScrollFloat'
import SplitText from './SplitText'

gsap.registerPlugin(ScrollTrigger)

/* ─── CAN CONFIGURATION ─────────────────────────────────── */

interface CanConfig {
  modelPath: string
  baseScale: number
  heroPos: [number, number, number]
  heroRot: [number, number, number]
  finalPos: [number, number, number]
  finalRot: [number, number, number]
  heroScale: number
  finalScale: number
  appearsAt: number
}

/*
  Scale calibration (from the debug session):
  - Cola at 0.7 fills ~90% viewport → need ~0.2 for good size
  - Pepsi at 0.005 was tiny → need ~0.025
  - Starbucks at 1.0 was tiny → need ~8.0
  - Latte at 1.0 was invisible → need ~15.0
  - Grimace at 1.0 was tiny → need ~6.0
*/

const CAN_CONFIGS: CanConfig[] = [
  // ═══ HERO CANS ═══

  // LEFT: Starbucks
  {
    modelPath: '/starbucks_coffee_cup_with_removable_sleeve.glb',
    baseScale: 14.0,
    heroPos: [-4.7, 0.6, 0],
    heroRot: [0.1, 0.3, -0.1],
    finalPos: [-0.15, 0.1, -0.3],
    finalRot: [0.05, 0.5, -0.03],
    heroScale: 1,
    finalScale: 0.7,
    appearsAt: 0,
  },
  // RIGHT: Pepsi — lower, same height as text
  {
    modelPath: '/pepsi_can.glb',
    baseScale: 0.020,
    heroPos: [3.0, -0.8, 0],
    heroRot: [0.1, Math.PI + 0.3, 0.1],
    finalPos: [2.4, -1.5, 0.2],
    finalRot: [0.05, Math.PI + 0.5, 0.03],
    heroScale: 1,
    finalScale: 0.8,
    appearsAt: 0,
  },

  // ═══ SCROLL CANS (well-spaced group on right) ═══

  // Cola — front center
  {
    modelPath: '/simple_cola_can.glb',
    baseScale: 0.8,
    heroPos: [3, 5, 0],
    heroRot: [0.3, 1, 0.2],
    finalPos: [1.0, -0.7, 0.8],
    finalRot: [0.05, 0.3, 0.05],
    heroScale: 0,
    finalScale: 0.7,
    appearsAt: 0.3,
  },
  // Latte — back upper right
  {
    modelPath: '/latte_macchiato.glb',
    baseScale: 15.0,
    heroPos: [5, 6, -1],
    heroRot: [-0.3, 2, 0.3],
    finalPos: [2.0, -0.5, -0.5],
    finalRot: [0.02, 0.8, 0.03],
    heroScale: 0,
    finalScale: 0.8,
    appearsAt: 0.38,
  },
  // Grimace — far right
  {
    modelPath: '/grimace_birthday_shake_parody.glb',
    baseScale: 6.0,
    heroPos: [1, 7, -2],
    heroRot: [0.4, -1, -0.3],
    finalPos: [3.6, -0.2, -0.8],
    finalRot: [0.02, -0.3, -0.02],
    heroScale: 0,
    finalScale: 0.6,
    appearsAt: 0.42,
  },
]

/* ─── ANIMATED DRINK ────────────────────────────────────── */

// Helper for smoothstep to avoid duplication
const smoothstepGlobal = (edge0: number, edge1: number, x: number) => {
  const v = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return v * v * (3 - 2 * v)
}

function AnimatedDrink({
  config,
  index,
  scrollProgress,
}: {
  config: CanConfig
  index: number
  scrollProgress: React.RefObject<number>
}) {
  const ref = useRef<THREE.Group>(null!)
  const startTime = useRef<number | null>(null)

  const entranceOffset: [number, number, number] = config.appearsAt === 0
    ? [config.heroPos[0] * 2.5, config.heroPos[1] + 3, config.heroPos[2] - 2]
    : config.heroPos

  useFrame((state) => {
    if (!ref.current) return
    const p = scrollProgress.current ?? 0
    const t = state.clock.elapsedTime

    if (startTime.current === null) startTime.current = t
    const elapsed = t - startTime.current

    // Faster scroll transitions since we have 600vh now
    const scrollEase = smoothstepGlobal(0.15, 0.35, p)
    const entranceDuration = 2.0
    const entranceEase = smoothstepGlobal(0, entranceDuration, elapsed)

    const entrancePosX = THREE.MathUtils.lerp(entranceOffset[0], config.heroPos[0], entranceEase)
    const entrancePosY = THREE.MathUtils.lerp(entranceOffset[1], config.heroPos[1], entranceEase)
    const entrancePosZ = THREE.MathUtils.lerp(entranceOffset[2], config.heroPos[2], entranceEase)

    // ─── SCENE 2 EXIT ───
    // Differentiate the Hero Pepsi from the others
    const isPepsiHero = config.modelPath === '/pepsi_can.glb' && config.appearsAt === 0
    const exitP = smoothstepGlobal(0.35, 0.42, p)
    const exitOffsetX = !isPepsiHero ? exitP * 15 : 0 // Non-pepsis move offscreen to the right

    ref.current.position.x = THREE.MathUtils.lerp(entrancePosX, config.finalPos[0], scrollEase) + exitOffsetX
    ref.current.position.y =
      THREE.MathUtils.lerp(entrancePosY, config.finalPos[1], scrollEase) +
      Math.sin(t * 1.5 + index * 1.3) * 0.08
    ref.current.position.z = THREE.MathUtils.lerp(entrancePosZ, config.finalPos[2], scrollEase)

    const entranceTumble = (1 - entranceEase) * Math.PI * 3
    const scrollTumble = scrollEase * Math.PI * 2

    ref.current.rotation.x = THREE.MathUtils.lerp(config.heroRot[0], config.finalRot[0], scrollEase)
    ref.current.rotation.y =
      THREE.MathUtils.lerp(config.heroRot[1], config.finalRot[1], scrollEase) +
      entranceTumble + scrollTumble
    ref.current.rotation.z = THREE.MathUtils.lerp(config.heroRot[2], config.finalRot[2], scrollEase)

    // Hide the Pepsi hero instantly at 0.35 so RollingPepsi can seamlessly take over
    const disappear = isPepsiHero ? 1 - smoothstepGlobal(0.35, 0.351, p) : 1

    if (config.appearsAt > 0) {
      const appear = smoothstepGlobal(0.2, 0.3, p)
      ref.current.scale.setScalar(appear * disappear * config.finalScale * config.baseScale)
    } else {
      const entranceScale = entranceEase
      const heroToFinal = smoothstepGlobal(0.15, 0.35, p)
      const currentScale = THREE.MathUtils.lerp(config.heroScale, config.finalScale, heroToFinal)
      ref.current.scale.setScalar(entranceScale * currentScale * disappear * config.baseScale)
    }
  })

  return <DrinkModel ref={ref} modelPath={config.modelPath} />
}

/* ─── ROLLING PEPSI (Scenes 3-5) ────────────────────────── */

function RollingPepsi({ scrollProgress }: { scrollProgress: React.RefObject<number> }) {
  const ref = useRef<THREE.Group>(null!)

  // ─── TWEAK THESE VALUES TO ADJUST THE ROLLING PEPSI ─── //
  const canScale = 0.0200    // Size of the can (increase for bigger, decrease for smaller)
  const startY = 1.00       // Height where the can starts rolling from (Below navbar)
  const endY = -5.0        // Height where the can finishes rolling to (Bottom of screen)
  const positionX = -1.25      // Left/Right position (0 is centered)
  const positionZ = 2      // Depth (higher number = closer to screen)
  // ────────────────────────────────────────────────────── //

  useFrame((state) => {
    if (!ref.current) return
    const p = scrollProgress.current ?? 0
    if (p < 0.34) {
      ref.current.scale.setScalar(0)
      return
    }

    // ─── PREPARATION PHASE (0.35 to 0.42) ───
    // Fly from the group 'try all' position up to the starting roll position
    const prepP = smoothstepGlobal(0.35, 0.42, p)

    // Pepsi final config from CAN_CONFIGS:
    const startScale = 0.8 * 0.02 // finalScale * baseScale
    const startPos = [2.5, 0.1, 0.3]
    const startRot = [-0.1, Math.PI + 0.1, -0.1]

    ref.current.scale.setScalar(THREE.MathUtils.lerp(startScale, canScale, prepP))

    if (prepP < 1) {
      ref.current.position.x = THREE.MathUtils.lerp(startPos[0], positionX, prepP)
      ref.current.position.y = THREE.MathUtils.lerp(startPos[1], startY, prepP)
      ref.current.position.z = THREE.MathUtils.lerp(startPos[2], positionZ, prepP)

      ref.current.rotation.x = THREE.MathUtils.lerp(startRot[0], 0, prepP)
      ref.current.rotation.y = THREE.MathUtils.lerp(startRot[1], 0, prepP)
      // Roll into horizontal alignment
      ref.current.rotation.z = THREE.MathUtils.lerp(startRot[2], -Math.PI / 2, prepP)
      return
    }

    // ─── ROLLING PHASE ───
    // Loop logic for 4 sections:
    // S2 (0.42-0.565), S3 (0.565-0.71), S4 (0.71-0.855), S5 (0.855-1.0)
    let loopP = 0
    let isFinalPhase = false
    if (p < 0.565) loopP = smoothstepGlobal(0.42, 0.565, p)
    else if (p < 0.71) loopP = smoothstepGlobal(0.565, 0.71, p)
    else if (p < 0.855) loopP = smoothstepGlobal(0.71, 0.855, p)
    else {
      loopP = smoothstepGlobal(0.855, 1.0, p)
      isFinalPhase = true
    }

    // Drop from top to bottom (but lock at the top for the final pouring scene)
    const currentEndY = isFinalPhase ? startY : endY
    let currentY = THREE.MathUtils.lerp(startY, currentEndY, loopP)

    // Smoothly calculate our tilt progress early so we can use it for both X-position and Z-rotation
    const tiltP = isFinalPhase ? smoothstepGlobal(0.855, 0.88, p) : 0

    // Elevate the can significantly higher (towards navbar) on final tilt
    if (isFinalPhase) {
      currentY = THREE.MathUtils.lerp(currentY, startY + 2.2, tiltP)
    }
    ref.current.position.y = currentY

    // Slide it to the center (0) so it perfectly aligns with the spilling liquid mask!
    ref.current.position.x = isFinalPhase ? THREE.MathUtils.lerp(positionX, 0, tiltP) : positionX

    // Horizontal alignment
    if (isFinalPhase) {
      // Tilt from horizontal (-Math.PI/2) to upside down (-Math.PI) to pour!
      ref.current.rotation.z = THREE.MathUtils.lerp(-Math.PI / 2, -Math.PI, tiltP)

      // The roll at p=0.855 is exactly -13.05 * Math.PI. Snap it smoothly to -14 * Math.PI to center the logo!
      ref.current.rotation.x = THREE.MathUtils.lerp(-13.05 * Math.PI, -14 * Math.PI, tiltP)
      ref.current.rotation.y = 0
    } else {
      ref.current.rotation.z = -Math.PI / 2
      // Rolling rotation: rolling backward/forward visually
      ref.current.rotation.x = -(p - 0.42) * Math.PI * 30
      ref.current.rotation.y = 0
    }

    ref.current.position.z = positionZ
  })

  return <DrinkModel ref={ref} modelPath={'/pepsi_can.glb'} />
}

/* ─── BUBBLES EFFECT ─────────────────────────────────────── */

function Bubbles({ scrollProgress }: { scrollProgress: React.RefObject<number> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const count = 120 // Increased bubble count
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        t: Math.random() * 100,
        factor: 0.1 + Math.random() * 0.5,
        speed: 0.01 + Math.random() * 0.02,
        x: -12 + Math.random() * 24, // Wider spread
        y: -15 + Math.random() * 30, // Taller spread
        z: -5 + Math.random() * 8,   // Deeper spread
        scale: 0.08 + Math.random() * 0.15, // Larger bubbles
      })
    }
    return temp
  }, [])

  useFrame(() => {
    if (!meshRef.current) return
    const p = scrollProgress.current ?? 0
    // Make bubbles float up progressively faster
    const pSpeed = p * 0.2

    particles.forEach((particle, i) => {
      let { t, factor, speed, x, y, z, scale } = particle
      t += speed + pSpeed
      particle.t = t

      // Float upward + zig-zag wobble
      dummy.position.set(
        x + Math.sin(t * factor) * 0.8,
        (y + t * 3) % 25 - 10,
        z
      )

      const s = Math.max(0.1, Math.sin(t)) * scale
      dummy.scale.set(s, s, s)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color="#ffffff"
        transparent
        opacity={0.4}
        roughness={0.0}
        metalness={0.1}
      />
    </instancedMesh>
  )
}

/* ─── 3D SCENE ─────────────────────────────────────────── */

function Scene({ scrollProgress }: { scrollProgress: React.RefObject<number> }) {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow />
      <directionalLight position={[-3, 4, 2]} intensity={0.8} />
      <spotLight position={[0, 10, 0]} intensity={0.4} angle={0.5} penumbra={1} />
      <Environment preset="city" environmentIntensity={0.5} />

      <Bubbles scrollProgress={scrollProgress} />
      <RollingPepsi scrollProgress={scrollProgress} />

      {CAN_CONFIGS.map((config, i) => (
        <AnimatedDrink key={i} config={config} index={i} scrollProgress={scrollProgress} />
      ))}
    </>
  )
}

/* ─── LOADING SCREEN ───────────────────────────────────── */

function LoadingScreen() {
  return (
    <div className="hero-3d-loader">
      <div style={{ textAlign: 'center' }}>
        <div className="hero-3d-spinner" />
        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#6E88B0' }}>
          Loading 3D Experience...
        </p>
      </div>
    </div>
  )
}

/* ─── SCENE TEXT CONFIGS ───────────────────────────────── */
const rollingTextCss: React.CSSProperties = {
  fontSize: 'clamp(3.5rem, 15vw, 12rem)',
  fontWeight: 900,
  color: '#1e3a5f', // Match the Sipsip hero text color
  fontFamily: 'var(--font-inter), sans-serif',
  textTransform: 'uppercase',
  textShadow: '2px 4px 10px rgba(0,0,0,0.05)',
  letterSpacing: '-0.04em', // Modern tight kerning
  margin: 0,
  textAlign: 'center',
}

/* ─── HERO SCENE (MAIN EXPORT) ─────────────────────────── */

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollProgress = useRef(0)
  const currentSectionRef = useRef(0)
  const [currentSection, setCurrentSection] = useState(0)
  const [textReveals, setTextReveals] = useState([false, false, false])
  const [isLoaded, setIsLoaded] = useState(false)
  const [showHeroText, setShowHeroText] = useState(false)

  // Spill scene refs
  const spillRef = useRef<HTMLDivElement>(null)
  const splashBlobRef = useRef<HTMLDivElement>(null)
  const shopBtnRef = useRef<HTMLAnchorElement>(null)

  // Avoid state updates causing too many renders during scroll
  const textRevealsRef = useRef([false, false, false])

  useGSAP(
    () => {
      if (!containerRef.current) return

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress
          scrollProgress.current = p

          // Sections: 0 (Hero), 1 (Try All), 2 (SWEET), 3 (REFRESHING), 4 (AFFORDABLE), 5 (SPILL)
          const newSec = p < 0.28 ? 0 : p < 0.42 ? 1 : p < 0.565 ? 2 : p < 0.71 ? 3 : p < 0.855 ? 4 : 5
          if (newSec !== currentSectionRef.current) {
            currentSectionRef.current = newSec
            setCurrentSection(newSec)
          }

          // Text should only reveal when can passes mid-point of the section
          const r2 = p >= 0.49 // SWEET 
          const r3 = p >= 0.635 // REFRESHING 
          const r4 = p >= 0.78 // AFFORDABLE 

          if (r2 !== textRevealsRef.current[0] || r3 !== textRevealsRef.current[1] || r4 !== textRevealsRef.current[2]) {
            textRevealsRef.current = [r2, r3, r4]
            setTextReveals([r2, r3, r4])
          }

          // SPILL ANIMATION LOGIC (Scene 5)
          if (spillRef.current && splashBlobRef.current && shopBtnRef.current) {
            if (p > 0.855) {
              const spillP = smoothstepGlobal(0.88, 0.96, p) // start spilling after tilt completes
              // We use an expanding div wrapper height to reveal the fixed-height inner spill image downwards!
              spillRef.current.style.height = `${spillP * 72}vh`

              // Shop Now button fade
              const btnP = smoothstepGlobal(0.92, 0.98, p)
              shopBtnRef.current.style.opacity = `${btnP}`
              shopBtnRef.current.style.transform = `translateY(${(1 - btnP) * 25}px)`
              shopBtnRef.current.style.pointerEvents = btnP > 0.5 ? 'auto' : 'none'
            } else {
              spillRef.current.style.height = `0vh`
              shopBtnRef.current.style.opacity = '0'
              shopBtnRef.current.style.pointerEvents = 'none'
            }
          }
        },
      })
    },
    { scope: containerRef }
  )

  const handleCreated = useCallback(() => {
    setTimeout(() => {
      setIsLoaded(true)
      setTimeout(() => setShowHeroText(true), 1200) // Give the drinks time to cleanly settle in place
    }, 800)
  }, [])

  const bgColors = ['#F2E0D0', '#F2E0D0', '#6E88B0', '#F2E0D0', '#6E88B0', '#F2E0D0']

  return (
    <div ref={containerRef} style={{ height: '720vh', position: 'relative' }}>
      {/* Sticky viewport */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          background: bgColors[currentSection] || '#F2E0D0',
          transition: 'background 0.8s ease',
        }}
      >
        {!isLoaded && <LoadingScreen />}

        {/* ─── SPILL BACKGROUND LAYER (Behind 3D Canvas) ─── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: currentSection === 5 ? 'auto' : 'none',
            opacity: currentSection === 5 ? 1 : 0,
            transition: 'opacity 0.6s ease',
            zIndex: 0
          }}
        >
          {/* Spilling Wrapper Masking the Coffee Image */}
          <div
            ref={spillRef}
            style={{
              position: 'absolute',
              top: '16vh', // Align exactly around the mouth of the inverted can
              width: '100%',
              height: '0vh', // Animates down to reveal image organically
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              transformOrigin: 'top center'
            }}
          >
            <img
              src="/Coffee_Break-removebg-preview.png"
              style={{
                height: '60vh', // Extended massively to ensure the stream easily bridges from navbar area down to CTA
                objectFit: 'contain',
                filter: 'drop-shadow(0px 10px 15px rgba(54, 17, 0, 0.4))',
                transform: 'rotate(180deg)' // Fix orientation so thick splash is at bottom
              }}
            />
          </div>
        </div>

        {/* R3F Canvas */}
        <Canvas
          camera={{ position: [0, 0, 7], fov: 42 }}
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
          dpr={[1, 1.5]}
          onCreated={handleCreated}
        >
          <Suspense fallback={null}>
            <Scene scrollProgress={scrollProgress} />
          </Suspense>
        </Canvas>

        {/* ─── HTML Overlay ────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          {/* ═══ SECTION 1: Logo + Tagline ═══ */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: '15vh', // Lifted up to match exactly the center axis of the 3D drinks
              opacity: currentSection === 0 ? 1 : 0,
              transform: currentSection === 0 ? 'translateY(0) scale(1)' : 'translateY(-80px) scale(0.9)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
              pointerEvents: currentSection === 0 ? 'auto' : 'none',
            }}
          >
            {/* Logo with an ultra-premium frosted glass lozenge */}
            <div
              style={{
                background: 'rgba(30, 58, 95, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 30px 60px rgba(30, 58, 95, 0.25), inset 0 2px 5px rgba(255, 255, 255, 0.15)',
                borderRadius: '120px',
                padding: '1rem 4rem',
                marginBottom: '2rem', // Reduced distance to the tagline
                opacity: showHeroText ? 1 : 0,
                transform: showHeroText ? 'translateY(0) scale(1)' : 'translateY(35px) scale(0.95)',
                transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <img
                src="/logo.png"
                alt="SipShop"
                style={{
                  height: 110,
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1) drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
                }}
              />
            </div>

            {/* Tagline Typography ProMax */}
            <div
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.8rem)', // Shrunk significantly to avoid horizontal overlap with the 3D meshes!
                fontWeight: 900,
                color: '#1e3a5f',
                lineHeight: 1.05,
                textAlign: 'center',
                letterSpacing: '-0.04em',
                fontFamily: 'var(--font-inter), sans-serif',
                textShadow: '0 10px 20px rgba(30, 58, 95, 0.15)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4em',
                minHeight: '1.0em'
              }}
            >
              {showHeroText && (
                <SplitText
                  text="Stay Cool. Stay SipSip"
                  className="" // Removing transparent class that caused compilation failures
                  delay={40}
                  duration={1.2}
                  ease="back.out(2)"
                  splitType="chars"
                  from={{ opacity: 0, y: 40, scale: 0.8, rotateX: 45 }}
                  to={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                  threshold={0.1}
                  rootMargin="-50px"
                />
              )}
            </div>

            {/* Description Premium Formatting */}
            <div style={{
              marginTop: '1.5rem', // Brought closer to Title
              maxWidth: 620,
              minHeight: '80px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              {showHeroText && (
                <BlurText
                  text="Your go-to refreshment for bold flavors and instant chill, crafted to keep every moment fresh, fun, and satisfying."
                  delay={35}
                  animateBy="words"
                  direction="top"
                  className="text-[1.15rem] md:text-[1.3rem] text-[#4a5568] font-medium text-center leading-[1.8] drop-shadow-sm"
                />
              )}
            </div>

            {/* Tactile ProMax CTA Button */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1.5rem', // Brought closer to Description
              pointerEvents: 'auto',
              opacity: showHeroText ? 1 : 0,
              transform: showHeroText ? 'translateY(0)' : 'translateY(25px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s'
            }}>
              <Link 
                href="/prodsearch" 
                className="btn-primary"
                style={{
                  padding: '1.2rem 3rem',
                  borderRadius: '100px',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 20px 40px rgba(30, 58, 95, 0.3), inset 0 1px 0 rgba(255,255,255,0.25)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 25px 45px rgba(30, 58, 95, 0.4), inset 0 1px 0 rgba(255,255,255,0.35)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(30, 58, 95, 0.3), inset 0 1px 0 rgba(255,255,255,0.25)'
                }}
              >
                Beverage Types
                <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          {/* ═══ SECTION 2: "Try All 11 Drinks" — text on left, cans group on right ═══ */}
          <div
            style={{
              position: 'absolute',
              left: '15%',
              top: '53%',
              transform: `translateY(-50%) translateX(${currentSection === 1 ? '0' : '-40px'})`,
              opacity: currentSection === 1 ? 1 : 0,
              transition: 'opacity 0.7s ease, transform 0.7s ease',
              maxWidth: '40%',
            }}
          >
            <span className="section-label" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
              ✦&nbsp; Our Collection
            </span>
            <div
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 900,
                color: '#1e3a5f',
                lineHeight: 1.05,
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
                fontFamily: 'var(--font-inter), sans-serif',
                margin: 0,
              }}
            >
              <ScrollFloat
                animationDuration={1}
                ease='back.inOut(2)'
                scrollStart='center bottom+=50%'
                scrollEnd='bottom bottom-=40%'
                stagger={0.03}
                containerClassName="!my-0 !py-0"
              >
                TRY ALL
              </ScrollFloat>
              <div style={{ display: 'flex', paddingLeft: '0.2em' }}>
                <RotatingText
                  texts={['11 DRINKS', 'SODAS', 'LATTES', 'SHAKES', 'FRAPPES', 'TEAS']}
                  mainClassName="text-[#1e3a5f] bg-transparent"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2500}
                />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', maxWidth: 420 }}>
              <BlurText
                text="From classic sodas to artisan lattes and creamy shakes. Handcrafted daily with premium ingredients and zero shortcuts."
                delay={20}
                animateBy="words"
                direction="left"
                className="text-[1.15rem] text-[#64748b] leading-[1.6]"
              />
            </div>
            <Link
              href="/prodsearch"
              className="btn-primary"
              style={{ marginTop: '1.5rem', display: 'inline-flex', pointerEvents: 'auto' }}
            >
              What We Offer
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* ═══ SECTION 3: SWEET ═══ */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentSection === 2 && textReveals[0] ? 1 : 0,
              transform: currentSection === 2 && textReveals[0] ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <h2 style={{ ...rollingTextCss, color: '#F2E0D0' }}>SWEET</h2>
          </div>

          {/* ═══ SECTION 4: REFRESHING ═══ */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentSection === 3 && textReveals[1] ? 1 : 0,
              transform: currentSection === 3 && textReveals[1] ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <h2 style={{ ...rollingTextCss, color: '#1e3a5f' }}>REFRESHING</h2>
          </div>

          {/* ═══ SECTION 5: AFFORDABLE ═══ */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentSection === 4 && textReveals[2] ? 1 : 0,
              transform: currentSection === 4 && textReveals[2] ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <h2 style={{ ...rollingTextCss, color: '#F2E0D0' }}>AFFORDABLE</h2>
          </div>

          {/* ═══ SECTION 6: CTA (Overlays the Canvas and Spill) ═══ */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: currentSection === 5 ? 'auto' : 'none',
              opacity: currentSection === 5 ? 1 : 0,
              transition: 'opacity 0.6s ease',
              zIndex: 3
            }}
          >
            {/* Unused splash ref to satisfy GSAP hook without errors */}
            <div ref={splashBlobRef} style={{ display: 'none' }} />

            {/* Left Side Floating Tagline - UI UX PROMAX */}
            <div
              style={{
                position: 'absolute',
                left: '6vw',
                top: '30vh',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
                borderLeft: '4px solid #1e3a5f',
                paddingLeft: '2rem',
                opacity: currentSection === 5 ? 1 : 0,
                transform: currentSection === 5 ? 'translateX(0)' : 'translateX(-50px)',
                transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
              }}
            >
              <p style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.5rem)',
                letterSpacing: '0.3em',
                color: '#6E88B0',
                fontWeight: 700,
                textTransform: 'uppercase',
                margin: 0,
                marginBottom: '0.5rem'
              }}>
                The Signature Drop
              </p>

              <h2 style={{
                fontSize: 'clamp(4.5rem, 8vw, 8rem)',
                fontWeight: 900,
                color: '#1e3a5f',
                letterSpacing: '-0.05em',
                lineHeight: 0.85,
                textTransform: 'uppercase',
                fontFamily: 'var(--font-inter), sans-serif',
                margin: 0,
                filter: 'drop-shadow(0px 8px 16px rgba(30, 58, 95, 0.15))'
              }}>
                STAY<br />FRESH.
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ height: '2px', width: '4rem', backgroundColor: '#1e3a5f', opacity: 0.4 }} />
                <h2 style={{
                  fontSize: 'clamp(4rem, 7vw, 7rem)',
                  fontWeight: 900,
                  color: 'transparent',
                  WebkitTextStroke: '2px #1e3a5f',
                  letterSpacing: '-0.02em',
                  lineHeight: 0.85,
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-inter), sans-serif',
                  margin: 0,
                }}>
                  SIPSIP.
                </h2>
              </div>
            </div>

            {/* The button at the bottom */}
            <Link
              href="/prodsearch"
              ref={shopBtnRef}
              className="btn-primary"
              style={{
                marginTop: '70vh', // Slightly tighter margin so stream easily overflows behind it
                opacity: 0,
                transform: 'translateY(20px)',
                padding: '1.2rem 3.5rem',
                borderRadius: '100px',
                fontWeight: 700,
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 20px 40px rgba(30, 58, 95, 0.2), inset 0 1px 0 rgba(255,255,255,0.25)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
                zIndex: 10,
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 25px 45px rgba(30, 58, 95, 0.3), inset 0 1px 0 rgba(255,255,255,0.35)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(30, 58, 95, 0.2), inset 0 1px 0 rgba(255,255,255,0.25)'
              }}
            >
              Shop Now
              <ArrowRight size={20} strokeWidth={2.5} className="ml-2" />
            </Link>
          </div>

        </div>
      </div>

      {/* CSS for loader */}
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .hero-3d-loader {
          position: absolute;
          inset: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F2E0D0;
          font-family: var(--font-inter), sans-serif;
        }
        .hero-3d-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(110, 136, 176, 0.2);
          border-top-color: #6E88B0;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }
      `}</style>
    </div>
  )
}
