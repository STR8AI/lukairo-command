export default function Highlights() {
  const highlights = [
    {
      title: "Omnichannel capture",
      body: "Bring voice, chat, SMS, and social into one inbox with shared context and routing.",
    },
    {
      title: "Automations that close",
      body: "Follow-ups, reminders, and handoffs run automatically while your team stays focused.",
    },
    {
      title: "Full-funnel visibility",
      body: "Live reporting across leads, bookings, and revenue to keep every team aligned.",
    },
  ];

  const metrics = [
    { value: "24/7", label: "coverage" },
    { value: "< 60s", label: "speed to lead" },
    { value: "1 inbox", label: "for every channel" },
  ];

  return (
    <section className="lk-section" id="platform">
      <div className="lk-section__inner">
        <div className="lk-section__header">
          <p className="lk-section__eyebrow">Operating layer</p>
          <h2>One system to capture, convert, and retain.</h2>
          <p className="lk-section__lede">
            LUKAIRO connects AI voice, chat, booking, and CRM workflows into a single command
            centre so every lead is answered, routed, and followed through.
          </p>
        </div>

        <div className="lk-grid">
          {highlights.map((item) => (
            <div className="lk-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>

        <div className="lk-metrics" aria-label="Performance highlights">
          {metrics.map((item) => (
            <div className="lk-metric" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
