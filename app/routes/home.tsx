import Hero from "../components/Hero";
import Services from "../components/Services";

export const meta = () => {
  return [
    { title: "LUKAIRO | Plug-and-Play Growth Engines" },
    { name: "description", content: "We build and run revenue systems." },
  ];
};

export default function Home() {
  return (
    <main className="lukairo-page">
      <Hero bookingHref="https://www.lukairoengine.com/widget/booking/SGgO7LS3M1CVcD0ok6xV" />
      <Services />
    </main>
  );
}
