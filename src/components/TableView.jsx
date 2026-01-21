export function TableView({
  table,
  title,
  highlightCells = [],
  zoom = 100,
  onZoomIn,
  onZoomOut,
}) {
  if (!table || !table.headers || table.headers.length === 0) {
    return (
      <div className="table-view empty">
        <p>{title ? `No ${title.toLowerCase()} loaded` : "No data"}</p>
      </div>
    );
  }

  const isHighlighted = (rowIdx, colName) => {
    return highlightCells.some(
      (cell) => cell.row === rowIdx && cell.col === colName
    );
  };

  return (
    <div className="table-view">
      <div className="table-header">
        {title && <div className="table-title">{title}</div>}
        <div className="zoom-controls">
          <button onClick={onZoomOut} className="zoom-btn">−</button>
          <span className="zoom-level">{zoom}%</span>
          <button onClick={onZoomIn} className="zoom-btn">+</button>
        </div>
      </div>
      <div className="table-container">
        <table style={{ fontSize: `${zoom}%` }}>
          <thead>
            <tr>
              <th className="row-num">#</th>
              {table.headers.map((header, idx) => (
                <th key={idx}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="row-num">{rowIdx + 1}</td>
                {table.headers.map((header, colIdx) => (
                  <td
                    key={colIdx}
                    className={isHighlighted(rowIdx, header) ? "highlighted" : ""}
                  >
                    {row[header] || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
