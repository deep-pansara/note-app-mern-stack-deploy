import { useState } from "react";
import { validateEmail } from "../../utils/helper";
import Navbar from "../../components/Navbar/Navbar";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import PasswordInput from "../../components/inputs/PasswordInput";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSignUp = async function (e) {
    e.preventDefault();
    if (!name) {
      setError("Please enter a name");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }
    if (!password) {
      setError("Please enter the password");
      return;
    }
    setError("");

    //SignUp API call
    try {
      const response = await axiosInstance.post("/create-account", {
        fullName: name,
        email: email,
        password: password,
      });

      //Handle successfull registration
      if (response.data && response.data.error) {
        setError(response.data.error.message);
        return;
      }

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again!");
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-[100vh] bg-red-100">
        <div className="w-96 border rounded-xl bg-white px-7 py-10  shadow-md">
          <form onSubmit={handleSignUp}>
            <h4 className="text-2xl mb-7 font-semibold">Sign Up</h4>
            <input
              type="text"
              placeholder="name"
              className="input-box"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="email"
              className="input-box"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <PasswordInput
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}
            <button type="submit" className="btn-primary shadow-md">
              Create an account
            </button>
          </form>
          <p className="text-sm text-center my-2 ">
            Already have an account?
            <Link to="/login" className="font-medium text-primary underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
export default SignUp;
