type ContactProps = {
  bookingHref?: string;
};

export default function Contact({ bookingHref }: ContactProps) {
  const cards = [
    {
      title: "Live chat",
      body: "Start a conversation with the command centre team.",
      href: "https://m.me/LUKAIRO_",
      label: "Open Messenger",
    },
    {
      title: "WhatsApp",
      body: "Fast response for urgent needs and quick questions.",
      href: "https://wa.me/14374947028",
      label: "Message WhatsApp",
    },
    {
      title: "Direct line",
      body: "Speak to a strategist about your pipeline.",
      href: "tel:+14374947028",
      label: "Call +1 437 494 7028",
    },
    {
      title: "Email",
      body: "Send context, assets, or access details.",
      href: "mailto:lukairoteam@outlook.com",
      label: "Email the team",
    },
  ];

  return (
    <section className="lk-section" id="chat">
      <div className="lk-section__inner">
        <div className="lk-section__header">
          <p className="lk-section__eyebrow">Contact</p>
          <h2>Command centre access, on your terms.</h2>
          <p className="lk-section__lede">
            Choose your fastest channel and we will respond with a tactical plan.
          </p>
        </div>

        <div className="lk-contact-grid">
          {cards.map((card) => (
            <div className="lk-contact-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <a className="lk-link" href={card.href}>
                {card.label}
              </a>
            </div>
          ))}
        </div>

        <div className="lk-contact-cta" id="booking">
          <div>
            <h3>Ready to deploy LUKAIRO?</h3>
            <p>Book a strategy call and we will build the launch roadmap.</p>
          </div>
          <div className="lk-contact-actions">
            <a
              className="lk-btn primary"
              href={
                bookingHref ??
                "https://www.lukairoengine.com/widget/booking/SGgO7LS3M1CVcD0ok6xV"
              }
            >
              Book a call
            </a>
            <a className="lk-btn ghost" href="https://app.lukairo.app">
              View dashboard
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
