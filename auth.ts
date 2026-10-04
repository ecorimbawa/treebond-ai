import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db/connection";
import { verifySignIn } from "@/lib/siwe";
import { findOrCreateWalletUser } from "@/lib/wallet-account";
import { User } from "@/models";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        await connectDB();

        const user = await User.findOne({ email }).select("+password");
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),
    // Wallet sign-in (EIP-4361). Doubles as sign-up: an address nobody has
    // claimed yet gets a sponsor account on the spot, which is what makes
    // "connect wallet" a complete entry path and not just a second password.
    Credentials({
      id: "siwe",
      name: "Ethereum Wallet",
      credentials: {
        message: {},
        signature: {},
      },
      authorize: async (credentials) => {
        const message = credentials?.message as string | undefined;
        const signature = credentials?.signature as string | undefined;
        if (!message || !signature) return null;

        const result = await verifySignIn({ message, signature });
        if (!result.ok) return null;

        const user = await findOrCreateWalletUser(result.address);
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
