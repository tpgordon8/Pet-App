/**
 * Confetti utility for celebration moments
 * Lightweight DOM-based confetti without external dependencies
 */

/**
 * Trigger confetti burst
 * @param {Object} options - Confetti options
 * @param {string} options.color - Primary color for confetti (defaults to orange)
 * @param {number} options.count - Number of confetti pieces (defaults to 30)
 * @param {number} options.duration - Animation duration in ms (defaults to 2000)
 * @param {HTMLElement} options.origin - Origin element (defaults to center of screen)
 */
export function triggerConfetti(options = {}) {
  const {
    color = '#fb923c',
    count = 30,
    duration = 2000,
    origin = null
  } = options

  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  `

  document.body.appendChild(container)

  // Get origin coordinates
  let originX = window.innerWidth / 2
  let originY = window.innerHeight / 2

  if (origin) {
    const rect = origin.getBoundingClientRect()
    originX = rect.left + rect.width / 2
    originY = rect.top + rect.height / 2
  }

  // Create confetti pieces
  for (let i = 0; i < count; i++) {
    createConfettiPiece(container, originX, originY, color, duration)
  }

  // Clean up after animation
  setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }, duration + 100)
}

/**
 * Create individual confetti piece
 */
function createConfettiPiece(container, originX, originY, color, duration) {
  const confetti = document.createElement('div')

  // Random properties
  const angle = Math.random() * 360
  const velocity = Math.random() * 200 + 100
  const rotationSpeed = Math.random() * 720 - 360
  const size = Math.random() * 6 + 4
  const opacity = Math.random() * 0.5 + 0.5

  // Random color variation
  const colors = [color, lightenColor(color, 20), darkenColor(color, 20)]
  const randomColor = colors[Math.floor(Math.random() * colors.length)]

  // Calculate trajectory
  const radians = (angle * Math.PI) / 180
  const velocityX = Math.cos(radians) * velocity
  const velocityY = Math.sin(radians) * velocity - 200 // Extra upward boost

  confetti.style.cssText = `
    position: absolute;
    left: ${originX}px;
    top: ${originY}px;
    width: ${size}px;
    height: ${size}px;
    background: ${randomColor};
    opacity: ${opacity};
    border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    pointer-events: none;
  `

  container.appendChild(confetti)

  // Animate
  const startTime = Date.now()

  function animate() {
    const elapsed = Date.now() - startTime
    const progress = elapsed / duration

    if (progress >= 1) {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti)
      }
      return
    }

    const currentX = originX + velocityX * progress
    const currentY = originY + velocityY * progress + (progress * progress * 400) // Gravity
    const rotation = rotationSpeed * progress
    const currentOpacity = opacity * (1 - progress)

    confetti.style.transform = `translate(${currentX - originX}px, ${currentY - originY}px) rotate(${rotation}deg)`
    confetti.style.opacity = currentOpacity

    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}

/**
 * Lighten a hex color
 */
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * (percent / 100)))
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * (percent / 100)))
  const b = Math.min(255, (num & 0xff) + Math.round(255 * (percent / 100)))

  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

/**
 * Darken a hex color
 */
function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * (percent / 100)))
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * (percent / 100)))
  const b = Math.max(0, (num & 0xff) - Math.round(255 * (percent / 100)))

  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}
