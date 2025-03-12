import Image from "next/image";
import { StrictMode } from "react";
import env from "dotenv";
import Header2 from "./Components/Header2";
import Footer2 from "./Components/Footer2";
import { getHomepageSettings } from "./lib/homepageSettings";

// Load environment variables
env.config();

export default async function Page() {
  const settings = await getHomepageSettings();
  const {
    aboutTitle = "",
    aboutText = "",
    jewelryTitle = "",
    jewelryDescription = "",
    buttonUrl = "",
    buttonLabel = "",
    callToActionText = "",
    projectsSectionTitle = "",
    images = [],
  } = settings || {};

  // Only the six most recent images
  const displayedImages = images.slice(-6);

  // Remove wrapping <p> tags from projectsSectionTitle if they exist
  const cleanedProjectsSectionTitle = projectsSectionTitle.replace(
    /^<p>|<\/p>$/g,
    ""
  );

  return (
    <StrictMode>
      <Header2 />
      <header className="text-center py-5 bg-white text-black">
        <h1 className="text-4xl font-bold text-red-600">The Studio 26</h1>
        <p className="text-lg text-gray-400">
          4100 Cameron Park Drive #118, Cameron Park, CA 95682
        </p>
      </header>

      <div
        className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]"
        style={{
          backgroundImage: `url('https://picsum.photos/id/527/4000/3000')`,
          backgroundSize: "cover",
        }}
      ></div>

      <div className="bg-white">
        {/* About Us Section */}
        <section className="text-center p-10 bg-white">
          <div
            className="text-3xl font-bold text-yellow-700 mb-4"
            dangerouslySetInnerHTML={{ __html: aboutTitle }}
          />
          <div
            className="text-lg text-gray-700 max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: aboutText }}
          />
        </section>

        {/* Jewelry Class Section */}
        <section className="text-center p-10 bg-white border-t border-gray-300">
          <div
            className="text-2xl font-bold text-gray-800 mb-2"
            dangerouslySetInnerHTML={{ __html: jewelryTitle }}
          />
          <div
            className="text-lg text-gray-600 max-w-3xl mx-auto mb-6"
            dangerouslySetInnerHTML={{ __html: jewelryDescription }}
          />
          <div
            className="text-lg text-gray-600 mb-4"
            dangerouslySetInnerHTML={{ __html: callToActionText }}
          />
          <a href={buttonUrl}>
            <button className="bg-yellow-700 text-white text-lg py-3 px-8 rounded-lg hover:bg-yellow-600">
              <div dangerouslySetInnerHTML={{ __html: buttonLabel }} />
            </button>
          </a>
        </section>
      </div>

      {/* Projects Section */}
      <section className="bg-white py-10">
        <div
          className="text-3xl font-bold text-center text-gray-800 mb-6"
          // Render cleaned title
          dangerouslySetInnerHTML={{
            __html:
              cleanedProjectsSectionTitle ||
              "Past Projects Created At The Studio 26, LLC",
          }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
          {displayedImages.map(
            (img: { url: string; key: string }, index: number) => (
              <div key={img.key} className="relative w-[300px] h-[300px]">
                <Image
                  src={img.url}
                  alt={`Project Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            )
          )}
        </div>
      </section>

      <Footer2 />
    </StrictMode>
  );
}
