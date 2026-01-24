import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/">Go Home</a>
    </div>
  );
}
