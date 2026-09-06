import type { HelloResponse } from "@ethannet/types";

export function HelloCard({ message, timestamp }: HelloResponse) {
  return (
    <section style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>ethannet</h1>
      <p>{message}</p>
      <p>
        <small>Received at: {timestamp}</small>
      </p>
    </section>
  );
}
