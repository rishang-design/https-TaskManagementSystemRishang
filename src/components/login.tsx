import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import React from 'react'

const Login = () => {
  const googleLogin = async () => {
    console.log(import.meta.env.VITE_FIREBASE_API_KEY);
    const provider = new GoogleAuthProvider();
    
    signInWithPopup(auth, provider)
    .then(async(result) => {
        console.log(result);
        if(result.user){
            alert("Login Successful");
        }
    });
    window.location.href = "/tasklist";
    
  };


  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 p-8">
        <img src="./src/assets/TaskBuddy.png" alt="Hi Buddy" className="h-20 w-50" />
        <p className="text-gray-600 font-sans text-mm max-w-sm mt-4 font-medium">
          Streamline your workflow and track progress effortlessly with our all-in-one task management app
        </p>
        <div className="mt-8" onClick={googleLogin}>
          <img src="./src/assets/g-logo.png" alt="logo" className="ml-4" />
        </div>
      </div>
      <div className="w-1/2 bg-gray-50">
        <img src="./src/assets/img-login.png" alt="login" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}

export default Login


