// app/api/subscription-plans/[id]/route.ts
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI as string;

async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(uri);
  }
  const client = new MongoClient(uri);
  await client.connect();
  return { client };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { client } = await connectToDatabase();
    const db = client.db();
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const plan = await db.collection("subscription_plans").findOne({
      _id: new ObjectId(params.id)
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: plan._id.toString(),
      name: plan.name,
      description: plan.description,
      price: plan.price,
      stripePriceId: plan.stripePriceId,
      interval: plan.interval
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database error" },
      { status: 500 }
    );
  }
}