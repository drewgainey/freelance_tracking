import {
  Layout,
  Card,
  Typography,
  Divider,
  Table,
  Tabs,
  TabsProps,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { Key } from "antd/es/table/interface";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import ExportToExcel from "../components/buttons/exportToExcel";
import SubmitInvoicesToFirestore from "../components/buttons/submitInvoicesToFirestore";
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

interface AvailableHoursColumn extends BillableHours {
  key: React.Key;
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

  //Table props and configuration
  const clientFilters = Array.from(
    new Set(billableHours.map((hour) => hour.client))
  )
    .sort()
    .map((client) => ({
      text: client,
      value: client,
    }));

  const availableHours = billableHours
    .filter((hour) => hour.billed === false)
    .map((hour) => ({
      ...hour,
      key: hour.id,
    }));

  const availableHoursColumns: ColumnsType<AvailableHoursColumn> = [
    {
      title: "Date",
      dataIndex: "date",
      key: 1,
    },
    {
      title: "Client",
      dataIndex: "client",
      key: 2,
      filters: clientFilters,
      onFilter: (value: boolean | Key, record: AvailableHoursColumn) => {
        return record.client === value;
      },
    },
    {
      title: "Start Time",
      dataIndex: "start",
      key: 3,
    },
    {
      title: "End Time",
      dataIndex: "end",
      key: 4,
    },
    {
      title: "Hours Worked",
      dataIndex: "hoursWorked",
      key: 5,
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: 6,
    },
    {
      title: "Work Performed",
      dataIndex: "workPerformed",
      key: 7,
    },
  ];

  const invoiceData = invoices.map((invoice) => {
    const oustandingBalance = invoice.totalDue - invoice.amountPaid;
    return {
      ...invoice,
      outstandingBalance: oustandingBalance,
    };
  });
  const columns = [
    {
      title: "Client",
      dataIndex: "client",
      key: 1,
    },

    {
      title: "Invoice Date",
      dataIndex: "invoiceDate",
      key: 2,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: 3,
    },
    {
      title: "Total Due",
      dataIndex: "totalDue",
      key: 4,
    },
    {
      title: "Amount Paid",
      dataIndex: "amountPaid",
      key: 5,
    },
    {
      title: "Outstanding Balance",
      dataIndex: "outstandingBalance",
      key: 6,
    },
  ];

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
      children: <Table dataSource={invoiceData} columns={columns} />,
    },
    {
      key: "2",
      label: "Billable Hours",
      children: (
        <Table
          rowSelection={availableHoursRowSelection}
          dataSource={availableHours as AvailableHoursColumn[]}
          columns={availableHoursColumns}
        />
      ),
    },
    {
      key: "3",
      label: "Alt Invoices",
      children: <InvoicesDataTable clients={["Asherify"]} />,
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
