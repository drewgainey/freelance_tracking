import { Button, Card, Divider, Input, Layout, Typography } from "antd";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";

const { Content } = Layout;
const { Title } = Typography;

interface Client {
  clientName: string;
  contact: string;
  email: string;
  rate: number;
  active: boolean;
}

function ClientDetails() {
  const { clientId } = useParams();

  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!clientId) return; // Exit early if no clientId

    const unsub = onSnapshot(doc(db, "clients", clientId), (doc) => {
      setClient(doc.data() as Client);
    });

    return () => unsub();
  }, [clientId]);

  if (!client) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <Content style={{ margin: "0px 16px 0" }}>
        <Card>
          <Title level={3} style={{ margin: "10px" }}>
            {client.clientName}
          </Title>
          <Divider />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <Input
                style={{ margin: "0px 10px 10px" }}
                addonBefore="Contact"
                value={client.contact}
              />
              <Input
                style={{ margin: "0px 10px 10px" }}
                addonBefore="Email"
                value={client.email}
              />
              <Input
                style={{ margin: "0px 10px 10px" }}
                addonBefore="Default Rate $"
                value={client.rate}
              />
            </div>
            <div>
              <Button type="primary">Edit Client</Button>
            </div>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}

export default ClientDetails;
