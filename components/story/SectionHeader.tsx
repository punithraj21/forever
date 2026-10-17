// The eyebrow + light serif title + hairline used by every section on the
// home page (EventDetails, Weather, …), so the story page's tabs match it.
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-10 text-center sm:mb-12">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
        {eyebrow}
      </p>
      <h2 className="font-serif text-4xl font-light tracking-tight text-[#3a2030] sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 font-serif text-base italic text-[#7a5560] sm:text-lg">
          {subtitle}
        </p>
      )}
      <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
    </div>
  );
}
