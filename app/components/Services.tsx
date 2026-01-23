export default function Services() {
  return (
    <section className="lk-services" id="services">
      <div className="lk-services__inner">
        <div className="lk-services__header">
          <p className="lk-services__eyebrow">What we run</p>
          <h2>Revenue engines, fully managed.</h2>
          <p className="lk-services__lede">
            We deploy AI voice, chat, booking, follow-up, and reporting that plugs into your tools
            and keeps every system synced.
          </p>
        </div>
        <div className="lk-services__grid">
          {[
            "AI voice + chat",
            "Two-way CRM sync",
            "Inbound + outbound automations",
            "Scheduling and dispatch",
            "Lead capture and nurture",
            "Reporting and QA",
          ].map((item) => (
            <div key={item} className="lk-services__card">
              <div className="dot" />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
