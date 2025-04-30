// app/api/homepage-settings/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import HomepageSettings from '@/app/models/HomepageSettings';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  await dbConnect();

  try {
    let settings = await HomepageSettings.findOne({});

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          aboutTitle: '',
          aboutText: '',
          jewelryTitle: '',
          jewelryDescription: '',
          buttonUrl: '',
          buttonLabel: '',
          callToActionText: '',
          projectsSectionTitle: '',
          images: []
        }
      }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: settings }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching homepage settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  await dbConnect();

  try {
    const settingsData = await request.json();
    let settings = await HomepageSettings.findOne({});

    if (settings) {
      await HomepageSettings.updateOne({}, settingsData);
      settings = await HomepageSettings.findOne({});
    } else {
      settings = await HomepageSettings.create(settingsData);
    }

    return NextResponse.json(
      { success: true, data: settings, message: 'Settings saved successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error saving homepage settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}