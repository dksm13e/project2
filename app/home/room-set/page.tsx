import { ScenarioForm } from "@/components/ScenarioForm";
import { ModulePageTracker } from "@/components/ModulePageTracker";

export default function HomeRoomSetPage() {
  return (
    <>
      <ModulePageTracker module="home" page="scenario" scenarioId="home-room-set" />
      <ScenarioForm scenarioId="home-room-set" />
    </>
  );
}