import { Suspense } from "react";
import Dashboard from "./components/Dashboard";
import NavBar from "./components/NavBar";
import Loading from "./components/Loading";

export default function Home() {
  return (
    <div>
      <NavBar />
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
