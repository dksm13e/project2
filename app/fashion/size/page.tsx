import { ScenarioForm } from "@/components/ScenarioForm";

export default function FashionSizePage() {
  return (
    <ScenarioForm
      title="Fashion / Size"
      checkoutLabel="Открыть полный разбор размера"
      fields={[
        { name: "url", label: "Ссылка на товар", placeholder: "https://..." },
        { name: "category", label: "Категория" },
        { name: "height", label: "Рост" },
        { name: "weight", label: "Вес" },
        { name: "fit", label: "Желаемая посадка" }
      ]}
    />
  );
}
