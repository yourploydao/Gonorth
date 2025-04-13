// pages/[auth].js
import { useRouter } from 'next/router';

const allowedRoutes = ['login', 'signup', 'forgotpass', 'verifycode', 'resetpass'];

export default function AuthRouter() {
  const { auth } = useRouter().query;

  if (!allowedRoutes.includes(auth)) {
    return <h1>404 - Not Found</h1>;
  }
}
