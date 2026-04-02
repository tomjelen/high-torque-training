export default function DownloadBar() {
  return (
    <section>
      <a href="/workouts/high-torque-workouts.zip" download role="button">
        Download All Workouts (.zip)
      </a>

      <details style={{ marginTop: '1rem' }}>
        <summary>Zwift install instructions</summary>
        <div style={{ marginTop: '0.75rem' }}>
          <p>The zip contains five folders — copy them directly into your Zwift workout directory:</p>
          <ul>
            <li><strong>Windows:</strong> <code>%localAppData%\Zwift\Workouts\[your_user_id]\</code></li>
            <li><strong>macOS:</strong> <code>~/Documents/Zwift/Workouts/[your_user_id]/</code></li>
            <li><strong>iOS/Android:</strong> not supported for custom workouts — use a PC/Mac</li>
          </ul>
          <p>Restart Zwift. The folders appear under <strong>Custom Workouts</strong> in the workout selection screen.</p>
          <p>
            All power targets are expressed as a fraction of your FTP (e.g. <code>0.88</code> = 88% FTP).
            Keep your FTP up to date in Zwift for accurate targets.
          </p>
        </div>
      </details>
    </section>
  )
}
