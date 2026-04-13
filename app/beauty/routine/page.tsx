import { ScenarioForm } from "@/components/ScenarioForm";

export default function BeautyRoutinePage() {
  return (
    <ScenarioForm
      title="Beauty / Routine"
      checkoutLabel="Открыть полный beauty routine"
      fields={[
        { name: "skin", label: "Тип кожи" },
        { name: "goal", label: "Главная задача" },
        { name: "sensitive", label: "Чувствительность" },
        { name: "budget", label: "Бюджет" },
        { name: "liked", label: "Ссылка на продукт" }
      ]}
    />
  );
}
