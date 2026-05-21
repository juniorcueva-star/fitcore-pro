function App() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
        <h1 className="text-4xl font-bold">
          FitCore <span className="text-yellow-500">Pro</span>
        </h1>
        <p className="mt-3 text-neutral-400">
          Frontend configurado correctamente.
        </p>
        <button className="mt-6 rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black transition hover:bg-yellow-400">
          Comenzar
        </button>
      </div>
    </main>
  )
}

export default App