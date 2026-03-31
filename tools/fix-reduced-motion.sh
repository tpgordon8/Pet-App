#!/bin/bash

# Fix reduced motion accessibility across all Vue components
# This script adds motion-reduce:transition-none to Tailwind transition classes

echo "🔧 Fixing prefers-reduced-motion accessibility issues..."

components=(
  "src/components/ActivityNotesModal.vue"
  "src/components/CollapsibleSection.vue"
  "src/components/EmojiPicker.vue"
  "src/components/EmptyState.vue"
  "src/components/HouseholdSettingsModal.vue"
  "src/components/InviteMemberModal.vue"
  "src/components/ToastContainer.vue"
  "src/components/TodaysSummary.vue"
  "src/components/onboarding/AddPetStep.vue"
  "src/components/onboarding/StepContainer.vue"
)

fixed_count=0

for component in "${components[@]}"; do
  if [ -f "$component" ]; then
    echo "Processing: $component"

    # Fix transition classes without motion-reduce
    # Pattern: transition-{any} NOT followed by motion-reduce
    sed -i 's/\(transition-[a-z-]*\)\([^m]\|$\)/\1 motion-reduce:transition-none\2/g' "$component"

    # Fix standalone "transition" class
    sed -i 's/\btransition\([^-]\|$\)/transition motion-reduce:transition-none\1/g' "$component"

    # Fix animate classes
    sed -i 's/\(animate-[a-z-]*\)\([^m]\|$\)/\1 motion-reduce:animate-none\2/g' "$component"

    fixed_count=$((fixed_count + 1))
  else
    echo "⚠️  File not found: $component"
  fi
done

echo ""
echo "✅ Fixed $fixed_count components"
echo "✨ Running linter to clean up..."

npm run lint

echo "🎉 Done!"
