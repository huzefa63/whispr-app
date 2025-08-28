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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fields = useMemo(
    () => [
      {
        name: "email",
        type: "email",
        placeholder: "Enter your email",
        register,
        validation: {
          required: "Please enter a valid email",
        },
      },
      ...(pathname === "/auth/signup"
        ? [
            {
              name: "name",
              type: "text",
              placeholder: "Enter your name",
              register,
              validation: {
                required: "Please enter username",
              },
            },
          ]
        : []),
      ...(pathname === "/auth/signup"
        ? [
            {
              name: "contactNumber",
              type: "number",
              placeholder: "Enter your contact number",
              register,
              validation: {
                required: "Please enter contact number",
                minLength: 10,
              },
            },
          ]
        : []),
      {
        name: "password",
        type: "password",
        placeholder: "Enter your password",
        register,
        validation: {
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password should be at least 6 characters long",
          },
        },
      },
      ...(pathname === "/auth/signup"
        ? [
            {
              name: "passwordConfirm",
              type: "password",
              placeholder: "Confirm your password",
              register,
              validation: {
                validate: (val) =>
                  getValues("password") !== val
                    ? "Password did not match"
                    : true,
              },
            },
          ]
        : []),
    ],
    [pathname]
  );

  async function onsubmit(data) {
    if (pathname === "/auth/signup") await signUp(data, setIsSubmitting);
    else await signIn(data, setIsSubmitting);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onsubmit)}>
      {fields.map((el, i) => (
        <Field
          key={i}
          field={el}
          register={register}
          errors={errors} // ✅ Pass errors as prop
        />
      ))}

      {pathname === "/auth/signup" && (
        <input
          {...register("profileImage")}
          type="file"
          className="file:bg-indigo-600 file:text-white file:px-3 file:py-2 file:rounded-md mt-4 text-gray-400"
        />
      )}

      <div className="flex items-center gap-2 mt-4">
        <input type="checkbox" id="remember" />
        <label htmlFor="remember" className="text-gray-400">
          Remember me for 30 days
        </label>
      </div>

      <div className="text-gray-400">
        {pathname === "/auth/signup"
          ? "Already have an account?"
          : "Don't have an account?"}{" "}
        <Link
          className="text-indigo-400 hover:underline"
          href={pathname === "/auth/signin" ? "/auth/signup" : "/auth/signin"}
        >
          {pathname === "/auth/signin" ? "Sign Up" : "Sign In"}
        </Link>
      </div>

      <button
        type="submit"
        className="w-full py-3 mt-6 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold text-lg shadow-lg transition-all relative"
      >
        <span className={`${isSubmitting && "opacity-0"}`}>Submit</span>
        {isSubmitting && (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Spinner />
          </span>
        )}
      </button>
    </form>
  );
}

export default AuthForm;
