import { NextRequest, NextResponse } from "next/server";

// Mock store locations data
const MOCK_STORES: Record<string, object[]> = {
  walmart: [
    { id: "wm-1", name: "Walmart Supercenter", address: "1234 Main St", city: "San Francisco", state: "CA", zip: "94102", distance: 0.8 },
    { id: "wm-2", name: "Walmart Neighborhood Market", address: "5678 Market St", city: "San Francisco", state: "CA", zip: "94103", distance: 1.4 },
    { id: "wm-3", name: "Walmart Supercenter", address: "9012 Mission St", city: "Daly City", state: "CA", zip: "94014", distance: 3.2 },
  ],
  target: [
    { id: "tg-1", name: "Target", address: "789 Valencia St", city: "San Francisco", state: "CA", zip: "94110", distance: 0.5 },
    { id: "tg-2", name: "Target Express", address: "321 Geary St", city: "San Francisco", state: "CA", zip: "94102", distance: 1.1 },
    { id: "tg-3", name: "Target", address: "654 El Camino Real", city: "South San Francisco", state: "CA", zip: "94080", distance: 4.7 },
  ],
  cvs: [
    { id: "cvs-1", name: "CVS Pharmacy", address: "100 Powell St", city: "San Francisco", state: "CA", zip: "94102", distance: 0.3 },
    { id: "cvs-2", name: "CVS Pharmacy", address: "450 Castro St", city: "San Francisco", state: "CA", zip: "94114", distance: 1.6 },
  ],
  walgreens: [
    { id: "wg-1", name: "Walgreens", address: "200 Kearny St", city: "San Francisco", state: "CA", zip: "94108", distance: 0.4 },
    { id: "wg-2", name: "Walgreens", address: "2300 16th St", city: "San Francisco", state: "CA", zip: "94103", distance: 1.9 },
  ],
  ulta: [
    { id: "ul-1", name: "Ulta Beauty", address: "845 Market St", city: "San Francisco", state: "CA", zip: "94103", distance: 0.6 },
    { id: "ul-2", name: "Ulta Beauty", address: "3251 20th Ave", city: "San Francisco", state: "CA", zip: "94132", distance: 3.8 },
  ],
  sephora: [
    { id: "sep-1", name: "Sephora", address: "1 Stockton St", city: "San Francisco", state: "CA", zip: "94108", distance: 0.7 },
    { id: "sep-2", name: "Sephora inside JCPenney", address: "5560 Bay St", city: "Emeryville", state: "CA", zip: "94608", distance: 5.1 },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const { store_chain } = await req.json();

    if (!store_chain) {
      return NextResponse.json({ error: "store_chain is required" }, { status: 400 });
    }

    const key = store_chain.toLowerCase();
    const stores = MOCK_STORES[key] || [];

    return NextResponse.json({ stores });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}
