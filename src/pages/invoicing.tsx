import { Layout, Card, Typography, Divider, Tabs, TabsProps } from "antd";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import ExportToExcel from "../components/buttons/exportToExcel";
import SubmitInvoicesToFirestore from "../components/buttons/submitInvoicesToFirestore";
import HoursInvoiceable from "../components/datatables/hours/hoursInvoiceable";
import InvoicesDataTable from "../components/datatables/invoices";
import { db } from "../firebase";

const { Content } = Layout;
const { Title } = Typography;

interface BillableHours {
  id: string;
  date: string;
  client: string;
  start: string;
  end: string;
  hoursWorked: number;
  workPerformed: string;
  billed: boolean;
  rate: number;
}

interface Client {
  clientName: string;
  contact: string;
  email: string;
  rate: number;
  active: boolean;
  id: string;
}

interface Invoice {
  client: string;
  invoiceDate: string;
  dueDate: string;
  totalDue: number;
  amountPaid: number;
  hours: string[];
}

function Invoicing() {
  const [billableHours, setBillableHours] = useState<BillableHours[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [deactivateInvoiceButtons, setDeactivateInvoiceButtons] =
    useState(true);
  const [availableHoursSelectedRowKeys, setAvailableHoursSelectedRowKeys] =
    useState<React.Key[]>([]);
  const [selectedHours, setSelectedHours] = useState<BillableHours[]>([]);

  //Get Data from Firestore
  useEffect(
    () =>
      onSnapshot(collection(db, "billableHours"), (snapshot) => {
        setBillableHours(
          snapshot.docs.map((doc) => {
            const data = doc.data() as BillableHours;
            return { ...data, id: doc.id };
          })
        );
      }),
    []
  );

  useEffect(
    () =>
      onSnapshot(collection(db, "invoices"), (snapshot) => {
        setInvoices(snapshot.docs.map((doc) => doc.data() as Invoice));
      }),
    []
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "clients"), (snapshot) => {
      setClients(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Client))
      );
    });
    return () => unsubscribe();
  }, []);

  if (!clients) {
    return <div>Loading...</div>;
  }

  //Table props and configuration

  const availableHours = billableHours
    .filter((hour) => hour.billed === false)
    .map((hour) => ({
      ...hour,
      key: hour.id,
    }));

  const invoiceData = invoices.map((invoice) => {
    const oustandingBalance = invoice.totalDue - invoice.amountPaid;
    return {
      ...invoice,
      outstandingBalance: oustandingBalance,
    };
  });

  const onAvailableHoursSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setAvailableHoursSelectedRowKeys(newSelectedRowKeys);
    setSelectedHours(
      availableHours.filter((hour) => newSelectedRowKeys.includes(hour.key))
    );
  };

  const availableHoursRowSelection = {
    selectedRowKeys: availableHoursSelectedRowKeys,
    onChange: onAvailableHoursSelectChange,
  };

  //Tabs
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Open Invoices",
      children: (
        <InvoicesDataTable
          clients={clients.map((client) => client.clientName)}
        />
      ),
    },
    {
      key: "2",
      label: "Billable Hours",
      children: (
        <HoursInvoiceable
          billableHours={availableHours}
          rowSelection={availableHoursRowSelection}
        />
      ),
    },
  ];
  return (
    <Layout>
      <Content style={{ margin: "0px 16px 0" }}>
        <Card>
          <Title level={3} style={{ margin: "10px" }}>
            Invoice Dashboard
          </Title>
          <Divider style={{ marginBottom: "0px" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ margin: "10px", float: "right" }}>
              <ExportToExcel
                data={deactivateInvoiceButtons ? invoiceData : availableHours}
                fileName={
                  deactivateInvoiceButtons ? "Invoices" : "Billable Hours"
                }
              />
              <SubmitInvoicesToFirestore
                disabled={deactivateInvoiceButtons}
                selectedHours={selectedHours}
              />
            </div>
            <Tabs
              defaultActiveKey="1"
              items={items}
              onChange={() =>
                setDeactivateInvoiceButtons(!deactivateInvoiceButtons)
              }
            />
          </div>
        </Card>
      </Content>
    </Layout>
  );
}

export default Invoicing;
