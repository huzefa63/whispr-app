'use client';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import {createUserAction} from '@/actions/authActions';
import axios from "axios";
function AuthForm() {
  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onSubmit" });
  const pathname = usePathname();
  const router = useRouter();
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
  async function signUp(data){
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/createUser`,
        data
      );
      
      localStorage.setItem("jwt", res.data?.jwt);
      location.href = '/chat-app';
    } catch (err) {
      console.trace();
      console.error("Error creating user:", err);
    }
  }
  async function signIn(data){
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signIn`,
        data,
      );
      
      localStorage.setItem("jwt", res.data?.jwt);
      location.href = "/chat-app";
    } catch (err) {
      console.trace();
      console.error("Error creating user:", err);
    }
  }

  async function onsubmit(data) {
    if(pathname === '/auth/signup') await signUp(data);
    else await signIn(data);
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
        </div>
        <div className="flex items-center gap-2 mb-3">
          <input type="checkbox" name="" id="remember" />
          <label htmlFor="remember" className="text-[var(--text)]">
            remember me for 30 days
          </label>
        </div>
        <div>
          {pathname === "/auth/signup" && (
            <p className="text-[var(--text)]">
              already have an account ?{" "}
              <Link className="text-blue-500" href="/auth/signin">
                signin
              </Link>{" "}
            </p>
          )}
          {pathname === "/auth/signin" && (
            <p className="text-[var(--text)]">
              don't have an account ?{" "}
              <Link className="text-blue-500" href="/auth/signup">
                signup
              </Link>{" "}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="mt-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Submit
        </button>
      </form>
  );
}

export default AuthForm;


function Field({field,errors}){
  return (
    <div className="relative z-0 w-full mb-5 group">
      <input
        {...field?.register?.(field?.name, field?.validation)}
        type={field?.type}
        id={field?.name}
        className="block py-2.5 px-0 w-full text-sm text-[var(--text)] bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
        placeholder=" "
      />
      <label
        htmlFor={field?.name}
        className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
      >
        {field?.name === "passwordConfirm" && "confirm password"}
        {field?.name === "contactNumber" && "contact number"}
        {field?.name !== "passwordConfirm" && field?.name !== 'contactNumber' && field?.name}
      </label>
      {errors[field?.name] && <p className="text-red-500">{errors[field?.name]?.message}</p>}
    </div>
  );
}