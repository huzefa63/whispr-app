import Link from "next/link";
import PublicNav from "../_components/PublicNav";

function page() {
    return (
      <div className="min-h-screen bg-[var(--background)] text-white">
        <PublicNav />

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-6">Features</h1>
          <p className="text-gray-400 mb-4">
            Explore all the features that make Whispr private, fast, and simple.
          </p>

          {/* Example Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-[var(--surface)] rounded-lg shadow ">
              <h2 className="text-xl font-semibold mb-2">Secure Messaging</h2>
              <p className="text-gray-400 text-sm">
                End-to-end encryption for all conversations.
              </p>
            </div>
            <div className="p-6 bg-[var(--surface)] rounded-lg shadow ">
              <h2 className="text-xl font-semibold mb-2">Fast Performance</h2>
              <p className="text-gray-400 text-sm">
                Optimized for speed and reliability.
              </p>
            </div>
            <div className="p-6 bg-[var(--surface)] rounded-lg shadow ">
              <h2 className="text-xl font-semibold mb-2">Simple Interface</h2>
              <p className="text-gray-400 text-sm">
                Easy to use and intuitive design.
              </p>
            </div>
          </div>
        </section>
        <section className="max-w-5xl mx-auto px-6 py-10">
          {/* <h2 className="text-4xl font-bold text-center mb-12">Features</h2> */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Features List */}
            <div className="bg-[var(--surface)] p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-indigo-400">
                Messaging
              </h3>
              <ul className="space-y-3">
                <li>✔ Add anyone to your chat list using their number</li>
                <li>✔ Real-time messaging</li>
                <li>✔ Edit messages</li>
                <li>✔ Reply to specific messages</li>
                <li>✔ Delete messages for me or for everyone</li>
                <li>✔ Send images, audio files</li>
              </ul>
            </div>

            <div className="bg-[var(--surface)] p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-indigo-400">
                Calling
              </h3>
              <ul className="space-y-3">
                <li>✔ Voice and video calls</li>
                {/* <li>✔ Add multiple participants in calls</li> */}
                <li>✔ Smooth and secure connection with WebRTC</li>
              </ul>
            </div>

            <div className="bg-[var(--surface)] p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-indigo-400">
                Status & Privacy
              </h3>
              <ul className="space-y-3">
                <li>✔ Blue ticks when message is read</li>
                <li>✔ Last seen visibility</li>
                <li>✔ Online & Typing indicators</li>
              </ul>
            </div>

            <div className="bg-[var(--surface)] p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-indigo-400">
                File Sharing
              </h3>
              <ul className="space-y-3">
                <li>✔ Share images and audio files</li>
                <li>✔ Fast and secure uploads</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="bg-[var(--surface)] py-12 mt-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Tech Stack</h2>
            <p className="text-lg text-gray-300">
              Built with{" "}
              <span className="text-indigo-400 font-semibold">React</span>,
              <span className="text-indigo-400 font-semibold"> Next.js</span>,
              <span className="text-indigo-400 font-semibold"> Node.js</span>,
              <span className="text-indigo-400 font-semibold"> PostgreSQL</span>
              ,
              <span className="text-indigo-400 font-semibold"> Prisma ORM</span>
              ,
              <span className="text-indigo-400 font-semibold"> JavaScript</span>
              ,
              <span className="text-indigo-400 font-semibold">
                {" "}
                Tailwind CSS
              </span>
              .
            </p>
          </div>
        </section>
      </div>
    );
}

export default page
