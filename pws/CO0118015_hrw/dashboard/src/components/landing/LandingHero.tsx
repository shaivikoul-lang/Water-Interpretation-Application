import heroWebp from '../../assets/hero-reservoir.webp'
import heroJpg from '../../assets/hero-reservoir.jpg'

export function LandingHero() {
  return (
    <section aria-labelledby="hero-heading" className="landing-hero">
      <picture>
        <source srcSet={heroWebp} type="image/webp" />
        <img className="landing-hero__photo" src={heroJpg} alt="" aria-hidden />
      </picture>
      <div className="landing-hero__veil" aria-hidden />

      <div className="landing-container landing-hero__inner">
        <h1 id="hero-heading" className="landing-hero__title">
          Understand your water.
        </h1>
        <p className="landing-hero__punch">Without decoding a chemistry report.</p>
      </div>
    </section>
  )
}
