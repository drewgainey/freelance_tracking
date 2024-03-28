import { Layout, Card, Typography, Divider } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CreateClient from "../../components/buttons/createClient";
import ExportToExcel from "../../components/buttons/exportToExcel";
import { db } from "../../firebase";

const { Content } = Layout;
const { Title } = Typography;

interface Client {
  clientName: string;
  contact: string;
  email: string;
  rate: number;
  active: boolean;
  id: string;
}

function Clients() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(
    () =>
      onSnapshot(collection(db, "clients"), (snapshot) => {
        setClients(
          snapshot.docs.map((doc) => {
            const data = doc.data() as Client;
            return { ...data, id: doc.id };
          })
        );
      }),
    []
  );

  const columns: ColumnsType<Client> = [
    {
      title: "Client",
      dataIndex: "clientName",
      key: 1,
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: 2,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: 3,
    },
    {
      title: "Standard Rate",
      dataIndex: "rate",
      key: 4,
    },
    {
      title: "Actions",
      key: 8,
      dataIndex: "id",
      render: (id) => <Link to={`/clients/${id}`}>Details</Link>,
    },
  ];
  return (
    <Layout>
      <Content style={{ margin: "0px 16px 0" }}>
        <Card>
          <Title level={3} style={{ margin: "10px" }}>
            Clients
          </Title>
          <Divider />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ margin: "10px", float: "right" }}>
              <ExportToExcel data={clients} fileName={"Clients"} />
              <CreateClient />
            </div>
            <Table dataSource={clients} columns={columns} />
          </div>
        </Card>
      </Content>
    </Layout>
  );
}

export default Clients;
