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
    case "best buy":
    case "bestbuy":
      return `https://www.bestbuy.com/site/searchpage.jsp?st=${q}`;
    case "b&h":
    case "b&h photo":
    case "bhphoto":
      return `https://www.bhphotovideo.com/c/search?Ntt=${q}`;
    case "newegg":
      return `https://www.newegg.com/p/pl?d=${q}`;
    case "micro center":
    case "microcenter":
      return `https://www.microcenter.com/search/search_results.aspx?Ntx=mode+MatchAllPartial&Ntk=all&N=4294967288&myStore=false&query=${q}`;
    default:
      // Generic Google Shopping fallback
      return `https://www.google.com/search?q=${encodeURIComponent(`buy ${brand} ${productName}`)}&tbm=shop`;
  }
}
