import { ScenarioForm } from "@/components/ScenarioForm";

export default function HomeRoomSetPage() {
  return (
    <ScenarioForm
      title="Home / Room Set"
      checkoutLabel="Открыть полный home-set"
      fields={[
        { name: "room", label: "Тип комнаты" },
        { name: "style", label: "Стиль" },
        { name: "budget", label: "Бюджет" },
        { name: "area", label: "Площадь комнаты" },
        { name: "liked", label: "Ссылка на понравившийся товар" }
      ]}
    />
  );
}
