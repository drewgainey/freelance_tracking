import { Button, Modal } from "antd";
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
// import { addDoc, collection } from "firebase/firestore";
// import { db } from "../firebase";

interface Props {
  disabled: boolean;
  selectedHours: BillableHours[];
}
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
interface Item {
  amount?: number;
  currency: string;
  quantity: number;
  description: string;
}
interface Invoice {
  client: string;
  email?: string;
  invoiceDate: string;
  dueDate: string;
  totalDue: number;
  amountPaid: number;
  hours: string[];
  items: Item[];
}
interface Client {
  clientName: string;
  contact: string;
  email: string;
  rate: number;
  active: boolean;
}

function extractDate(input: string): string {
  const regex = /\d{2}\/\d{2}\/\d{2}/; // Matches a date in MM/DD/YY format
  const match = input.match(regex);
  return match ? match[0] : ""; // Return the matched date or null if no date is found
}

function SubmitInvoicesToFirestore({ disabled, selectedHours }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(
    () =>
      onSnapshot(collection(db, "clients"), (snapshot) => {
        setClients(
          snapshot.docs.map((doc) => {
            //done this way to prevent exposing certain fields to the front end
            const { clientName, contact, email, rate, active } = doc.data();
            return { clientName, contact, email, rate, active };
          })
        );
      }),
    []
  );

  const invoices = selectedHours.reduce((acc, cur) => {
    //find client email
    const client = clients.find((client) => client.clientName === cur.client);
    //check if client does not already have invoice object created. If not, initialize one
    if (!acc.some((invoice) => invoice.client === cur.client)) {
      //create inital item for invoice
      const item: Item = {
        amount: client ? client.rate * cur.hoursWorked * 100 : 0,
        currency: "usd",
        quantity: 1,
        description: `${cur.date} ${cur.hoursWorked} hours at $${cur.rate} per hour: ${cur.workPerformed}`,
      };
      const invoice: Invoice = {
        client: cur.client,
        email: client?.email,
        invoiceDate: "04/3/24",
        dueDate: "04/15/24",
        totalDue: cur.rate * cur.hoursWorked,
        amountPaid: 0,
        hours: [cur.id],
        items: [item],
      };

      acc.push(invoice);
    } else {
      const clientInvoice = acc.find(
        (invoice) => invoice.client === cur.client
      );
      if (clientInvoice) {
        if (!clientInvoice.hours.includes(cur.id)) {
          // Check to avoid duplicate entries
          clientInvoice.hours.push(cur.id);
          clientInvoice.totalDue += cur.rate * cur.hoursWorked; // Update the total due
          //add item to items array on invoices
          const item: Item = {
            amount: client ? client.rate * cur.hoursWorked * 100 : 0,
            currency: "usd",
            quantity: 1,
            description: `${cur.date} ${cur.hoursWorked} hours at $${cur.rate} per hour: ${cur.workPerformed}`,
          };
          clientInvoice.items.push(item);
        }
      }
    }

    return acc;
  }, [] as Invoice[]);

  //Write Data to FireStore
  const addInvoiceToFireStore = async (invoice: Invoice) => {
    try {
      const invoicePayload = {
        client: invoice.client,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        totalDue: invoice.totalDue,
        amountPaid: 0,
        hours: invoice.hours,
      };
      invoice.items.sort((a, b) => {
        const aDate: string = extractDate(a.description);
        const bDate: string = extractDate(b.description);

        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });
      const stripeInvoiceData = {
        email: invoice.email,
        items: invoice.items,
      };
      await runTransaction(db, async (trans) => {
        invoice.hours.forEach((hour) => {
          const hourRef = doc(db, "billableHours", hour);
          trans.update(hourRef, { billed: true });
        });
        const invoiceRef = doc(collection(db, "invoices"));
        trans.set(invoiceRef, invoicePayload);

        const stripeInvoiceRef = doc(collection(db, "stripeInvoiceData"));
        trans.set(stripeInvoiceRef, stripeInvoiceData);
      });
    } catch (e) {
      console.log(e);
    }
  };

  const invoiceSelectedHours = () => {
    setConfirmLoading(true);
    invoices.forEach((invoice) => addInvoiceToFireStore(invoice));
  };

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    await invoiceSelectedHours();
    setConfirmLoading(false);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        style={{ marginLeft: "10px" }}
        type="primary"
        disabled={disabled}
        onClick={handleClick}
      >
        Invoice Selected
      </Button>
      <Modal
        title="Confirm Invoice Creation"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
      >
        <p>The following invoices will be created</p>
        {invoices.map((invoice) => (
          <p>{`${invoice.client}    $${invoice.totalDue}`}</p>
        ))}
      </Modal>
    </>
  );
}

export default SubmitInvoicesToFirestore;
