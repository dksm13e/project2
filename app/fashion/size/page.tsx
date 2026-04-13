import { ScenarioForm } from "@/components/ScenarioForm";
import { ModulePageTracker } from "@/components/ModulePageTracker";

export default function FashionSizePage() {
  return (
    <>
      <ModulePageTracker module="fashion" page="scenario" scenarioId="fashion-size" />
      <ScenarioForm scenarioId="fashion-size" />
    </>
  );
}