import { Table } from "antd";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";

interface Invoice {
  client: string;
  invoiceDate: string;
  dueDate: string;
  totalDue: number;
  amountPaid: number;
  hours: string[];
  id: string;
}

interface Props {
  clients: string[];
}

function InvoicesDataTable({ clients }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    console.log(clients);

    if (clients.length == 0) {
      return;
    }

    const invoicesQuery = query(
      collection(db, "invoices"),
      where("client", "in", clients)
    );

    const unsubscribe = onSnapshot(invoicesQuery, (snapshot) => {
      setInvoices(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Invoice))
      );
    });
    return () => unsubscribe();
  }, [clients]);

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
  return <Table dataSource={invoiceData} columns={columns} />;
}

export default InvoicesDataTable;
