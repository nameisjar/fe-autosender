import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ReactionPicker from '../../components/ReactionPicker.vue';

describe('ReactionPicker', () => {
  const mountPicker = options => mount(ReactionPicker, {
    ...options,
    global: {
      ...options?.global,
      stubs: { ...options?.global?.stubs, Teleport: true },
    },
  });

  it('keeps quick reactions and opens a larger categorized emoji grid', async () => {
    const wrapper = mountPicker();

    expect(wrapper.findAll('[aria-label^="Reaction "]')).toHaveLength(6);
    await wrapper.get('[aria-label="Lihat semua emoji"]').trigger('click');

    expect(wrapper.findAll('[role="tab"]')).toHaveLength(8);
    expect(wrapper.findAll('[aria-label^="Reaction "]').length).toBeGreaterThan(50);
  });

  it('emits a selected emoji and supports removing the current reaction', async () => {
    const wrapper = mountPicker({ props: { currentEmoji: '👍' } });

    await wrapper.get('[aria-label="Reaction 👍"]').trigger('click');
    await wrapper.get('[aria-label="Hapus reaction"]').trigger('click');

    expect(wrapper.emitted('select')).toEqual([['👍'], ['']]);
  });
});
