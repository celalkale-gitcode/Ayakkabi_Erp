import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Ana Sayfa</h1>

      <Link href="/dashboard">Dashboard'a Git</Link>
    </div>
  );
}
