import { describe, expect, it } from 'vitest';
import { calculateFloatingPosition } from '../../utils/floatingPosition.js';

const boundaryRect = {
  left: 100,
  right: 700,
  top: 100,
  bottom: 600,
};
const pickerRect = { width: 320, height: 240 };

describe('calculateFloatingPosition', () => {
  it('keeps an outgoing picker inside the right edge and opens above when possible', () => {
    const result = calculateFloatingPosition({
      anchorRect: { left: 650, right: 678, top: 500, bottom: 528 },
      boundaryRect,
      pickerRect,
      direction: 'outgoing',
    });

    expect(result).toEqual({ left: 358, top: 252 });
    expect(result.left + pickerRect.width).toBeLessThanOrEqual(boundaryRect.right - 12);
  });

  it('keeps an incoming picker inside the left edge', () => {
    const result = calculateFloatingPosition({
      anchorRect: { left: 92, right: 120, top: 450, bottom: 478 },
      boundaryRect,
      pickerRect,
      direction: 'incoming',
    });

    expect(result.left).toBe(112);
  });

  it('flips below the button when there is not enough room above', () => {
    const result = calculateFloatingPosition({
      anchorRect: { left: 300, right: 328, top: 120, bottom: 148 },
      boundaryRect,
      pickerRect,
      direction: 'incoming',
    });

    expect(result.top).toBe(156);
  });

  it('clamps vertically when neither side has enough room', () => {
    const result = calculateFloatingPosition({
      anchorRect: { left: 300, right: 328, top: 260, bottom: 288 },
      boundaryRect: { left: 100, right: 700, top: 100, bottom: 380 },
      pickerRect,
      direction: 'incoming',
    });

    expect(result.top).toBe(112);
    expect(result.top + pickerRect.height).toBeLessThanOrEqual(368);
  });
});
