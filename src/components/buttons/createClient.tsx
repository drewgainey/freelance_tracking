import {
  Button,
  Form,
  Modal,
  Input,
  Divider,
  Typography,
  InputNumber,
  notification,
} from "antd";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { db } from "../../firebase";

const { Title } = Typography;

type FieldType = {
  clientName: string;
  contact: string;
  email: string;
  rate: number;
};
interface Client {
  clientName: string;
  contact: string;
  email: string;
  rate: number;
  active: boolean;
}

type NotificationType = "success" | "error";

function CreateClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm<FieldType>();
  const [api, contextHolder] = notification.useNotification();

  //Modal Event Handles
  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    const formValues = form.getFieldsValue();
    try {
      await submitForm(formValues);
    } catch (error) {
      openNotificationWithIcon("error");
      setConfirmLoading(false);
      return;
    }

    setConfirmLoading(false);
    setIsModalOpen(false);
    form.resetFields();

    //notify of success
    openNotificationWithIcon("success");
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  //Form Event Handlers
  const submitForm = async (values: FieldType) => {
    const payload: Client = { ...values, active: false };
    await addDoc(collection(db, "clients"), payload);
  };

  //Success Notification
  const openNotificationWithIcon = (type: NotificationType) => {
    api[type]({
      message: type == "success" ? "Success" : "Error",
      description:
        type == "success"
          ? "Your Time Has Sucessfully Created"
          : "There was an error creating your client. Please try again",
    });
  };

  return (
    <>
      {contextHolder}
      <Button
        style={{ marginLeft: "10px" }}
        type="primary"
        onClick={handleClick}
      >
        Add New
      </Button>
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
      >
        <Title level={3} style={{ margin: "10px" }}>
          Add New Client
        </Title>
        <Divider />
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 12 }}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Client Name"
            name="clientName"
            rules={[
              { required: true, message: "Please enter the client name" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FieldType>
            label="Contact Name"
            name="contact"
            rules={[
              { required: true, message: "Please input the client contact" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FieldType>
            label="Contact Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input a contanct email address",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FieldType>
            label="Billing Rate"
            name="rate"
            rules={[
              {
                required: true,
                message: "Please input your default billing rate",
              },
            ]}
          >
            <InputNumber addonBefore="$" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default CreateClient;
