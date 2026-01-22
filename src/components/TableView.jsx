import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";

export const TableView = forwardRef(function TableView(
  {
    table,
    title,
    highlightCells = [],
    originalTable = null,
    zoom = 100,
    onZoomIn,
    onZoomOut,
    onSyncScroll,
    syncScrollEnabled = false,
  },
  ref
) {
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Expose scroll methods to parent
  useImperativeHandle(ref, () => ({
    scrollTo: (top, left) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = top;
        containerRef.current.scrollLeft = left;
      }
    },
    getScroll: () => {
      if (containerRef.current) {
        return {
          top: containerRef.current.scrollTop,
          left: containerRef.current.scrollLeft,
        };
      }
      return { top: 0, left: 0 };
    },
  }));

  // Handle scroll with cmd/ctrl held
  const handleScroll = (e) => {
    if (syncScrollEnabled && onSyncScroll && containerRef.current) {
      onSyncScroll(
        containerRef.current.scrollTop,
        containerRef.current.scrollLeft
      );
    }
  };

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

  const getOriginalValue = (rowIdx, colName) => {
    if (originalTable && originalTable.rows[rowIdx]) {
      return originalTable.rows[rowIdx][colName] || "";
    }
    return null;
  };

  // Check if a row matches the search term
  const rowMatchesSearch = (row) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(term)
    );
  };

  // Check if a specific cell matches the search term
  const cellMatchesSearch = (value) => {
    if (!searchTerm.trim()) return false;
    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
  };

  const handleCellMouseEnter = (e, rowIdx, colName, currentValue) => {
    if (!isHighlighted(rowIdx, colName)) return;

    const originalValue = getOriginalValue(rowIdx, colName);
    if (originalValue === null) return;

    const rect = e.target.getBoundingClientRect();
    setTooltip({
      x: rect.left,
      y: rect.bottom + 4,
      original: originalValue,
      current: currentValue,
    });
  };

  const handleCellMouseLeave = () => {
    setTooltip(null);
  };

  // Count matching rows for display
  const matchCount = table
    ? table.rows.filter((row) => rowMatchesSearch(row)).length
    : 0;

  return (
    <div className="table-view">
      <div className="table-header">
        {title && <div className="table-title">{title}</div>}
        <div className="header-controls">
          <div className="zoom-controls">
            <button onClick={onZoomOut} className="zoom-btn">
              −
            </button>
            <span className="zoom-level">{zoom}%</span>
            <button onClick={onZoomIn} className="zoom-btn">
              +
            </button>
          </div>
          <div className="search-controls">
            <input
              type="text"
              className="search-input"
              placeholder="Find..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <span className="search-count">
                {matchCount}/{table?.rows?.length || 0}
              </span>
            )}
          </div>
        </div>
      </div>
      <div
        className="table-container"
        ref={containerRef}
        onScroll={handleScroll}
      >
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
            {table.rows.map((row, rowIdx) => {
              if (!rowMatchesSearch(row)) return null;
              return (
                <tr key={rowIdx}>
                  <td className="row-num">{rowIdx + 1}</td>
                  {table.headers.map((header, colIdx) => {
                    const value = row[header] || "";
                    const highlighted = isHighlighted(rowIdx, header);
                    const searchMatch = cellMatchesSearch(value);
                    const cellClass = [
                      highlighted ? "highlighted" : "",
                      searchMatch ? "search-match" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <td
                        key={colIdx}
                        className={cellClass || undefined}
                        onMouseEnter={
                          highlighted
                            ? (e) => handleCellMouseEnter(e, rowIdx, header, value)
                            : undefined
                        }
                        onMouseLeave={highlighted ? handleCellMouseLeave : undefined}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {tooltip && (
        <div
          className="cell-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="tooltip-row original">
            <span className="tooltip-label">−</span>
            <span className="tooltip-value">{tooltip.original || "(empty)"}</span>
          </div>
          <div className="tooltip-row current">
            <span className="tooltip-label">+</span>
            <span className="tooltip-value">{tooltip.current || "(empty)"}</span>
          </div>
        </div>
      )}
    </div>
  );
});
