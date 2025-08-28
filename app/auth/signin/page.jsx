import PublicNav from "@/app/_components/PublicNav";
import AuthForm from "@/app/_components/AuthForm";

function Page() {
  return (
    <div className="bg-[var(--background)] w-full min-h-screen flex flex-col">
      {/* ✅ Full-width Navbar */}
      <div className="w-full">
        <PublicNav />
      </div>

      {/* ✅ Centered Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[var(--surface)] rounded-xl shadow-md p-6">
          {/* ✅ Heading */}
          <h1 className="text-2xl font-semibold text-center mb-6 text-gray-300">
            Welcome Back
          </h1>
          <p className="text-center text-gray-300 mb-4">
            Please sign in to continue
          </p>

          <AuthForm />
        </div>
      </div>
    </div>
  );
}

export default Page;
