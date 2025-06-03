// pages/_app.js
import { useRouter } from "next/router";
import Header from "../components/navigation";
import Footer from "../components/footer";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const authPages = ['/signup', '/login', '/verifycode', '/forgotpassword', '/resetpassword'];
  const isAuthPage = authPages.includes(router.pathname);
  const isHomeBeforeLogin = router.pathname === '/home-before-login';

  return (
    <>
      {/* ไม่แสดง nav ในหน้า auth กับ home-before-login */}
      {!isAuthPage && !isHomeBeforeLogin && <Header />}

      <Component {...pageProps} />

      {/* แสดง footer ทุกหน้ายกเว้นหน้า auth */}
      {!isAuthPage && <Footer />}
    </>
  );
}

export default MyApp;
