import { ScenarioForm } from "@/components/ScenarioForm";

export default function FashionFitCheckPage() {
  return (
    <ScenarioForm
      title="Fashion / Fit Check"
      checkoutLabel="Открыть полный fit-report"
      fields={[
        { name: "url", label: "Ссылка на товар", placeholder: "https://..." },
        { name: "type", label: "Тип вещи" },
        { name: "body", label: "Тип телосложения" },
        { name: "season", label: "Сезон" },
        { name: "goal", label: "Цель" }
      ]}
    />
  );
}
