/**
 * Image Compression Utility
 * Compresses images before upload to save bandwidth and storage costs
 */

import imageCompression from 'browser-image-compression'

/**
 * Compress an image file before upload
 * @param {File} file - Image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} Compressed image file
 */
export async function compressImage(file, options = {}) {
  if (!file) {
    throw new Error('No file provided')
  }

  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  const defaultOptions = {
    maxSizeMB: 1, // Max file size in MB
    maxWidthOrHeight: 1920, // Max width or height (maintains aspect ratio)
    useWebWorker: true, // Use web worker for better performance
    fileType: 'image/jpeg', // Output format
    initialQuality: 0.8, // Initial quality (0-1)
    ...options
  }

  try {
    console.log(`Compressing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    const compressedFile = await imageCompression(file, defaultOptions)

    const originalSize = file.size / 1024 / 1024
    const compressedSize = compressedFile.size / 1024 / 1024
    const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1)

    console.log(
      `Compression complete: ${originalSize.toFixed(2)}MB → ${compressedSize.toFixed(2)}MB (${savings}% smaller)`
    )

    return compressedFile
  } catch (error) {
    console.error('Error compressing image:', error)
    throw new Error('Failed to compress image')
  }
}

/**
 * Generate thumbnail from image
 * @param {File} file - Image file
 * @returns {Promise<File>} Thumbnail file
 */
export async function generateThumbnail(file) {
  return await compressImage(file, {
    maxSizeMB: 0.1, // Small thumbnail
    maxWidthOrHeight: 400,
    initialQuality: 0.7
  })
}

/**
 * Check if image needs compression
 * @param {File} file - Image file to check
 * @param {number} maxSizeMB - Max size in MB
 * @returns {boolean} True if file needs compression
 */
export function needsCompression(file, maxSizeMB = 1) {
  if (!file) return false

  const fileSizeMB = file.size / 1024 / 1024
  return fileSizeMB > maxSizeMB
}

/**
 * Get image dimensions from file
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>} Image dimensions
 */
export async function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.width,
        height: img.height
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Promise<{valid: boolean, error?: string}>} Validation result
 */
export async function validateImage(file, options = {}) {
  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxWidth = 10000,
    maxHeight = 10000
  } = options

  // Check file exists
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
    }
  }

  // Check file size
  const fileSizeMB = file.size / 1024 / 1024
  if (fileSizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File too large. Max size: ${maxSizeMB}MB`
    }
  }

  // Check dimensions
  try {
    const { width, height } = await getImageDimensions(file)

    if (width > maxWidth || height > maxHeight) {
      return {
        valid: false,
        error: `Image dimensions too large. Max: ${maxWidth}x${maxHeight}px`
      }
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to read image dimensions'
    }
  }

  return { valid: true }
}

/**
 * Compress and validate image in one step
 * @param {File} file - Image file to process
 * @param {Object} options - Combined options
 * @returns {Promise<File>} Compressed and validated image
 */
export async function processImage(file, options = {}) {
  // Validate first
  const validation = await validateImage(file, options)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Compress if needed
  if (needsCompression(file, options.maxSizeMB || 1)) {
    return await compressImage(file, options)
  }

  // Return original if already small enough
  return file
}
