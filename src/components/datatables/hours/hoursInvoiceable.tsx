import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { Key } from "react";

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

interface Props {
  billableHours: BillableHours[];
  rowSelection: {
    selectedRowKeys: React.Key[];
    onChange: (newSelectedRowKeys: React.Key[]) => void;
  };
}

function HoursInvoiceable({ billableHours, rowSelection }: Props) {
  const availableHours = billableHours
    .filter((hour) => hour.billed === false)
    .map((hour) => ({
      ...hour,
      key: hour.id,
    }));

  const clientFilters = Array.from(
    new Set(billableHours.map((hour) => hour.client))
  )
    .sort()
    .map((client) => ({
      text: client,
      value: client,
    }));
  const availableHoursColumns: ColumnsType<AvailableHoursColumn> = [
    {
      title: "Date",
      dataIndex: "date",
      key: 1,
      sorter: (a: AvailableHoursColumn, b: AvailableHoursColumn) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
      sortDirections: ["descend", "ascend"],
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
  return (
    <Table
      rowSelection={rowSelection}
      dataSource={availableHours as AvailableHoursColumn[]}
      columns={availableHoursColumns}
    />
  );
}

export default HoursInvoiceable;
