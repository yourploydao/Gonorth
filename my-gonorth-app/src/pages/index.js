// pages/[auth].js
import { useRouter } from 'next/router';
import Signup from './signup';
import Login from './login';
import ForgotPassword from './forgotpassword';
import VerifyCode from './verifycode';
import ResetPassword from './resetpassword';

export default function AuthRouter() {
  const { auth } = useRouter().query;

  if (!auth) return null;

  switch (auth) {
    case 'signup':
      return <Signup />;
    case 'login':
      return <Login />;
    case 'forgotpassword':
      return <ForgotPassword />;
    case 'verifycode':
      return <VerifyCode />;
    case 'resetpassword':
      return <ResetPassword />;
    default:
      return <h1>404 - Not Found</h1>;
  }
}
