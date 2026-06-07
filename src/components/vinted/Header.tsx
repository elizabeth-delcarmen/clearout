type Props = { needsDataCount: number };

export function Header({ needsDataCount }: Props) {
  return (
    <div className="sticky top-0 z-10 bg-primary pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[calc(1.5rem+env(safe-area-inset-top))] pb-5">
      <div className="text-label uppercase tracking-[2px] text-white/70 font-sans-ui">
        CLEAROUT
      </div>
      <h1 className="text-[22px] font-extrabold text-white mt-1">Listing Tracker</h1>
      {needsDataCount > 0 && (
        <div className="mt-3 inline-block rounded-[10px] bg-white/15 px-3 py-2 text-sm text-white font-sans-ui">
          ⏱ {needsDataCount} item{needsDataCount === 1 ? "" : "s"} need 24hr data
        </div>
      )}
    </div>
  );
}