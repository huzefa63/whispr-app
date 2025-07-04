import AuthForm from "@/app/_components/AuthForm";
function page() {
  return (
    <div className="bg-[var(--background)] w-full h-screen flex items-center justify-center">
      <div className="w-[80%] lg:w-[40%] bg-[var(--surface)]">
        <AuthForm />
      </div>
    </div>
  );
}

export default page;
