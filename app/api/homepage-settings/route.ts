// app/api/homepage-settings/route.ts
import { NextResponse } from "next/server";
import { updateHomepageSettings } from "../../lib/homepageSettings";

export async function GET() {
    // Optionally, you might simply redirect GET calls to your helper function.
    // For this example, assume the homepage reads data from the helper directly.
    // (You can choose to have both the homepage and the admin fetch via the API.)
    return NextResponse.json(await updateHomepageSettings({}));
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        await updateHomepageSettings(data);
        return NextResponse.json({ message: "Settings saved successfully!" });
    } catch (error) {
        console.error("Error saving homepage settings:", error);
        return NextResponse.json(
            { message: "Error saving settings." },
            { status: 500 }
        );
    }
}
