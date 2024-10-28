import Head from "next/head";

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

export default function page(){
    return(
    <div>
        <Header />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Sign in</h2>
                
                {/* Email Input */}
                <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                    type="email"
                    placeholder="name@email.com"
                    className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                </div>

                {/* Password Input */}
                <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                </div>

                {/* Remember Me & Reset Password */}
                <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <input
                    type="checkbox"
                    id="remember-me"
                    className="h-4 w-4 text-indigo-600"
                    />
                    <label htmlFor="remember-me" className="ml-2 text-gray-700">Remember me</label>
                </div>
                <a href="#" className="text-sm text-indigo-600 hover:underline">
                    Reset password
                </a>
                </div>

                {/* Sign In Button */}
                <button className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 mb-4">
                Sign in
                </button>

                {/* Sign Up & Google Sign-In */}
                <div className="text-center text-gray-600 mb-4">
                Don’t have an account? <a href="#" className="text-indigo-600 hover:underline">Sign up</a>
                </div>

                <div className="flex items-center justify-center mb-4">
                <span className="border-t w-1/4"></span>
                <span className="mx-4 text-gray-500">or</span>
                <span className="border-t w-1/4"></span>
                </div>

                {/* Google Sign In Button */}
                <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                    alt="Google Icon"
                    className="w-5 h-5 mr-2"
                />
                Continue with Google
                </button>
            </div>
        </div>
        <Footer />
    </div>
    );
}