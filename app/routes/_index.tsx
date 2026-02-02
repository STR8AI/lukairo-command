import type { MetaFunction } from "@remix-run/node";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Highlights from "../components/Highlights";
import Workflow from "../components/Workflow";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export const meta: MetaFunction = () => {
  return [
    { title: "LUKAIRO | Plug-and-Play Growth Engines" },
    { name: "description", content: "We build and run revenue systems." },
  ];
};

export default function Index() {
  const bookingHref = "https://www.lukairoengine.com/widget/booking/SGgO7LS3M1CVcD0ok6xV";
  return (
    <main className="lukairo-page">
      <Hero bookingHref={bookingHref} />
      <Services />
      <Highlights />
      <Workflow />
      <Contact bookingHref={bookingHref} />
      <Footer />
    </main>
  );
}