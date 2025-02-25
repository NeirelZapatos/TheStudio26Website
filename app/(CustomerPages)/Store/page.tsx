import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Page() {
  return (
    <>
      <h1 className="text-center text-4xl font-bold text-red-600">
        The Studio 26
      </h1>
      <p className="text-center text-lg text-gray-400">
        4100 Cameron Park Drive #118, Cameron Park, CA 95682
      </p>
      <div>
        {/* Dropdown section */}
        <nav className="flex justify-center space-x-6 mp-4">
          {/* Stone dropdown */}
          <div className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost m-1 font-medium"
            >
              Stones
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
            >
              <li>
                <Link href="/StoreSearch">All Stones</Link>
              </li>
              <li>
                <Link href="/StoreSearch">Handpicked by Debora</Link>
              </li>
              <li>
                <Link href="/StoreSearch">Cabochons</Link>
              </li>
              <li>
                <Link href="/StoreSearch">Faceted Stones</Link>
              </li>
              <li>
                <Link href="/StoreSearch">Slabs</Link>
              </li>
            </ul>
          </div>
          {/* Jewelry dropdown */}
          <div className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost m-1 font-medium"
            >
              Jewelry
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
            >
              <li>
                <Link href="/StoreSearch">All Jewelry</Link>
              </li>
              <li>
                <Link href="/StoreSearch">Handcrafted by Master Dan</Link>
              </li>
              <li>
                <Link href="/StoreSearch">Handcrafted by Ruben</Link>
              </li>
              <li>
                <Link href="/StoreSearch">Casted Jewelry</Link>
              </li>
            </ul>
          </div>
          {/* Supplies dropdown */}
          <div className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost m-1 font-medium"
            >
              Supplies
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
            >
              <li>
                <Link href="/StoreSearch">All Supplies</Link>
              </li>
              <li>
                <Link href="/StoreSearch">Silver</Link>
              </li>
              <li>
                <Link href="/StoreSearch">Kits</Link>
              </li>
              <li>
                <Link href="/StoreSearch">Tools</Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <section
        className="relative bg-cover bg-center text-center py-20"
        style={{
          backgroundImage: `url('https://picsum.photos/id/527/4000/3000')`,
        }}
      >
        <div className="max-w-2xl mx-auto bg-white bg-opacity-75 p-8">
          <h2 className="text-2xl font-bold uppercase mb-4">
            Welcome to the Studio 26, LLC
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Indulge in the charm of our online jewelry store, which offers a
            convenient and accessible way to explore and acquire exquisite
            handmade jewelry, stones, and supplies, all from the comfort of your
            own home.
          </p>
          <Link href="/StoreSearch">
            <button className="btn bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              <p>Shop All</p>
            </button>
          </Link>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-12">
        <h1 className="text-center font-bold text-4xl">Collections</h1>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Stones Collection */}
          <Link
            href="/StoreSearch"
            className="block text-center transition transform hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <Image
                src="https://media.istockphoto.com/id/1067431158/photo/gemstones-collection-jewelry-set.webp?b=1&s=612x612&w=0&k=20&c=wJn9wbva_cFOxkjVAMVnWRdIBe8QT15gf8_bXwYcZXI="
                alt="Collections Image"
                width={300}
                height={300}
                className="rounded-lg object-cover"
              />
              <p className="text-xl font-bold mt-4 text-black hover:text-pretty hover:underline">
                Stones
              </p>
            </div>
          </Link>

          {/* Jewelry Collection */}
          <Link
            href="/StoreSearch"
            className="block text-center transition transform hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <Image
                src="https://images.freeimages.com/images/large-previews/4fd/jewelry-series-2-1516742.jpg?fmt=webp&h=350"
                alt="Jewelry Image"
                width={300}
                height={300}
                className="rounded-lg object-cover"
              />
              <p className="text-xl font-bold mt-4 text-black hover:text-pretty hover:underline">
                Jewelry
              </p>
            </div>
          </Link>

          {/* Supplies Collection */}
          <Link
            href="/StoreSearch"
            className="block text-center transition transform hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <Image
                src="https://media.istockphoto.com/id/494001655/photo/making-of-fine-art-jewellery.webp?b=1&s=612x612&w=0&k=20&c=tHpKFfgwxZODIs4SVAsUawqN59CYinv_BgkFjl3Hpyw="
                alt="Supplies Image"
                width={300}
                height={300}
                className="rounded-lg object-cover"
              />
              <p className="text-xl font-bold mt-4 text-black hover:text-pretty hover:underline">
                Supplies
              </p>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
