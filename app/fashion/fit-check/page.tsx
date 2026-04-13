import { ScenarioForm } from "@/components/ScenarioForm";
import { ModulePageTracker } from "@/components/ModulePageTracker";

export default function FashionFitCheckPage() {
  return (
    <>
      <ModulePageTracker module="fashion" page="scenario" scenarioId="fashion-fit-check" />
      <ScenarioForm scenarioId="fashion-fit-check" />
    </>
  );
}