export function SessionEnd(){
<div
  style={{
    position: "fixed",
    inset: 0,
    background: "rgba(15,15,20,0.75)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  }}
>
  <div
    style={{
      width: "320px",
      padding: "30px",
      borderRadius: "22px",
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
      textAlign: "center",
      color: "#fff",
    }}
  >
    <div
      style={{
        width: "52px",
        height: "52px",
        margin: "0 auto 20px",
        border: "4px solid rgba(255,255,255,0.15)",
        borderTop: "4px solid #6ee7ff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />

    <h2
      style={{
        margin: "0",
        fontSize: "22px",
        fontWeight: "600",
      }}
    >
      Ending Session
    </h2>

    <p
      style={{
        marginTop: "12px",
        color: "#cfcfcf",
        fontSize: "15px",
        lineHeight: "1.6",
      }}
    >
      Securely signing you out...
      <br />
      Please wait a moment.
    </p>
  </div>
</div>
}