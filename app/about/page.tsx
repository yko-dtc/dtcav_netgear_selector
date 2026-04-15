export default function AboutPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <section className="rounded-[32px] border border-slate-900/10 bg-[color:var(--surface)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-900/75">
          Internal standard notes
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950">
          How this selector thinks
        </h2>
        <div className="mt-5 space-y-5 text-sm leading-7 text-slate-700">
          <p>
            The selector is tuned for access-layer AV-over-IP deployments that may
            carry Crestron NVX, Q-SYS Q-LAN, Dante, and similar multicast-heavy traffic.
            SFP+ uplinks matter because inter-switch transport is common in these systems.
          </p>
          <p>
            Rear-facing RJ45 access switches are the standard recommendation. The only
            front-facing exception is the approved compact 8-port model for small
            installs when that exception is deliberately enabled.
          </p>
          <p>
            Normal recommendation flow excludes 16-port specialty switches and keeps
            core / aggregation models visually separate so transport gear does not get
            mistaken for room-rack access hardware.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[32px] border border-amber-700/20 bg-amber-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-900/75">
            Required disclaimer
          </p>
          <p className="mt-3 text-sm leading-6 text-amber-950">
            This selector only recommends models from our approved internal Netgear AV
            switch list. Final design still requires engineering review for multicast
            behavior, uplinks, power, and AV traffic segregation.
          </p>
        </div>

        <div className="rounded-[32px] border border-slate-900/10 bg-[color:var(--surface)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Recommendation policy
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li>- 1-8 ports: use the compact 8-port exception only when explicitly allowed.</li>
            <li>- 9-24 ports: prioritize 24-port class access switches.</li>
            <li>- 25-48 ports: prioritize 48-port class access switches.</li>
            <li>- EtherCON and specialty core connector types stay out of normal access recommendations.</li>
            <li>- QSFP28 is not treated as interchangeable with SFP+.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
