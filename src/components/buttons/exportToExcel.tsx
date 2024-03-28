import { Button } from "antd";
import * as XLSX from "xlsx";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  fileName: string;
}

function ExportToExcel({ data, fileName }: Props) {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  return (
    <Button onClick={exportToExcel} type="primary">
      Export to Excel
    </Button>
  );
}

export default ExportToExcel;
