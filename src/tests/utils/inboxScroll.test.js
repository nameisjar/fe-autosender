import { describe, expect, it } from 'vitest';
import { getCenteredContainerScrollTop } from '../../utils/inboxScroll.js';

describe('Inbox quoted-message scrolling', () => {
  it('centers a target using coordinates relative to the scroll container', () => {
    expect(getCenteredContainerScrollTop({
      containerScrollTop: 1200,
      containerClientHeight: 600,
      containerScrollHeight: 5000,
      containerTop: 100,
      elementTop: 400,
      elementHeight: 80,
    })).toBe(1240);
  });

  it('clamps the target position to the available scroll range', () => {
    expect(getCenteredContainerScrollTop({
      containerScrollTop: 0,
      containerClientHeight: 600,
      containerScrollHeight: 1000,
      containerTop: 100,
      elementTop: 50,
      elementHeight: 60,
    })).toBe(0);

    expect(getCenteredContainerScrollTop({
      containerScrollTop: 900,
      containerClientHeight: 600,
      containerScrollHeight: 1000,
      containerTop: 100,
      elementTop: 900,
      elementHeight: 60,
    })).toBe(400);
  });
});
