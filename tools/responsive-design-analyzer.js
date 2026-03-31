#!/usr/bin/env node

/**
 * Responsive Design Analyzer for Tailr
 *
 * This tool analyzes Vue components for responsive design patterns and potential issues.
 * It checks for proper use of Tailwind responsive classes, accessibility, and mobile-first design.
 *
 * Usage:
 *   node tools/responsive-design-analyzer.js [path]
 *
 * Examples:
 *   node tools/responsive-design-analyzer.js src/components
 *   node tools/responsive-design-analyzer.js src/views/DashboardView.vue
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

// Responsive breakpoints (for reference)
// sm: '640px', md: '768px', lg: '1024px', xl: '1280px', 2xl: '1536px'

// Analysis results
const results = {
  files: 0,
  issues: [],
  warnings: [],
  suggestions: [],
  goodPractices: []
}

/**
 * Check if file is a Vue component
 */
function isVueFile(file) {
  return file.endsWith('.vue')
}

/**
 * Read file content
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    console.error(`${colors.red}Error reading file ${filePath}:${colors.reset}`, error.message)
    return null
  }
}

/**
 * Extract template section from Vue component
 */
function extractTemplate(content) {
  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/)
  return templateMatch ? templateMatch[1] : ''
}

/**
 * Extract style section from Vue component
 */
function extractStyles(content) {
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/)
  return styleMatch ? styleMatch[1] : ''
}

/**
 * Find all responsive class usages
 */
function findResponsiveClasses(template) {
  const responsivePattern = /(sm:|md:|lg:|xl:|2xl:)[\w-]+/g
  return template.match(responsivePattern) || []
}

/**
 * Check for hardcoded pixel values
 */
function checkHardcodedSizes(content, filePath) {
  const pixelPattern = /(?:width|height|min-width|max-width|min-height|max-height|font-size|margin|padding):\s*\d+px/gi
  const matches = content.match(pixelPattern) || []

  if (matches.length > 0) {
    results.warnings.push({
      file: filePath,
      type: 'hardcoded-sizes',
      message: `Found ${matches.length} hardcoded pixel values. Consider using Tailwind classes or rem units.`,
      details: matches.slice(0, 5).join(', ') + (matches.length > 5 ? '...' : '')
    })
  }
}

/**
 * Check for mobile-first approach
 */
function checkMobileFirst(template, filePath) {
  const classes = template.match(/class="([^"]*)"/g) || []
  let mobileFirstViolations = 0

  classes.forEach(classAttr => {
    // Check if desktop classes are used without mobile base
    const hasDesktopOnly = /\b(lg:|xl:|2xl:)[\w-]+/.test(classAttr) &&
                          !/\b(sm:|md:)[\w-]+/.test(classAttr) &&
                          !/\b(w-|h-|p-|m-|text-)[\w-]+(?!\w)/.test(classAttr)

    if (hasDesktopOnly) {
      mobileFirstViolations++
    }
  })

  if (mobileFirstViolations > 0) {
    results.suggestions.push({
      file: filePath,
      type: 'mobile-first',
      message: `${mobileFirstViolations} elements may not follow mobile-first approach. Ensure base styles work on mobile.`
    })
  }
}

/**
 * Check for viewport units
 */
function checkViewportUnits(styles, filePath) {
  const viewportPattern = /\b\d+v[wh]\b/g
  const matches = styles.match(viewportPattern) || []

  if (matches.length > 0) {
    results.warnings.push({
      file: filePath,
      type: 'viewport-units',
      message: `Found ${matches.length} viewport unit(s). Ensure these work well on mobile Safari.`,
      details: matches.join(', ')
    })
  }
}

/**
 * Check for touch-friendly targets
 */
function checkTouchTargets(template, filePath) {
  const buttonPattern = /<button[^>]*>/g
  const buttons = template.match(buttonPattern) || []

  let smallTargets = 0
  buttons.forEach(button => {
    // Check if button has proper padding/size classes
    const hasPadding = /\bp-\d+|\bpy-\d+|\bpx-\d+/.test(button)
    const hasMinHeight = /\bmin-h-/.test(button)
    const hasHeight = /\bh-\d+/.test(button)

    if (!hasPadding && !hasMinHeight && !hasHeight) {
      smallTargets++
    }
  })

  if (smallTargets > 0) {
    results.warnings.push({
      file: filePath,
      type: 'touch-targets',
      message: `${smallTargets} button(s) may be too small for touch. Minimum 44x44px recommended (WCAG 2.1).`
    })
  }
}

/**
 * Check for overflow handling
 */
function checkOverflow(template, filePath) {
  const hasOverflowX = /overflow-x-auto|overflow-x-scroll/.test(template)
  const hasLongText = /whitespace-nowrap/.test(template)

  if (hasLongText && !hasOverflowX) {
    results.suggestions.push({
      file: filePath,
      type: 'overflow',
      message: 'Found whitespace-nowrap without overflow handling. Text may break layout on small screens.'
    })
  }
}

/**
 * Check for responsive images
 */
function checkImages(template, filePath) {
  const imgPattern = /<img[^>]*>/g
  const images = template.match(imgPattern) || []

  let issuesFound = 0
  images.forEach(img => {
    const hasResponsiveClass = /\b(w-full|max-w-|h-auto)/.test(img)
    const hasObjectFit = /\bobject-(cover|contain|fill)/.test(img)

    if (!hasResponsiveClass && !hasObjectFit) {
      issuesFound++
    }
  })

  if (issuesFound > 0) {
    results.suggestions.push({
      file: filePath,
      type: 'responsive-images',
      message: `${issuesFound} image(s) may not be responsive. Add w-full, max-w-*, or object-fit classes.`
    })
  }
}

/**
 * Check for accessibility features
 */
function checkAccessibility(template, filePath) {
  // Check for reduced motion support
  const hasAnimation = /transition|animate-|duration-/.test(template)
  const hasReducedMotion = /motion-reduce:/.test(template)

  if (hasAnimation && !hasReducedMotion) {
    results.issues.push({
      file: filePath,
      type: 'reduced-motion',
      message: 'Animations found without prefers-reduced-motion support. Add motion-reduce: variants.'
    })
  }

  // Check for focus states
  const hasInteractive = /<button|<a\s|<input|<select|<textarea/.test(template)
  const hasFocusStates = /focus:|focus-visible:/.test(template)

  if (hasInteractive && !hasFocusStates) {
    results.warnings.push({
      file: filePath,
      type: 'focus-states',
      message: 'Interactive elements found without focus states. Add focus: or focus-visible: classes.'
    })
  }
}

/**
 * Check for good responsive practices
 */
function checkGoodPractices(template, filePath) {
  const responsiveClasses = findResponsiveClasses(template)

  if (responsiveClasses.length > 0) {
    results.goodPractices.push({
      file: filePath,
      message: `Uses ${responsiveClasses.length} responsive classes`
    })
  }

  // Check for container/max-width usage
  if (/\bcontainer\b|\bmax-w-/.test(template)) {
    results.goodPractices.push({
      file: filePath,
      message: 'Uses container or max-width for content constraint'
    })
  }

  // Check for flexbox/grid
  if (/\bflex\b|\bgrid\b/.test(template)) {
    results.goodPractices.push({
      file: filePath,
      message: 'Uses modern layout (flexbox/grid)'
    })
  }
}

/**
 * Analyze a single Vue file
 */
function analyzeFile(filePath) {
  const content = readFile(filePath)
  if (!content) return

  results.files++

  const template = extractTemplate(content)
  const styles = extractStyles(content)

  // Run all checks
  checkHardcodedSizes(content, filePath)
  checkMobileFirst(template, filePath)
  checkViewportUnits(styles, filePath)
  checkTouchTargets(template, filePath)
  checkOverflow(template, filePath)
  checkImages(template, filePath)
  checkAccessibility(template, filePath)
  checkGoodPractices(template, filePath)
}

/**
 * Recursively analyze directory
 */
function analyzeDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      // Skip node_modules, dist, etc.
      if (!['node_modules', 'dist', '.git', 'coverage'].includes(entry.name)) {
        analyzeDirectory(fullPath)
      }
    } else if (isVueFile(entry.name)) {
      analyzeFile(fullPath)
    }
  })
}

/**
 * Print results
 */
function printResults() {
  console.log(`\n${colors.bright}${colors.cyan}📱 Responsive Design Analysis${colors.reset}\n`)
  console.log(`Analyzed ${colors.bright}${results.files}${colors.reset} Vue components\n`)

  // Issues (critical)
  if (results.issues.length > 0) {
    console.log(`${colors.bright}${colors.red}❌ Issues (${results.issues.length})${colors.reset}`)
    results.issues.forEach(issue => {
      console.log(`\n  ${colors.red}●${colors.reset} ${colors.bright}${issue.file}${colors.reset}`)
      console.log(`    ${issue.message}`)
      if (issue.details) {
        console.log(`    ${colors.cyan}${issue.details}${colors.reset}`)
      }
    })
    console.log('')
  }

  // Warnings
  if (results.warnings.length > 0) {
    console.log(`${colors.bright}${colors.yellow}⚠️  Warnings (${results.warnings.length})${colors.reset}`)
    results.warnings.forEach(warning => {
      console.log(`\n  ${colors.yellow}●${colors.reset} ${colors.bright}${warning.file}${colors.reset}`)
      console.log(`    ${warning.message}`)
      if (warning.details) {
        console.log(`    ${colors.cyan}${warning.details}${colors.reset}`)
      }
    })
    console.log('')
  }

  // Suggestions
  if (results.suggestions.length > 0) {
    console.log(`${colors.bright}${colors.blue}💡 Suggestions (${results.suggestions.length})${colors.reset}`)
    results.suggestions.forEach(suggestion => {
      console.log(`\n  ${colors.blue}●${colors.reset} ${colors.bright}${suggestion.file}${colors.reset}`)
      console.log(`    ${suggestion.message}`)
    })
    console.log('')
  }

  // Good practices
  if (results.goodPractices.length > 0) {
    console.log(`${colors.bright}${colors.green}✓ Good Practices (${results.goodPractices.length})${colors.reset}`)
    const practicesByFile = {}
    results.goodPractices.forEach(practice => {
      if (!practicesByFile[practice.file]) {
        practicesByFile[practice.file] = []
      }
      practicesByFile[practice.file].push(practice.message)
    })

    Object.entries(practicesByFile).forEach(([file, practices]) => {
      console.log(`\n  ${colors.green}●${colors.reset} ${colors.bright}${file}${colors.reset}`)
      practices.forEach(practice => {
        console.log(`    ${practice}`)
      })
    })
    console.log('')
  }

  // Summary
  const totalIssues = results.issues.length + results.warnings.length + results.suggestions.length
  if (totalIssues === 0) {
    console.log(`${colors.bright}${colors.green}✅ All checks passed!${colors.reset}\n`)
  } else {
    console.log(`${colors.bright}Summary:${colors.reset}`)
    console.log(`  ${colors.red}Issues:${colors.reset} ${results.issues.length}`)
    console.log(`  ${colors.yellow}Warnings:${colors.reset} ${results.warnings.length}`)
    console.log(`  ${colors.blue}Suggestions:${colors.reset} ${results.suggestions.length}`)
    console.log('')
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2)
  const targetPath = args[0] || path.join(__dirname, '../src')

  console.log(`${colors.cyan}Analyzing:${colors.reset} ${targetPath}\n`)

  const stats = fs.statSync(targetPath)

  if (stats.isDirectory()) {
    analyzeDirectory(targetPath)
  } else if (isVueFile(targetPath)) {
    analyzeFile(targetPath)
  } else {
    console.error(`${colors.red}Error: Target must be a Vue file or directory${colors.reset}`)
    process.exit(1)
  }

  printResults()

  // Exit with error if critical issues found
  if (results.issues.length > 0) {
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { analyzeFile, analyzeDirectory, results }
