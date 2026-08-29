import { HelloCard } from "@/components/HelloCard";
import type { HelloResponse } from "@ethannet/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

async function getHello(): Promise<HelloResponse> {
  const res = await fetch(`${BACKEND_URL}/api/hello`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Backend request failed: ${res.status}`);
  }
  return res.json() as Promise<HelloResponse>;
}

export default async function HomePage() {
  const data = await getHello();
  return <HelloCard {...data} />;
}
