$content = @'
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Still log it too, in case the console is easier to copy from.
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: "24px",
            fontFamily: "monospace",
            background: "#fff3f3",
            color: "#900",
            whiteSpace: "pre-wrap",
            minHeight: "100vh",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Une erreur est survenue :</h2>
          <div>{String(this.state.error?.message || this.state.error)}</div>
          <hr />
          <div style={{ fontSize: "12px", opacity: 0.8 }}>
            {this.state.error?.stack}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

'@
Set-Content -Path "src\\components\\ErrorBoundary.jsx" -Value $content -Encoding UTF8
Write-Host "Done. New file written."