import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActivityButton from '@/components/ActivityButton.vue'

describe('ActivityButton', () => {
  it('renders with icon and label', () => {
    const wrapper = mount(ActivityButton, {
      props: {
        icon: 'poop',
        label: 'Poop',
        count: 0
      }
    })

    expect(wrapper.text()).toContain('Poop')
    expect(wrapper.text()).toContain('0 today')
  })

  it('displays count when greater than 0', () => {
    const wrapper = mount(ActivityButton, {
      props: {
        icon: 'poop',
        label: 'Poop',
        count: 3
      }
    })

    expect(wrapper.text()).toContain('3 today')
  })

  it('emits click event when clicked and not disabled', async () => {
    const wrapper = mount(ActivityButton, {
      props: {
        icon: 'poop',
        label: 'Poop',
        count: 0
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(ActivityButton, {
      props: {
        icon: 'poop',
        label: 'Poop',
        count: 0,
        disabled: true
      }
    })

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()

    await wrapper.trigger('click')
    // The click event won't be emitted because handleClick checks disabled
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('applies disabled attribute when disabled prop is true', () => {
    const wrapper = mount(ActivityButton, {
      props: {
        icon: 'poop',
        label: 'Poop',
        count: 0,
        disabled: true
      }
    })

    const button = wrapper.find('button')
    expect(button.element.disabled).toBe(true)
  })

  it('applies custom class when provided', () => {
    const wrapper = mount(ActivityButton, {
      props: {
        icon: 'poop',
        label: 'Poop',
        count: 0,
        customClass: 'custom-button'
      }
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('custom-button')
  })
})
