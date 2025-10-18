"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { BadgeDollarSign, BellPlus, BellRing, CalendarPlus, LayoutDashboard, List, LogOut, Mail, PackageSearch, Settings, SquarePlus, Table2, TicketPercent } from "lucide-react";
import SidebarItem from "./sidebar.item";
import SidebarMenu from "./sidebar.menu";
import useSidebar from "apps/admin-ui/src/hooks/useSidebar";
import useAdmin from "apps/admin-ui/src/hooks/useAdmin";
import Box from "../box";
import { Sidebar } from "./sidebar.styles";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { AxiosError } from "axios";

const SidebarWrapper = () => {

  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { admin } = useAdmin();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) => activeSidebar === route ? "#0085ff" : "#969696";

  const logoutMutation = useMutation({
    mutationFn: async() => {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/logout-admin`, 
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (error: AxiosError) => {
      console.error("Logout failed:", error);
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  }

  return (
    <Box 
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: "0",
        overflowY: "scroll",
        scrollbarWidth: "none",
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href={"/"} className="flex justify-center text-center gap-2">
            <Table2 size={28} />
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">{admin?.name}</h3>
              <h5 className="font-medium pl-2 text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {admin?.email}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem 
            title="Dashboard"
            icon={<LayoutDashboard fill={getIconColor("/dashboard")} />}
            isActive={activeSidebar === "/dashboard"}
            href="/dashboard"
          />
          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem 
                isActive={activeSidebar === "/dashboard/orders"}
                title="Orders"
                href="/dashboard/orders"
                icon={<List size={26} color={getIconColor("/dashboard/orders")} />}
              />
              <SidebarItem 
                isActive={activeSidebar === "/dashboard/payments"}
                title="Payments"
                href="/dashboard/payments"
                icon={<BadgeDollarSign size={26} color={getIconColor("/dashboard/payments")} />}
              />
            </SidebarMenu>
            <SidebarMenu title="Products">
              <SidebarItem 
                isActive={activeSidebar === "/dashboard/create-product"}
                title="Create Product"
                href="/dashboard/create-product"
                icon={<SquarePlus size={24} color={getIconColor("/dashboard/create-product")} />}
              />
              <SidebarItem 
                isActive={activeSidebar === "/dashboard/all-products"}
                title="All Products"
                href="/dashboard/all-products"
                icon={<PackageSearch size={22} color={getIconColor("/dashboard/all-products")} />}
              />
            </SidebarMenu>
            <SidebarMenu title="Events">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/create-event"}
                title="Create Event"
                href="/dashboard/create-event"
                icon={<CalendarPlus size={24} color={getIconColor("/dashboard/create-event")} />}
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/all-events"}
                title="All Events"
                href="/dashboard/all-events"
                icon={<BellPlus size={24} color={getIconColor("/dashboard/all-events")} />}
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem 
                isActive={activeSidebar === "/dashboard/inbox"}
                title="Inbox"
                href="/dashboard/inbox"
                icon={<Mail size={20} color={getIconColor("/dashboard/inbox")} />}
              />
              <SidebarItem 
                isActive={activeSidebar === "/dashboard/settings"}
                title="Settings"
                href="/dashboard/settings"
                icon={<Settings size={22} color={getIconColor("/dashboard/settings")} />}
              />
              <SidebarItem 
                isActive={activeSidebar === "/dashboard/notifications"}
                title="Notifications"
                href="/dashboard/notifications"
                icon={<BellRing size={24} color={getIconColor("/dashboard/notifications")} />}  
              />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/discount-codes"}
                title="Discount Codes"
                href="/dashboard/discount-codes"
                icon={
                  <TicketPercent
                    size={22}
                    color={getIconColor("/dashboard/discount-codes")}
                  />
                }
              />
              <button onClick={handleLogout} className='my-1 block w-full'>
                <div className={`flex gap-2 w-full min-h-12 h-full items-center px-[13px] rounded-lg cursor-pointer transition hover:bg-[#2b2f31]`}>
                  {<LogOut size={20} color={getIconColor("/logout")} />}
                  <h5 className="text-slate-200 text-lg">
                    Logout
                  </h5>
                </div>
              </button>
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  )
}

export default SidebarWrapper