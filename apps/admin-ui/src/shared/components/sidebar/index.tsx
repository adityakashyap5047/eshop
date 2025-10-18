"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { BadgeDollarSign, BellPlus, BellRing, FileClock, LayoutDashboard, List, Loader2, LogOut, PackageSearch, PencilRuler, Settings, Store, Table2, Users } from "lucide-react";
import SidebarItem from "./sidebar.item";
import SidebarMenu from "./sidebar.menu";
import useSidebar from "apps/admin-ui/src/hooks/useSidebar";
import useAdmin from "apps/admin-ui/src/hooks/useAdmin";
import Box from "../box";
import { Sidebar } from "./sidebar.styles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";

const SidebarWrapper = () => {

  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { admin, isLoading } = useAdmin();
  const queryClient = useQueryClient();

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
      queryClient.clear();
      queryClient.removeQueries({ queryKey: ["admin"] });
      window.location.href = "/";
    },
    onError: () => {
      queryClient.clear();
      window.location.href = "/";
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  }

  if(isLoading || !admin){
    return <Box 
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: "0",
        overflowY: "scroll",
        scrollbarWidth: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="sidebar-wrapper"
    ><Loader2 className="animate-spin w-6 h-6" /></Box>
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
          <Link href={"/"} className="flex justify-center items-center text-center gap-2">
            <Table2 size={28} />
            <Box>
              <h3 className="text-xl text-left pl-2 font-medium text-[#ecedee]">{admin?.name}</h3>
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
              <SidebarItem 
                isActive={activeSidebar === "/dashboard/products"}
                title="Products"
                href="/dashboard/products"
                icon={<PackageSearch size={26} color={getIconColor("/dashboard/products")} />}
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/events"}
                title="Events"
                href="/dashboard/events"
                icon={<BellPlus size={24} color={getIconColor("/dashboard/events")} />}
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/users"}
                title="Users"
                href="/dashboard/users"
                icon={<Users size={24} color={getIconColor("/dashboard/users")} />}
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/sellers"}
                title="Sellers"
                href="/dashboard/sellers"
                icon={<Store size={24} color={getIconColor("/dashboard/sellers")} />}
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem 
                isActive={activeSidebar === "/dashboard/loggers"}
                title="Loggers"
                href="/dashboard/loggers"
                icon={<FileClock size={20} color={getIconColor("/dashboard/loggers")} />}
              />
              <SidebarItem 
                isActive={activeSidebar === "/dashboard/management"}
                title="Management"
                href="/dashboard/management"
                icon={<Settings size={22} color={getIconColor("/dashboard/management")} />}
              />
              <SidebarItem 
                isActive={activeSidebar === "/dashboard/notifications"}
                title="Notifications"
                href="/dashboard/notifications"
                icon={<BellRing size={24} color={getIconColor("/dashboard/notifications")} />}  
              />
            </SidebarMenu>
            <SidebarMenu title="Customization">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/customizations"}
                title="Customizations"
                href="/dashboard/customizations"
                icon={
                  <PencilRuler
                    size={22}
                    color={getIconColor("/dashboard/customizations")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Extras">
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