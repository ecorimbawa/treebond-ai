import { connectDB } from '@/lib/db/connection';
import { Tree, TreeEvidence, Verification } from '@/models';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const tree = await Tree.findById(id).populate('projectId');

    if (!tree) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tree not found',
        },
        { status: 404 }
      );
    }

    // Get evidence history
    const evidence = await TreeEvidence.find({ treeId: id })
      .populate('submittedBy', 'email fullName')
      .sort({ capturedAt: -1 });

    // Get verifications
    const verifications = await Verification.find({ treeId: id })
      .populate('verifierId', 'email fullName')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: {
          tree,
          evidence,
          verifications,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/trees/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tree',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const tree = await Tree.findByIdAndUpdate(id, body, { new: true }).populate('projectId');

    if (!tree) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tree not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: tree,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PATCH /api/trees/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update tree',
      },
      { status: 500 }
    );
  }
}
