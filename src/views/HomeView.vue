<template>
  <div class="home-root min-h-screen flex flex-col overflow-hidden">
    <!-- Animated background blobs -->
    <div class="blob blob-1" aria-hidden="true"></div>
    <div class="blob blob-2" aria-hidden="true"></div>
    <div class="blob blob-3" aria-hidden="true"></div>

    <!-- Main hero content -->
    <main class="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-24">
      <!-- Logo mark -->
      <div class="logo-ring mb-6 animate-scale-in">
        <span class="text-5xl sm:text-6xl select-none">🐾</span>
      </div>

      <!-- Brand name -->
      <h1 class="hero-title animate-slide-up mb-2">
        Tailr
      </h1>

      <!-- Tagline -->
      <p class="hero-tagline animate-slide-up mb-4">
        Pet Activity Logger
      </p>

      <!-- Sub-copy -->
      <p class="hero-sub animate-fade-in mb-10 max-w-xs sm:max-w-sm text-center">
        Track daily activities, medical records, and health insights for every pet — beautifully synced in real time.
      </p>

      <!-- Floating pet avatars -->
      <div class="pet-row mb-10 animate-fade-in" aria-hidden="true">
        <span class="pet-avatar" title="Dog">🐕</span>
        <span class="pet-avatar" title="Cat">🐈</span>
        <span class="pet-avatar" title="Rabbit">🐇</span>
        <span class="pet-avatar" title="Bird">🐦</span>
        <span class="pet-avatar" title="Fish">🐠</span>
      </div>

      <!-- Feature pills -->
      <div class="feature-pills animate-fade-in mb-12">
        <span class="feature-pill">⚡ Real-time sync</span>
        <span class="feature-pill">🏥 Medical tracking</span>
        <span class="feature-pill">💡 Smart insights</span>
        <span class="feature-pill">📊 Activity trends</span>
      </div>

      <!-- CTA -->
      <div class="w-full max-w-xs animate-slide-up">
        <button
          class="cta-btn"
          aria-label="Get started with Tailr"
          @click="$router.push('/onboarding')"
        >
          Get Started
          <span class="cta-arrow" aria-hidden="true">→</span>
        </button>
        <p class="text-center text-sm text-gray-400 dark:text-gray-500 mt-4">
          Free for pet parents · No account needed
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
// Landing page — no logic required
</script>

<style scoped>
/* =============================================
   Root / Background
   ============================================= */
.home-root {
  background: linear-gradient(
    145deg,
    #f9f7ff 0%,
    #fdf4ff 30%,
    #f0fdf4 60%,
    #fffbeb 100%
  );
  position: relative;
}

.dark .home-root {
  background: linear-gradient(
    145deg,
    #0f0f1a 0%,
    #1a1025 30%,
    #0d1f12 60%,
    #1a1500 100%
  );
}

/* =============================================
   Animated background blobs
   ============================================= */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: blob-float 12s ease-in-out infinite;
  pointer-events: none;
}

.blob-1 {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, transparent 70%);
  top: -120px;
  left: -100px;
  animation-delay: 0s;
}

.blob-2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(244, 114, 182, 0.2) 0%, transparent 70%);
  top: 30%;
  right: -80px;
  animation-delay: -4s;
}

.blob-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.18) 0%, transparent 70%);
  bottom: -80px;
  left: 20%;
  animation-delay: -8s;
}

.dark .blob-1 {
  background: radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%);
}
.dark .blob-2 {
  background: radial-gradient(circle, rgba(244, 114, 182, 0.12) 0%, transparent 70%);
}
.dark .blob-3 {
  background: radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, transparent 70%);
}

@keyframes blob-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(20px, -30px) scale(1.05); }
  66%       { transform: translate(-15px, 20px) scale(0.97); }
}

/* =============================================
   Logo ring
   ============================================= */
.logo-ring {
  width: 100px;
  height: 100px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 4px 16px rgba(139, 154, 125, 0.15),
    0 12px 40px rgba(167, 139, 250, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.dark .logo-ring {
  background: rgba(30, 30, 50, 0.7);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.4),
    0 12px 40px rgba(167, 139, 250, 0.2);
}

/* =============================================
   Typography
   ============================================= */
.hero-title {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  font-size: clamp(3rem, 10vw, 5rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
  /* Vibrant gradient text */
  background: linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #ea580c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .hero-title {
  background: linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #fb923c 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.hero-tagline {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  font-size: clamp(1rem, 3vw, 1.25rem);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7280;
}

.dark .hero-tagline {
  color: #9ca3af;
}

.hero-sub {
  font-size: 1rem;
  line-height: 1.7;
  color: #4b5563;
}

.dark .hero-sub {
  color: #9ca3af;
}

/* =============================================
   Pet avatars
   ============================================= */
.pet-row {
  display: flex;
  gap: 0.875rem;
}

.pet-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  font-size: 1.6rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: default;
  user-select: none;
  animation: avatar-bob 4s ease-in-out infinite;
}

.pet-avatar:nth-child(2) { animation-delay: -0.8s; }
.pet-avatar:nth-child(3) { animation-delay: -1.6s; }
.pet-avatar:nth-child(4) { animation-delay: -2.4s; }
.pet-avatar:nth-child(5) { animation-delay: -3.2s; }

.pet-avatar:hover {
  transform: scale(1.18) rotate(-5deg);
}

.dark .pet-avatar {
  background: rgba(30, 30, 50, 0.6);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

@keyframes avatar-bob {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

/* =============================================
   Feature pills
   ============================================= */
.feature-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.feature-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.875rem;
  border-radius: 100px;
  font-size: 0.8125rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  color: #374151;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  white-space: nowrap;
}

.dark .feature-pill {
  background: rgba(30, 30, 50, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
  color: #d1d5db;
}

/* =============================================
   CTA Button
   ============================================= */
.cta-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem 2rem;
  border-radius: 16px;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: white;
  background: linear-gradient(135deg, #7c3aed 0%, #db2777 60%, #ea580c 100%);
  background-size: 200% 200%;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow:
    0 4px 16px rgba(124, 58, 237, 0.35),
    0 8px 32px rgba(219, 39, 119, 0.2);
  min-height: 56px;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px rgba(124, 58, 237, 0.45),
    0 16px 48px rgba(219, 39, 119, 0.3);
  background-position: right center;
}

.cta-btn:active {
  transform: translateY(0);
}

.cta-arrow {
  font-size: 1.25rem;
  transition: transform 0.2s ease;
}

.cta-btn:hover .cta-arrow {
  transform: translateX(4px);
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .blob,
  .pet-avatar {
    animation: none;
  }
}
</style>
