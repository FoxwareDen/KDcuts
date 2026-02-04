import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard/settings")({
  component: function () {
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
      setSaved(true);
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
          {/* Business Info */}
          <Card className="border-border">
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

          {/* Notifications */}
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

          {/* Services & Pricing */}
          <Card className="border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Services & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Classic Haircut",
                    duration: "30",
                    price: "100",
                  },
                  {
                    name: "Beard Trim & Shape",
                    duration: "20",
                    price: "100",
                  },
                  {
                    name: "The Full Experience",
                    duration: "45",
                    price: "100",
                  },
                ].map((service, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex-1">
                      <Label>Service Name</Label>
                      <Input
                        defaultValue={service.name}
                        className="mt-1.5 border-border bg-card"
                      />
                    </div>
                    <div className="w-full sm:w-32">
                      <Label>Duration (min)</Label>
                      <Input
                        type="number"
                        defaultValue={service.duration}
                        className="mt-1.5 border-border bg-card"
                      />
                    </div>
                    <div className="w-full sm:w-32">
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        defaultValue={service.price}
                        className="mt-1.5 border-border bg-card"
                      />
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full border-border bg-transparent">
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
