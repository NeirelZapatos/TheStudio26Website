"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState, FormEvent } from "react";
//import Head from "next/head";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error); // Display error if authentication fails
    } else {
      // Redirect or handle success
      window.location.href = "/Dashboard";
    }
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold text-center mb-6">Sign in</h2>

          {error && (
            <div className="mb-4 flex items-center rounded-lg bg-red-100 px-4 py-3 text-red-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                />
              </svg>
              <span>Incorrect username or password</span>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            {/* Remember Me & Reset Password */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {/* <input
                  type="checkbox"
                  id="remember-me"
                  className="h-4 w-4 text-indigo-600"
                />
                <label htmlFor="remember-me" className="ml-2 text-gray-700">
                  Remember me
                </label> */}
              </div>
              <a href="#" className="text-sm text-indigo-600 hover:underline">
                Reset password
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 mb-4"
            >
              Sign in
            </button>

            {/* Sign Up & Google Sign-In */}
            {/* <div className="text-center text-gray-600 mb-4">
              Don’t have an account?{" "}
              <a href="#" className="text-indigo-600 hover:underline">
                Sign up
              </a>
            </div> */}

            {/* <div className="flex items-center justify-center mb-4">
              <span className="border-t w-1/4"></span>
              <span className="mx-4 text-gray-500">or</span>
              <span className="border-t w-1/4"></span>
            </div> */}

            {/* Google Sign In Button */}
            {/* <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                width={20}
                height={20}
                alt="Google Icon"
                className="w-5 h-5 mr-2"
              />
              Continue with Google
            </button> */}
          </form>
        </div>
      </div>
    </div>
  );
}
