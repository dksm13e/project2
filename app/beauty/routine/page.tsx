import { ScenarioForm } from "@/components/ScenarioForm";
import { ModulePageTracker } from "@/components/ModulePageTracker";

export default function BeautyRoutinePage() {
  return (
    <>
      <ModulePageTracker module="beauty" page="scenario" scenarioId="beauty-routine" />
      <ScenarioForm scenarioId="beauty-routine" />
    </>
  );
}