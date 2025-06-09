"use server";

import { cookies } from "next/headers";

export async function createUserAction(params) {
    
  let res;
  try {
    res = await fetch(
      `http://localhost:5000/user/createUser`,
      {
        "method":"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(params)
      }
    );
    res = await res.json();
    console.log('from server',res.data);
     (await cookies()).set('jwt',res?.jwt,{
      expires: 7 * 24 * 60 * 60 * 1000,
      name:'jwt',
    })
  } catch (err) {
    console.trace();
    console.error("Error creating user:", err);
    res = err;
  }
  return res;
}
