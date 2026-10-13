import { Mushroom } from "@/components/Mushroom";
import { Nav } from "@/components/Nav";
import { MenuTabs } from "@/components/MenuTabs";
import { SporeBurst } from "@/components/Spores";
import { SITE } from "@/data/site";

// [left %, top %, flight radius px, flight seconds, delay seconds], spread around the mushrooms
const FIREFLIES: [number, number, number, number, number][] = [
  [14, 58, 70, 9, 0], [30, 74, 55, 7, -2], [8, 84, 60, 11, -4],
  [72, 54, 80, 10, -1], [90, 66, 50, 8, -3], [60, 86, 45, 6.5, -2.5],
  [82, 88, 65, 9.5, -5], [46, 64, 90, 12, -6], [22, 42, 60, 10.5, -1.5], [96, 44, 55, 8.5, -4.5],
];

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <section className="hero">
          <div className="wrap hero__grid">
            <div className="hero__copy">
              <h1>India&apos;s first mushroom café.</h1>
              <p className="lede">
                Grown on our farm near Pawna, picked fresh and cooked into food that&apos;s nutritious and delightfully
                delicious.
              </p>
              <div className="hero__cta">
                <a className="btn" href="#menu">See the menu</a>
                <a className="btn btn--ghost" href={SITE.dineout} target="_blank" rel="noopener">Book a table</a>
              </div>
              <p className="hero__meta">
                Baner, Pune · Open till {SITE.closesAt} · 4.9 on Swiggy Dineout
              </p>
            </div>
            <div className="hero__art" aria-hidden="true">
              <Mushroom className="shroom shroom--big" />
              <Mushroom className="shroom shroom--mid" variant="bell" />
              <Mushroom className="shroom shroom--small" variant="flat" />
              <Mushroom className="shroom shroom--tiny" variant="button" />
              {FIREFLIES.map(([x, y, r, dur, delay], i) => (
                <span
                  key={i}
                  className="firefly"
                  style={{ "--x": `${x}%`, "--y": `${y}%`, "--r": `${r}px`, "--dur": `${dur}s`, "--delay": `${delay}s` } as React.CSSProperties}
                >
                  <span className="firefly__light" />
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="wrap about">
            <h2>Grown at Pawna, cooked in Baner.</h2>
            <div className="about__body">
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
          </div>
        </section>

        <section className="section" id="menu">
          <div className="wrap">
            <div className="section__head">
              <h2>Menu</h2>
              <p className="muted">Around ₹800 for two</p>
            </div>
            <MenuTabs />
            <p className="note">Sample menu for demo purposes. Prices are indicative and exclude taxes.</p>
          </div>
        </section>

        <section className="section" id="visit">
          <div className="wrap">
            <div className="section__head">
              <h2>Find us</h2>
              <p className="muted">Open till {SITE.closesAt}</p>
            </div>
          </div>
          <div className="wrap visit">
            <div className="visit__info">
              <div className="loc">
                <h3>Baner café</h3>
                <p>
                  {SITE.cafe.lines.map((l) => (
                    <span key={l}>{l}<br /></span>
                  ))}
                  <span className="muted">{SITE.cafe.landmark}</span>
                </p>
                <p>Free Wi-Fi</p>
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
      </main>

      <footer className="footer">
        <div className="wrap footer__inner">
          <div className="brand brand--footer">
            <Mushroom className="brand__mark" />
            <span>{SITE.fullName}™</span>
          </div>
          <p>
            <a href={SITE.instagram} target="_blank" rel="noopener">Instagram {SITE.instagramHandle}</a>
          </p>
          <p className="muted">© {new Date().getFullYear()} Samspire</p>
        </div>
      </footer>
      <SporeBurst />
    </>
  );
}
