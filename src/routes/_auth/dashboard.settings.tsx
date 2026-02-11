import { useEffect, useState, useRef } from "react"; // Added useRef
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { addService, deleteService, getServices, type Service } from "@/lib/settings";
import type { MetaData } from "@/lib/db";

// Helper function to generate unique IDs
const generateUniqueId = () => {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const Route = createFileRoute("/_auth/dashboard/settings")({
  component: function() {
    const [services, setServices] = useState<
      (Service & { tempId: string } & Partial<MetaData>)[]
    >([]);
    const [deletedServices, setDeletedServices] = useState<(Service & { tempId: string } & MetaData)[]>([]);
    const [saved, setSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Added loading state
    const hasLoaded = useRef(false); // Prevent multiple loads

    useEffect(() => {
      // Only load once
      if (hasLoaded.current) return;

      setIsLoading(true);
      getServices().then((services) => {
        if (services) {
          // Use the service ID as tempId if it exists, otherwise generate a new one
          const newServices = services.map((service) => {
            return {
              ...service,
              tempId: service.id ? `db-${service.id}` : generateUniqueId()
            };
          }) as (Service & { tempId: string } & Partial<MetaData>)[];

          // Filter out any duplicates by ID
          const uniqueServices = Array.from(
            new Map(newServices.map(service => [service.id || service.tempId, service])).values()
          );

          setServices(uniqueServices);
        }
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });

      hasLoaded.current = true;
    }, []);

    const addNewService = () => {
      setServices([...services, {
        service: "",
        description: "",
        price: 0,
        tempId: generateUniqueId()
      }]);
    };

    const handleServiceInputChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newServices = services.map(service => {
        if (service.tempId === id) {
          // For price, convert to number
          if (e.target.name === 'price') {
            return { ...service, [e.target.name]: parseFloat(e.target.value) || 0 };
          }
          return { ...service, [e.target.name]: e.target.value };
        }
        return service;
      });
      setServices(newServices);
    };

    const handleDeleteService = (tempId: string) => {
      const deletedService = services.find(service => service.tempId === tempId);

      if (deletedService?.id != undefined) {
        setDeletedServices([...deletedServices, deletedService as Service & { tempId: string } & MetaData]);
      }

      // Always remove from current services
      setServices(services.filter(service => service.tempId !== tempId));
    };

    const handleSave = async () => {
      setSaved(true);

      try {
        // Delete removed services that have an ID (from database)
        await Promise.all(deletedServices.map(service => {
          if (service.id) {
            return deleteService(service.id);
          }
          return Promise.resolve();
        }));

        // Add new services (without ID)
        const newServices = services.filter(service => !service.id);
        await Promise.all(newServices.map(service =>
          addService(service.service, service.description, service.price)
        ));

        const googoogaga = services.map(service => {
          return {
            ...service,
            id: service.id || Math.floor(Math.random() * 1_0000_000)
          };
        });

        setServices(googoogaga);

        // Clear deleted services after successful save
        setDeletedServices([]);

        // Optionally: Reload services from database to get updated IDs
        // But for now, we'll just mark the state as saved
      } catch (error) {
        console.error("Error saving services:", error);
      }

      setTimeout(() => setSaved(false), 3000);
    };

    if (isLoading) {
      return (
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading services...</div>
          </div>
        </div>
      );
    }

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
          <Button onClick={handleSave} className="gap-2" disabled={saved}>
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
              <p className="text-sm text-muted-foreground">
                Existing services (from database) cannot be edited. Add new services below.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No services found. Add your first service below.
                  </div>
                ) : (
                  services.map((service) => {
                    const isExistingService = service.id !== undefined;

                    return (
                      <div
                        key={service.tempId}
                        className={`flex flex-col gap-4 rounded-lg border p-4 ${isExistingService
                          ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20"
                          : "border-border bg-secondary/30"
                          }`}
                      >
                        {isExistingService && (
                          <div className="flex items-center justify-between">
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Existing Service
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div className="sm:col-span-2">
                            <Label htmlFor={`service-${service.tempId}`}>
                              Service Name
                              {isExistingService && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (Cannot be edited)
                                </span>
                              )}
                            </Label>
                            {isExistingService ? (
                              <div className="mt-1.5 rounded-md border border-border bg-card px-3 py-2">
                                {service.service || <span className="text-muted-foreground italic">No service name</span>}
                              </div>
                            ) : (
                              <Input
                                id={`service-${service.tempId}`}
                                name="service"
                                value={service.service || ""}
                                onChange={(e) => handleServiceInputChange(service.tempId, e)}
                                className="mt-1.5 border-border bg-card"
                                placeholder="e.g., Haircut & Styling"
                              />
                            )}
                          </div>

                          <div>
                            <Label htmlFor={`price-${service.tempId}`}>
                              Price (R)
                              {isExistingService && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (Cannot be edited)
                                </span>
                              )}
                            </Label>
                            {isExistingService ? (
                              <div className="mt-1.5 rounded-md border border-border bg-card px-3 py-2">
                                R{service.price ? service.price.toFixed(2) : "0.00"}
                              </div>
                            ) : (
                              <Input
                                id={`price-${service.tempId}`}
                                type="number"
                                name="price"
                                value={service.price || 0}
                                onChange={(e) => handleServiceInputChange(service.tempId, e)}
                                className="mt-1.5 border-border bg-card"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                              />
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`description-${service.tempId}`}>
                            Description
                            {isExistingService && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (Cannot be edited)
                              </span>
                            )}
                          </Label>
                          {isExistingService ? (
                            <div className="mt-1.5 rounded-md border border-border bg-card px-3 py-2 min-h-[80px]">
                              {service.description || (
                                <span className="text-muted-foreground italic">No description</span>
                              )}
                            </div>
                          ) : (
                            <Textarea
                              id={`description-${service.tempId}`}
                              name="description"
                              value={service.description || ""}
                              onChange={(e) => handleServiceInputChange(service.tempId, e)}
                              className="mt-1.5 border-border bg-card"
                              placeholder="Brief description of the service..."
                              rows={3}
                            />
                          )}
                          {!isExistingService && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Optional: Provide details about what the service includes
                            </p>
                          )}
                        </div>

                        {/* Delete button */}
                        <div className="flex justify-end">
                          <Button
                            variant={isExistingService ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => handleDeleteService(service.tempId)}
                            className={isExistingService ? "" : "border-border"}
                          >
                            {isExistingService ? (
                              <>
                                <X className="mr-2 size-4" />
                                Delete Service
                              </>
                            ) : (
                              "Remove Service"
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}

                <Button
                  onClick={addNewService}
                  variant="outline"
                  className="w-full border-border bg-transparent"
                >
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
