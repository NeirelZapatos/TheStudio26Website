// app/lib/homepageSettings.ts
import fs from "fs/promises";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "homepageSettings.json");

// Read the settings from the JSON file; if the file doesn't exist, create it with defaults.
export async function getHomepageSettings() {
    try {
        const data = await fs.readFile(dataFilePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading homepage settings file:", error);
        // File may not exist yet. Create default settings.
        const defaultSettings = {
            aboutText:
                "Default About Us text goes here. Add your description about your company, its mission, and history.",
            buttonLink: "https://example.com",
            images: [] as { url: string; key: string }[],
            jewelryTitle: "Are you interested in learning jewelry making?",
            jewelryDescription:
                "Discover the fundamentals of jewelry crafting, all in one comprehensive beginner class. This is a prerequisite for many of our advanced courses.",
        };
        await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
        await fs.writeFile(
            dataFilePath,
            JSON.stringify(defaultSettings, null, 2),
            "utf8"
        );
        return defaultSettings;
    }
}

// Merge new settings with the current settings and persist to disk.
export async function updateHomepageSettings(
    newSettings: Partial<{
        aboutText: string;
        buttonLink: string;
        images: { url: string; key: string }[];
        jewelryTitle: string;
        jewelryDescription: string;
    }>
) {
    const currentSettings = await getHomepageSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await fs.writeFile(
        dataFilePath,
        JSON.stringify(updatedSettings, null, 2),
        "utf8"
    );
    return updatedSettings;
}
