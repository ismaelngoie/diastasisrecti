export default function DashboardPage() {
  return (
    <main className="min-h-screen clinical-noise flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-soft">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-lora)" }}>
          Dashboard (Placeholder)
        </h1>
        <p className="text-white/70 mt-2 leading-relaxed">
          You got redirected here because <span className="text-white font-semibold">isPremium</span> was true.
          <br />
          We’ll replace this later with the real dashboard.
        </p>
      </div>
    </main>
  );
}
