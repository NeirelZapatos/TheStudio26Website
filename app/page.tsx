import Image from "next/image";
import { StrictMode } from "react";
import env from "dotenv";
import Header2 from "./Components/Header2";
import Footer2 from "./Components/Footer2";

// allows for use of environment variables
// ex: to get an environment variable called TESTING you would type process.env.TESTING
env.config();

export default function Page() {
  return (
    <StrictMode>
      <Header2 />
      <header className="text-center py-5 bg-white-800 text-black">
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
        <section className="text-center p-10 bg-white-100">
          <h2 className="text-3xl font-bold text-yellow-700 mb-4">About Us</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Ever since 2010, The Studio 26 has been providing students with a
            rich and diverse learning environment. The Studio 26 is located in
            Cameron Park, CA, and has taught 1000's of students. We encourage
            students alike to explore, learn and create each passing day.
          </p>
        </section>

        <section className="text-center p-10 bg-white border-t border-gray-300">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Are you interested in learning jewelry making?
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Discover the fundamentals of jewelry crafting, all in one
            comprehensive beginner class. This is a prerequisite for many of our
            advanced courses.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            Hurry, Limited Seats Available! Secure your spot today by clicking
            the button below.
          </p>
          <button className="bg-yellow-700 text-white text-lg py-3 px-8 rounded-lg hover:bg-yellow-600">
            Beginning Jewelry Making Class
          </button>
        </section>
      </div>

      <section className="bg-white py-10">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Past Projects Created At The Studio 26, LLC
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
          <Image
            src="https://images.freeimages.com/images/large-previews/14a/jewel-3-1422765.jpg?fmt=webp&h=350"
            alt="Project Image 1"
            width={300}
            height={300}
            className="object-cover"
          />
          <Image
            src="https://images.freeimages.com/images/large-previews/14a/jewel-3-1422765.jpg?fmt=webp&h=350"
            alt="Project Image 2"
            width={300}
            height={300}
            className="object-cover"
          />
          <Image
            src="https://images.freeimages.com/images/large-previews/14a/jewel-3-1422765.jpg?fmt=webp&h=350"
            alt="Project Image 3"
            width={300}
            height={300}
            className="object-cover"
          />
          <Image
            src="https://images.freeimages.com/images/large-previews/14a/jewel-3-1422765.jpg?fmt=webp&h=350"
            alt="Project Image 4"
            width={300}
            height={300}
            className="object-cover"
          />
          <Image
            src="https://images.freeimages.com/images/large-previews/14a/jewel-3-1422765.jpg?fmt=webp&h=350"
            alt="Project Image 5"
            width={300}
            height={300}
            className="object-cover"
          />
          <Image
            src="https://images.freeimages.com/images/large-previews/14a/jewel-3-1422765.jpg?fmt=webp&h=350"
            alt="Project Image 6"
            width={300}
            height={300}
            className="object-cover"
          />
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-lg">Subscribe to our mailing list</p>
          <form className="flex justify-center mt-4">
            <input
              type="email"
              placeholder="Email"
              className="p-3 w-64 border border-gray-300 rounded-l-lg focus:outline-none bg-white text-black"
            />
            <button
              type="submit"
              className="bg-gray-800 text-white px-4 py-3 rounded-r-lg hover:bg-gray-700"
            >
              →
            </button>
          </form>
        </div>
      </section>
      <Footer2 />
    </StrictMode>
  );
}