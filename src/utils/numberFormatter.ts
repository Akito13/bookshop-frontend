export default function formatNumber(input: number) {
  return new Intl.NumberFormat("en-us", { minimumFractionDigits: 0 }).format(
    input
  );
}
