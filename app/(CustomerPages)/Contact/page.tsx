//app/Contact/page.tsx
"use client";
import { useState } from "react";
import { ChangeEvent, FocusEvent } from "react";

export default function Page() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: string; message: string } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const initialPlaceholders = {
    firstName: "First Name",
    lastName: "Last Name",
    email: "example@gmail.com",
    phone: "123-456-7890",
    subject: "Subject",
    message: "Write your message...",
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: false }));
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    const newErrors = {
      email: !formData.email,
      subject: !formData.subject,
      message: !formData.message,
      phone: formData.phone ? !validatePhoneNumber(formData.phone) : false, // Set phone error to boolean
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFeedback({ type: "success", message: "Message sent successfully!" });

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        const errorData = await response.json();
        setFeedback({ type: "error", message: errorData.error || "Failed to send message." });
      }
    } catch (error) {
      setFeedback({ type: "error", message: "An unexpected error occurred." });
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-theme="autumn">
      <div className="container mx-auto p-4 max-w-3xl py-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-black mb-8 mt-6">Contact Us</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`form-control ${errors.firstName ? "border-red-500" : ""}`}>
              <label className="label">
                <span className="label-text">First Name - Optional</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`input input-bordered w-full ${errors.firstName ? "border-red-500" : ""}`}
                placeholder={formData.firstName ? "" : initialPlaceholders.firstName}
              />
            </div>
            <div className={`form-control ${errors.lastName ? "border-red-500" : ""}`}>
              <label className="label">
                <span className="label-text">Last Name - Optional</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`input input-bordered w-full ${errors.lastName ? "border-red-500" : ""}`}
                placeholder={formData.lastName ? "" : initialPlaceholders.lastName}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`form-control ${errors.email ? "border-red-500" : ""}`}>
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input input-bordered w-full ${errors.email ? "border-red-500" : ""}`}
                placeholder={formData.email ? "" : initialPlaceholders.email}
              />
              {errors.email && <p className="text-red-500 text-sm">* Required</p>}
            </div>
            <div className={`form-control ${errors.phone ? "border-red-500" : ""}`}>
              <label className="label">
                <span className="label-text">Phone Number - Optional</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`input input-bordered w-full ${errors.phone ? "border-red-500" : ""}`}
                placeholder={formData.phone ? "" : initialPlaceholders.phone}
              />
              {errors.phone && <p className="text-red-500 text-sm">Must be in the format 123-456-7890</p>}
            </div>
          </div>

          <div className={`form-control ${errors.subject ? "border-red-500" : ""}`}>
            <label className="label">
              <span className="label-text">Subject</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`input input-bordered w-full ${errors.subject ? "border-red-500" : ""}`}
              placeholder={formData.subject ? "" : initialPlaceholders.subject}
            />
            {errors.subject && <p className="text-red-500 text-sm">* Required</p>}
          </div>

          <div className={`form-control ${errors.message ? "border-red-500" : ""}`}>
            <label className="label">
              <span className="label-text">Message</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={`textarea textarea-bordered h-24 ${errors.message ? "border-red-500" : ""}`}
              placeholder={formData.message ? "" : initialPlaceholders.message}
            />
            {errors.message && <p className="text-red-500 text-sm">* Required</p>}
          </div>

          <div className="flex items-center space-x-8">
            <button className="btn text-white bg-red-700 hover:bg-red-500" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>

            {feedback && (
              <span
                className={`inline-block ${feedback?.type === "success" ? "text-green-500" : "text-red-500"}`}
              >
                {feedback?.message}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
