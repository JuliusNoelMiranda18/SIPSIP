'use client'

import React, { useMemo, forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface DrinkModelProps {
  modelPath?: string
  [key: string]: any
}

// ForwardRef so parent components can animate it via useFrame
const DrinkModel = forwardRef<THREE.Group, DrinkModelProps>(function DrinkModel({ modelPath = '/simple_cola_can.glb', ...props }, ref) {
  const { scene } = useGLTF(modelPath)

  // Clone so we can spawn independent instances
  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return c
  }, [scene])

  return (
    <group ref={ref} {...props} dispose={null}>
      <primitive object={clone} />
    </group>
  )
})

DrinkModel.displayName = 'DrinkModel'
export { DrinkModel }

// Preload all models
useGLTF.preload('/simple_cola_can.glb')
useGLTF.preload('/pepsi_can.glb')
useGLTF.preload('/starbucks_coffee_cup_with_removable_sleeve.glb')
useGLTF.preload('/latte_macchiato.glb')
useGLTF.preload('/grimace_birthday_shake_parody.glb')
