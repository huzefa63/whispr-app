'use server';

async function sendMessage(data){
    try{
        const res = await fetch("http://localhost:4000/message/sendMessage",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(data),
            }
        );
        return res;
    }catch(err){
        console.log(err);
    }
}