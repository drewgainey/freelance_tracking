import { Layout, Card, Typography, Divider, Table, Space } from "antd";
import { ColumnsType } from "antd/es/table";
import { Key } from "antd/es/table/interface";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import ExportToExcel from "../components/buttons/exportToExcel";
import { db } from "../firebase";

const { Content } = Layout;
const { Title } = Typography;

interface BillableHours {
  date: string;
  client: string;
  start: string;
  end: string;
  hoursWorked: string;
  workPerformed: string;
  billed: boolean;
}
interface BillableHoursColumn {
  key: number;
  date: string;
  client: string;
  startTime: string;
  endTime: string;
  hoursWorked: string;
  workPerformed: string;
  invoiced: string;
}

function Hours() {
  const [billableHours, setBillableHours] = useState<BillableHours[]>([]);

  useEffect(
    () =>
      onSnapshot(collection(db, "billableHours"), (snapshot) => {
        setBillableHours(
          snapshot.docs.map((doc) => doc.data() as BillableHours)
        );
      }),
    []
  );
  const dataSource = billableHours.map((hour, i) => {
    return {
      key: i,
      date: hour.date,
      client: hour.client,
      startTime: hour.start,
      endTime: hour.end,
      hoursWorked: hour.hoursWorked,
      workPerformed: hour.workPerformed,
      invoiced: hour.billed == true ? "Yes" : "No",
    };
  });

  const excelExport = billableHours.map((hour) => {
    return {
      Date: hour.date,
      Client: hour.client,
      "Start Time": hour.start,
      "End Time": hour.end,
      "Hours Worked": hour.hoursWorked,
      "Work Performed": hour.workPerformed,
      Invoiced: hour.billed == true ? "Yes" : "No",
    };
  });

  const clientFilters = Array.from(
    new Set(billableHours.map((hour) => hour.client))
  )
    .sort()
    .map((client) => ({
      text: client,
      value: client,
    }));

  const columns: ColumnsType<BillableHoursColumn> = [
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onFilter: (value: boolean | Key, record: BillableHoursColumn) => {
        return record.client === value;
      },
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: 3,
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      key: 4,
    },
    {
      title: "Hours Worked",
      dataIndex: "hoursWorked",
      key: 5,
    },
    {
      title: "Work Performed",
      dataIndex: "workPerformed",
      key: 6,
    },
    {
      title: "Invoiced",
      dataIndex: "invoiced",
      key: 7,
    },
    {
      title: "Actions",
      key: 8,
      render: () => (
        <Space size="middle">
          <a>Edit</a>
          <a>Delete</a>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Content style={{ margin: "0px 16px 0" }}>
        <Card>
          <Title level={3} style={{ margin: "10px" }}>
            Billable Hours
          </Title>
          <Divider style={{ marginBottom: "0px" }} />
          <div style={{ margin: "10px", float: "right" }}>
            <ExportToExcel data={excelExport} fileName="Billable Hours" />
          </div>
          <Table
            dataSource={dataSource as BillableHoursColumn[]}
            columns={columns}
          />
        </Card>
      </Content>
    </Layout>
  );
}

export default Hours;
