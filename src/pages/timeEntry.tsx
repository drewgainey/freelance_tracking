import {
  Layout,
  theme,
  Button,
  Form,
  type FormProps,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Typography,
  Divider,
  notification,
  InputNumber,
} from "antd";
import Card from "antd/es/card/Card";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

const { Content } = Layout;
const { TextArea } = Input;
const { Title } = Typography;

function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;
  return hours + ":" + minutesStr + " " + ampm;
}

function differenceInHours(date1: Date, date2: Date): number {
  const differenceInMilliseconds = date2.getTime() - date1.getTime();
  const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
  return differenceInHours;
}

type FieldType = {
  date?: Date;
  timeWorked?: string;
  workPerformed?: string;
  client?: string;
  rate?: number;
};
type NotificationType = "success" | "info" | "warning" | "error";

interface Client {
  clientName: string;
  active: boolean;
  rate: number;
}

export default function TimeEntry() {
  const [clients, setClients] = useState<Client[]>([]);
  const [currentClient, setCurrentClient] = useState<Client>();

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

  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    // Check if currentClient is not undefined
    if (currentClient) {
      // Set the "rate" field value in the form to the current client's rate
      form.setFieldsValue({ rate: currentClient.rate });
    }
  }, [currentClient, form]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const openNotificationWithIcon = (type: NotificationType) => {
    api[type]({
      message: type === "success" ? "Sucess!" : "Error",
      description:
        type === "success"
          ? "Your Time Has Sucessfully Been Submitted"
          : "There has been an error, please resubmit your time",
    });
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    //extract date - I should probbably extract his into a seperate function
    //@ts-expect-error date object for Date Picker, I do not have correct types for
    const dateString = values.date?.$d.toString();
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    const formattedDate = `${month}/${day}/${year}`;

    //extract start and end times
    //@ts-expect-error date object for Time Picker, I do not have correct types for
    const timeStartDateString = values.timeWorked[0].$d.toString();
    const timeStartDate = new Date(timeStartDateString);
    const timeStart = formatTime(timeStartDate);

    //@ts-expect-error date object for Time Picker, I do not have correct types for
    const timeEndDateString = values.timeWorked[1].$d.toString();
    const timeEndDate = new Date(timeEndDateString);
    const endTime = formatTime(timeEndDate);

    const hoursWorked = differenceInHours(timeStartDate, timeEndDate);

    const payload = {
      client: values.client,
      billed: false,
      date: formattedDate,
      workPerformed: values.workPerformed,
      start: timeStart,
      end: endTime,
      hoursWorked: hoursWorked,
      rate: values.rate,
    };
    form.resetFields();
    await addDoc(collection(db, "billableHours"), payload);
    openNotificationWithIcon("success");
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Layout>
      {contextHolder}
      <Content style={{ margin: "0px 16px 0" }}>
        <Card>
          <Title level={3} style={{ margin: "10px" }}>
            Time Entry
          </Title>
          <Divider />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Form
              form={form}
              name="basic"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              style={{ maxWidth: 600 }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              initialValues={{}}
            >
              <Form.Item<FieldType>
                label="Date"
                name="date"
                rules={[{ required: true, message: "Date is Required" }]}
              >
                <DatePicker format="MM/DD/YY" />
              </Form.Item>

              <Form.Item<FieldType>
                label="Time Worked"
                name="timeWorked"
                rules={[{ required: true, message: "Time Worked is Required" }]}
              >
                <TimePicker.RangePicker
                  use12Hours
                  needConfirm
                  format="h:mm a"
                />
              </Form.Item>

              <Form.Item<FieldType>
                label="Work Performed"
                name="workPerformed"
                rules={[
                  { required: true, message: "Work Performed is Required" },
                ]}
              >
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item<FieldType>
                label="Client"
                name="client"
                rules={[{ required: true, message: "Client is Required" }]}
              >
                <Select
                  options={clients.map((client) => {
                    return {
                      value: client.clientName,
                      label: client.clientName,
                    };
                  })}
                  onChange={(value) =>
                    setCurrentClient(
                      clients.find((client) => client.clientName === value)
                    )
                  }
                />
              </Form.Item>
              <Form.Item<FieldType>
                label="Rate"
                name="rate"
                rules={[{ required: true, message: "Rate is Required" }]}
              >
                <InputNumber addonBefore="$" />
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}
