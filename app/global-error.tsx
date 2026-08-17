"use client"

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
            background: "#f7f6f2",
            color: "#171815",
          }}
        >
          <div style={{ maxWidth: 440, textAlign: "center" }}>
            <h1 style={{ fontSize: 32, letterSpacing: "-0.03em" }}>
              AFM needs a fresh start
            </h1>
            <p style={{ lineHeight: 1.6, color: "#62645d" }}>
              We could not recover this screen. Your saved portfolio data has not
              been removed.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 16,
                minHeight: 44,
                border: 0,
                borderRadius: 10,
                padding: "0 18px",
                background: "#3d4a28",
                color: "white",
                cursor: "pointer",
              }}
            >
              Reload AFM
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
