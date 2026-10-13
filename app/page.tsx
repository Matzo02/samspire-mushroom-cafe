import { Mushroom, MushroomRow, type Variant } from "@/components/Mushroom";
import { BackToTop, SporeBurst } from "@/components/Spores";
import { Nav } from "@/components/Nav";
import { MenuTabs } from "@/components/MenuTabs";
import { SIGNATURES, rupee } from "@/data/menu";
import { SITE } from "@/data/site";

const VARIETIES = ["Oyster", "Shiitake", "Button", "King Oyster", "Lion's Mane", "Portobello"];

const STEPS = [
  { n: "01", title: "Grown", text: "Cultivated on our own farm near Pawna, no middlemen." },
  { n: "02", title: "Picked", text: "Harvested at peak freshness and brought in to Baner." },
  { n: "03", title: "Plated", text: "Cooked to order into café classics with a mushroom heart." },
];

const BENEFITS: { icon: Variant; title: string; text: string }[] = [
  { icon: "amanita", title: "Plant protein", text: "A meaty bite and a useful source of protein for vegetarian diets." },
  { icon: "bell", title: "Vitamin D", text: "One of the few non-animal foods that can provide vitamin D." },
  { icon: "flat", title: "Fibre-rich", text: "Naturally high in fibre and antioxidants, low in calories and fat." },
  { icon: "button", title: "Low footprint", text: "Grown indoors with little land and water. Good food, lighter on the planet." },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <section className="hero on-dark">
          <div className="wrap hero__grid">
            <div className="hero__copy">
              <p className="eyebrow">Baner · Pune</p>
              <h1>
                India&apos;s first <em>mushroom</em> café.
              </h1>
              <p className="lede">
                Grown on our farm near Pawna, picked fresh and cooked into food that&apos;s nutritious and delightfully
                delicious.
              </p>
              <div className="hero__cta">
                <a className="btn" href="#menu">See the menu</a>
                <a className="btn btn--ghost" href="#visit">Find us</a>
              </div>
              <ul className="hero__facts">
                <li><strong>4.9★</strong><span>on Swiggy Dineout</span></li>
                <li><strong>₹800</strong><span>for two</span></li>
                <li><strong>Own</strong><span>mushroom farm</span></li>
              </ul>
            </div>
            <div className="hero__art" aria-hidden="true">
              <div className="hero__moon" />
              <Mushroom className="shroom shroom--big" />
              <Mushroom className="shroom shroom--mid" variant="bell" />
              <Mushroom className="shroom shroom--small" variant="flat" />
              <Mushroom className="shroom shroom--tiny" variant="button" />
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className={`spore s${n}`} />
              ))}
            </div>
          </div>
          <MushroomRow className="shroom-row--cap" />
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            {[...VARIETIES, ...VARIETIES].flatMap((v, i) => [
              <span key={`v${i}`}>{v}</span>,
              <Mushroom key={`m${i}`} className="marquee__shroom" variant={(["amanita", "bell", "flat", "button"] as const)[i % 4]} />,
            ])}
          </div>
        </div>

        <section className="section" id="story">
          <div className="wrap story">
            <div className="story__head">
              <p className="eyebrow">Our story</p>
              <h2>From the farm at Pawna to your table in Baner.</h2>
            </div>
            <div className="story__body">
              <p>
                Samspire started with a simple idea: mushrooms deserve to be the star of the plate, not a side. We grow
                our own near Pawna Dam, where the cool, damp hills are just right for them, and bring them to Baner fresh.
              </p>
              <p>
                Every dish on our menu is built around mushrooms, from crispy oyster &ldquo;wings&rdquo; to a
                slow-stirred wild mushroom risotto and a lion&apos;s mane latte. It&apos;s comfort food that happens to be
                good for you.
              </p>
            </div>
            <ol className="steps">
              {STEPS.map((s) => (
                <li key={s.n}>
                  <span className="steps__n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section section--dark on-dark" id="signatures">
          <div className="wrap">
            <p className="eyebrow eyebrow--light">Chef&apos;s picks</p>
            <h2>Signatures worth the drive.</h2>
            <div className="cards">
              {SIGNATURES.map((it) => (
                <article className="card" key={it.name}>
                  <Mushroom className="card__icon" />
                  <h3>{it.name}</h3>
                  <p>{it.desc}</p>
                  <span className="card__price">{rupee(it.price)}</span>
                </article>
              ))}
            </div>
          </div>
          <MushroomRow className="shroom-row--paper" />
        </section>

        <section className="section" id="menu">
          <div className="wrap">
            <div className="menu__head">
              <div>
                <p className="eyebrow">The menu</p>
                <h2>Everything has mushrooms. Mostly.</h2>
              </div>
              <div className="legend">
                <span className="tag tag--veg">Veg</span>
                <span className="tag tag--vegan">Vegan</span>
                <span className="tag tag--chef">Chef&apos;s pick</span>
              </div>
            </div>
            <MenuTabs />
            <p className="note"><span className="glyph" />Sample menu for demo purposes. Prices are indicative and exclude taxes.</p>
          </div>
        </section>

        <section className="section section--tint" id="why">
          <div className="wrap">
            <p className="eyebrow">Why mushrooms</p>
            <h2>Small fungi, big goodness.</h2>
            <div className="why">
              {BENEFITS.map((b) => (
                <article key={b.title}>
                  <div className="why__icon"><Mushroom variant={b.icon} /></div>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="visit">
          <div className="wrap visit">
            <div className="visit__info">
              <p className="eyebrow">Visit us</p>
              <h2>Come hungry.</h2>
              <div className="loc">
                <h3>Baner café</h3>
                <p>
                  {SITE.cafe.lines.map((l) => (
                    <span key={l}>{l}<br /></span>
                  ))}
                  <span className="muted">{SITE.cafe.landmark}</span>
                </p>
                <p>
                  <strong>Open till {SITE.closesAt}</strong> · Free Wi-Fi
                </p>
              </div>
              <div className="loc">
                <h3>Pawna</h3>
                <p>
                  {SITE.farm.lines.map((l) => (
                    <span key={l}>{l}<br /></span>
                  ))}
                  <span className="muted">{SITE.farm.note}</span>
                </p>
              </div>
              <div className="visit__cta">
                <a className="btn" href={SITE.dineout} target="_blank" rel="noopener">Reserve on Swiggy Dineout</a>
                <a className="btn btn--ghost" href={SITE.directions} target="_blank" rel="noopener">Directions</a>
              </div>
            </div>
            <div className="visit__map">
              <iframe title="Map to Samspire, Baner" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={SITE.mapEmbed} />
            </div>
          </div>
        </section>

        <section className="insta on-dark">
          <div className="wrap insta__inner">
            <h2>Follow the fungi.</h2>
            <p>New dishes, farm days and behind-the-scenes on Instagram.</p>
            <a className="btn btn--light" href={SITE.instagram} target="_blank" rel="noopener">
              {SITE.instagramHandle}
            </a>
          </div>
          <MushroomRow className="shroom-row--glow" />
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__inner">
          <div className="brand brand--footer">
            <Mushroom className="brand__mark" />
            <span>{SITE.fullName}™</span>
          </div>
          <p className="muted">
            Baner &amp; Pawna, Pune · <a href={SITE.instagram} target="_blank" rel="noopener">Instagram</a>
          </p>
          <p className="muted small">Concept website, demo build.</p>
        </div>
      </footer>
      <BackToTop />
      <SporeBurst />
    </>
  );
}
