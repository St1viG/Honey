import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLanguage } from "../i18n/LanguageContext";

const MIN_COL_WIDTH = 50;
const DEFAULT_COL_WIDTH = 150;
const ROW_HEIGHT = 32;

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
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [columnWidths, setColumnWidths] = useState({});
  const [resizing, setResizing] = useState(null);

  // Initialize column widths when table changes
  useEffect(() => {
    if (table?.headers) {
      setColumnWidths((prev) => {
        const newWidths = { ...prev };
        table.headers.forEach((header) => {
          if (!(header in newWidths)) {
            newWidths[header] = DEFAULT_COL_WIDTH;
          }
        });
        return newWidths;
      });
    }
  }, [table?.headers]);

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

  // Handle scroll sync
  const handleScroll = useCallback(() => {
    if (syncScrollEnabled && onSyncScroll && containerRef.current) {
      onSyncScroll(
        containerRef.current.scrollTop,
        containerRef.current.scrollLeft
      );
    }
  }, [syncScrollEnabled, onSyncScroll]);

  // Check if a row matches the search term
  const rowMatchesSearch = useCallback(
    (row) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return Object.values(row).some((val) =>
        String(val).toLowerCase().includes(term)
      );
    },
    [searchTerm]
  );

  // Memoize filtered rows to avoid recalculating on every render
  const filteredRows = useMemo(() => {
    if (!table?.rows) return [];
    return table.rows
      .map((row, originalIndex) => ({ row, originalIndex }))
      .filter(({ row }) => rowMatchesSearch(row));
  }, [table?.rows, rowMatchesSearch]);

  // Virtualizer for rows
  const rowVirtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  // Column resizing handlers
  const handleResizeStart = useCallback((e, header) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({
      header,
      startX: e.clientX,
      startWidth: 0, // Will be set from current width
    });
  }, []);

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      const currentWidth = columnWidths[resizing.header] || DEFAULT_COL_WIDTH;
      if (resizing.startWidth === 0) {
        setResizing((prev) => ({ ...prev, startWidth: currentWidth }));
        return;
      }
      const delta = e.clientX - resizing.startX;
      const newWidth = Math.max(MIN_COL_WIDTH, resizing.startWidth + delta);
      setColumnWidths((prev) => ({
        ...prev,
        [resizing.header]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, columnWidths]);

  const isHighlighted = useCallback(
    (rowIdx, colName) => {
      return highlightCells.some(
        (cell) => cell.row === rowIdx && cell.col === colName
      );
    },
    [highlightCells]
  );

  const getOriginalValue = useCallback(
    (rowIdx, colName) => {
      if (originalTable && originalTable.rows[rowIdx]) {
        return originalTable.rows[rowIdx][colName] || "";
      }
      return null;
    },
    [originalTable]
  );

  const cellMatchesSearch = useCallback(
    (value) => {
      if (!searchTerm.trim()) return false;
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    },
    [searchTerm]
  );

  const handleCellMouseEnter = useCallback(
    (e, rowIdx, colName, currentValue) => {
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
    },
    [isHighlighted, getOriginalValue]
  );

  const handleCellMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  // Calculate total table width
  const totalWidth = useMemo(() => {
    if (!table?.headers) return 0;
    const rowNumWidth = 50;
    const columnsWidth = table.headers.reduce(
      (sum, header) => sum + (columnWidths[header] || DEFAULT_COL_WIDTH),
      0
    );
    return rowNumWidth + columnsWidth;
  }, [table?.headers, columnWidths]);

  if (!table || !table.headers || table.headers.length === 0) {
    return (
      <div className="table-view empty">
        <p>{t.noData}</p>
      </div>
    );
  }

  const virtualRows = rowVirtualizer.getVirtualItems();

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
              placeholder={t.find}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <span className="search-count">
                {filteredRows.length}/{table?.rows?.length || 0}
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
        <div
          className="virtual-table"
          style={{
            fontSize: `${zoom}%`,
            width: totalWidth,
            minWidth: "100%",
          }}
        >
          {/* Sticky header */}
          <div className="virtual-thead">
            <div className="virtual-tr virtual-header-row">
              <div className="virtual-th row-num" style={{ width: 50 }}>
                #
              </div>
              {table.headers.map((header) => (
                <div
                  key={header}
                  className="virtual-th"
                  style={{ width: columnWidths[header] || DEFAULT_COL_WIDTH }}
                >
                  <span className="header-text">{header}</span>
                  <div
                    className="resize-handle"
                    onMouseDown={(e) => handleResizeStart(e, header)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Virtualized body */}
          <div
            className="virtual-tbody"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {virtualRows.map((virtualRow) => {
              const { row, originalIndex } = filteredRows[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  className="virtual-tr"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="virtual-td row-num" style={{ width: 50 }}>
                    {originalIndex + 1}
                  </div>
                  {table.headers.map((header) => {
                    const value = row[header] || "";
                    const highlighted = isHighlighted(originalIndex, header);
                    const searchMatch = cellMatchesSearch(value);
                    const cellClass = [
                      "virtual-td",
                      highlighted ? "highlighted" : "",
                      searchMatch ? "search-match" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <div
                        key={header}
                        className={cellClass}
                        style={{
                          width: columnWidths[header] || DEFAULT_COL_WIDTH,
                        }}
                        onMouseEnter={
                          highlighted
                            ? (e) =>
                                handleCellMouseEnter(
                                  e,
                                  originalIndex,
                                  header,
                                  value
                                )
                            : undefined
                        }
                        onMouseLeave={
                          highlighted ? handleCellMouseLeave : undefined
                        }
                        title={value}
                      >
                        {value}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
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

      {resizing && <div className="resize-overlay" />}
    </div>
  );
});
