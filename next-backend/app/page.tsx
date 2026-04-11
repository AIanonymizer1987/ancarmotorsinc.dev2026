export default function Home() {
  return (
    <main style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div>
        <h1>Neon backend proxy</h1>
        <p>This Next.js app is only used for API proxying to Neon.</p>
      </div>
    </main>
  );
}
