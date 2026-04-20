import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { usePagination } from './usePagination'

// Helper: generate N items
function makeItems(n) {
  return Array.from({ length: n }, (_, i) => ({ id: i + 1, label: `Item ${i + 1}` }))
}

describe('usePagination', () => {
  // ─── paginatedItems ───────────────────────────────────────────────────────────

  describe('paginatedItems', () => {
    it('shows only the first N items (initialPageSize)', () => {
      const items = ref(makeItems(100))
      const { paginatedItems } = usePagination(items, { initialPageSize: 10 })
      expect(paginatedItems.value).toHaveLength(10)
      expect(paginatedItems.value[0].id).toBe(1)
      expect(paginatedItems.value[9].id).toBe(10)
    })

    it('shows all items when total <= initialPageSize', () => {
      const items = ref(makeItems(5))
      const { paginatedItems } = usePagination(items, { initialPageSize: 50 })
      expect(paginatedItems.value).toHaveLength(5)
    })

    it('uses default initialPageSize of 50', () => {
      const items = ref(makeItems(100))
      const { paginatedItems } = usePagination(items)
      expect(paginatedItems.value).toHaveLength(50)
    })

    it('returns empty array for empty items', () => {
      const { paginatedItems } = usePagination(ref([]))
      expect(paginatedItems.value).toHaveLength(0)
    })
  })

  // ─── hasMore ──────────────────────────────────────────────────────────────────

  describe('hasMore', () => {
    it('returns true when items exceed page size', () => {
      const { hasMore } = usePagination(ref(makeItems(100)), { initialPageSize: 10 })
      expect(hasMore.value).toBe(true)
    })

    it('returns false when all items are shown', () => {
      const { hasMore } = usePagination(ref(makeItems(5)), { initialPageSize: 50 })
      expect(hasMore.value).toBe(false)
    })

    it('returns false for empty list', () => {
      const { hasMore } = usePagination(ref([]))
      expect(hasMore.value).toBe(false)
    })
  })

  // ─── remainingCount ───────────────────────────────────────────────────────────

  describe('remainingCount', () => {
    it('returns correct remaining count', () => {
      const { remainingCount } = usePagination(ref(makeItems(100)), { initialPageSize: 10 })
      expect(remainingCount.value).toBe(90)
    })

    it('returns 0 when all items shown', () => {
      const { remainingCount } = usePagination(ref(makeItems(5)), { initialPageSize: 50 })
      expect(remainingCount.value).toBe(0)
    })

    it('never returns negative', () => {
      const { remainingCount } = usePagination(ref([]))
      expect(remainingCount.value).toBeGreaterThanOrEqual(0)
    })
  })

  // ─── loadMore ─────────────────────────────────────────────────────────────────

  describe('loadMore', () => {
    it('increases visible items by loadMoreSize', () => {
      const items = ref(makeItems(100))
      const { paginatedItems, loadMore } = usePagination(items, {
        initialPageSize: 10,
        loadMoreSize: 5
      })
      expect(paginatedItems.value).toHaveLength(10)
      loadMore()
      expect(paginatedItems.value).toHaveLength(15)
    })

    it('does nothing when hasMore is false', () => {
      const items = ref(makeItems(5))
      const { paginatedItems, loadMore } = usePagination(items, { initialPageSize: 50 })
      loadMore()
      expect(paginatedItems.value).toHaveLength(5)
    })

    it('does not exceed total item count', () => {
      const items = ref(makeItems(12))
      const { paginatedItems, loadMore } = usePagination(items, {
        initialPageSize: 10,
        loadMoreSize: 25
      })
      loadMore()
      expect(paginatedItems.value).toHaveLength(12)
    })

    it('uses default loadMoreSize of 25', () => {
      const items = ref(makeItems(100))
      const { paginatedItems, loadMore } = usePagination(items, { initialPageSize: 10 })
      loadMore()
      expect(paginatedItems.value).toHaveLength(35)
    })
  })

  // ─── reset ────────────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('resets page size to initial after loadMore calls', () => {
      const items = ref(makeItems(100))
      const { paginatedItems, loadMore, reset } = usePagination(items, {
        initialPageSize: 10,
        loadMoreSize: 10
      })
      loadMore()
      loadMore()
      expect(paginatedItems.value).toHaveLength(30)
      reset()
      expect(paginatedItems.value).toHaveLength(10)
    })
  })

  // ─── loadAll ──────────────────────────────────────────────────────────────────

  describe('loadAll', () => {
    it('shows all items after loadAll', () => {
      const items = ref(makeItems(100))
      const { paginatedItems, hasMore, loadAll } = usePagination(items, { initialPageSize: 10 })
      expect(hasMore.value).toBe(true)
      loadAll()
      expect(paginatedItems.value).toHaveLength(100)
      expect(hasMore.value).toBe(false)
    })
  })

  // ─── currentPageSize ──────────────────────────────────────────────────────────

  describe('currentPageSize', () => {
    it('exposes current page size as a ref', () => {
      const { currentPageSize } = usePagination(ref(makeItems(100)), { initialPageSize: 20 })
      expect(currentPageSize.value).toBe(20)
    })

    it('reflects updates after loadMore', () => {
      const { currentPageSize, loadMore } = usePagination(ref(makeItems(100)), {
        initialPageSize: 20,
        loadMoreSize: 10
      })
      loadMore()
      expect(currentPageSize.value).toBe(30)
    })
  })

  // ─── reactivity ───────────────────────────────────────────────────────────────

  describe('reactivity', () => {
    it('updates paginatedItems when source list changes', () => {
      const items = ref(makeItems(5))
      const { paginatedItems } = usePagination(items, { initialPageSize: 10 })
      expect(paginatedItems.value).toHaveLength(5)

      items.value = makeItems(3)
      expect(paginatedItems.value).toHaveLength(3)
    })

    it('updates hasMore when source list grows', () => {
      const items = ref(makeItems(5))
      const { hasMore } = usePagination(items, { initialPageSize: 10 })
      expect(hasMore.value).toBe(false)

      items.value = makeItems(20)
      expect(hasMore.value).toBe(true)
    })
  })
})
