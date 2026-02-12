import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/simulate
 * Main simulation endpoint
 * 
 * Body:
 * {
 *   income: number,
 *   expenses: number,
 *   days: number,
 *   seed: number,
 *   assets: Asset[],
 *   liabilities: Liability[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { income, expenses, days = 365, seed = 42, assets = [], liabilities = [] } = body;

    // Validate inputs
    if (!income || !expenses) {
      return NextResponse.json(
        { success: false, error: "Missing income or expenses" },
        { status: 400 }
      );
    }

    // TODO: Engine team will integrate actual simulation here
    // For now, return mock data to test the API
    
    const mockHistory = [];
    let balance = 10000;

    for (let day = 0; day < Math.min(days, 365); day++) {
      balance += income - expenses;
      mockHistory.push({
        day,
        balance: Math.max(0, balance),
        creditScore: 650 + Math.random() * 50,
        assets,
        vibeScore: Math.random() * 100,
        collapsedFlag: balance < 0,
      });
    }

    return NextResponse.json(
      {
        success: true,
        days: mockHistory.length,
        history: mockHistory,
        finalBalance: {
          mean: balance,
          percentile5: balance * 0.8,
          percentile95: balance * 1.2,
        },
        collapseProbability: 0.1,
        creditScoreEvolution: mockHistory.map((h) => h.creditScore),
        vibe: "healthy",
        liquidityRatio: 0.75,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/simulate
 * Returns API documentation
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Future Wallet Simulation API",
    endpoint: "/api/simulate",
    method: "POST",
    description: "Run a financial simulation with given parameters",
  });
}