import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, UserIcon } from "lucide-react";
import { Toaster } from "react-hot-toast";


const Login = () => {
  const [state, setState] = useState<"login" | "signup">("login");

  const [userName, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { user, login, signup } = useAppContext();

  
  useEffect(() => {
    if (user) {
      navigate("/"); 
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || (state === "signup" && !userName)) {
      alert("Please fill all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      if (state === "login") {
        await login({ email, password });
      } else {
        await signup({ username: userName, email, password });
      }
    } catch (error) {
      console.error("Auth Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>

    <Toaster />
    <main className="min-h-screen flex items-center justify-center bg-[#020617] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        
        {/* Title */}
        <h2 className="text-3xl font-semibold text-white">
          {state === "login" ? "Sign in" : "Sign up"}
        </h2>

        <p className="text-gray-400 mt-2 text-sm">
          {state === "login"
            ? "Please enter email and password to access."
            : "Please enter your details to create an account."}
        </p>

        {/* Username */}
        {state === "signup" && (
          <div className="mt-6">
            <label className="text-sm text-gray-300">Username</label>

            <div className="relative mt-2">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />

              <input
                value={userName}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#0f172a] border border-gray-700 text-white outline-none focus:border-gray-500"
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div className="mt-5">
          <label className="text-sm text-gray-300">Email</label>

          <div className="relative mt-2">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#0f172a] border border-gray-700 text-white outline-none focus:border-gray-500"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mt-5">
          <label className="text-sm text-gray-300">Password</label>

          <div className="relative mt-2">
            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#0f172a] border border-gray-700 text-white outline-none focus:border-gray-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition disabled:opacity-50"
        >
          {isSubmitting
            ? "Please wait..."
            : state === "login"
            ? "Login"
            : "Sign up"}
        </button>

        {/* Toggle */}
        <p className="text-center text-gray-400 mt-6 text-sm">
          {state === "login"
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() =>
              setState(state === "login" ? "signup" : "login")
            }
            className="ml-1 text-green-500 hover:underline"
          >
            {state === "login" ? "Sign up" : "Login"}
          </button>
        </p>
      </form>
    </main>
    </>
  );
  
};



export default Login;