"use client";

export function Field({ field, errors }) {
  return (
    <div className="relative z-0 w-full mb-5 group">
      <input
        {...field?.register?.(field?.name, field?.validation)}
        type={field?.type}
        id={field?.name}
        className="
          block w-full rounded-md px-3 pt-5 pb-2 text-sm text-[var(--text)]
          bg-[var(--bg-secondary)] border border-gray-300
          appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500
          dark:bg-[var(--dark-bg-secondary)] dark:border-gray-600
          dark:text-white
        "
        placeholder=" "
      />
      <label
        htmlFor={field?.name}
        className="
          absolute left-3 top-2.5 text-gray-500 text-sm duration-300
          transform -translate-y-1 scale-90 origin-[0]
          peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-3
          peer-focus:scale-90 peer-focus:-translate-y-1 peer-focus:text-blue-600
          dark:text-gray-400
        "
      >
        {field?.name === "passwordConfirm" && "Confirm Password"}
        {field?.name === "contactNumber" && "Contact Number"}
        {field?.name !== "passwordConfirm" &&
          field?.name !== "contactNumber" &&
          field?.name}
      </label>
      {errors[field?.name] && (
        <p className="text-red-500 text-xs mt-1">
          {errors[field?.name]?.message}
        </p>
      )}
    </div>
  );
}
