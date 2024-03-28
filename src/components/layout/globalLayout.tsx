import {
  LineChartOutlined,
  ClockCircleOutlined,
  AuditOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  CheckSquareOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme } from "antd";
import * as React from "react";
import { Link, Outlet } from "react-router-dom";
import GlobalHeader from "./globalHeader";

const { Content, Sider } = Layout;

const siderItems: MenuProps["items"] = [
  { icon: LineChartOutlined, label: <Link to="/home">Home</Link> },
  {
    icon: ClockCircleOutlined,
    label: <Link to="/time-entry">Time Entry</Link>,
  },
  {
    icon: FileSearchOutlined,
    label: <Link to="/hours">Billable Hours</Link>,
  },
  { icon: CheckSquareOutlined, label: "Task Management" },
  { icon: AuditOutlined, label: <Link to="/invoices">Invoices </Link> },
  { icon: FolderOpenOutlined, label: "Files" },
  { icon: TeamOutlined, label: <Link to="/clients">Clients </Link> },
].map((icon, index) => {
  const key = String(index + 1);

  return {
    key: `sub${key}`,
    icon: React.createElement(icon.icon),
    label: icon.label,
  };
});

function GlobalLayout() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout>
      <GlobalHeader />
      <Content style={{ padding: "16px 32px" }}>
        <Layout
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Sider style={{ background: colorBgContainer }} width={208}>
            <Menu
              mode="inline"
              defaultSelectedKeys={["1"]}
              defaultOpenKeys={["sub1"]}
              style={{
                height: "100%",
              }}
              items={siderItems}
            />
          </Sider>
          <Outlet />
        </Layout>
      </Content>
    </Layout>
  );
}

export default GlobalLayout;
