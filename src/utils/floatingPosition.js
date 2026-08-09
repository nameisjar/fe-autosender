const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));

export function calculateFloatingPosition({
  anchorRect,
  boundaryRect,
  pickerRect,
  direction = 'incoming',
  edgeGap = 12,
  anchorGap = 8,
}) {
  const minLeft = boundaryRect.left + edgeGap;
  const maxLeft = boundaryRect.right - edgeGap - pickerRect.width;
  const preferredLeft = direction === 'outgoing'
    ? anchorRect.right - pickerRect.width
    : anchorRect.left;

  const minTop = boundaryRect.top + edgeGap;
  const maxTop = boundaryRect.bottom - edgeGap - pickerRect.height;
  const topAbove = anchorRect.top - anchorGap - pickerRect.height;
  const topBelow = anchorRect.bottom + anchorGap;
  const fitsAbove = topAbove >= minTop;
  const fitsBelow = topBelow <= maxTop;
  let preferredTop;

  if (fitsAbove) {
    preferredTop = topAbove;
  } else if (fitsBelow) {
    preferredTop = topBelow;
  } else {
    const spaceAbove = anchorRect.top - minTop;
    const spaceBelow = boundaryRect.bottom - edgeGap - anchorRect.bottom;
    preferredTop = spaceBelow > spaceAbove ? topBelow : topAbove;
  }

  return {
    left: clamp(preferredLeft, minLeft, maxLeft),
    top: clamp(preferredTop, minTop, maxTop),
  };
}
