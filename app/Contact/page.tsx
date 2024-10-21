const Header = () => (
  <div className="navbar bg-base-100">
    <div className="navbar-start">
      <div className="dropdown">
        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </div>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
          <li><a>Online Store</a></li>
          <li>
            <a>Parent</a>
            <ul className="p-2">
              <li><a>Submenu 1</a></li>
              <li><a>Submenu 2</a></li>
            </ul>
          </li>
          <li><a>Item 3</a></li>
        </ul>
      </div>
      <a className="btn btn-ghost text-xl text-[#8B0000]">The Studio 26</a>
    </div>
    <div className="navbar-center hidden lg:flex">
      <ul className="menu menu-horizontal px-1">
        <li><a>Online Store</a></li>
        <li><a>Class Catalog</a></li>
        <li><a>Calendar</a></li>
        <li><a>Open Lab</a></li>
        <li><a>Gift Cards</a></li>
        <li><a>Contact Us</a></li>
        {/* <li>
          <details>
            <summary>Parent</summary>
            <ul className="p-2">
              <li><a>Submenu 1</a></li>
              <li><a>Submenu 2</a></li>
            </ul>
          </details>
        </li> */}
      </ul>
    </div>
    <div className="navbar-end">
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <div className="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="badge badge-sm indicator-item">8</span>
            </div>
          </div>
          <div
            tabIndex={0}
            className="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-52 shadow">
            <div className="card-body">
              <span className="text-lg font-bold">8 Items</span>
              <span className="text-info">Subtotal: $999</span>
              <div className="card-actions">
                <button className="btn btn-primary btn-block">View cart</button>
              </div>
            </div>
          </div>
        </div>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                alt="Tailwind CSS Navbar component"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li><a>Settings</a></li>
            <li><a>Logout</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const Footer = () => (
  <footer className="footer bg-base-200 text-base-content p-10">
    <nav>
      <h6 className="footer-title">Location</h6>
      <a className="link link-hover">
        4100 Cameron Park Drive,<br />
        Suite 118 Cameron Park, <br />
        CA 95682
      </a>
    </nav>
    <nav>
      <h6 className="footer-title">Email</h6>
      <a className="link link-hover">TheStudio26@gmail.com</a>
    </nav>
    <nav>
      <h6 className="footer-title">Phone Number</h6>
      <a className="link link-hover">916-350-0546</a>
    </nav>
    <form>
      <h6 className="footer-title">Newsletter</h6>
      <fieldset className="form-control w-80">
        <label className="label">
          <span className="label-text">Enter your email address</span>
        </label>
        <div className="join">
          <input
            type="text"
            placeholder="username@site.com"
            className="input input-bordered join-item" />
          <button className="btn btn-primary join-item">Subscribe</button>
        </div>
      </fieldset>
    </form>
  </footer>
);

export default function Page() {
  return (
    <div data-theme="autumn">
      <Header />
      <div className="container mx-auto p-4 max-w-3xl py-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-[#8B0000] mb-2">The Studio 26</h1>
        <p className="text-lg text-center text-gray-600 mb-8">4100 Cameron Park Drive #118, Cameron Park, CA 95682</p>

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input type="text" className="input input-bordered w-full" />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>
              <input type="text" className="input input-bordered w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input type="email" className="input input-bordered w-full" />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone Number</span>
              </label>
              <input type="tel" className="input input-bordered w-full" />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Subject</span>
            </label>
            <input type="text" className="input input-bordered w-full" />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Message</span>
            </label>
            <textarea className="textarea textarea-bordered h-24" placeholder="Write your message..."></textarea>
          </div>

          <button className="btn btn-primary">Send Message</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}