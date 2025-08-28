import Link from "next/link";
import PublicNav from "../_components/publicNav";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-gray-100">
      {/* Header */}
      <PublicNav />

      {/* Main Section */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <section>
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white">
            Your Conversations, Reinvented.
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Whispr lets you chat seamlessly with end-to-end security and
            real-time delivery. Simple, fast, and built for privacy.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/signin" className="px-5 py-3 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-500">
              Start Messaging
            </Link>
            <Link href="/features" className="px-5 py-3 rounded-md border border-gray-700 text-gray-200 hover:bg-gray-800">
              Learn More
            </Link>
          </div>

          {/* Features List */}
          <ul className="mt-8 grid gap-4">
            <li className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center text-white">
                ⚡
              </div>
              <div>
                <h4 className="font-semibold text-white">Instant Messaging</h4>
                <p className="text-sm text-gray-400">
                  Real-time delivery with WebSocket-powered speed and
                  persistence.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center text-white">
                🔒
              </div>
              <div>
                <h4 className="font-semibold text-white">End-to-End Privacy</h4>
                <p className="text-sm text-gray-400">
                  Secure encryption for all your messages and shared files.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center text-white">
                🖼️
              </div>
              <div>
                <h4 className="font-semibold text-white">Rich Media Sharing</h4>
                <p className="text-sm text-gray-400">
                  Send photos and audio effortlessly.
                </p>
              </div>
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Whispr — Built with ❤️
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <a>Privacy</a>
            <a>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
