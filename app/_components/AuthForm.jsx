'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Spinner from "./Spinner";
import { signIn, signUp } from "../_services/authService";
import { Field } from "./Field";
function AuthForm() {
  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onSubmit" });
  const pathname = usePathname();
  const [isSubmitting,setIsSubmitting] = useState(false);
  const fields = useMemo(
    () => [
      {
        name: "email",
        type: "email",
        register,
        validation: {
          required: "please enter valid email",
        },
      },
      ...(pathname === "/auth/signup"
        ? [
            {
              name: "name",
              type: "text",
              register,
              validation: {
                required: "please enter username",
              },
            },
          ]
        : []),
      ...(pathname === "/auth/signup"
        ? [
            {
              name: "contactNumber",
              type: "number",
              register,
              validation: {
                required: "please enter contact number",
                minLength: 10,
              },
            },
          ]
        : []),
      {
        name: "password",
        type: "password",
        register,
        validation: {
          required: "password is required",
          minLength: {
            value: 6,
            message: "password should be at least 6 characters long",
          },
        },
      },
      ...(pathname === "/auth/signup"
        ? [
            {
              name: "passwordConfirm",
              type: "password",
              register,
              validation: {
                validate: (val) =>
                  getValues("password") !== val
                    ? "password did not match"
                    : true,
              },
            },
          ]
        : []),
    ],
    [pathname]
  ); // Prevent excessive recalculations

  async function onsubmit(data) {
    if(pathname === '/auth/signup') await signUp(data,setIsSubmitting);
    else await signIn(data,setIsSubmitting);
  }

  return (
    <form
      className=" rounded-md border text-white border-stone-700 w-full p-5"
      onSubmit={handleSubmit(onsubmit)}
    >
      <h1 className="text-center text-3xl text-[var(--text)] mb-5">
        {pathname === "/auth/signup" ? "Signup Form" : "Signin Form"}
      </h1>
      <div className="relative z-0 w-full mb-5 group">
        {fields.map((el, i) => (
          <Field key={i} field={el} errors={errors} />
        ))}
        {pathname === "/auth/signup" && (
          <input
            {...register("profileImage")}
            type="file"
            className="file:bg-blue-500 file:px-3 file:py-2 file:rounded-md file:hover:bg-blue-600"
          />
        )}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <input type="checkbox" name="" id="remember" />
        <label htmlFor="remember" className="text-[var(--text)]">
          remember me for 30 days
        </label>
      </div>
      <div>
        <p className="text-[var(--text)]">
          {pathname === '/auth/signup' ? 'already have an account ?' : "don't have an account ?"}
          <Link className="text-blue-500" href={pathname === '/auth/signin' ? '/auth/signup': "/auth/signin"}>
            {pathname === '/auth/signin' ? 'signup' : 'signin'}
          </Link>{" "}
        </p>
      </div>
      <button
        type="submit"
        className="mt-3 relative text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        <span className={`${isSubmitting && "opacity-0"}`}>submit</span>
        <span
          className={`${
            isSubmitting
              ? "block absolute top-1/2 left-1/2 -translate-1/2 p-1"
              : "hidden"
          }`}
        >
          <Spinner />
        </span>
      </button>
    </form>
  );
}
export default AuthForm;