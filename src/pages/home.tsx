import { Layout, Typography, List } from "antd";
import Card from "antd/es/card/Card";
import DashboardCalendar from "../components/widgets/dashboardCalendar";

const { Content } = Layout;
const { Title } = Typography;

const data = [
  {
    title: "Open Tasks",
    content: <Title>Test</Title>,
  },
  {
    content: <DashboardCalendar />,
  },
];

function Home() {
  return (
    <Layout>
      <Content style={{ margin: "0px 16px 0" }}>
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={data}
          renderItem={(item) => (
            <List.Item>
              <Card title={item.title}>{item.content}</Card>
            </List.Item>
          )}
        />
      </Content>
    </Layout>
  );
}

export default Home;
