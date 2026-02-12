import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/branch
 * Handles "what-if" scenario branching from a snapshot
 * 
 * Body:
 * {
 *   snapshotId: string,
 *   changedVariable: string,
 *   newValue: any,
 *   days: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { snapshotId, changedVariable, newValue, days = 365 } = body;

    if (!snapshotId || !changedVariable || newValue === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing snapshotId, changedVariable, or newValue" 
        },
        { status: 400 }
      );
    }

    // TODO: Engine team will integrate actual branching logic here
    // For now, return mock data to test the API

    const mockBranchedHistory = [];
    let balance = 10000;

    for (let day = 0; day < Math.min(days, 365); day++) {
      balance += 5000 - 2000; // Mock income - expenses
      mockBranchedHistory.push({
        day,
        balance: Math.max(0, balance),
        creditScore: 650 + Math.random() * 50,
        vibeScore: Math.random() * 100,
        collapsedFlag: balance < 0,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Branching simulation completed",
        snapshotId,
        changedVariable,
        newValue,
        days: mockBranchedHistory.length,
        history: mockBranchedHistory,
        finalBalance: {
          mean: balance,
          percentile5: balance * 0.8,
          percentile95: balance * 1.2,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Branch simulation error:", error);
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
 * GET /api/branch
 * Returns API documentation
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Future Wallet Branching API",
    endpoint: "/api/branch",
    method: "POST",
    description: "Run a what-if scenario simulation from a snapshot",
  });
}