import { describe, it, expect } from 'vitest'
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeUserInput,
  sanitizeActivityNotes,
  sanitizePetName,
  sanitizeHouseholdName,
  sanitizeMemberName,
  sanitizeSearchQuery,
  escapeHtml,
  sanitizeUrl
} from './sanitize'

describe('sanitize.js', () => {
  // ─── sanitizeHtml ────────────────────────────────────────────────────────────

  describe('sanitizeHtml', () => {
    it('returns empty string for null/undefined/non-string', () => {
      expect(sanitizeHtml(null)).toBe('')
      expect(sanitizeHtml(undefined)).toBe('')
      expect(sanitizeHtml(123)).toBe('')
    })

    it('strips script tags', () => {
      const result = sanitizeHtml('<script>alert("xss")</script>hello')
      expect(result).not.toContain('<script>')
      expect(result).toContain('hello')
    })

    it('strips event handlers', () => {
      const result = sanitizeHtml('<p onclick="evil()">text</p>')
      expect(result).not.toContain('onclick')
      expect(result).toContain('text')
    })

    it('preserves allowed tags', () => {
      const result = sanitizeHtml('<b>bold</b> <i>italic</i> <em>em</em>')
      expect(result).toContain('<b>bold</b>')
      expect(result).toContain('<i>italic</i>')
      expect(result).toContain('<em>em</em>')
    })

    it('strips disallowed block-level tags but keeps content', () => {
      const result = sanitizeHtml('<div class="evil">content</div>')
      expect(result).not.toContain('<div')
      expect(result).toContain('content')
    })
  })

  // ─── sanitizeText ─────────────────────────────────────────────────────────────

  describe('sanitizeText', () => {
    it('returns empty string for null/undefined/non-string', () => {
      expect(sanitizeText(null)).toBe('')
      expect(sanitizeText(undefined)).toBe('')
    })

    it('strips all HTML tags', () => {
      const result = sanitizeText('<b>bold</b> plain text')
      expect(result).not.toContain('<b>')
      expect(result).toContain('bold')
      expect(result).toContain('plain text')
    })

    it('strips script injection attempts', () => {
      const result = sanitizeText('<img src=x onerror="alert(1)">')
      expect(result).not.toContain('<img')
      expect(result).not.toContain('onerror')
    })
  })

  // ─── sanitizeUserInput ────────────────────────────────────────────────────────

  describe('sanitizeUserInput', () => {
    it('returns empty string for falsy input', () => {
      expect(sanitizeUserInput('')).toBe('')
      expect(sanitizeUserInput(null)).toBe('')
      expect(sanitizeUserInput(undefined)).toBe('')
    })

    it('trims whitespace by default', () => {
      expect(sanitizeUserInput('  hello  ')).toBe('hello')
    })

    it('does not trim when trim: false', () => {
      const result = sanitizeUserInput('  hello  ', { trim: false })
      expect(result).toBe('  hello  ')
    })

    it('enforces maxLength', () => {
      const long = 'a'.repeat(200)
      const result = sanitizeUserInput(long, { maxLength: 50 })
      expect(result.length).toBeLessThanOrEqual(50)
    })

    it('does not truncate when under maxLength', () => {
      const result = sanitizeUserInput('hello', { maxLength: 50 })
      expect(result).toBe('hello')
    })

    it('strips HTML by default', () => {
      const result = sanitizeUserInput('<b>bold</b> text')
      expect(result).not.toContain('<b>')
      expect(result).toContain('text')
    })

    it('allows basic formatting when allowBasicFormatting: true', () => {
      const result = sanitizeUserInput('<b>bold</b>', { allowBasicFormatting: true })
      expect(result).toContain('<b>bold</b>')
    })
  })

  // ─── Specialized sanitizers ───────────────────────────────────────────────────

  describe('sanitizeActivityNotes', () => {
    it('truncates to 500 characters', () => {
      const long = 'x'.repeat(600)
      expect(sanitizeActivityNotes(long).length).toBeLessThanOrEqual(500)
    })

    it('trims whitespace', () => {
      expect(sanitizeActivityNotes('  note  ')).toBe('note')
    })

    it('strips HTML', () => {
      expect(sanitizeActivityNotes('<script>bad</script>note')).not.toContain('<script>')
    })

    it('returns empty string for null', () => {
      expect(sanitizeActivityNotes(null)).toBe('')
    })
  })

  describe('sanitizePetName', () => {
    it('truncates to 50 characters', () => {
      const long = 'a'.repeat(100)
      expect(sanitizePetName(long).length).toBeLessThanOrEqual(50)
    })

    it('strips HTML from name', () => {
      expect(sanitizePetName('<b>Luna</b>')).not.toContain('<b>')
    })

    it('trims name', () => {
      expect(sanitizePetName('  Luna  ')).toBe('Luna')
    })
  })

  describe('sanitizeHouseholdName', () => {
    it('truncates to 100 characters', () => {
      const long = 'a'.repeat(200)
      expect(sanitizeHouseholdName(long).length).toBeLessThanOrEqual(100)
    })
  })

  describe('sanitizeMemberName', () => {
    it('truncates to 50 characters', () => {
      const long = 'a'.repeat(100)
      expect(sanitizeMemberName(long).length).toBeLessThanOrEqual(50)
    })
  })

  describe('sanitizeSearchQuery', () => {
    it('truncates to 200 characters', () => {
      const long = 'q'.repeat(300)
      expect(sanitizeSearchQuery(long).length).toBeLessThanOrEqual(200)
    })

    it('strips HTML injection from search', () => {
      const result = sanitizeSearchQuery('<script>xss</script>search term')
      expect(result).not.toContain('<script>')
    })
  })

  // ─── escapeHtml ───────────────────────────────────────────────────────────────

  describe('escapeHtml', () => {
    it('returns empty string for null/undefined/non-string', () => {
      expect(escapeHtml(null)).toBe('')
      expect(escapeHtml(undefined)).toBe('')
    })

    it('escapes ampersand', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b')
    })

    it('escapes less-than and greater-than', () => {
      expect(escapeHtml('<div>')).toBe('&lt;div&gt;')
    })

    it('escapes double quotes', () => {
      expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;')
    })

    it('escapes single quotes', () => {
      expect(escapeHtml("it's")).toBe("it&#x27;s")
    })

    it('escapes forward slash', () => {
      expect(escapeHtml('a/b')).toBe('a&#x2F;b')
    })

    it('handles all dangerous characters together', () => {
      const result = escapeHtml('<script>"alert"(\'xss\')&</script>')
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
      expect(result).not.toContain('"')
      expect(result).not.toContain("'")
    })

    it('leaves safe characters unchanged', () => {
      expect(escapeHtml('hello world 123')).toBe('hello world 123')
    })
  })

  // ─── sanitizeUrl ──────────────────────────────────────────────────────────────

  describe('sanitizeUrl', () => {
    it('returns null for null/undefined/non-string', () => {
      expect(sanitizeUrl(null)).toBeNull()
      expect(sanitizeUrl(undefined)).toBeNull()
    })

    it('allows http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com')
    })

    it('allows https URLs', () => {
      expect(sanitizeUrl('https://example.com/path?q=1')).toBe('https://example.com/path?q=1')
    })

    it('allows mailto URLs', () => {
      expect(sanitizeUrl('mailto:user@example.com')).toBe('mailto:user@example.com')
    })

    it('blocks javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBeNull()
    })

    it('blocks data: protocol', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
    })

    it('blocks ftp: protocol', () => {
      expect(sanitizeUrl('ftp://files.example.com')).toBeNull()
    })

    it('returns null for invalid URLs', () => {
      expect(sanitizeUrl('not-a-url')).toBeNull()
      expect(sanitizeUrl('//no-protocol')).toBeNull()
    })

    it('trims whitespace before checking', () => {
      expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com')
    })
  })
})
