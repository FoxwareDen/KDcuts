import { addBooking, getUserSession } from "@/lib/db";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {

  const test = async () => {
    const session = await getUserSession();

    console.log(session);

    let user_id = session.user ? session.user.id : null;

    console.log(user_id);
    console.log((new Date()).toISOString());
    console.log((new Date()).getTime());

    const test = await addBooking({
      email: "test",
      date: (new Date()).toISOString(),
      time: "1430",
      phone: "1234567890",
      user_id,
      service: "trim service"
    })

    console.log(test);
  }

  return <>
    <button onClick={test}>test</button>
  </>;
}
