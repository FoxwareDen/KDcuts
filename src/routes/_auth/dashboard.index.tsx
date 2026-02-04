import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Settings } from "lucide-react";
import { BookingsKanban } from "@/components/admin/bookings-kanban";
import { CalendarConfig } from "@/components/admin/calendar-config";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard/")({
  component: function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("bookings");

    return (
      <div className="flex h-full flex-col p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your bookings and availability settings.
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-1 flex-col"
        >
          <TabsList className="mb-6 w-fit">
            <TabsTrigger value="bookings" className="gap-2">
              <LayoutGrid className="size-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2">
              <Settings className="size-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="flex-1">
            <BookingsKanban />
          </TabsContent>

          <TabsContent value="config" className="flex-1">
            <CalendarConfig />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
})


