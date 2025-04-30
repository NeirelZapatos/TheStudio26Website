import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import Admin from "@/app/models/Admin";
import bcrypt from "bcrypt";
import dbConnect from "@/app/lib/dbConnect";

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  //adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password){
          throw new Error("Email and password are required.");
        }

        await dbConnect();

        const admin = await Admin.findOne({
          email: credentials.email,
        });
        
        if (!admin || !admin.hashed_password){
          throw new Error("Incorrect Username or password");
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password,
          admin.hashed_password
        );

        return passwordsMatch ? admin : null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  theme: {
    colorScheme: "light", // Sets light mode
  },
};