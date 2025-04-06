"use client";

import { useState, FormEvent, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useRouter } from "next/navigation"; // Changed from next/router to next/navigation

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Check password length
    if (password.length < 5) {
      setError("Password must be at least 5 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("/api/auth/reset-password", {
        token,
        password,
      });

      if (response.data.success) {
        setSuccess("Password has been reset successfully!");
        setError("");
        
        // Add redirect to login page after successful password reset
        setTimeout(() => {
          router.push("/Login");
        }, 2000);
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

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
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center rounded-lg bg-green-100 px-4 py-3 text-green-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
              minLength={5}
            />
            <p className="text-sm text-gray-500 mt-1">Password must be at least 5 characters</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
              minLength={5}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}