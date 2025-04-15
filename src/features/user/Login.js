import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import InputText from '../../components/Input/InputText';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginObj, setLoginObj] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const submitForm = async (e) => {
    e.preventDefault();

    if (loginObj.username.trim() === '') {
      return toast.error('Username is required!');
    }
    if (loginObj.password.trim() === '') {
      return toast.error('Password is required!');
    }

    setLoading(true);

    try {
      const { success, error } = await login(loginObj);
      
      if (!success) {
        throw new Error(error || 'An error occurred');
      }

      toast.success('Login successful!');
      setTimeout(() => navigate('/app/welcome'));
    } catch (error) {
      toast.error(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setLoginObj({ ...loginObj, [updateType]: value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-400">
      <div className="card w-full max-w-4xl shadow-xl rounded-xl bg-white flex md:flex-row flex-col">
        <div className="md:w-1/2 hidden md:flex items-center justify-center bg-orange-100 rounded-l-xl overflow-hidden">
          <img src="/logo-login.jpg" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div className="md:w-1/2 w-full py-12 px-8">
          <div className="text-center mb-4">
            <img src="/signin.gif" alt="Sign In Animation" className="mx-auto mb-4 w-24 border-4 border-white rounded-full shadow-lg" />
            <p className="text-center text-gray-600 mb-6">Welcome back! Please enter your credentials.</p>
          </div>
          <form onSubmit={submitForm} autoComplete="on">
            <div className="mb-5">
              <InputText
                type="text"
                defaultValue={loginObj.username}
                updateType="username"
                containerStyle="mt-4"
                labelTitle="Username"
                placeholder="abc@example.com"
                updateFormValue={updateFormValue}
                autoComplete="username"
              />
              <div className="relative mt-4">
                <InputText
                  type={showPassword ? 'text' : 'password'}
                  defaultValue={loginObj.password}
                  updateType="password"
                  labelTitle="Password"
                  placeholder="*******"
                  updateFormValue={updateFormValue}
                  autoComplete="current-password"
                />
                <span
                  className="absolute right-3 top-1/2 my-4 transform -translate-y-1/2 flex items-center cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
                </span>
              </div>
            </div>

            <div className="text-right text-orange-600">
              <Link to="/forgot-password">
                <span className="text-sm hover:underline cursor-pointer transition duration-200">Forgot Password?</span>
              </Link>
            </div>

            <button
              type="submit"
              className={`btn mt-5 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition duration-200 ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
