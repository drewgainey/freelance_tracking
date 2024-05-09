import { Space, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { Key } from "react";

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
interface BillableHours {
  date: string;
  client: string;
  start: string;
  end: string;
  hoursWorked: string;
  workPerformed: string;
  billed: boolean;
}

interface Props {
  billableHours: BillableHours[];
}

function HoursNonInvoiceable({ billableHours }: Props) {
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
    <Table dataSource={dataSource as BillableHoursColumn[]} columns={columns} />
  );
}

export default HoursNonInvoiceable;
