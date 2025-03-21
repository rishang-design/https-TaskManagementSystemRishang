import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import  { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  // Add authentication check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // If user is already logged in, redirect to tasklist
        navigate('/tasklist');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate]);

  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        // Get user info
        const userName = result.user.displayName || result.user.email?.split('@')[0] || 'User';
        
        // Store user info if needed
        localStorage.setItem('userName', userName);
        
        // Navigate using React Router
        navigate('/tasklist', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
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


