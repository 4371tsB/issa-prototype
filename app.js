/* ISSA mobile prototype: hash-routed screens rendered from templates. */
(function () {
  "use strict";

  const A = "assets/";
  const screen = document.getElementById("screen");
  const device = document.getElementById("device");
  const layer = document.getElementById("layer");

  const SPECIALIZATIONS = ["Bodybuilding", "Business of PT", "Corrective Exercise", "Nutritionist", "Strength & Conditioning"];
  const COUNTRIES = ["United States", "Canada"];
  const STATES = ["Arizona", "California", "Florida", "New York", "Texas"];

  // Bundle pricing comes from the homepage Pricing Cards; CPT checkout figures come from the checkout flow.
  const PRODUCTS = {
    cpt: { name: "Certified Personal Trainer", mo: 89, save: 200 },
    fc: { name: "Fitness Coach Bundle", mo: 99, save: 200 },
    et: { name: "Elite Trainer Bundle", mo: 125, save: 200 },
    mt: { name: "Master Trainer Bundle", mo: 175, save: 350 },
  };

  function freshState() {
    return {
      promo: true,
      item: null, // { id }
      specs: { fc: null, et: null, mt: null },
      plan: "monthly",
      addon: null,
      summaryOpen: false,
      details: { email: "jordan.lee@email.com", first: "Jordan", last: "Lee", phone: "(555) 214-8890", news: true },
      billing: { country: "United States", street: "1234 W Main St", apt: "", city: "Phoenix", state: "Arizona", zip: "85004", save: true },
      pay: { method: "card", number: "4242 4242 4242 4242", name: "Jordan Lee", exp: "08 / 29", cvc: "•••", agree: true, declined: false },
      bundleIdx: 0,
    };
  }
  let S = freshState();

  /* ---------- helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const money = (n, cents = true) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });

  function pricing(id) {
    if (id === "cpt") return { down: 49, inst: 92, n: 11, total: 1061, reg: 1068, full: 868, save: 200 };
    const p = PRODUCTS[id];
    const total = p.mo * 12;
    return { down: p.mo, inst: p.mo, n: 11, total, reg: total, full: total - p.save, save: p.save };
  }
  const item = () => S.item && { id: S.item.id, ...PRODUCTS[S.item.id], spec: S.specs[S.item.id], pr: pricing(S.item.id) };
  const dueToday = () => { const it = item(); return it ? (S.plan === "monthly" ? it.pr.down : it.pr.full) : 0; };

  const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M10 16.4 6 12.4l1.4-1.4 2.6 2.6 6.6-6.6L18 8.4z"/></svg>';

  /* ---------- shared pieces ---------- */
  function promo() {
    if (!S.promo) return "";
    return `<div class="promo">
      <p class="msg">Start for as low as $49 down.<br>Enroll today and pay over time.</p>
      <div class="row">
        <div class="timer"><span>8 <em>HOURS</em></span><span>33 <em>MINUTES</em></span><span>37 <em>SECONDS</em></span></div>
        <button class="btn-small hot" data-go="product">Start Now</button>
      </div>
      <button class="x hot" data-act="closePromo" aria-label="Close banner"><img src="${A}promo-close.svg" width="16" height="16" alt=""></button>
    </div>`;
  }

  function header() {
    const count = S.item ? 1 : 0;
    return `<header class="hdr">
      <button class="logo hot" data-go="home" aria-label="ISSA home"><img src="${A}logo-black.svg" width="120" height="25.3503" alt="ISSA"></button>
      <span class="spacer"></span>
      <div class="utils">
        <span class="util"><img src="${A}icon-signin.svg" width="24" height="24" alt="">Sign In</span>
        <button class="util hot" data-go="cart" aria-label="Cart, ${count} item${count === 1 ? "" : "s"}"><img src="${A}icon-cart.svg" width="24" height="24" alt="">${count}</button>
        <span class="util"><img src="${A}icon-menu.svg" width="24" height="24" alt=""></span>
      </div>
    </header>`;
  }

  // Pass a track id to make each dot jump to its slide
  function pager(count, idx, dot, id, track) {
    let h = "";
    for (let i = 0; i < count; i++) {
      const mark = i === idx ? '<span class="on"></span>' : `<img src="${A}${dot}" width="30" height="10" alt="">`;
      h += track
        ? `<button class="pdot" data-act="slide" data-track="${track}" data-i="${i}" aria-label="Show card ${i + 1} of ${count}"${i === idx ? ' aria-current="true"' : ""}>${mark}</button>`
        : mark;
    }
    return `<div class="pager${track ? " hot" : ""}"${id ? ` id="${id}"` : ""}>${h}</div>`;
  }

  /* ---------- Home ---------- */
  function heroHome() {
    return `<section class="hero">
      <img class="pattern" src="${A}hero-pattern.png" alt="">
      <div class="swash"><img src="${A}hero-swash.svg" width="674" height="314.165" alt=""></div>
      <img class="man" src="${A}hero-man.png" alt="">
      <img class="woman" src="${A}hero-woman.png" alt="">
      <img class="jg" src="${A}job-guarantee.svg" width="147" height="128" alt="Find a job or your money back">
      <div class="copy">
        <h1>Launch your career with ISSA</h1>
        <p>Join 1,000,000+ certified ISSA professionals with our accredited trainer certification course—and begin earning.</p>
        <button class="btn btn-primary legacy-btn hot" data-act="toBundles">See Certifications <img src="${A}corner-right-down.svg" width="24" height="24" alt=""></button>
      </div>
    </section>`;
  }

  const INCLUDES = {
    cpt: ["Certified Personal Trainer Course with Live Learning", "NCCA-Accredited Exam", "Job Guarantee®"],
    fc: ["Certified Personal Trainer Course with Live Learning", "NCCA-Accredited Exam", "CPR/AED Certification", "Job Guarantee®", "1 Specialization Course"],
    et: ["Certified Personal Trainer Course with Live Learning", "NCCA-Accredited Exam", "CPR/AED Certification", "Job Guarantee®", "3 Specialization Courses"],
    mt: ["Certified Personal Trainer Course with Live Learning", "NCCA-Accredited Exam", "CPR/AED Certification", "Job Guarantee®", "5 Specialization Courses"],
  };

  function pricingCard(id) {
    const p = PRODUCTS[id];
    const tagged = id === "et";
    const spec = S.specs[id];
    const select = id === "cpt"
      ? '<div class="noselect"></div>'
      : `<button class="selectf ${spec ? "filled" : ""} hot" data-act="pickSpec" data-id="${id}"><span>${esc(spec || "Select Specialization")}</span><img src="${A}${spec ? "card-select-check" : "card-select-plus"}.svg" width="20" height="20" alt=""></button>`;
    return `<div class="pcard ${tagged ? "tagged" : ""}" data-card="${id}">
      ${tagged ? '<div class="tag">BEST VALUE</div>' : ""}
      <div class="body">
        <div class="head">
          <div><p class="title">${p.name}</p><p class="sub">Payment options</p></div>
          <div class="pair">
            <div><div style="display:flex;align-items:center"><span class="amt">$${p.mo}</span><span class="per">/mo</span></div><p class="note">x12 months</p></div>
            <img class="div" src="${A}price-divider.svg" width="1" height="42" alt="">
            <div><p class="amt">Save $${p.save}</p><p class="note">Pay in full</p></div>
          </div>
        </div>
        ${select}
        <button class="btn btn-primary btn-block legacy-btn hot" data-act="buy" data-id="${id}">Buy Now</button>
        <div class="inc"><p>Includes:</p><ul>${INCLUDES[id].map((t) => `<li>${t}</li>`).join("")}</ul></div>
        <button class="btn btn-outline btn-block legacy-btn more${id === "cpt" ? " hot" : ""}"${id === "cpt" ? ' data-go="product"' : ""}>Learn More</button>
      </div>
    </div>`;
  }

  function bundles() {
    return `<section class="sec-dark bundles" id="bundles">
      <div class="top">
        <div class="stack">
          <div class="intro">
            <h2 class="h2">Get certified with our <span class="y">Trainer Bundles</span></h2>
            <div class="intro-sub">
              <p><b>Only need your trainer certification?</b>The Certified Personal Trainer course gets you started.</p>
              <p><b>Want Certification + Specialization Courses + Bigger Savings?</b>See our Fitness Coach, Elite Trainer, or Master Trainer Bundle</p>
            </div>
          </div>
          <div class="track bundle-track" id="bundleTrack">${["cpt", "fc", "et", "mt"].map(pricingCard).join("")}</div>
        </div>
        ${pager(4, S.bundleIdx, "dots-inactive.svg", "bundlePager", "bundleTrack")}
        <p class="fine">Taxes/other fees not included above.*</p>
      </div>
      <div class="fast">
        <div class="stack">
          <p class="t">Fast Track</p>
          <p class="s">Get Certified Fast</p>
          <p class="d">4-week accelerated guided study to get you certified in record time.<br><br>$99 - Available in cart with Certification purchase.</p>
        </div>
        <button class="btn btn-outline legacy-btn">Learn More</button>
      </div>
    </section>`;
  }

  function categories() {
    const cards = [
      { img: "cat-pt.jpg", w: 437, h: 134, l: "calc(50% + .5px)", t: "calc(50% + 6.03px)", label: "Personal Training", go: "product" },
      { img: "cat-nutrition.jpg", w: 352, h: 108, l: "50%", t: "50%", label: "Nutrition &amp; Wellness" },
      { img: "cat-yoga.jpg", w: 352, h: 108, l: "50%", t: "50%", label: "Yoga &amp; Pilates", k: true },
      { img: "cat-espanol.jpg", w: 352, h: 108, l: "calc(50% - 13px)", t: "50%", label: "Español", k: true },
    ];
    return `<section class="cats">
      <div class="heads"><p class="eyebrow">Browse Courses</p><h2 class="h2">Explore ISSA<br><span class="y">Courses by Category</span></h2></div>
      <div class="track">${cards.map((c) => `<div class="ccard${c.k ? " k" : ""}">
        <div class="img"><img src="${A}${c.img}" style="width:${c.w}px;height:${c.h}px;left:${c.l};top:${c.t}" alt=""></div>
        <div class="foot"><button class="cselect${c.go ? " hot" : ""}"${c.go ? ` data-go="${c.go}"` : ""}><span>${c.label}</span><img src="${A}cat-chevron.svg" width="20" height="20" alt=""></button></div>
      </div>`).join("")}</div>
      ${pager(4, 0, "cat-dots.svg")}
    </section>`;
  }

  function ceu() {
    return `<section class="sec-dark ceu">
      <div class="heads"><p class="eyebrow">Specializations &amp; CEUs</p><h2 class="h2">Already a <span class="y">Certified Personal Trainer?</span></h2></div>
      <p class="d">Advance your skillset with ISSA Continuing Education courses and earn CEUs required for certification renewal.</p>
      <button class="btn btn-outline legacy-btn">Go to Continuing Eductions Courses</button>
    </section>`;
  }

  function jobGuarantee() {
    const v = [
      ["jg-v1", "30.08% 85.22% 47.55% 0"], ["jg-v2", "49.67% 4.14% 31.54% 77.73%"],
      ["jg-v3", "5.93% 15.28% 8.97% 10.74%"], ["jg-v4", "1.14% 11.11% 4.17% 6.58%"],
      ["jg-v5", "8.1% 0.2% 46.83% 0"], ["jg-v6", "16.68% 5.84% 54.35% 6.26%"], ["jg-v7", "43.44% 25.9% 16.62% 19.95%"],
    ];
    const cards = [
      ["jg-card1.png", "145.56%", "-10.97%", "Exclusive Employer Network", "Galn direct, prlority access to more than 10,000 gyms, studios, and health clubs actively seeking certified talent."],
      ["jg-card2.png", "145.95%", "-9.14%", "Industry-Respected Credentials", "ISSA certifications, including <b>NCCA-accredited</b> options, rank among the most trusted and requested in the fitness industry."],
      ["jg-card3.png", "155.67%", "-33.17%", "100% Money-Back Promise", "If you don’t receive a job offer within 90 days of passing your NCCPT exam, we’ll refund your tuition in full."],
    ];
    const brands = [["brand-1.jpg", 84], ["brand-2.jpg", 84], ["brand-3.jpg", 83], ["brand-4.jpg", 84]];
    const brands2 = [["brand-5.jpg", 84], ["brand-6.jpg", 83], ["brand-7.jpg", 84]];
    const logo = ([f, w]) => `<img src="${A}${f}" style="width:${w}px" alt="">`;
    return `<section class="jgsec">
      <img class="pattern" src="${A}hero-pattern.png" alt="">
      <div class="jgbadge" role="img" aria-label="Find a job or your money back">${v.map(([f, i]) => `<div style="position:absolute;inset:${i}"><img src="${A}${f}.svg" style="position:static;width:100%;height:100%" alt=""></div>`).join("")}</div>
      <div class="col">
        <div class="intro">
          <h2 class="h2">Get hired <span class="lk">&amp;</span> transform the world of fitness</h2>
          <div class="lead"><p>Your purchase is backed by our 100% money-back job guarantee.</p><p>Land a position after certification or your tuition is on us.</p></div>
          <p class="why"><span class="lk">Why</span> It Works</p>
        </div>
        ${cards.map(([f, h, t, ti, tx]) => `<div class="icard"><div class="img"><img src="${A}${f}" style="height:${h};top:${t}" alt=""></div><div class="b"><h3>${ti}</h3><p>${tx}</p></div></div>`).join("")}
        <div class="brands">
          <p>Trusted by <span class="lk">Top Fitness Brands</span></p>
          <div class="row">${brands.map(logo).join("")}</div>
          <div class="row">${brands2.map(logo).join("")}</div>
        </div>
      </div>
    </section>`;
  }

  function popular() {
    return `<section class="sec-dark popular"><div class="in">
      <h2 class="h2">Check out our most popular bundle</h2>
      <button class="btn btn-outline-light legacy-btn hot" data-act="toElite">View Elite Trainer</button>
    </div></section>`;
  }

  function reviews() {
    return `<section class="reviews">
      <h2 class="h2">What <span class="lk">our customers</span> are saying</h2>
      <div class="frame"><img src="${A}reviews.png" alt="Customer reviews: Excellent, 4.5 stars, based on 16,233 reviews on Trustpilot"></div>
    </section>`;
  }

  function hear() {
    return `<section class="hear">
      <div class="bg"><img src="${A}hear-bg.png" alt=""></div>
      <h2 class="h2">Hear what <span class="y">makes ISSA the choice</span> for fitness professionals</h2>
      <div class="tcard b2"><div class="img"><img src="${A}hear-2.png" style="height:139.08%;top:-3.47%" alt=""></div><div class="b" style="height:auto"><h3>Clint O.<span>ISSA Certified PT</span></h3><p>I am amazed at how many doors have opened since I received my certificate. I've discovered my passion for teaching group HiT classes and have become a brand ambassador.</p></div></div>
      <div class="tcard a"><div class="img"><img src="${A}hear-1.png" style="height:278.02%;top:-63.33%" alt=""></div><div class="b"><h3>Julie P.<span>ISSA Certified PT</span></h3><p>Thanks to ISSA, I gained the knowledge to achieve my fitness goals, and I'm thrilled to now support others on their journey to success.</p></div></div>
      ${pager(3, 0, "hear-dot.svg")}
    </section>`;
  }

  function faq() {
    const qs = ["Why should I choose ISSA to become a certified personal trainer?", "What careers can I pursue with a ISSA certification?", "What is the job guarantee and how do I qualify?", "Where is the ISSA certification accepted?"];
    return `<section class="faq">
      <h2 class="h2" style="color:var(--issa-black)"><span class="lk">Frequently</span> asked questions</h2>
      <div class="acc">
        ${qs.map((q) => `<div class="item"><div class="q"><span>${q}</span><img src="${A}faq-arrow.svg" width="24" height="24" alt=""></div><img class="line" src="${A}faq-line.svg" alt=""></div>`).join("")}
        <p class="see">See More</p>
      </div>
    </section>`;
  }

  function evalKit() {
    return `<section class="evalk">
      <div class="col">
        <div class="copy">
          <h2>Take the first step - get your ISSA evaluation kit today!</h2>
          <p>Our evaluation kit will help you:</p>
          <ul><li>See if you have the five qualities every successful trainer needs</li><li>Discover which program is right for you through the personalized quiz</li><li>Take a look at the exact career paths you’ll be able to take</li></ul>
          <p>By the end, you’ll know if ISSA is right for you. And you’ll have everything you need to enroll on hand.</p>
        </div>
        <div class="fields">${["First Name", "Last Name", "Email Address", "Phone Number"].map((f) => `<p>${f}</p><img src="${A}eval-line.svg" alt="">`).join("")}</div>
        <div class="consent">
          <p>By clicking the button below you consent to receiving calls and emails from ISSA.</p>
          <div class="row"><div class="cbx"><div class="cb" aria-checked="true" role="img" aria-label="Checked"><span class="box">${CHECK}</span></div></div>
          <p>I consent to receive Marketing, Customer care updates, and Account notifications via SMS from ISSA about its services or information related to my account. Message and data rates apply. Reply STOP to opt out. Reply HELP for assistance. Message frequency may vary. For full terms, please see our <span class="u">Privacy Policy</span></p></div>
        </div>
        <button class="btn btn-primary legacy-btn">Schedule a Call</button>
        <div><div class="links"><span class="u">Terms of Service</span><span class="u">Privacy Policy</span></div><p style="font-size:14px;line-height:21px;margin-top:8px">No cost. No obligation</p></div>
      </div>
      <div class="photo"><img src="${A}eval-photo.jpg" alt=""></div>
    </section>`;
  }

  function footer() {
    const g = (head, links, mt = 16) => `<div class="grp" style="margin-top:${mt}px"><p>${head}</p>${links.map((l) => (typeof l === "string" ? `<span class="bl">${l}</span>` : l)).join("")}</div>`;
    return `<footer class="foot">
      <div class="flogo"><img src="${A}ft-logo-fill.svg" width="169.743" height="35.8583" alt="ISSA"></div>
      <img class="rule" src="${A}ft-rule1.svg" style="margin-top:20px" alt="">
      <p style="margin-top:21px">LEARN</p>
      ${g("Popular Courses", [`<a class="hot" data-go="product" style="align-self:flex-start">Personal Trainer</a>`, "CPR", "Certified Nutrition Coach", "View All"])}
      ${g("Additional Learning Opportunities", ["Study Expansion Pack", "Fast Tract"])}
      ${g("New Courses", ["Functional Aging Courses", "GLP-1 Weight Loss Support Training", "Entrenador de Fuerza y<br>Acondicionamiento"])}
      <p style="margin-top:16px">HELP</p>
      ${g("Customer Support", ["Contact Us", "FAQs", "Printed Text Books", "Military"])}
      ${g("Reviews", ["Policies", "Job Guarantee", "Terms and Conditions"])}
      <p style="margin-top:16px">ABOUT</p>
      ${g("More About ISSA", ["About ISSA", "Accreditations &amp; Affiliations", "Blog", "ISSA News &amp; Media Coverage", "Careers", "Partnerships", "Partner Discounts", "Become an Affiliate", "BMI Calculator"])}
      ${g("Resources for Gyms", [])}
      <span class="bl" style="margin-top:16px">Certification Validation</span>
      <img class="rule" src="${A}ft-rule2.svg" style="margin-top:20px" alt="">
      <div class="social" style="margin-top:21px">${["facebook", "instagram", "x", "youtube"].map((s) => `<img src="${A}ft-${s}.svg" width="32" height="32" alt="${s}">`).join("")}</div>
      <p class="c" style="margin-top:20px">United States (866) 506-3874</p>
      <p class="c" style="margin-top:10px">International (805) 745-8111</p>
      <img class="rule" src="${A}ft-rule3.svg" style="margin-top:20px" alt="">
      <p class="c" style="margin-top:21px;font:italic 400 12px/normal var(--font-display)">Check out our most popular bundle:</p>
      <button class="btn btn-primary legacy-btn hot" data-act="toElite" style="margin-top:19px;align-self:center">LEARN MORE</button>
      <img class="rule" src="${A}ft-rule3.svg" style="margin-top:20px" alt="">
      <p class="small discl" style="margin-top:21px">1Applicable taxes and fees are added at checkout.|Start for Free is available in U.S. and Canada only.|Quebec Tax Registration Number: NR00037753.|Canada Simplified GST/HST Business Number:711256701RT0001</p>
      <p class="small" style="margin-top:20px">©2025 ISSA. All rights reserved.</p>
      <p class="small" style="margin-top:12px">ISSA - 11201 N. Tatum Blvd Ste 300 PMB 28048 - Phoenix AZ 85028-6039 - USA</p>
      <div class="legal" style="margin-top:20px"><span>Cookie Preferences</span><span>Terms and Conditions</span></div>
      <button class="top hot" data-act="top" style="margin-top:16px">BACK TO TOP <img src="${A}ft-top.svg" width="10" height="8" alt=""></button>
    </footer>`;
  }

  /* ---------- Product page ---------- */
  function heroProduct() {
    return `<section class="hero">
      <img class="pattern" src="${A}hero-pattern.png" alt="">
      <div class="swash"><img src="${A}hero-swash.svg" width="674" height="314.165" alt=""></div>
      <div class="copy">
        <h1>Certified Personal Trainer</h1>
        <p>Take our internationally recognized and accredited personal trainer certification course.</p>
        <button class="btn btn-primary legacy-btn hot" data-act="buy" data-id="cpt" style="padding-inline:20px">Buy Now</button>
      </div>
      <img class="pdp-woman" src="${A}pdp-woman.png" alt="">
      <img class="jg" src="${A}pdp-job-guarantee.svg" width="147" height="128" alt="Find a job or your money back">
    </section>`;
  }

  function productBody() {
    const up = (t, s, d, price, rest) => `<div class="upcard"><div class="stack"><p class="t">${t}</p><p class="s">${s}</p><p class="d">${d}<br><br><b>${price}</b>${rest}</p></div><button class="btn btn-outline legacy-btn w160">Learn More</button></div>`;
    return `<section class="sec-dark pdp">
      <div class="w buy">
        <h2 class="h2"><span style="color:var(--issa-white)">Become a</span><span class="y"> Certified Personal Trainer</span></h2>
        <div class="opts">
          <p>Payment options:</p>
          <div class="rows">
            <div class="r g"><b>$49</b><span>Start for</span></div>
            <div class="r"><b>$89</b><span>.00/mo x12</span></div>
            <div class="r"><b>$868</b><span>.00 x1—<strong style="font-weight:600">SAVE $200</strong></span></div>
          </div>
        </div>
        <p class="yl">Make monthly payments at 0% interest.<br><br>Or save $ by paying in full<br>Choose in cart—cancel within 7 days for refund*</p>
        <p class="fine">Taxes/other fees not included above.*</p>
        <button class="btn btn-primary legacy-btn w160 hot" data-act="buy" data-id="cpt" style="padding-inline:20px">Buy Now</button>
      </div>
      <img class="rule" src="${A}pdp-rule.svg" width="350" height="2" alt="">
      <div class="w inc">
        <p class="t28">Includes</p>
        <ul><li>Personal Trainer Certification course</li><li>NCCPT NCCA-accredited exam or open-book exam</li><li>Online textbook, quizzes, and forums</li><li>CPR/AED certification course</li><li>ISSA’s Job Guarantee*</li></ul>
      </div>
      <img class="rule" src="${A}pdp-rule.svg" width="350" height="2" alt="">
      <p class="t28">Certification Upgrades</p>
      <div class="w ups">
        ${up("Fast Track", "Get certified fast", "4-week accelerated guided study to get you certified in record time.", "$99", " - Only available in cart with Certification purchase.")}
        ${up("Certify For Life", "One payment and no renewal fees", "Never pay another certification renewal fee - CPR and CEUs covered. ", "$199", " - Available in cart with Certification purchase.")}
      </div>
    </section>`;
  }

  /* ---------- Checkout kit ---------- */
  function steps(cur) {
    const labels = ["Cart", "Details", "Billing", "Payment"];
    const routes = ["cart", "details", "billing", "payment"];
    let h = "";
    labels.forEach((l, i) => {
      const n = i + 1;
      const cls = n < cur ? "done" : n === cur ? "cur" : "";
      const dot = n < cur ? CHECK : n;
      h += n < cur
        ? `<button class="step ${cls} hot" data-go="${routes[i]}" aria-label="Back to ${l}"><span class="dot">${dot}</span>${l}</button>`
        : `<div class="step ${cls}"${n === cur ? ' aria-current="step"' : ""}><span class="dot">${dot}</span>${l}</div>`;
      if (n < 4) h += `<div class="conn${n < cur ? " on" : ""}"><i></i></div>`;
    });
    return `<nav class="steps" aria-label="Checkout progress">${h}</nav>`;
  }

  function cartItem() {
    const it = item();
    const price = S.plan === "monthly" ? money(it.pr.total, false) : money(it.pr.full, false);
    const meta = it.spec ? `Online · Self-paced · + ${esc(it.spec)}` : "Online · Self-paced · NCCA-accredited exam";
    return `<div class="citem">
      <div class="thumb"><img src="${A}logo-white-thumb.svg" width="52" height="10.985" alt=""></div>
      <div class="info">
        <p class="t">${it.name}</p>
        <p class="m">${meta}</p>
        <div class="pr"><span>${price}</span><button class="tlink hot" data-act="remove">Remove</button></div>
      </div>
    </div>`;
  }

  const srow = (l, v, total) => `<div class="srow${total ? " total" : ""}"><span>${l}</span><span>${v}</span></div>`;

  function sumbar() {
    const open = S.summaryOpen;
    const det = open ? `<div class="det">
      ${cartItem()}
      <div class="rule-sub"></div>
      ${srow("Plan", S.plan === "monthly" ? "12 monthly payments" : "Pay in full")}
      ${srow("Taxes", "$0.00")}
      ${srow("Due today", money(dueToday()), true)}
    </div>` : "";
    return `<div class="sumbar">
      <button class="tgl hot" data-act="sum" aria-expanded="${open}">
        <img class="c" src="${A}summary-cart.svg" width="24" height="24" alt="">
        <span class="l">${open ? "Hide" : "Show"} order summary</span>
        <img class="ch" src="${A}summary-chevron-${open ? "up" : "down"}.svg" width="20" height="20" alt="">
        <span class="sp"></span><span class="v">${money(dueToday())}</span>
      </button>${det}
    </div>`;
  }

  function popt(kind) {
    const it = item();
    const sel = S.plan === kind;
    const label = kind === "full" ? "Pay in full" : "12 monthly payments";
    const price = kind === "full" ? money(it.pr.full, false) : `${money(it.pr.down, false)} today`;
    const desc = kind === "full"
      ? `One payment · Save ${money(it.pr.save, false)} (reg. ${money(it.pr.reg, false)})`
      : `Then ${money(it.pr.inst, false)}/mo for ${it.pr.n} months · 0% APR`;
    return `<button class="popt${sel ? " sel" : ""} hot" data-act="plan" data-v="${kind}" role="radio" aria-checked="${sel}">
      <span class="top"><span class="radio"><span class="ring"></span>${label}</span><span class="price">${price}</span></span>
      <span class="desc">${desc}</span>
    </button>`;
  }

  function tf(id, label, bind, value, extra = "") {
    return `<div class="tf"><label for="${id}">${label}</label><input id="${id}" data-bind="${bind}" value="${esc(value)}" ${extra}></div>`;
  }

  function checkbox(act, checked, label) {
    return `<button class="cb hot" data-act="${act}" role="checkbox" aria-checked="${checked}"><span class="target"><span class="box">${checked ? CHECK : ""}</span></span><span>${label}</span></button>`;
  }

  function selectField(act, value, placeholder) {
    return `<button class="selectf${value ? " filled" : ""} hot" data-act="${act}"><span>${esc(value || placeholder)}</span><img src="${A}${value ? "select-check" : "icon-plus"}.svg" width="20" height="20" alt=""></button>`;
  }

  /* ---------- Views ---------- */
  const views = {
    home() {
      return promo() + header() + heroHome() + bundles() + categories() + ceu() + jobGuarantee() + popular() + reviews() + hear() + faq() + evalKit() + footer();
    },

    product() {
      return promo() + header() + heroProduct() + productBody();
    },

    cart() {
      if (!S.item) {
        return header() + `<div class="co">${steps(1)}<div class="empty" style="padding:0">
          <h1 class="lato" style="font:700 36px/36px var(--font-display)">Your cart</h1>
          <p>Your cart is empty. Pick a certification or bundle to get started.</p>
          <button class="btn btn-primary hot" data-act="toBundles">See Certifications</button>
        </div></div>`;
      }
      const it = item();
      const monthly = S.plan === "monthly";
      const totals = monthly
        ? srow("Program total (12 payments)", money(it.pr.total)) + srow("Promo", "—") + srow("Taxes", "$0.00") + srow("Due today", money(it.pr.down), true)
        : srow("Subtotal", money(it.pr.reg)) + srow("Pay-in-full savings", "−" + money(it.pr.save)) + srow("Taxes", "$0.00") + srow("Due today", money(it.pr.full), true);
      return header() + `<div class="co">
        ${steps(1)}
        <div class="head"><h1>Your cart</h1></div>
        ${cartItem()}
        <div class="grp" role="radiogroup" aria-label="Choose how to pay"><p class="h6">Choose how to pay</p>${popt("full")}${popt("monthly")}</div>
        <div class="grp"><p class="h6">Add to your program</p>${selectField("addon", S.addon, "Add a specialization")}</div>
        <div class="promo-row"><div class="tf"><input id="promoCode" placeholder="Promo code" aria-label="Promo code"></div><button class="btn btn-apply">Apply</button></div>
        <div class="rule-sub"></div>
        <div class="totals">${totals}</div>
        <button class="btn btn-primary btn-block hot" data-go="details">Checkout</button>
        <p class="foot-note">Secure checkout · 100% Money Back Job Guarantee<br>Visa · Mastercard · American Express · Discover · PayPal</p>
      </div>`;
    },

    details() {
      const d = S.details;
      return header() + sumbar() + `<div class="co">
        ${steps(2)}
        <div class="head"><h1>Your details</h1><p>Already have an account? Sign in for faster checkout.</p></div>
        <div class="fields">
          ${tf("email", "Email", "details.email", d.email, 'type="email" autocomplete="email"')}
          <div class="two">${tf("first", "First name", "details.first", d.first, 'autocomplete="given-name"')}${tf("last", "Last name", "details.last", d.last, 'autocomplete="family-name"')}</div>
          ${tf("phone", "Phone", "details.phone", d.phone, 'type="tel" autocomplete="tel"')}
        </div>
        ${checkbox("news", d.news, "Email me ISSA news and exclusive offers")}
        <button class="btn btn-primary btn-block hot" data-go="billing">Continue to billing</button>
        <div class="center-row"><button class="tlink hot" data-go="cart">Return to cart</button></div>
      </div>`;
    },

    billing() {
      const b = S.billing;
      return header() + sumbar() + `<div class="co">
        ${steps(3)}
        <div class="head"><h1>Billing address</h1></div>
        <div class="fields">
          <div class="fsel"><span>Country</span>${selectField("country", b.country, "Select country")}</div>
          ${tf("street", "Street address", "billing.street", b.street, 'autocomplete="address-line1"')}
          <div class="tf"><input id="apt" data-bind="billing.apt" value="${esc(b.apt)}" placeholder="Apt, suite, etc. (optional)" aria-label="Apt, suite, etc. (optional)"></div>
          ${tf("city", "City", "billing.city", b.city, 'autocomplete="address-level2"')}
          <div class="two end"><div class="fsel"><span>State</span>${selectField("state", b.state, "Select state")}</div>${tf("zip", "ZIP code", "billing.zip", b.zip, 'inputmode="numeric" autocomplete="postal-code"')}</div>
        </div>
        ${checkbox("saveInfo", b.save, "Save this information for next time")}
        <button class="btn btn-primary btn-block hot" data-go="payment">Continue to payment</button>
        <div class="center-row"><button class="tlink hot" data-go="details">Return to details</button></div>
      </div>`;
    },

    payment() {
      const it = item();
      const p = S.pay;
      const monthly = S.plan === "monthly";
      const card = p.method === "card";
      const method = (kind, label, desc) => {
        const sel = p.method === kind;
        return `<button class="popt${sel ? " sel" : ""} hot" data-act="method" data-v="${kind}" role="radio" aria-checked="${sel}"><span class="top"><span class="radio"><span class="ring"></span>${label}</span></span><span class="desc">${desc}</span></button>`;
      };
      const paypalDesc = p.method === "paypal"
        ? (monthly ? "You’ll log in to PayPal to approve the down payment and monthly installments." : "You’ll log in to PayPal to approve your payment.")
        : "You’ll finish enrolling on PayPal.";
      const cardFields = card ? `<div class="cardfields">
          <div class="tf${p.declined ? " err" : ""}" id="cardField"><label for="cardNumber">Card number</label><input id="cardNumber" data-bind="pay.number" value="${esc(p.number)}" inputmode="numeric" autocomplete="cc-number">${p.declined ? '<p class="help">Your card was declined. Try another card or pay with PayPal.</p>' : ""}</div>
          ${tf("cardName", "Name on card", "pay.name", p.name, 'autocomplete="cc-name"')}
          <div class="two">${tf("cardExp", "Expiration (MM / YY)", "pay.exp", p.exp, 'autocomplete="cc-exp"')}${tf("cardCvc", "Security code", "pay.cvc", p.cvc, 'autocomplete="cc-csc"')}</div>
        </div>` : "";
      const pr = it.pr;
      const disclosure = monthly ? `<div class="disc">
          <p class="t">Payment plan summary</p>
          ${srow("Cash price", money(pr.total))}
          ${srow("Down payment (today)", money(pr.down))}
          ${srow("Amount financed", money(pr.total - pr.down))}
          ${srow("Annual Percentage Rate (APR)", "0.00%")}
          ${srow("Finance charge", "$0.00")}
          ${srow("Monthly installments", `${pr.n} × ${money(pr.inst)}`)}
          ${srow("First installment due", "Nov 14, 2026")}
          <div class="rule-sub"></div>
          ${srow("Total of payments", money(pr.total), true)}
          <p class="n">Installments are charged automatically to your payment method on the same day each month. No prepayment penalty.</p>
        </div>` : "";
      const cta = !card ? "Continue to PayPal" : monthly ? "Enroll in payment plan" : "Complete purchase";
      const hint = card
        ? `<p class="foot-note">${monthly ? `You’ll be charged ${money(pr.down)} today. Next payment: ${money(pr.inst)} on Nov 14, 2026.` : `You’ll be charged ${money(pr.full)} today.`}</p>`
        : "";
      const agreeLabel = monthly ? "I’ve read and agree to the Payment Plan Agreement and Terms &amp; Conditions." : "I’ve read and agree to the Terms &amp; Conditions.";
      return header() + sumbar() + `<div class="co">
        ${steps(4)}
        <div class="head"><h1>Payment</h1><p>All transactions are secure and encrypted.</p></div>
        <div class="pm" role="radiogroup" aria-label="Payment method">
          ${method("card", "Credit or debit card", "Visa, Mastercard, American Express, Discover")}
          ${cardFields}
          ${method("paypal", "PayPal", paypalDesc)}
        </div>
        ${disclosure}
        ${checkbox("agree", p.agree, agreeLabel)}
        <button class="btn btn-primary btn-block hot" data-act="enroll"${p.agree ? "" : ' aria-disabled="true"'}>${cta}</button>
        ${hint}
        <div class="center-row"><button class="tlink hot" data-go="billing">Return to billing</button></div>
      </div>`;
    },

    confirmation() {
      const it = item();
      const pr = it.pr;
      const monthly = S.plan === "monthly";
      const schedule = monthly
        ? `<p class="t">Payment schedule</p>${srow("Paid today", money(pr.down))}${srow("Next payment · Nov 14, 2026", money(pr.inst))}${srow("Remaining installments", `${pr.n} × ${money(pr.inst)}`)}<div class="rule-sub"></div>${srow("Total of payments", money(pr.total), true)}`
        : `<p class="t">Payment summary</p>${srow("Paid today", money(pr.full))}${srow("Pay-in-full savings", "−" + money(pr.save))}<div class="rule-sub"></div>${srow("Total paid", money(pr.full), true)}`;
      const li = (t) => `<div class="li"><span>•</span><span>${t}</span></div>`;
      return header() + `<div class="co center">
        <div class="badge"><img src="${A}success-check.svg" width="36" height="36" alt=""></div>
        <div class="done-head"><h1>You’re enrolled!</h1><p>Order #ISSA-1048572<br>A confirmation was sent to ${esc(S.details.email)}</p></div>
        <div class="box16"><p class="t">What happens next</p>${li("Check your inbox for your ISSA login")}${li("Start your course in the ISSA Learning Center")}${li("Your NCCA-accredited exam is included")}</div>
        <div class="box16 muted">${schedule}</div>
        <button class="btn btn-primary btn-block hot" data-act="restart">Start learning</button>
        <div class="center-row"><span class="tlink">View order details</span></div>
      </div>`;
    },
  };

  /* ---------- Routing ---------- */
  const CHECKOUT = ["details", "billing", "payment", "confirmation"];
  let route = "home";

  function render(keepScroll) {
    const y = screen.scrollTop;
    if (!keepScroll) S.bundleIdx = 0;
    const tracks = keepScroll ? [...screen.querySelectorAll(".track")].map((t) => t.scrollLeft) : [];
    screen.innerHTML = views[route]();
    screen.scrollTop = keepScroll ? y : 0;
    screen.querySelectorAll(".track").forEach((t, i) => { if (tracks[i]) t.scrollLeft = tracks[i]; });
    document.querySelectorAll("#jump button").forEach((b) => b.setAttribute("aria-current", String(b.dataset.jump === route)));
  }

  function go(r, after) {
    if (CHECKOUT.includes(r) && !S.item) S.item = { id: "cpt" };
    closeModal();
    if (location.hash.slice(1) === r) { route = r; render(false); }
    else { route = r; location.hash = r; }
    if (after) requestAnimationFrame(after);
  }

  window.addEventListener("hashchange", () => {
    const r = location.hash.slice(1);
    route = views[r] ? r : "home";
    if (CHECKOUT.includes(route) && !S.item) S.item = { id: "cpt" };
    render(false);
  });

  function scrollToId(id, extra) {
    const el = document.getElementById(id);
    if (!el) return;
    screen.scrollTo({ top: el.offsetTop, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    if (extra) extra();
  }
  const toBundles = (cardId) => {
    const run = () => scrollToId("bundles", () => {
      if (!cardId) return;
      const track = document.getElementById("bundleTrack");
      const card = track && track.querySelector(`[data-card="${cardId}"]`);
      if (card) track.scrollTo({ left: card.offsetLeft - 20, behavior: "smooth" });
    });
    if (route !== "home") go("home", () => requestAnimationFrame(run));
    else run();
  };

  /* ---------- Selection Modal ---------- */
  let modal = null;

  // Only the first draw slides the sheet in; picks redraw it in place
  let enterTimer;
  function openModal(cfg, trigger) {
    modal = { ...cfg, temp: cfg.value || null, trigger };
    if (trigger) trigger.classList.add("active");
    layer.classList.add("enter");
    clearTimeout(enterTimer);
    enterTimer = setTimeout(() => layer.classList.remove("enter"), 300);
    drawModal();
  }
  function drawModal() {
    if (!modal) return;
    const on = !!modal.temp;
    layer.innerHTML = `<div class="scrim" data-m="close"></div>
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle">
        <div class="handle"></div>
        <div class="hd"><h2 id="sheetTitle">${modal.title}</h2><button class="close hot" data-m="close" aria-label="Close"><img src="${A}modal-close.svg" width="24" height="24" alt=""></button></div>
        <p class="sub">${modal.sub}</p>
        <div class="mopts" role="listbox">${modal.options.map((o) => {
          const sel = o === modal.temp;
          return `<button class="orow${sel ? " sel" : ""} hot dot-in" data-m="pick" data-v="${esc(o)}" role="option" aria-selected="${sel}"><span>${esc(o)}</span><img src="${A}option-${sel ? "check" : "plus"}.svg" width="24" height="24" alt=""></button>`;
        }).join("")}</div>
        <div class="acts">
          <button class="btn btn-primary btn-block${on ? " hot" : ""}" data-m="confirm"${on ? "" : ' aria-disabled="true"'}>Confirm</button>
          ${modal.removable === false ? "" : `<button class="btn btn-outline-light btn-block${on ? " hot" : ""}" data-m="remove"${on ? "" : ' aria-disabled="true"'}>Remove selection</button>`}
        </div>
      </div>`;
    layer.hidden = false;
  }
  function closeModal() {
    if (modal && modal.trigger) modal.trigger.classList.remove("active");
    modal = null;
    layer.hidden = true;
    layer.innerHTML = "";
  }

  layer.addEventListener("click", (e) => {
    const t = e.target.closest("[data-m]");
    if (!t || !modal) return;
    const m = t.dataset.m;
    if (t.getAttribute("aria-disabled") === "true") return;
    if (m === "close") { const dirty = modal.dirty; closeModal(); if (dirty) render(true); }
    else if (m === "pick") { modal.temp = t.dataset.v; drawModal(); }
    else if (m === "remove") { const cb = modal.onRemove; modal.temp = null; modal.dirty = true; if (cb) cb(); drawModal(); }
    else if (m === "confirm") { const v = modal.temp; const cb = modal.onConfirm; closeModal(); cb(v); }
  });

  const specModal = (id, then, trigger) => openModal({
    title: "Select Specialization",
    sub: "Choose one specialization to add to your bundle.",
    options: SPECIALIZATIONS,
    value: S.specs[id],
    onConfirm: (v) => { S.specs[id] = v; render(true); if (then) then(); },
    onRemove: () => { S.specs[id] = null; },
  }, trigger || document.querySelector(`[data-act="pickSpec"][data-id="${id}"]`));

  /* ---------- Actions ---------- */
  function addToCart(id) {
    S.item = { id };
    S.plan = "monthly";
    S.summaryOpen = false;
    S.pay.declined = false;
    go("cart");
  }

  const actions = {
    closePromo() { S.promo = false; render(true); },
    toBundles() { toBundles(); },
    toElite() { toBundles("et"); },
    top() { screen.scrollTo({ top: 0, behavior: "smooth" }); },
    pickSpec(el) { specModal(el.dataset.id); },
    slide(el) { const t = document.getElementById(el.dataset.track); if (t) slideTo(t, +el.dataset.i); },
    buy(el) {
      const id = el.dataset.id;
      if (id !== "cpt" && !S.specs[id]) specModal(id, () => addToCart(id));
      else addToCart(id);
    },
    remove() { S.item = null; S.addon = null; S.summaryOpen = false; go("cart"); },
    plan(el) { S.plan = el.dataset.v; render(true); },
    addon() {
      openModal({
        title: "Select Specialization", sub: "Choose one specialization to add to your program.", options: SPECIALIZATIONS, value: S.addon,
        onConfirm: (v) => { S.addon = v; render(true); }, onRemove: () => { S.addon = null; },
      });
    },
    sum() { S.summaryOpen = !S.summaryOpen; render(true); },
    news() { S.details.news = !S.details.news; render(true); },
    saveInfo() { S.billing.save = !S.billing.save; render(true); },
    country() {
      openModal({ title: "Select Country", sub: "Choose the country for your billing address.", options: COUNTRIES, value: S.billing.country, removable: false, onConfirm: (v) => { S.billing.country = v; render(true); } });
    },
    state() {
      openModal({ title: "Select State", sub: "Choose the state for your billing address.", options: STATES, value: S.billing.state, removable: false, onConfirm: (v) => { S.billing.state = v; render(true); } });
    },
    method(el) { S.pay.method = el.dataset.v; S.pay.declined = false; render(true); },
    agree() { S.pay.agree = !S.pay.agree; render(true); },
    enroll() {
      if (!S.pay.agree) return;
      if (S.pay.method === "card" && S.pay.number.replace(/\D/g, "") === "4000000000000002") {
        S.pay.declined = true;
        render(true);
        const f = document.getElementById("cardField");
        if (f) screen.scrollTo({ top: Math.max(0, f.getBoundingClientRect().top - screen.getBoundingClientRect().top + screen.scrollTop - 120), behavior: "smooth" });
        return;
      }
      S.pay.declined = false;
      go("confirmation");
    },
    restart() { S = freshState(); go("home"); },
  };

  /* ---------- Events ---------- */
  let flashTimer;
  function flash() {
    device.classList.add("flash");
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => device.classList.remove("flash"), 700);
  }

  screen.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go], [data-act]");
    if (t) {
      if (t.getAttribute("aria-disabled") === "true") return;
      if (t.dataset.go) go(t.dataset.go);
      else if (actions[t.dataset.act]) actions[t.dataset.act](t);
      return;
    }
    if (!e.target.closest("input, label")) flash();
  });

  screen.addEventListener("input", (e) => {
    const el = e.target;
    if (!el.dataset.bind) return;
    const [grp, key] = el.dataset.bind.split(".");
    S[grp][key] = el.value;
    if (el.id === "cardNumber" && S.pay.declined) {
      S.pay.declined = false;
      const f = document.getElementById("cardField");
      f.classList.remove("err");
      const h = f.querySelector(".help");
      if (h) h.remove();
    }
  });

  // Keep the bundle carousel pager in step with the swipe position
  screen.addEventListener("scroll", (e) => {
    if (e.target.id !== "bundleTrack") return;
    const idx = Math.max(0, Math.min(3, Math.round(e.target.scrollLeft / 264)));
    if (idx === S.bundleIdx) return;
    S.bundleIdx = idx;
    const p = document.getElementById("bundlePager");
    if (p) p.outerHTML = pager(4, idx, "dots-inactive.svg", "bundlePager", "bundleTrack");
  }, true);

  // Mouse drag-to-swipe for carousels (touch and trackpads already scroll natively)
  let drag = null;
  let suppressClick = false;
  function slideTo(track, i) {
    const cards = track.children;
    const card = cards[Math.max(0, Math.min(cards.length - 1, i))];
    track.scrollTo({ left: card.offsetLeft - track.firstElementChild.offsetLeft, behavior: "smooth" });
  }
  screen.addEventListener("pointerdown", (e) => {
    const track = e.target.closest(".track");
    if (!track || e.pointerType !== "mouse" || e.button !== 0) return;
    drag = { track, x: e.clientX, left: track.scrollLeft, moved: false, t: performance.now() };
  });
  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < 6) return;
    if (!drag.moved) { drag.moved = true; drag.track.classList.add("dragging"); }
    drag.track.scrollLeft = drag.left - dx;
  });
  window.addEventListener("pointerup", (e) => {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.moved) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
    d.track.classList.remove("dragging");
    const step = d.track.children[1] ? d.track.children[1].offsetLeft - d.track.children[0].offsetLeft : 264;
    const dx = e.clientX - d.x;
    const fast = Math.abs(dx) / (performance.now() - d.t) > 0.4;
    const from = Math.round(d.left / step);
    let i = Math.round(d.track.scrollLeft / step);
    if (fast && i === from) i += dx < 0 ? 1 : -1;
    slideTo(d.track, i);
  });
  screen.addEventListener("click", (e) => {
    if (suppressClick) { e.stopPropagation(); e.preventDefault(); }
  }, true);

  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal) { const dirty = modal.dirty; closeModal(); if (dirty) render(true); } });

  // Review panel
  const panel = document.getElementById("panel");
  document.getElementById("hotToggle").addEventListener("change", (e) => device.classList.toggle("show-hot", e.target.checked));
  document.getElementById("jump").addEventListener("click", (e) => {
    const b = e.target.closest("[data-jump]");
    if (!b) return;
    panel.classList.remove("open");
    if (b.dataset.jump === "bundles") return toBundles();
    if (b.dataset.jump === "cart" && !S.item) S.item = { id: "cpt" };
    go(b.dataset.jump);
  });
  document.getElementById("reset").addEventListener("click", () => { S = freshState(); panel.classList.remove("open"); go("home"); });
  document.getElementById("panelFab").addEventListener("click", () => panel.classList.add("open"));
  document.getElementById("panelClose").addEventListener("click", () => panel.classList.remove("open"));

  const initial = location.hash.slice(1);
  route = views[initial] ? initial : "home";
  if (CHECKOUT.includes(route) && !S.item) S.item = { id: "cpt" };
  render(false);
})();
