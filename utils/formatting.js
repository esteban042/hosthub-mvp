
export const formatPrice = (price) => {
  if (price && price > 200000) {
    const thousands = Math.round(price / 1000);
    return `${thousands}k`;
  }
  if (price) {
    return price.toLocaleString();
  }
  return '0';
};
