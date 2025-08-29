import axios from "axios";
import toast from "react-hot-toast";

export async function signUp(data,setIsSubmitting) {
  console.log(data);
  const formData = new FormData();
  formData.append("email", data.email);
  formData.append("name", data.name);
  formData.append("contactNumber", data.contactNumber);
  formData.append("password", data.password);
  formData.append("passwordConfirm", data.passwordConfirm);
  formData.append("profileImage", data.profileImage[0]);
  try {
    setIsSubmitting(true);
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/createUser`,
      formData
    );

    localStorage.setItem("jwt", res.data?.jwt);
    location.href = "/chat-app";
  } catch (err) {
    toast.error("failed to signup, email or contact number may already exist!");
    console.trace();
    console.error("Error creating user:", err);
  } finally {
    setIsSubmitting(false);
  }
}

export async function signIn(data,setIsSubmitting) {
  try {
    setIsSubmitting(true);
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signIn`,
      data,{withCredentials:true}
    );

    localStorage.setItem("jwt", res.data?.jwt);
    location.href = "/chat-app";
  } catch (err) {
    toast.error("failed to signin, email or password is incorrect!");
    console.trace();
    console.error("Error creating user:", err);
  } finally {
    setIsSubmitting(false);
  }
}