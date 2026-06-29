export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Tratto Docs</h1>
        <p className="text-xl text-slate-600 mb-8">
          Complete API documentation and guides for Tratto Email
        </p>
        <a
          href="/en/getting-started"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Get Started
        </a>
      </div>
    </main>
  );
}
