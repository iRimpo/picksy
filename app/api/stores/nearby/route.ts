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
  "best buy": [
    { id: "bb-1", name: "Best Buy", address: "1717 Harrison St", city: "San Francisco", state: "CA", zip: "94103", distance: 0.9 },
    { id: "bb-2", name: "Best Buy", address: "2675 Geary Blvd", city: "San Francisco", state: "CA", zip: "94118", distance: 2.1 },
  ],
  bestbuy: [
    { id: "bb-1", name: "Best Buy", address: "1717 Harrison St", city: "San Francisco", state: "CA", zip: "94103", distance: 0.9 },
    { id: "bb-2", name: "Best Buy", address: "2675 Geary Blvd", city: "San Francisco", state: "CA", zip: "94118", distance: 2.1 },
  ],
  "micro center": [
    { id: "mc-1", name: "Micro Center", address: "9895 E. Washington Blvd", city: "Culver City", state: "CA", zip: "90232", distance: 5.4 },
  ],
  amazon: [
    { id: "amz-1", name: "Amazon Fresh", address: "2040 24th Ave E", city: "San Francisco", state: "CA", zip: "94116", distance: 2.3 },
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
