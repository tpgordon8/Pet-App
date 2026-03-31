/**
 * Optimistic Updates Composable
 * Provides instant UI feedback while waiting for server response
 */

import { ref } from 'vue'

/**
 * Create an optimistic update manager
 * @returns {Object} Optimistic update utilities
 */
export function useOptimistic() {
  const pendingUpdates = ref(new Map())

  /**
   * Add an optimistic update
   * @param {string} id - Unique ID for this update
   * @param {*} optimisticData - Data to show immediately
   * @param {Function} actualUpdate - Async function that performs real update
   * @returns {Promise<*>} Result of actual update
   */
  async function optimisticUpdate(id, optimisticData, actualUpdate) {
    // Store pending update
    pendingUpdates.value.set(id, optimisticData)

    try {
      // Perform actual update
      const result = await actualUpdate()

      // Remove pending update on success
      pendingUpdates.value.delete(id)

      return result
    } catch (error) {
      // Roll back on error
      pendingUpdates.value.delete(id)

      throw error
    }
  }

  /**
   * Check if update is pending
   * @param {string} id - Update ID
   * @returns {boolean} True if pending
   */
  function isPending(id) {
    return pendingUpdates.value.has(id)
  }

  /**
   * Get optimistic data for pending update
   * @param {string} id - Update ID
   * @returns {*} Optimistic data or null
   */
  function getOptimistic(id) {
    return pendingUpdates.value.get(id) || null
  }

  /**
   * Clear all pending updates
   */
  function clearAll() {
    pendingUpdates.value.clear()
  }

  return {
    optimisticUpdate,
    isPending,
    getOptimistic,
    clearAll,
    pendingUpdates
  }
}

/**
 * Optimistic list operations
 * For managing lists with optimistic add/remove/update
 */
export function useOptimisticList(initialList = []) {
  const list = ref([...initialList])
  const optimisticItems = ref(new Map()) // tempId -> item

  /**
   * Optimistically add item to list
   * @param {*} item - Item to add
   * @param {Function} addFn - Async function to actually add item
   * @returns {Promise<*>} Added item with real ID
   */
  async function optimisticAdd(item, addFn) {
    // Generate temporary ID
    const tempId = `temp_${Date.now()}_${Math.random()}`
    const optimisticItem = { ...item, id: tempId, _optimistic: true }

    // Add to list immediately
    list.value.unshift(optimisticItem)
    optimisticItems.value.set(tempId, optimisticItem)

    try {
      // Perform actual add
      const addedItem = await addFn(item)

      // Replace optimistic item with real item
      const index = list.value.findIndex(i => i.id === tempId)
      if (index !== -1) {
        list.value[index] = addedItem
      }

      // Clean up
      optimisticItems.value.delete(tempId)

      return addedItem
    } catch (error) {
      // Roll back on error
      list.value = list.value.filter(i => i.id !== tempId)
      optimisticItems.value.delete(tempId)

      throw error
    }
  }

  /**
   * Optimistically remove item from list
   * @param {string} id - Item ID
   * @param {Function} removeFn - Async function to actually remove item
   * @returns {Promise<void>}
   */
  async function optimisticRemove(id, removeFn) {
    // Store removed item for rollback
    const removedItem = list.value.find(i => i.id === id)
    if (!removedItem) return

    const removedIndex = list.value.indexOf(removedItem)

    // Remove immediately
    list.value = list.value.filter(i => i.id !== id)

    try {
      // Perform actual remove
      await removeFn(id)
    } catch (error) {
      // Roll back on error
      list.value.splice(removedIndex, 0, removedItem)

      throw error
    }
  }

  /**
   * Optimistically update item in list
   * @param {string} id - Item ID
   * @param {Object} updates - Updates to apply
   * @param {Function} updateFn - Async function to actually update item
   * @returns {Promise<*>} Updated item
   */
  async function optimisticUpdate(id, updates, updateFn) {
    // Find item
    const item = list.value.find(i => i.id === id)
    if (!item) return

    // Store original for rollback
    const originalItem = { ...item }
    const itemIndex = list.value.indexOf(item)

    // Update immediately
    list.value[itemIndex] = { ...item, ...updates, _optimistic: true }

    try {
      // Perform actual update
      const updatedItem = await updateFn(id, updates)

      // Replace with real updated item
      list.value[itemIndex] = updatedItem

      return updatedItem
    } catch (error) {
      // Roll back on error
      list.value[itemIndex] = originalItem

      throw error
    }
  }

  /**
   * Sync list with server data
   * @param {Array} serverList - List from server
   */
  function syncWithServer(serverList) {
    // Filter out optimistic items
    const nonOptimistic = serverList.filter(item => !item._optimistic)

    // Keep optimistic items
    const optimisticOnly = list.value.filter(item => item._optimistic)

    // Merge: optimistic items first, then server items
    list.value = [...optimisticOnly, ...nonOptimistic]
  }

  return {
    list,
    optimisticAdd,
    optimisticRemove,
    optimisticUpdate,
    syncWithServer
  }
}
