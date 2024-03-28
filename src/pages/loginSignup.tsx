import { Tabs } from "antd";
import type { TabsProps } from "antd";
import Login from "../components/auth/login";
import Register from "../components/auth/register";
import GoogleButton from "react-google-button";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LoginSignup() {
  const { googleSignIn, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser != null) {
      navigate("/home");
    }
  });

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (e) {
      console.log(e);
    }
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Login",
      children: (
        <>
          <Login />
          <GoogleButton onClick={handleGoogleSignIn} />
        </>
      ),
    },
    {
      key: "2",
      label: "Signup",
      children: <Register />,
    },
  ];
  return (
    <div
      style={{
        backgroundColor: "F0F2F5",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}

export default LoginSignup;
