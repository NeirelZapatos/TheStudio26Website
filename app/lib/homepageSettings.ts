import dbConnect from './dbConnect';
import HomepageSettings, { HomepageSettingsDocument, ImageEntry } from '../models/HomepageSettings';

const defaultSettings = {
  aboutTitle: "About Us",
  aboutText: "Ever since 2010, The Studio 26 has been providing students with a rich and diverse learning environment. The Studio 26 is located in Cameron Park, CA, and has taught 1000's of students. We encourage students alike to explore, learn and create each passing day.",
  jewelryTitle: "<p>Are you interested in learning jewelry making?</p>",
  jewelryDescription: "<p>Discover the fundamentals of jewelry crafting, all in one comprehensive beginner class. This is a prerequisite for many of our advanced courses.</p>",
  buttonUrl: "/class-catalog",
  buttonLabel: "<p>Beginning Jewelry Making Class</p>",
  callToActionText: "<p>Hurry, Limited Seats Available! Secure your spot today by clicking the button below.</p>",
  projectsSectionTitle: "<p>Past Projects Created At The Studio 26, LLC</p>",
  images: [] as ImageEntry[]
};

export type HomepageSettingsData = {
  aboutTitle: string;
  aboutText: string;
  jewelryTitle: string;
  jewelryDescription: string;
  buttonUrl: string;
  buttonLabel: string;
  callToActionText: string;
  projectsSectionTitle: string;
  images: ImageEntry[];
};

export async function getHomepageSettings() {
  try {
    await dbConnect();
    const settings = await HomepageSettings.findOne({}).lean();

    if (!settings) {
      return defaultSettings;
    }

    const settingsData: HomepageSettingsData = {
      aboutTitle: settings.aboutTitle || defaultSettings.aboutTitle,
      aboutText: settings.aboutText || defaultSettings.aboutText,
      jewelryTitle: settings.jewelryTitle || defaultSettings.jewelryTitle,
      jewelryDescription: settings.jewelryDescription || defaultSettings.jewelryDescription,
      buttonUrl: settings.buttonUrl || defaultSettings.buttonUrl,
      buttonLabel: settings.buttonLabel || defaultSettings.buttonLabel,
      callToActionText: settings.callToActionText || defaultSettings.callToActionText,
      projectsSectionTitle: settings.projectsSectionTitle || defaultSettings.projectsSectionTitle,
      images: settings.images || defaultSettings.images
    };
    
    return settingsData;
    
  } catch (error) {
    console.error('Error fetching homepage settings:', error);
    return {
      aboutTitle: "",
      aboutText: "",
      jewelryTitle: "",
      jewelryDescription: "",
      buttonUrl: "",
      buttonLabel: "",
      callToActionText: "",
      projectsSectionTitle: "",
      images: []
    };
  }
}