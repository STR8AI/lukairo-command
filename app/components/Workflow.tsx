export default function Workflow() {
  const steps = [
    {
      title: "Diagnose",
      body: "We map your funnel, data, and handoffs to find the conversion leaks.",
    },
    {
      title: "Build",
      body: "LUKAIRO configures AI voice, chat, routing, and automations around your team.",
    },
    {
      title: "Launch",
      body: "We deploy the live command centre with clear ownership and playbooks.",
    },
    {
      title: "Optimize",
      body: "Weekly reviews, QA, and iteration keep performance climbing.",
    },
  ];

  return (
    <section className="lk-section lk-section--alt" id="process">
      <div className="lk-section__inner">
        <div className="lk-section__header">
          <p className="lk-section__eyebrow">Execution</p>
          <h2>From first call to repeat revenue.</h2>
          <p className="lk-section__lede">
            We run the end-to-end process, so your team gets a proven system—not another tool.
          </p>
        </div>

        <div className="lk-steps">
          {steps.map((step, index) => (
            <div className="lk-step" key={step.title}>
              <div className="lk-step__index">0{index + 1}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
