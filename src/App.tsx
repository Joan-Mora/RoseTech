import { useEffect, useState } from "react";
import BrochureDownload from "./components/BrochureDownload";
import ContactForm from "./components/ContactForm";
import CoverageMap from "./components/CoverageMap";
import Header from "./components/Header";
import LocationMap from "./components/LocationMap";
import WhatsAppIcon from "./components/WhatsAppIcon";
import { IconClock, IconMail, IconPhone, IconPin, IconShop } from "./components/ContactIcons";
import { COMPANY, SERVICE_DEVICE_PHOTOS } from "./content";
import { useI18n } from "./i18n/I18nProvider";
import { useTheme } from "./theme/ThemeProvider";

const wa = `https://wa.me/${COMPANY.phoneE164}`;

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: COMPANY.legalName,
    alternateName: ["ROSE Technology", COMPANY.acronym],
    description:
      "Soluciones tecnológicas integrales de reparación, mantenimiento, desarrollo de software y productos para empresas y pymes en Villavicencio, Meta.",
    telephone: `+${COMPANY.phoneE164}`,
    email: COMPANY.email,
    url: COMPANY.myshopUrl,
    image: "./brand/logo-hero.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address,
      addressLocality: COMPANY.city,
      addressRegion: COMPANY.department,
      addressCountry: "CO",
    },
    areaServed: ["Villavicencio", "Meta", "Acacías", "Restrepo", "Cumaral", "Granada", "San Martín", "Puerto López"],
    openingHours: "Mo-Sa 07:00-19:00",
    slogan: COMPANY.tagline,
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function App() {
  const { m, interpolate } = useI18n();
  const { theme } = useTheme();
  const [cookies, setCookies] = useState(false);
  const footerLogo = theme === "light" ? "./brand/logo-hero-mark-red.png" : "./brand/logo-hero-mark-white.png";

  useEffect(() => {
    setCookies(localStorage.getItem("rose-cookie") !== "ok");
  }, []);

  return (
    <>
      <JsonLd />
      <a className="skip" href="#inicio">
        {m.a11y.skip}
      </a>
      <Header />

      <main>
        <section id="inicio" className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="tag">{m.hero.tagline}</p>
              <h1>
                <span>ROSE</span>TECHNOLOGY
              </h1>
              <p className="lede">{m.hero.lede}</p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#contacto">
                  {m.hero.ctaDiagnose}
                </a>
                <a className="btn btn-ghost" href="#software">
                  {m.hero.ctaMyshop}
                </a>
                <BrochureDownload className="btn btn-ghost">{m.hero.ctaBrochure}</BrochureDownload>
              </div>
              <div className="hero-meta">
                <div>
                  <strong>{m.hero.statYears}</strong>
                  {m.hero.statYearsLabel}
                </div>
                <div>
                  <strong>{m.hero.statHours}</strong>
                  {m.hero.statHoursLabel}
                </div>
                <div>
                  <strong>{m.hero.statFull}</strong>
                  {m.hero.statFullLabel}
                </div>
              </div>
            </div>
            <div className="logo-stage">
              <div className="logo-stage-mark" role="img" aria-label={m.hero.logoAlt}>
                <img
                  src="./brand/logo-hero-mark-red.png"
                  alt=""
                  width={560}
                  height={680}
                  className={theme === "light" ? "is-on" : undefined}
                />
                <img
                  src="./brand/logo-hero-mark-white.png"
                  alt=""
                  width={560}
                  height={680}
                  className={theme === "dark" ? "is-on" : undefined}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="band">
          <div className="wrap">
            <span>
              {COMPANY.legalName} — {COMPANY.acronym}
            </span>
            <span>{interpolate(m.band.hq, { location: COMPANY.locationLabel })}</span>
            <span>{m.contact.hoursValue}</span>
          </div>
        </div>

        <section id="quienes-somos" className="section">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">{m.about.eyebrow}</p>
              <h2>{m.about.title}</h2>
              <p className="lede">{m.about.lede}</p>
            </div>
            <div className="split-quote">
              <article className="quote">
                <h3>{m.about.missionTitle}</h3>
                <p>{m.about.mission}</p>
              </article>
              <article className="quote">
                <h3>{m.about.visionTitle}</h3>
                <p>{m.about.vision}</p>
              </article>
            </div>
            <div className="grid-4" style={{ marginTop: "1.4rem" }}>
              {m.about.values.map((item) => (
                <article className="card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="servicios" className="section section-alt">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">{m.services.eyebrow}</p>
              <h2>{m.services.title}</h2>
              <p className="lede">{m.services.lede}</p>
              <p className="lede">{m.services.lede2}</p>
            </div>
            <div className="grid-4">
              {m.services.devices.map((item, i) => (
                <article className="card photo-card" key={item.title}>
                  <img src={SERVICE_DEVICE_PHOTOS[i]} alt={item.alt} />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
            <div className="grid-3" style={{ marginTop: "1rem" }}>
              {m.services.extras.map((item) => (
                <article className="card accent" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="software" className="section myshop">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">{m.software.eyebrow}</p>
              <h2>{m.software.title}</h2>
              <p className="lede">{m.software.lede}</p>
            </div>
            <div className="myshop-grid">
              <article className="myshop-red">
                <h3>{m.software.myshopTitle}</h3>
                <p>{m.software.myshopIntro}</p>
                <ul>
                  {m.software.myshopItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>{m.software.myshopOutro}</p>
                <p>
                  {m.software.platform}{" "}
                  <a href={COMPANY.myshopUrl} rel="noreferrer" target="_blank">
                    {COMPANY.myshopHost}
                  </a>
                </p>
              </article>
              <article className="myshop-navy">
                <h3>{m.software.customTitle}</h3>
                <p>{m.software.customIntro}</p>
                <ul className="dark-list">
                  {m.software.customItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p style={{ marginTop: "1.2rem" }}>
                  <a className="btn btn-light" href="#contacto">
                    {m.software.customCta}
                  </a>
                </p>
              </article>
            </div>
            <div className="steps">
              {m.software.steps.map((step) => (
                <div className="step" key={step.code}>
                  <b>{step.code}</b>
                  {step.text}
                </div>
              ))}
            </div>
            <p className="lede" style={{ marginTop: "1.4rem" }}>
              {m.software.process}
            </p>
          </div>
        </section>

        <section id="productos" className="section">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">{m.products.eyebrow}</p>
              <h2>{m.products.title}</h2>
              <p className="lede">{m.products.lede}</p>
            </div>
            <div className="grid-3">
              {m.products.items.map((item) => (
                <article className="card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
            <p className="card accent" style={{ marginTop: "1rem" }}>
              {m.products.note}
            </p>
          </div>
        </section>

        <section id="por-que" className="section section-alt">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">{m.why.eyebrow}</p>
              <h2>{m.why.title}</h2>
              <p className="lede">{m.why.lede}</p>
              <p className="lede">{m.why.lede2}</p>
            </div>
            <div className="grid-4">
              {m.why.stats.map((item) => (
                <div className="stat card" key={item.value}>
                  <b>{item.value}</b>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="grid-4" style={{ marginTop: "1rem" }}>
              {m.why.cards.map((item) => (
                <article className="card accent" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="equipo" className="section">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">{m.team.eyebrow}</p>
              <h2>{m.team.title}</h2>
              <p className="lede">{m.team.lede}</p>
            </div>
            <div className="grid-2">
              <article className="card accent">
                <h3>{m.team.techTitle}</h3>
                <p>{m.team.techText}</p>
                <ul>
                  {m.team.techItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="card">
                <h3>{m.team.devTitle}</h3>
                <p>{m.team.devText}</p>
                <ul>
                  {m.team.devItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
            <div className="grid-4" style={{ marginTop: "1rem" }}>
              {m.team.cards.map((item) => (
                <article className="card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="cobertura" className="section section-alt">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">{m.coverage.eyebrow}</p>
              <h2>{m.coverage.title}</h2>
              <p className="lede">{m.coverage.lede}</p>
            </div>
            <div className="grid-2 coverage-layout">
              <CoverageMap />
              <div>
                <h3>{m.coverage.areaTitle}</h3>
                <p className="lede">{m.coverage.areaLede}</p>
                <ul>
                  {m.coverage.cities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3 style={{ marginTop: "1.2rem" }}>{m.coverage.onsiteTitle}</h3>
                <p>{m.coverage.onsiteText}</p>
                <p className="card callout-dark" style={{ marginTop: "1rem" }}>
                  {m.coverage.onsiteNote}
                </p>
              </div>
            </div>
            <div className="grid-3" style={{ marginTop: "1.2rem" }}>
              {m.coverage.audiences.map((item) => (
                <article className="card accent" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="section">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">{m.contact.eyebrow}</p>
              <h2>{m.contact.title}</h2>
              <p className="lede">{m.contact.lede}</p>
            </div>
            <div className="grid-2">
              <div className="contact-box">
                <h3>{m.contact.infoTitle}</h3>
                <div className="contact-row">
                  <IconPin className="contact-ico" />
                  <div>
                    <strong>{m.contact.location}</strong>
                    <div>{COMPANY.address}</div>
                    <small>{COMPANY.locationLabel}</small>
                  </div>
                </div>
                <div className="contact-row">
                  <IconPhone className="contact-ico" />
                  <div>
                    <strong>{m.contact.phone}</strong>
                    <div>
                      <a className="wa-inline" href={wa} rel="noreferrer" target="_blank">
                        <WhatsAppIcon />
                        {COMPANY.phoneDisplay}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="contact-row">
                  <IconMail className="contact-ico" />
                  <div>
                    <strong>{m.contact.email}</strong>
                    <div>
                      <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                    </div>
                  </div>
                </div>
                <div className="contact-row">
                  <IconShop className="contact-ico" />
                  <div>
                    <strong>{m.contact.myshop}</strong>
                    <div>
                      <a href={COMPANY.myshopUrl} rel="noreferrer" target="_blank">
                        {COMPANY.myshopHost}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="contact-row">
                  <IconClock className="contact-ico" />
                  <div>
                    <strong>{m.contact.hours}</strong>
                    <div>{m.contact.hoursValue}</div>
                  </div>
                </div>
              </div>
              <div className="card">
                <h3>{m.contact.formTitle}</h3>
                <p>{m.contact.formIntro}</p>
                <ContactForm />
                <p className="promo">{m.contact.promo}</p>
              </div>
            </div>
            <div className="hq-map-wrap">
              <LocationMap />
            </div>
          </div>
        </section>
      </main>

      <footer className="site">
        <div className="wrap foot-grid">
          <div className="foot-brand">
            <img src={footerLogo} alt={m.hero.logoAlt} width={88} height={108} />
            <p>{interpolate(m.footer.blurb, { legal: COMPANY.legalName, acronym: COMPANY.acronym })}</p>
            <p className="foot-slogan">{m.footer.closer}</p>
          </div>
          <div>
            <h3>{m.footer.contact}</h3>
            <p>
              {COMPANY.address}
              <br />
              <a className="wa-inline" href={wa} rel="noreferrer" target="_blank">
                <WhatsAppIcon />
                {COMPANY.phoneDisplay}
              </a>
              <br />
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              <br />
              {m.contact.hoursValue}
            </p>
          </div>
          <div>
            <h3>{m.footer.resources}</h3>
            <ul className="foot-links">
              <li>
                <BrochureDownload>{m.footer.pdf}</BrochureDownload>
              </li>
              <li>
                <a href={COMPANY.myshopUrl} rel="noreferrer" target="_blank">
                  Myshop
                </a>
              </li>
              <li>
                <a href="#cobertura">{m.footer.coverage}</a>
              </li>
              <li>
                <a href="#inicio">{m.footer.top}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="wrap legal">
          <span>{interpolate(m.footer.rights, { year: new Date().getFullYear(), legal: COMPANY.legalName })}</span>
          <span>{m.footer.cookiesNote}</span>
        </div>
      </footer>

      <a
        className="float-wa"
        href={wa}
        rel="noreferrer"
        target="_blank"
        aria-label={`${m.a11y.whatsapp} ${COMPANY.phoneDisplay}`}
        title={m.a11y.whatsapp}
      >
        <WhatsAppIcon />
      </a>

      {cookies ? (
        <div className="cookie" role="dialog" aria-label={m.a11y.privacy}>
          <p>{m.cookie.text}</p>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              localStorage.setItem("rose-cookie", "ok");
              setCookies(false);
            }}
          >
            {m.cookie.ok}
          </button>
        </div>
      ) : null}
    </>
  );
}
