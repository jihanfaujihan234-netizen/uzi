export default function FolderCard({ folder, onOpen }) {
  return (
    <button
      type="button"
      className="folder-card"
      onClick={() => onOpen(folder.id)}
      aria-label={`Buka folder ${folder.label} (${folder.count} item)`}
    >
      <span className="folder-art" aria-hidden="true">
        <span className="folder-back" />
        <span className="folder-tab" />
        <span className="folder-sheets">
          {folder.images.map((image, index) => (
            <span className="folder-sheet" key={image} style={{ '--sheet': index }}>
              <img src={image} alt="" loading="lazy" decoding="async" />
            </span>
          ))}
        </span>
        <span className="folder-front">
          <span className="folder-meta">
            <span className="folder-count">{folder.count}</span>
            <span className="folder-label">{folder.label}</span>
          </span>
          <span className="folder-dots">
            <span />
            <span />
            <span />
          </span>
        </span>
        <span className="folder-gloss" />
      </span>
    </button>
  )
}
