"use client";

import { signIn, useSession } from "next-auth/react";
import { FormEvent, useState, useEffect } from "react";

export default function LoginPage() {
  const { data: session, update } = useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials");
      setLoading(false);
      setToken("")
    } else if (result?.ok) {
      const res = await fetch('/api/token');
      const data = await res.json();
      setToken(data.accessToken);
      setLoading(false);
      setError("")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-4">
      <h2 className="text-2xl mb-4 text-center font-bold">Sign in</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" type="email" required placeholder="Email" className="w-full px-3 py-2 border focus:outline-none" />
        <input name="password" type="password" required placeholder="Password" className="w-full px-3 py-2 border focus:outline-none" />
        {error && <p className="text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full py-2 bg-black text-white hover:bg-white hover:text-black border">
          {loading ? "Loading..." : "Sign in"}
        </button>
      </form>
      {session && token && (
        <div className="mt-4 p-4 border">
          <p className="font-bold">Token:</p>
          <code className="text-xs break-all">{token}</code>
        </div>
      )}
    </div>
  );
}
