(function (global) {
  'use strict';

  // Prevent multiple executions
  if (global.FrameDisplay) {
    return;
  }

  // Inject CSS styles
  function injectStyles() {
    // Check if styles already injected
    if (document.getElementById('frame-display-styles')) {
      return;
    }

    const css = `
.table-container {
    /* max-width: 800px; */
    max-height: 500px;
    overflow: auto;
}

/* Base table structure */
.frame-display-table {
    width: auto;
    table-layout: auto;
    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    line-height: 16px;
    color: rgb(17, 23, 28);
    border-collapse: separate;
    border-spacing: 0;
    border: none;
    // margin: 0;
    // border-top: 0 solid black;
}

/* Cell styling */
.frame-display-table th,
.frame-display-table td {
    min-width: 2em;
    max-width: 25em;
    padding: 0.5em 1.0em 0.5em 0.5em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    border: 0.5px solid #D1D9E1;
    --data-grid-cell-selection-border-color: #2272B4;
    --data-grid-separator-color: #D1D9E1;
    --data-grid-cell-vertical-padding: 4px;
    --data-grid-cell-horizontal-padding: 8px;
}

/* Null cell styling */
.frame-display-table .null-cell {
    font-size: 85%;
    background-color: rgba(68, 83, 95, 0.1);
    border: 1px solid rgb(232, 236, 241);
    border-radius: 3px;
    padding: 2px 4px;
    display: inline-block;
}

/* Row striping for better readability */
.frame-display-table tbody tr:nth-child(odd) td,
.frame-display-table tbody tr:nth-child(odd) th {
    background-color: #fff;
}

.frame-display-table tbody tr:nth-child(even) td,
.frame-display-table tbody tr:nth-child(even) th {
    background-color: #f5f5f5;
}

/* Sticky header */
.frame-display-table thead th {
    position: sticky;
    top: 0;
    padding: 0.75em 1.0em 0.75em 0.5em;
    text-align: left;
    background-color: #f2f2f2;
    font-weight: 600;
    z-index: 10;
    cursor: pointer;
    border-collapse: separate;
    box-shadow: inset 0px 1px 0px 0px #D1D9E1;
}

/* Sticky first column */
.frame-display-table tbody th {
    position: sticky;
    left: 0;
    background-color: #f8f8f8;
    z-index: 1;
    text-align: center;
    box-shadow: inset 1px 0px 0px 0px #D1D9E1;
}

/* Corner cell (intersection of sticky header and first column) */
.frame-display-table thead tr th:first-child {
    position: sticky;
    left: 0;
    top: 0;
    z-index: 20;
    box-shadow: inset 1px 1px 0px 0px #D1D9E1;
}

.frame-display-table.resizing {
  cursor: col-resize;
}

.frame-display-table.resizing * {
  user-select: none !important;
}
`;

    const style = document.createElement('style');
    style.id = 'frame-display-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function initFrameDisplay(config = {}) {
    // Inject styles when initializing (DOM is ready by this point)
    injectStyles();

    // Configuration with defaults
    const settings = {
      tableSelector: '.frame-display-table',
      minColumnWidth: 30,
      resizerWidth: 8,
      resizerHoverColor: 'rgba(0,0,0,0.1)',
      showHoverEffect: true,
      ...config
    };

    document.querySelectorAll(settings.tableSelector).forEach(table => {
      const headers = table.querySelectorAll('th');

      headers.forEach((header, index) => {
        // Skip if resizer already exists
        if (header.querySelector('.column-resizer')) return;

        // Create resizer element
        const resizer = document.createElement('div');
        resizer.className = 'column-resizer';
        Object.assign(resizer.style, {
          position: 'absolute',
          top: '0',
          right: '0',
          width: settings.resizerWidth + 'px',
          height: '100%',
          cursor: 'col-resize',
          zIndex: '20'
        });

        // Add hover effect if enabled
        if (settings.showHoverEffect) {
          resizer.addEventListener('mouseover', () => {
            resizer.style.backgroundColor = settings.resizerHoverColor;
          });
          resizer.addEventListener('mouseout', () => {
            resizer.style.backgroundColor = '';
          });
        }

        header.appendChild(resizer);

        // Resize functionality
        let startX, startWidth;

        resizer.addEventListener('mousedown', function (e) {
          startX = e.pageX;
          startWidth = header.offsetWidth;

          document.addEventListener('mousemove', resize);
          document.addEventListener('mouseup', stopResize);

          table.classList.add('resizing');
          document.body.style.userSelect = 'none';
          e.preventDefault();
        });

        function resize(e) {
          const newWidth = Math.max(settings.minColumnWidth, startWidth + (e.pageX - startX));

          // Update the header cell width
          header.style.setProperty('width', newWidth + 'px', 'important');
          header.style.setProperty('min-width', newWidth + 'px', 'important');

          if (header.getAttribute("data-released") != "true") {
            header.style.setProperty('max-width', 0);
            header.setAttribute("data-released", "true");

            const colIndex = index + 1; // 1-based for CSS selector
            // Expensive, but only done once per column resize
            // I couldn't find a workaround to avoid this
            table.querySelectorAll(`td:nth-child(${colIndex})`).forEach(cell => {
              cell.style.setProperty('max-width', 0);
            });
          }
        }

        function stopResize() {
          document.removeEventListener('mousemove', resize);
          document.removeEventListener('mouseup', stopResize);
          table.classList.remove('resizing');
          document.body.style.userSelect = '';
        }
      });
    });
  }

  // Create the FrameDisplay namespace with collision detection
  if (!global.FrameDisplay) {
    global.FrameDisplay = {
      init: initFrameDisplay,
      version: '1.0.0'
    };
  }

  // Auto-initialization logic
  function autoInit() {
    // Read global config once
    const globalConfig = global.FrameDisplayConfig || {};

    // Check if auto-init is disabled
    if (globalConfig.autoInit === false) {
      return;
    }

    // Auto-initialize with global config
    initFrameDisplay(globalConfig);
  }

  // Handle DOM readiness for auto-initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

})(typeof window !== 'undefined' ? window : this);
