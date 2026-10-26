import { useEffect, useRef, useState } from 'react'
let THREE

function makeTortillaTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const context = canvas.getContext('2d')
  const base = context.createLinearGradient(0, 0, 0, 256)
  base.addColorStop(0, '#d69a50')
  base.addColorStop(0.48, '#f0c47e')
  base.addColorStop(1, '#bd7437')
  context.fillStyle = base
  context.fillRect(0, 0, canvas.width, canvas.height)
  let seed = 27
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  for (let index = 0; index < 2900; index += 1) {
    const x = random() * canvas.width
    const y = random() * canvas.height
    const radius = 0.5 + random() * 3.3
    context.fillStyle = random() > 0.48 ? 'rgba(93, 43, 17, 0.26)' : 'rgba(255, 223, 157, 0.25)'
    context.beginPath()
    context.ellipse(x, y, radius, radius * (0.5 + random()), random() * 2, 0, Math.PI * 2)
    context.fill()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createRoll(texture) {
  const geometry = new THREE.BufferGeometry()
  const segments = 112
  const around = 48
  const positions = []
  const uvs = []
  const indices = []

  for (let xIndex = 0; xIndex <= segments; xIndex += 1) {
    const along = xIndex / segments
    const x = (along - 0.5) * 3.5
    const taper = 0.79 + 0.21 * Math.sin(Math.PI * along) ** 0.45
    const irregular = Math.sin(along * 19) * 0.018
    for (let angleIndex = 0; angleIndex <= around; angleIndex += 1) {
      const angle = (angleIndex / around) * Math.PI * 2
      const radius = (0.64 + irregular) * taper
      positions.push(x, Math.cos(angle) * radius * 1.03, Math.sin(angle) * radius * 0.91)
      uvs.push(along * 2.4, angleIndex / around)
    }
  }
  for (let xIndex = 0; xIndex < segments; xIndex += 1) {
    for (let angleIndex = 0; angleIndex < around; angleIndex += 1) {
      const current = xIndex * (around + 1) + angleIndex
      const next = current + around + 1
      indices.push(current, current + 1, next, current + 1, next + 1, next)
    }
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.76, metalness: 0.01 })
  const shell = new THREE.Mesh(geometry, material)
  shell.castShadow = true
  shell.receiveShadow = true

  const fillingColors = ['#73a941', '#f1bf34', '#d54326', '#f0dec1', '#d25926']
  const filling = new THREE.Group()
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.51, 48),
    new THREE.MeshStandardMaterial({ color: '#ead7b4', roughness: 0.88 }),
  )
  face.rotation.y = Math.PI / 2
  face.position.x = 1.757
  face.scale.set(1, 0.86, 0.92)
  filling.add(face)
  const faceBase = new THREE.Mesh(
    new THREE.CircleGeometry(0.44, 40),
    new THREE.MeshStandardMaterial({ color: '#bd3421', roughness: 0.82 }),
  )
  faceBase.rotation.y = Math.PI / 2
  faceBase.position.x = 1.765
  faceBase.scale.set(1, 0.9, 0.9)
  filling.add(faceBase)
  for (let index = 0; index < 15; index += 1) {
    const angle = index * 2.399
    const radius = 0.08 + ((index * 7) % 9) * 0.033
    const color = fillingColors[index % fillingColors.length]
    const piece = new THREE.Mesh(
      new THREE.SphereGeometry(0.065 + (index % 3) * 0.012, 10, 8),
      new THREE.MeshStandardMaterial({ color, roughness: 0.72 }),
    )
    piece.scale.set(0.34, 0.85 + (index % 2) * 0.3, 0.88)
    piece.position.set(1.79, Math.cos(angle) * radius, Math.sin(angle) * radius)
    filling.add(piece)
  }

  const toastMarks = new THREE.Group()
  const markMaterial = new THREE.MeshStandardMaterial({ color: '#873d20', roughness: 0.88 })
  for (let index = 0; index < 27; index += 1) {
    const along = 0.09 + ((index * 29) % 79) / 100
    const angle = index * 2.399
    const taper = 0.79 + 0.21 * Math.sin(Math.PI * along) ** 0.45
    const radius = 0.65 * taper
    const mark = new THREE.Mesh(new THREE.SphereGeometry(0.025 + (index % 3) * 0.008, 6, 5), markMaterial)
    mark.position.set((along - 0.5) * 3.5, Math.cos(angle) * radius * 1.03, Math.sin(angle) * radius * 0.91)
    mark.scale.set(1.7, 0.55, 0.8)
    toastMarks.add(mark)
  }

  const seamPoints = []
  for (let index = 0; index <= 30; index += 1) {
    const along = 0.08 + (index / 30) * 0.84
    const angle = 0.68 + (index / 30) * 1.05
    const taper = 0.79 + 0.21 * Math.sin(Math.PI * along) ** 0.45
    const radius = 0.646 * taper
    seamPoints.push(new THREE.Vector3((along - 0.5) * 3.5, Math.cos(angle) * radius * 1.03, Math.sin(angle) * radius * 0.91))
  }
  const seam = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seamPoints), 50, 0.018, 7, false),
    new THREE.MeshStandardMaterial({ color: '#f5d294', roughness: 0.8 }),
  )

  const group = new THREE.Group()
  group.add(shell, filling, toastMarks, seam)
  return { group, shell, material }
}

function createIngredients() {
  const group = new THREE.Group()
  const colors = ['#bc4b28', '#e1b94f', '#6c9b46', '#e2d2ae', '#d87735']
  const pieces = []
  for (let index = 0; index < 17; index += 1) {
    const angle = index * 2.4
    const distance = 0.15 + ((index * 5) % 8) * 0.045
    const material = new THREE.MeshStandardMaterial({
      color: colors[index % colors.length],
      roughness: 0.7,
      transparent: true,
      opacity: 0.9,
    })
    const piece = new THREE.Mesh(new THREE.SphereGeometry(0.11 + (index % 3) * 0.025, 10, 8), material)
    piece.scale.set(0.65 + (index % 4) * 0.16, 0.55 + (index % 3) * 0.2, 1.2)
    const start = new THREE.Vector3(-1.25 + (index % 9) * 0.31, -0.76 + (index % 3) * 0.055, 0.55 + ((index * 3) % 5) * 0.08)
    const target = new THREE.Vector3((index % 7 - 3) * 0.16, 0.19 + Math.cos(angle) * distance, 0.48 + Math.sin(angle) * distance)
    piece.position.copy(start)
    group.add(piece)
    pieces.push({ mesh: piece, start, target })
  }
  return { group, pieces }
}

function FallbackRoll() {
  return <div className="roll-fallback" aria-label="Illustrated toasted Jumbo Roll"><div className="fallback-steam"><i /><i /><i /></div><div className="fallback-wrap"><span /><b /><i /></div><div className="fallback-shadow" /></div>
}

export default function RollScene({ progress = null, compact = false }) {
  const mountRef = useRef(null)
  const progressRef = useRef(progress)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined
    let cancelled = false
    let renderer
    let frame = 0
    let observer
    let animation
    async function initialize() {
      try {
      THREE = await import('three')
      if (cancelled) return
      const scene = new THREE.Scene()
      scene.background = null
      const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60)
      camera.position.set(0.55, 1.05, 7.5)
      camera.lookAt(0, 0.1, 0)

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: window.innerWidth > 600, powerPreference: 'low-power' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.45))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.25
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFShadowMap
      mount.appendChild(renderer.domElement)

      scene.add(new THREE.AmbientLight('#ffc78c', 1.5))
      const keyLight = new THREE.DirectionalLight('#fff0d5', 4.2)
      keyLight.position.set(-3, 5, 5)
      keyLight.castShadow = true
      keyLight.shadow.mapSize.set(512, 512)
      scene.add(keyLight)
      const rimLight = new THREE.PointLight('#ff541c', 21, 14)
      rimLight.position.set(2, 1, -2)
      scene.add(rimLight)
      const fillLight = new THREE.PointLight('#f5a64c', 7, 12)
      fillLight.position.set(-3, -2, 4)
      scene.add(fillLight)

      const stage = new THREE.Group()
      scene.add(stage)
      const tortilla = makeTortillaTexture()
      const { group: roll, material } = createRoll(tortilla)
      roll.position.y = 0.36
      roll.rotation.z = -0.12
      stage.add(roll)
      const { group: ingredientGroup, pieces } = createIngredients()
      stage.add(ingredientGroup)

      const disk = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.5, 0.1, 64),
        new THREE.MeshStandardMaterial({ color: '#211411', roughness: 0.55, metalness: 0.2 }),
      )
      disk.position.y = -1.08
      disk.receiveShadow = true
      stage.add(disk)
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(2.35, 0.035, 6, 96),
        new THREE.MeshStandardMaterial({ color: '#873419', emissive: '#521509', emissiveIntensity: 0.65, roughness: 0.4 }),
      )
      rim.rotation.x = Math.PI / 2
      rim.position.y = -1.015
      stage.add(rim)
      const heatWaves = []
      for (let index = 0; index < 3; index += 1) {
        const waveMaterial = new THREE.MeshStandardMaterial({
          color: '#df5227',
          emissive: '#8e210c',
          emissiveIntensity: 0.65,
          transparent: true,
          opacity: 0.2,
          roughness: 0.4,
        })
        const wave = new THREE.Mesh(new THREE.TorusGeometry(0.72 + index * 0.32, 0.012, 5, 48), waveMaterial)
        wave.rotation.x = Math.PI / 2
        wave.position.y = -0.94 + index * 0.012
        stage.add(wave)
        heatWaves.push({ mesh: wave, offset: index * 1.8 })
      }
      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(1.55, 48),
        new THREE.MeshBasicMaterial({ color: '#e54e17', transparent: true, opacity: 0.18, depthWrite: false }),
      )
      shadow.rotation.x = -Math.PI / 2
      shadow.position.set(0, -1.015, 0)
      shadow.scale.set(1.2, 0.46, 1)
      stage.add(shadow)

      const steamCanvas = document.createElement('canvas')
      steamCanvas.width = 64
      steamCanvas.height = 128
      const steamContext = steamCanvas.getContext('2d')
      const steamGradient = steamContext.createRadialGradient(32, 64, 3, 32, 64, 60)
      steamGradient.addColorStop(0, 'rgba(255, 236, 214, 0.28)')
      steamGradient.addColorStop(0.42, 'rgba(255, 236, 214, 0.12)')
      steamGradient.addColorStop(1, 'rgba(255, 236, 214, 0)')
      steamContext.fillStyle = steamGradient
      steamContext.fillRect(0, 0, steamCanvas.width, steamCanvas.height)
      const steamTexture = new THREE.CanvasTexture(steamCanvas)
      steamTexture.colorSpace = THREE.SRGBColorSpace
      const steam = []
      for (let index = 0; index < 8; index += 1) {
        const puff = new THREE.Sprite(new THREE.SpriteMaterial({
          map: steamTexture,
          color: '#fff0d5',
          transparent: true,
          opacity: 0.18,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }))
        const startX = -0.88 + index * 0.25
        puff.position.set(startX, 0.25 + (index % 3) * 0.2, -0.24 + (index % 2) * 0.32)
        puff.scale.set(0.33, 0.65, 1)
        scene.add(puff)
        steam.push({ mesh: puff, startX, startY: puff.position.y, offset: index * 0.73 })
      }

      const resize = () => {
        const width = mount.clientWidth
        const height = mount.clientHeight
        if (!width || !height) return
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.fov = width < 500 ? 38 : 33
        camera.updateProjectionMatrix()
      }
      observer = new ResizeObserver(resize)
      observer.observe(mount)
      resize()
      const startTime = performance.now()
      animation = () => {
        const elapsed = (performance.now() - startTime) / 1000
        const animationProgress = progressRef.current == null ? (elapsed % 18) / 18 : Math.min(1, Math.max(0, progressRef.current / 100))
        const assemble = Math.min(1, animationProgress / 0.31)
        const assembleEase = assemble * assemble * (3 - 2 * assemble)
        const reveal = Math.min(1, Math.max(0, (animationProgress - 0.78) / 0.22))
        const toast = Math.min(1, Math.max(0, (animationProgress - 0.22) / 0.78))
        roll.rotation.x = Math.sin(elapsed * 0.55) * 0.07
        roll.rotation.y = Math.sin(elapsed * 0.34) * 0.1 + animationProgress * Math.PI * 1.55
        roll.rotation.z = -0.12 + (1 - assembleEase) * Math.sin(elapsed * 1.2) * 0.2
        roll.position.y = 0.36 + Math.sin(elapsed * 1.3) * 0.07
        roll.position.z = reveal * 0.22
        roll.scale.setScalar(0.58 + assembleEase * 0.42 + reveal * (compact ? 0.05 : 0.16))
        pieces.forEach(({ mesh, start, target }, index) => {
          const stagger = Math.max(0, Math.min(1, (animationProgress - index * 0.003) / 0.24))
          mesh.position.lerpVectors(start, target, stagger * stagger * (3 - 2 * stagger))
          const visibility = Math.max(0, 1 - Math.max(0, animationProgress - 0.12) / 0.15)
          mesh.material.opacity = visibility * 0.9
          mesh.scale.setScalar(visibility * (0.85 + Math.sin(elapsed * 5 + index) * 0.08))
        })
        material.color.setRGB(1, 1 - toast * 0.12, 1 - toast * 0.27)
        rim.material.emissiveIntensity = 0.35 + 0.35 * Math.sin(elapsed * 2.2) + toast * 0.35
        heatWaves.forEach(({ mesh, offset }) => {
          const shimmer = 0.9 + Math.sin(elapsed * 2.4 + offset) * 0.1
          mesh.scale.set(shimmer + toast * 0.18, shimmer + toast * 0.18, 1)
          mesh.material.opacity = 0.1 + Math.max(0, Math.sin(elapsed * 2 + offset)) * 0.13 + toast * 0.05
        })
        steam.forEach(({ mesh, startX, startY, offset }) => {
          const loop = (elapsed * 0.42 + offset) % 2.4
          mesh.position.y = startY + loop * 0.65
          mesh.position.x = startX + Math.sin(elapsed + offset) * 0.13
          mesh.scale.set(0.3 + loop * 0.12, 0.4 + loop * 0.31, 1)
          mesh.material.opacity = Math.max(0, 0.2 * (1 - loop / 2.4))
        })
        renderer.render(scene, camera)
        frame = window.requestAnimationFrame(animation)
      }
      animation()
      } catch (error) {
        if (!cancelled) {
          console.warn('3D roll scene unavailable; showing the illustrated fallback.', error)
          setFailed(true)
        }
      }
    }
    initialize()

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      if (observer) observer.disconnect()
      if (renderer) {
        renderer.dispose()
        renderer.domElement.remove()
      }
    }
  }, [compact])

  return <div className={`roll-scene ${compact ? 'roll-scene-compact' : ''}`} ref={mountRef}>{failed && <FallbackRoll />}</div>
}