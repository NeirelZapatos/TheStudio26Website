import Image from "next/image";
import { StrictMode } from "react";
import env from "dotenv";

// allows for use of environment variables
// ex: to get an environment variable called TESTING you would type process.env.TESTING
env.config();

export default function Home() {
  return (
    <StrictMode>
      <h1>Studio 26</h1>
    </StrictMode>
  );
}
