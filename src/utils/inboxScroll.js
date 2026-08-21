const finiteNumber = value => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const getCenteredContainerScrollTop = ({
  containerScrollTop,
  containerClientHeight,
  containerScrollHeight,
  containerTop,
  elementTop,
  elementHeight,
}) => {
  const scrollTop = finiteNumber(containerScrollTop);
  const clientHeight = Math.max(0, finiteNumber(containerClientHeight));
  const scrollHeight = Math.max(clientHeight, finiteNumber(containerScrollHeight));
  const relativeElementTop = finiteNumber(elementTop) - finiteNumber(containerTop);
  const centeredTop = scrollTop
    + relativeElementTop
    - Math.max(0, (clientHeight - Math.max(0, finiteNumber(elementHeight))) / 2);
  const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
  return Math.min(maxScrollTop, Math.max(0, centeredTop));
};
