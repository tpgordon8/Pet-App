#!/usr/bin/env node

/**
 * Adds motion-reduce:transition-none to transition classes in Vue components
 */

import fs from 'fs'

const files = [
  'src/components/ActivityNotesModal.vue',
  'src/components/EditActivityModal.vue',
  'src/components/EmojiPicker.vue',
  'src/components/HouseholdSettingsModal.vue',
  'src/components/InviteMemberModal.vue',
  'src/components/MedicalModal.vue',
  'src/components/ModernStatsCard.vue',
  'src/components/CollapsibleSection.vue',
  'src/components/EmptyState.vue',
  'src/components/TodaysSummary.vue',
  'src/components/onboarding/AddPetStep.vue',
  'src/components/onboarding/StepContainer.vue'
]

let fixed = 0

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`⚠️  Skipping ${file} (not found)`)
    return
  }

  let content = fs.readFileSync(file, 'utf8')
  let originalContent = content

  // Fix transition classes that don't already have motion-reduce
  // Pattern: transition-{word} not followed by motion-reduce
  content = content.replace(/\b(transition-[\w-]+)(?!\s+motion-reduce)/g, '$1 motion-reduce:transition-none')

  // Fix standalone transition class
  content = content.replace(/\btransition(?!-|:)(?!\s+motion-reduce)/g, 'transition motion-reduce:transition-none')

  // Fix animate classes
  content = content.replace(/\b(animate-[\w-]+)(?!\s+motion-reduce)/g, '$1 motion-reduce:animate-none')

  // Add media query for CSS transitions if not already present
  if (/<style[^>]*>[\s\S]*?transition:[\s\S]*?<\/style>/.test(content) &&
      !/@media \(prefers-reduced-motion: reduce\)/.test(content)) {
    content = content.replace(
      /(<\/style>)/,
      `\n/* Accessibility: Disable animations for users who prefer reduced motion */\n@media (prefers-reduced-motion: reduce) {\n  * {\n    transition: none !important;\n    animation: none !important;\n    transform: none !important;\n  }\n}\n$1`
    )
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8')
    console.log(`✅ Fixed ${file}`)
    fixed++
  } else {
    console.log(`⏭️  No changes needed for ${file}`)
  }
})

console.log(`\n🎉 Fixed ${fixed} files`)
