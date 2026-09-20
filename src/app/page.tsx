import { Container } from "@/components/container";
import { Dashboard } from "@/components/dashboard";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Container>
      <Dashboard/>
      </Container>
    </div>
  );
}
