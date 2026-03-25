/**
 * Animation utilities composable
 * Provides reusable animation functions for delightful micro-interactions
 */

import { ref } from 'vue'

export function useAnimations() {
  /**
   * Success celebration animation
   * Creates a bounce effect with optional confetti
   */
  function celebrateSuccess(element, options = {}) {
    const {
      duration = 400,
      scale = 1.2,
      confetti = false
    } = options

    if (!element) return

    // Add bounce animation
    element.style.transition = `transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`
    element.style.transform = `scale(${scale})`

    setTimeout(() => {
      element.style.transform = 'scale(1)'
    }, duration)

    // Optional confetti effect
    if (confetti) {
      createConfetti(element)
    }
  }

  /**
   * Slide in animation
   * Used for modals, toasts, cards
   */
  function slideIn(element, direction = 'bottom', options = {}) {
    const {
      duration = 300,
      distance = 20
    } = options

    if (!element) return

    const transforms = {
      top: `translateY(-${distance}px)`,
      bottom: `translateY(${distance}px)`,
      left: `translateX(-${distance}px)`,
      right: `translateX(${distance}px)`
    }

    element.style.opacity = '0'
    element.style.transform = transforms[direction]
    element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`

    requestAnimationFrame(() => {
      element.style.opacity = '1'
      element.style.transform = 'translate(0, 0)'
    })
  }

  /**
   * Fade transition
   */
  function fade(element, fadeIn = true, duration = 200) {
    if (!element) return

    element.style.transition = `opacity ${duration}ms ease-in-out`
    element.style.opacity = fadeIn ? '1' : '0'
  }

  /**
   * Simple confetti burst
   * Creates small emoji particles that float up and fade
   */
  function createConfetti(element, emojis = ['🎉', '✨', '🌟']) {
    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const particleCount = 8

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      const emoji = emojis[Math.floor(Math.random() * emojis.length)]

      particle.textContent = emoji
      particle.style.position = 'fixed'
      particle.style.left = `${centerX}px`
      particle.style.top = `${centerY}px`
      particle.style.fontSize = '20px'
      particle.style.pointerEvents = 'none'
      particle.style.zIndex = '9999'
      particle.style.userSelect = 'none'

      document.body.appendChild(particle)

      // Random direction
      const angle = (Math.PI * 2 * i) / particleCount
      const velocity = 100 + Math.random() * 50
      const dx = Math.cos(angle) * velocity
      const dy = Math.sin(angle) * velocity - 50 // Bias upward

      // Animate
      particle.animate([
        {
          transform: 'translate(0, 0) rotate(0deg)',
          opacity: 1
        },
        {
          transform: `translate(${dx}px, ${dy}px) rotate(${Math.random() * 360}deg)`,
          opacity: 0
        }
      ], {
        duration: 800,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => {
        particle.remove()
      }
    }
  }

  /**
   * Ripple effect for buttons
   */
  function ripple(event, element, color = 'rgba(255, 255, 255, 0.4)') {
    if (!element) return

    const rect = element.getBoundingClientRect()
    const circle = document.createElement('span')
    const diameter = Math.max(rect.width, rect.height)
    const radius = diameter / 2

    circle.style.width = circle.style.height = `${diameter}px`
    circle.style.left = `${event.clientX - rect.left - radius}px`
    circle.style.top = `${event.clientY - rect.top - radius}px`
    circle.style.position = 'absolute'
    circle.style.borderRadius = '50%'
    circle.style.background = color
    circle.style.pointerEvents = 'none'
    circle.style.transform = 'scale(0)'
    circle.style.opacity = '1'

    element.style.position = 'relative'
    element.style.overflow = 'hidden'
    element.appendChild(circle)

    circle.animate([
      {
        transform: 'scale(0)',
        opacity: 1
      },
      {
        transform: 'scale(2)',
        opacity: 0
      }
    ], {
      duration: 600,
      easing: 'ease-out'
    }).onfinish = () => {
      circle.remove()
    }
  }

  /**
   * Shake animation for errors
   */
  function shake(element, options = {}) {
    const { duration = 400, intensity = 10 } = options

    if (!element) return

    const animation = element.animate([
      { transform: 'translateX(0)' },
      { transform: `translateX(-${intensity}px)` },
      { transform: `translateX(${intensity}px)` },
      { transform: `translateX(-${intensity}px)` },
      { transform: `translateX(${intensity}px)` },
      { transform: 'translateX(0)' }
    ], {
      duration,
      easing: 'ease-in-out'
    })

    return animation
  }

  /**
   * Pulse animation
   */
  function pulse(element, options = {}) {
    const { duration = 1000, scale = 1.05 } = options

    if (!element) return

    const animation = element.animate([
      { transform: 'scale(1)' },
      { transform: `scale(${scale})` },
      { transform: 'scale(1)' }
    ], {
      duration,
      iterations: Infinity,
      easing: 'ease-in-out'
    })

    return animation
  }

  /**
   * Swipe handler utility
   * Returns reactive state for swipe gestures
   */
  function useSwipe() {
    const swipeDistance = ref(0)
    const isSwiping = ref(false)
    const swipeDirection = ref(null)

    let startX = 0
    let startY = 0
    let currentX = 0

    function handleTouchStart(event) {
      startX = event.touches[0].clientX
      startY = event.touches[0].clientY
      isSwiping.value = true
    }

    function handleTouchMove(event) {
      if (!isSwiping.value) return

      currentX = event.touches[0].clientX
      const currentY = event.touches[0].clientY
      const diffX = currentX - startX
      const diffY = currentY - startY

      // Only track horizontal swipe if it's more horizontal than vertical
      if (Math.abs(diffX) > Math.abs(diffY)) {
        swipeDistance.value = diffX
        swipeDirection.value = diffX > 0 ? 'right' : 'left'
      }
    }

    function handleTouchEnd() {
      const threshold = 80 // Minimum swipe distance in pixels

      const didSwipe = Math.abs(swipeDistance.value) > threshold
      const direction = swipeDirection.value

      // Reset
      isSwiping.value = false
      swipeDistance.value = 0
      swipeDirection.value = null

      return { didSwipe, direction }
    }

    return {
      swipeDistance,
      isSwiping,
      swipeDirection,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd
    }
  }

  return {
    celebrateSuccess,
    slideIn,
    fade,
    createConfetti,
    ripple,
    shake,
    pulse,
    useSwipe
  }
}
