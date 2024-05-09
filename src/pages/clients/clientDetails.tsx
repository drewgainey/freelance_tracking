import {
  Button,
  Card,
  Divider,
  Input,
  Layout,
  Tabs,
  TabsProps,
  Typography,
} from "antd";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HoursNonInvoiceable from "../../components/datatables/hours/hoursNonInvoiceable";
import InvoicesDataTable from "../../components/datatables/invoices";
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
interface BillableHours {
  date: string;
  client: string;
  start: string;
  end: string;
  hoursWorked: string;
  workPerformed: string;
  billed: boolean;
}

function ClientDetails() {
  const { clientId } = useParams();

  const [client, setClient] = useState<Client | null>(null);
  const [billableHours, setBillableHours] = useState<BillableHours[]>([]);

  useEffect(() => {
    if (!clientId) return; // Exit early if no clientId

    const unsub = onSnapshot(doc(db, "clients", clientId), (doc) => {
      setClient(doc.data() as Client);
    });

    return () => unsub();
  }, [clientId]);

  //this needs to be updated to only pull the specific clients billable hours
  useEffect(() => {
    if (!clientId || !client?.clientName) return; // Exit early if no clientId
    const billableHoursQuery = query(
      collection(db, "billableHours"),
      where("client", "==", client?.clientName)
    );

    const unsubscribe = onSnapshot(billableHoursQuery, (snapshot) => {
      setBillableHours(snapshot.docs.map((doc) => doc.data() as BillableHours));
    });

    return unsubscribe;
  }, [client, clientId]);

  const billableHoursDataSource = billableHours.map((hour) => {
    return {
      date: hour.date,
      client: hour.client,
      start: hour.start,
      end: hour.end,
      hoursWorked: hour.hoursWorked,
      workPerformed: hour.workPerformed,
      billed: hour.billed,
    };
  });

  //remove and handle loading property
  if (!client) {
    return <div>Loading...</div>;
  }

  //Tabs
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Invoices",
      children: <InvoicesDataTable clients={[client.clientName]} />,
    },
    {
      key: "2",
      label: "Billable Hours",
      children: <HoursNonInvoiceable billableHours={billableHoursDataSource} />,
    },
  ];

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
        <Card style={{ marginTop: "10px" }}>
          <Tabs defaultActiveKey="1" items={items} />
        </Card>
      </Content>
    </Layout>
  );
}

export default ClientDetails;
