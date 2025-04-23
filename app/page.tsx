import Image from "next/image";
import { StrictMode } from "react";
import env from "dotenv";
import Header2 from "./Components/Header2";
import Footer2 from "./Components/Footer2";
import Link from "next/link";
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

      {/* Hero Section */}
      <div
        className="hero min-h-[calc(100vh-64px)]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1624585179018-25699030cb8f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="hero-overlay bg-black bg-opacity-40"></div>
        <div className="hero-content text-left text-white p-8 md:p-16 w-full">
          <div className="max-w-xl">
            <h1 className="font-special-gothic text-4xl md:text-5xl font-bold mb-2">
              Welcome to
            </h1>
            <h1 className="font-special-gothic text-4xl md:text-5xl font-bold mb-6">
              The Studio 26, LLC
            </h1>
            <p className="font-special-gothic text-xl md:text-2xl mb-8">
              A Community of Passionate Educators and Learners
            </p>
            <Link href="/class-catalog">
              <button className="btn btn-primary bg-red-700 hover:bg-red-600 border-none text-white">
                View our classes
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-700 opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-700 opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>

          <div className="max-w-5xl mx-auto relative">
            <div className="text-center mb-12">
              <div className="text-4xl md:text-5xl font-bold text-black font-special-gothic mb-6"
                dangerouslySetInnerHTML={{ __html: aboutTitle }}
              >
              </div>
              <div className="w-24 h-1 bg-yellow-600 mx-auto mb-8"></div>
            </div>
            <div className="text-center">
              <div
                className="text-lg text-gray-700 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: aboutText }}
              />
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 relative">
          {/* Decorative jewelry elements */}
          <div className="absolute top-10 right-10 text-yellow-700 opacity-10 text-6xl">
            ✧
          </div>
          <div className="absolute bottom-10 left-10 text-yellow-700 opacity-10 text-6xl">
            ✧
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 font-special-gothic mb-4">
                <div dangerouslySetInnerHTML={{ __html: jewelryTitle }} />
              </h2>
              <div className="w-20 h-1 bg-yellow-600 mx-auto mb-6"></div>
              <div
                className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
                dangerouslySetInnerHTML={{ __html: jewelryDescription }}
              />
            </div>
            <div className="text-center">
              <div
                className="text-lg text-gray-700 mb-8"
                dangerouslySetInnerHTML={{ __html: callToActionText }}
              />
              <a href={buttonUrl}>
                <button className="btn bg-yellow-700 hover:bg-yellow-600 border-none text-white px-8 py-3 text-lg font-medium rounded-lg transition-all duration-300 transform hover:scale-105">
                  <div dangerouslySetInnerHTML={{ __html: buttonLabel }} />
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 font-special-gothic mb-4">
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      cleanedProjectsSectionTitle ||
                      "Past Projects Created At The Studio 26, LLC",
                  }}
                />
              </h2>
              <div className="w-24 h-1 bg-yellow-600 mx-auto mb-6"></div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedImages.map(
                (img: { url: string; key: string }, index: number) => (
                  <div
                    key={img.key}
                    className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image with hover effect */}
                    <div className="relative w-full aspect-square">
                      <Image
                        src={img.url}
                        alt={`Project Image ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </div>
      <Footer2 />
    </StrictMode>
  );
}
