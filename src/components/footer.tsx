import { MapPin, Phone, Clock, Instagram} from "lucide-react";
import { useLocation } from "@tanstack/react-router";
import kdCutsLogo from "@/assets/KD Cuts Logo.png";
export function Footer() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  //footer not visible on dashboard
  if (isDashboard) return null;
  

  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
            <img 
              src={kdCutsLogo} 
              alt="KD Cuts Logo" 
              className="size-30 mr-6 object-cover rounded-full"
            />  
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  KD Cuts
                </h3>
                <p className="text-xs text-muted-foreground">Est. 2018</p>
              </div>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Premium grooming experience for the modern gentleman. Traditional
              techniques, contemporary style.
            </p>
          </div>

          {/* Hours */}
          <div>
            <h4 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <Clock className="size-4 text-primary" />
              Hours
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex justify-between">
                <span>Mon - Fri</span>
                <span>9:00 AM - 7:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span>9:00 AM - 3:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="text-primary">Closed</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  123 Main Street
                  <br />
                  Downtown, NY 10001
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                <a href="tel:+15551234567" className="hover:text-foreground">
                  (555) 123-4567
                </a>
              </li>
            </ul>

            <div className="mt-4 flex gap-4">
              <a
                href="https://www.tiktok.com/@kayden_carelse_?_r=1&_t=ZS-93dRwLs4u2P"
                className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="Tiktok"
              >
                <Instagram className="size-4" />
              </a>
              {/* <a
                href="#"
                className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="Facebook"
              >
                <Facebook className="size-4" />
              </a> */}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} KD Cuts. Barbershop. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
