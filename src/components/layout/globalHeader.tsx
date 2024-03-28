import { Button, Layout } from "antd";
import { Typography } from "antd";
import { useAuth } from "../../contexts/AuthContext";

const { Header } = Layout;
const { Title } = Typography;

function GlobalHeader() {
  const { logOut } = useAuth();

  const hangleSignOut = async () => {
    try {
      await logOut();
    } catch (errot) {
      console.log(console.error);
    }
  };
  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Title level={2} style={{ color: "#ffffff" }}>
        {" "}
        Gainey Consulting
      </Title>
      <Button type="text" style={{ color: "#ffffff" }} onClick={hangleSignOut}>
        Sign Out
      </Button>
    </Header>
  );
}

export default GlobalHeader;
