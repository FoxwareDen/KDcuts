import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { addService, deleteService, getServices, type Service } from "@/lib/settings";
import type { MetaData } from "@/lib/db";

export const Route = createFileRoute("/_auth/dashboard/settings")({
  component: function() {
    const [services, setServices] = useState<
      (Service & { tempId: string } & Partial<MetaData>)[]
    >([]);
    const [deletedServices, setDeletedServices] = useState<(Service & { tempId: string } & MetaData)[]>([]);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
      getServices().then((services) => {
        if (services) {
          const newServices = services.map((service) => {
            return { ...service, tempId: `${Date.now()}` }
          }) as (Service & { tempId: string } & Partial<MetaData>)[]
          setServices(newServices);
        }
      });
    }, [])

    const addNewService = () => {
      setServices([...services, { service: "", price: 0, tempId: `${Date.now()}` }]);
    };

    const handleServiceInputChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const newServices = services.map(service => {
        if (service.tempId == id) {
          return { ...service, [e.target.name]: e.target.value }
        }
        return service
      });
      setServices(newServices);
    };

    const handleDeleteService = (tempId: string) => {
      const deletedService = services.find(service => service.tempId == tempId);

      if (deletedService?.id != undefined) {
        setDeletedServices([...deletedServices, deletedService as Service & { tempId: string } & MetaData]);
        setServices(services.filter(service => service.tempId != tempId));
      } else {
        setServices(services.filter(service => service.tempId != tempId));
      }
    }

    const handleSave = async () => {
      const newServices = services.filter((service) => {
        // @ts-ignore
        return service.id == undefined && service.service?.length > 0
      })

      // TODO: 

      setSaved(true);
      // DELETES removed addService
      await Promise.all(deletedServices.map(service => deleteService(service.id)));
      // ADDS new services
      await Promise.all(newServices.map(service => addService(service.service, service.price)));
      setTimeout(() => setSaved(false), 3000);
    };

    return (
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your business profile and preferences
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            {saved ? (
              <>
                <Check className="size-4" />
                Saved
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Services & Pricing */}
          <Card className="border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Services & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.tempId}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-secondary/30 p-4 sm:flex-row sm:items-end"
                  >
                    <div className="flex-1">
                      <Label>Service Name</Label>
                      <Input
                        name="service"
                        defaultValue={service.service}
                        onChange={(e) => handleServiceInputChange(service.tempId, e)}
                        className="mt-1.5 border-border bg-card"
                      />
                    </div>

                    <div className="w-full sm:w-32">
                      <Label>Price (R)</Label>
                      <Input
                        type="number"
                        name="price"
                        defaultValue={service.price}
                        onChange={(e) => handleServiceInputChange(service.tempId, e)}
                        className="mt-1.5 border-border bg-card"
                      />
                    </div>

                    {/* Delete button */}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteService(service.tempId)}
                      className="sm:ml-2"
                    >
                      ✕
                    </Button>
                  </div>
                ))}

                <Button onClick={addNewService} variant="outline" className="w-full border-border bg-transparent">
                  Add New Service
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
})


/*
 *           <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  defaultValue="Marcus & Co. Barbershop"
                  className="mt-1.5 border-border bg-card"
                />
              </div>
              <div>
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  defaultValue="Marcus Williams"
                  className="mt-1.5 border-border bg-card"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="marcus@barbershop.com"
                  className="mt-1.5 border-border bg-card"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  defaultValue="+1 (555) 123-4567"
                  className="mt-1.5 border-border bg-card"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  defaultValue="123 Main Street, Downtown, NY 10001"
                  className="mt-1.5 border-border bg-card"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Email Notifications
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Receive emails for new bookings
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get text alerts for appointments
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Client Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Send automatic reminders to clients
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Cancellation Alerts
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Notify when a booking is cancelled
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
          */
