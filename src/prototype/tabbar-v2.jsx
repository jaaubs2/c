// Floating pill tab bar — icons only, active tab expands into a black pill with its label. Overrides window.UI.TabBar.
(() => {
const F = ({children, size=22}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{children}</svg>;
const FILLED = {
  home:     (s) => <F size={s}><path d="M11.3 3.3a1 1 0 0 1 1.4 0l7.5 6.6c.5.4.8 1 .8 1.7V19a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2v-7.4c0-.7.3-1.3.8-1.7l7.5-6.6z"/></F>,
  carnet:   (s) => <F size={s}><path d="M5 4a2 2 0 0 1 2-2h4v20H7a2 2 0 0 1-2-2V4z"/><path d="M13 2h4a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-4V2z" opacity=".55"/></F>,
  transmettre:(s) => <F size={s}><path d="M12 2.5l4.5 4.5a1 1 0 0 1-1.4 1.4L13 6.3V15a1 1 0 1 1-2 0V6.3L8.9 8.4a1 1 0 0 1-1.4-1.4L12 2.5z"/><path d="M4 13a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4a1 1 0 1 1 2 0v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-4a1 1 0 0 1 1-1z"/></F>,
  settings: (s) => <F size={s}><path d="M10.3 2.5a1 1 0 0 1 1-.8h1.4a1 1 0 0 1 1 .8l.3 1.8c.6.2 1.1.5 1.6.9l1.7-.7a1 1 0 0 1 1.2.4l.7 1.2a1 1 0 0 1-.2 1.3l-1.4 1.2c.1.6.1 1.2 0 1.8l1.4 1.2a1 1 0 0 1 .2 1.3l-.7 1.2a1 1 0 0 1-1.2.4l-1.7-.7c-.5.4-1 .7-1.6.9l-.3 1.8a1 1 0 0 1-1 .8h-1.4a1 1 0 0 1-1-.8l-.3-1.8a6 6 0 0 1-1.6-.9l-1.7.7a1 1 0 0 1-1.2-.4l-.7-1.2a1 1 0 0 1 .2-1.3l1.4-1.2a6 6 0 0 1 0-1.8L4.6 8.4a1 1 0 0 1-.2-1.3l.7-1.2a1 1 0 0 1 1.2-.4l1.7.7c.5-.4 1-.7 1.6-.9l.3-1.8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></F>,
  discover: (s) => <F size={s}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.2 6.3l-2.4 5.3-5.3 2.4 2.4-5.3 5.3-2.4z"/></F>,
  today:    (s) => <F size={s}><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1a3 3 0 0 1 3 3v2H3V7a3 3 0 0 1 3-3V3a1 1 0 0 1 1-1zM3 11h18v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8z"/></F>,
  respond:  (s) => <F size={s}><path d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 8.9 8.9 0 0 1-4.3-1.1L3.4 21l1.2-4A9 9 0 0 1 12 3z"/></F>,
  mic:      (s) => <F size={s}><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5.5 11a1 1 0 0 1 1 1 5.5 5.5 0 0 0 11 0 1 1 0 1 1 2 0 7.5 7.5 0 0 1-6.5 7.4V21h2.5a1 1 0 1 1 0 2h-7a1 1 0 1 1 0-2H11v-1.6A7.5 7.5 0 0 1 4.5 12a1 1 0 0 1 1-1z"/></F>,
};

function TabBar({tabs, current, onChange}){
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {tabs.map(t => {
        const active = t.id === current;
        const isMic = t.kind === "mic";
        const Filled = FILLED[isMic ? "mic" : t.id];
        const Glyph = (p) => <t.Icon size={p.size} sw={active ? 2.4 : 1.9}/>;
        return (
          <button key={t.id} className={"tab" + (active ? " on" : "") + (isMic ? " mic" : "")}
                  onClick={() => onChange(t.id)} aria-label={t.label} aria-current={active ? "page" : undefined}>
            <Glyph size={22}/>
          </button>
        );
      })}
    </nav>
  );
}
window.UI.TabBar = TabBar;
})();
