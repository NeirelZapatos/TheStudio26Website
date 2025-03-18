'use client'
import NewsletterForm from "./NewsletterForm";
import Link from "next/link";

const Footer2 = () => {
    return (
    <footer className="footer bg-base-200 text-base-content p-10 relative">
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
      <NewsletterForm />
      <Link href="/Login" className="link link-hover absolute bottom-4 right-10">Admin Log In</Link>
    </footer>
  );
}

export default Footer2;