/**
 * Retailer URL builders
 *
 * Builds search/product URLs for each supported store.
 * When affiliate tags are configured via env vars they are automatically
 * appended — ready for the revenue share program.
 *
 * Affiliate setup (do when ready):
 *   Amazon  → https://affiliate-program.amazon.com  → set NEXT_PUBLIC_AMAZON_TAG
 *   Others  → add their tags below once enrolled
 */

function searchQuery(brand: string, name: string): string {
  return encodeURIComponent(`${brand} ${name}`.trim());
}

export function getStoreUrl(store: string, productName: string, brand: string): string {
  const q = searchQuery(brand, productName);
  const lower = store.toLowerCase();

  switch (lower) {
    case "amazon": {
      const tag = process.env.NEXT_PUBLIC_AMAZON_TAG;
      const url = `https://www.amazon.com/s?k=${q}`;
      return tag ? `${url}&tag=${tag}` : url;
    }
    case "target":
      return `https://www.target.com/s?searchTerm=${q}`;
    case "walmart":
      return `https://www.walmart.com/search?q=${q}`;
    case "sephora":
      return `https://www.sephora.com/search?keyword=${q}`;
    case "ulta":
      return `https://www.ulta.com/search?search=${q}`;
    case "cvs":
      return `https://www.cvs.com/search?searchTerm=${q}`;
    case "walgreens":
      return `https://www.walgreens.com/search/results.jsp?Ntt=${q}`;
    case "iherb":
      return `https://www.iherb.com/search?kw=${q}`;
    case "dermstore":
      return `https://www.dermstore.com/search?q=${q}`;
    default:
      // Generic Google Shopping fallback
      return `https://www.google.com/search?q=${encodeURIComponent(`buy ${brand} ${productName}`)}&tbm=shop`;
  }
}
