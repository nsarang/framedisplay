(function (global) {
  'use strict';
  const version = '1.1.1';

  // Module-level settings
  let settings = {
    tableSelector: '.frame-display-table',
    minColumnWidth: 30,
    resizerWidth: 8,
    resizerHoverColor: 'rgba(0,0,0,0.1)',
    showHoverEffect: true,
    autoInit: true,
    allowReInit: false,
    ...(global.FrameDisplayConfig || {}), // merge any global config
  };

  // Prevent multiple executions
  if (global.FrameDisplay) {
    const existingVersion = global.FrameDisplay.version || '0.0.0';

    if (settings.allowReInit === true || version.localeCompare(existingVersion, undefined, { numeric: true }) > 0) {
      // Clean up previous instance and continue
      global.FrameDisplay.destroy();
    } else {
      // Default behavior
      return;
    }
  }

  let observer = null;

  // ------------ STYLES ------------
  function injectStyles() {
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
    /* margin: 0; */
    /* border-top: 0 solid black; */
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
.frame-display-table tbody code.null-cell {
    font-size: 85%;
    background-color: rgba(68, 83, 95, 0.1);
    border: 1px solid rgb(232, 236, 241);
    border-radius: 3px;
    padding: 2px 4px;
    display: inline-block;
    color: red;
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
.frame-display-table thead tr th {
    position: sticky;
    top: 0;
    padding: 0.75em 1.0em 0.75em 2.5em;
    text-align: left !important;
    background-color: #f2f2f2;
    font-weight: 600;
    z-index: 10;
    cursor: pointer;
    border-collapse: separate;
    box-shadow: inset 0px 1px 0px 0px #D1D9E1;
}

/* Reserve left area for icons */
.frame-display-table thead th::before {
    content: '';
    position: absolute;
    left: 0.5em;
    top: 50%;
    transform: translateY(-50%);
    width: 1.5em;
    height: 1.5em;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}

.frame-display-table thead th[data-dtype="int"]::before {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMy4wMDMgNy43NTRhLjc1Ljc1IDAgMCAxIC43NS0uNzVoNS4yMzJhLjc1Ljc1IDAgMCAxIC41MyAxLjI4bC0yLjc3NiAyLjc3N2MuNTUuMDk3IDEuMDU3LjI1MyAxLjQ5Mi40ODNjLjkwNS40NzcgMS41MDQgMS4yODQgMS41MDQgMi40MThjMCAuOTY2LS40NzEgMS43NS0xLjE3MiAyLjI3Yy0uNjg3LjUxMS0xLjU4Ny43Ny0yLjUyMS43N2MtMS4zNjcgMC0yLjI3NC0uNTI4LTIuNjY3LS43NTZhLjc1Ljc1IDAgMCAxIC43NTUtMS4yOTdjLjMzMS4xOTMuOTUzLjU1MyAxLjkxMi41NTNjLjY3MyAwIDEuMjQzLS4xODggMS42MjctLjQ3M2MuMzctLjI3NS41NjYtLjYzNS41NjYtMS4wNjdjMC0uNS0uMjE5LS44MzYtLjcwMy0xLjA5MWMtLjUzOC0uMjg0LTEuMzc1LS40NDMtMi40NzEtLjQ0M2EuNzUuNzUgMCAwIDEtLjUzLTEuMjhsMi42NDMtMi42NDRoLTMuNDIxYS43NS43NSAwIDAgMS0uNzUtLjc1TTcuODggMTUuMjE1YTEuNCAxLjQgMCAwIDAtMS40NDYuODNhLjc1Ljc1IDAgMCAxLTEuMzctLjYxYTIuOSAyLjkgMCAwIDEgMi45ODYtMS43MWMuNTg5LjA2IDEuMTM5LjMyMyAxLjU1Ny43NDNjLjQzNC40NDYuNjg1IDEuMDU4LjY4NSAxLjc3OGMwIDEuNjQxLTEuMjU0IDIuNDM3LTIuMTIgMi45ODZjLS41MzguMzQxLTEuMTguNjk0LTEuNDk1IDEuMjczSDkuNzVhLjc1Ljc1IDAgMCAxIDAgMS41aC00YS43NS43NSAwIDAgMS0uNzUtLjc1YzAtMS43OTkgMS4zMzctMi42MyAyLjI0My0zLjIxYzEuMDMyLS42NTkgMS41NS0xLjAzMSAxLjU1LTEuOGMwLS4zNTUtLjExNi0uNTg0LS4yNi0uNzMyYTEuMDcgMS4wNyAwIDAgMC0uNjUyLS4yOThabS4yMzQtMTMuMTIxYS43NS43NSAwIDAgMSAuMzg2LjY1NlY5aDEuMjUyYS43NS43NSAwIDAgMSAwIDEuNUg1Ljc1YS43NS43NSAwIDAgMSAwLTEuNUg3VjQuMTAzbC0uODUzLjUzM2EuNzQ5Ljc0OSAwIDEgMS0uNzk1LTEuMjcybDItMS4yNWEuNzUuNzUgMCAwIDEgLjc2Mi0uMDIiLz48L3N2Zz4=');
}
.frame-display-table thead th[data-dtype="float"]::before {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Im0xOCAyMmwtMS40LTEuNGwxLjU3NS0xLjZIMTJ2LTJoNi4xNzVMMTYuNiAxNS40TDE4IDE0bDQgNHpNMiAxM3YtM2gzdjN6bTcuNSAwcS0xLjQ1IDAtMi40NzUtMS4wMjVUNiA5LjV2LTRxMC0xLjQ1IDEuMDI1LTIuNDc1VDkuNSAydDIuNDc1IDEuMDI1VDEzIDUuNXY0cTAgMS40NS0xLjAyNSAyLjQ3NVQ5LjUgMTNtOSAwcS0xLjQ1IDAtMi40NzUtMS4wMjVUMTUgOS41di00cTAtMS40NSAxLjAyNS0yLjQ3NVQxOC41IDJ0Mi40NzUgMS4wMjVUMjIgNS41djRxMCAxLjQ1LTEuMDI1IDIuNDc1VDE4LjUgMTNtLTktMnEuNjI1IDAgMS4wNjMtLjQzN1QxMSA5LjV2LTRxMC0uNjI1LS40MzctMS4wNjJUOS41IDR0LTEuMDYyLjQzOFQ4IDUuNXY0cTAgLjYyNS40MzggMS4wNjNUOS41IDExbTkgMHEuNjI1IDAgMS4wNjMtLjQzN1QyMCA5LjV2LTRxMC0uNjI1LS40MzctMS4wNjJUMTguNSA0dC0xLjA2Mi40MzhUMTcgNS41djRxMCAuNjI1LjQzOCAxLjA2M1QxOC41IDExIi8+PC9zdmc+');
    top: 55%;
}
.frame-display-table thead th[data-dtype="string"]::before {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik03LjUgNWExIDEgMCAwIDEgLjkxNi42bDMuNSA4YTEgMSAwIDEgMS0xLjgzMi44TDkuNDcxIDEzSDUuNTNsLS42MTMgMS40YTEgMSAwIDAgMS0xLjgzMi0uOGwzLjUtOEExIDEgMCAwIDEgNy41IDVtMS4wOTYgNkw3LjUgOC40OTVMNi40MDQgMTF6TTQgMTlhMSAxIDAgMSAwIDAgMmgyNGExIDEgMCAwIDAgMC0yem0wIDZhMSAxIDAgMSAwIDAgMmgyNGExIDEgMCAwIDAgMC0yem05LTE5YTEgMSAwIDAgMSAxLTFoMi41YTMgMyAwIDAgMSAyLjQ1NSA0LjcyNUEzIDMgMCAwIDEgMTcgMTVoLTNhMSAxIDAgMCAxLTEtMXptMiA1djJoMmExIDEgMCAwIDAgMC0yem0wLTJoMS41YTEgMSAwIDAgMCAwLTJIMTV6bTggMWMwLTEuMTc2LjI5NC0xLjkzLjY1LTIuMzcxQTEuNjQgMS42NCAwIDAgMSAyNC45OCA3Yy42NiAwIDEuMjMuMzIgMS42MDQgMS4xNzhhMSAxIDAgMSAwIDEuODMzLS44QzI3Ljc1NyA1Ljg2NiAyNi41MTQgNSAyNC45NzkgNWEzLjY0IDMuNjQgMCAwIDAtMi44ODQgMS4zNzFDMjEuMzczIDcuMjY0IDIxIDguNTEgMjEgMTBzLjM3MyAyLjczNiAxLjA5NSAzLjYyOUEzLjY0IDMuNjQgMCAwIDAgMjQuOTggMTVjMS41MzUgMCAyLjc3OC0uODY2IDMuNDM4LTIuMzc4YTEgMSAwIDEgMC0xLjgzMy0uOEMyNi4yMSAxMi42ODEgMjUuNjQgMTMgMjQuOTggMTNhMS42NCAxLjY0IDAgMCAxLTEuMzI5LS42MjljLS4zNTYtLjQ0LS42NS0xLjE5NS0uNjUtMi4zNzEiLz48L3N2Zz4=');
}
.frame-display-table thead th[data-dtype="datetime"]::before {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik05LjUgMTRoLThDLjY3IDE0IDAgMTMuMzMgMCAxMi41VjIuMzhDMCAxLjU1LjY3Ljg4IDEuNS44OGgxMWMuODMgMCAxLjUuNjcgMS41IDEuNXY3LjI1YzAgLjI4LS4yMi41LS41LjVzLS41LS4yMi0uNS0uNVYyLjM4YzAtLjI4LS4yMi0uNS0uNS0uNWgtMTFjLS4yOCAwLS41LjIyLS41LjVWMTIuNWMwIC4yOC4yMi41LjUuNWg4Yy4yOCAwIC41LjIyLjUuNXMtLjIyLjUtLjUuNSIvPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTQgMy42MmMtLjI4IDAtLjUtLjIyLS41LS41Vi41YzAtLjI4LjIyLS41LjUtLjVzLjUuMjIuNS41djIuNjJjMCAuMjgtLjIyLjUtLjUuNW02LjEyIDBjLS4yOCAwLS41LS4yMi0uNS0uNVYuNWMwLS4yOC4yMi0uNS41LS41cy41LjIyLjUuNXYyLjYyYzAgLjI4LS4yMi41LS41LjVNMTMuNSA2SC41Qy4yMiA2IDAgNS43OCAwIDUuNVMuMjIgNSAuNSA1aDEzYy4yOCAwIC41LjIyLjUuNXMtLjIyLjUtLjUuNW0tMSAxMEMxMC41NyAxNiA5IDE0LjQzIDkgMTIuNVMxMC41NyA5IDEyLjUgOXMzLjUgMS41NyAzLjUgMy41cy0xLjU3IDMuNS0zLjUgMy41bTAtNmEyLjUgMi41IDAgMCAwIDAgNWEyLjUgMi41IDAgMCAwIDAtNSIvPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTEzLjUgMTRhLjQ3LjQ3IDAgMCAxLS4zNS0uMTVsLTEtMWEuNS41IDAgMCAxLS4xNS0uMzVWMTFjMC0uMjguMjItLjUuNS0uNXMuNS4yMi41LjV2MS4yOWwuODUuODVjLjIuMi4yLjUxIDAgLjcxYy0uMS4xLS4yMy4xNS0uMzUuMTUiLz48L3N2Zz4=');
}
.frame-display-table thead th[data-dtype="bool"]::before {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTggMTNBNSA1IDAgMSAxIDggM2E1IDUgMCAwIDEgMCAxMG0tMi44MjgtMi4xNzJhNCA0IDAgMCAxIDUuNjU2LTUuNjU2Yy4wMDQuMDEzLTUuNjQ1IDUuNjc0LTUuNjU2IDUuNjU2Ii8+PC9zdmc+');
}
.frame-display-table thead th[data-dtype="category"]::before {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik03LjQyNSA5LjQ3NUwxMS4xNSAzLjRxLjE1LS4yNS4zNzUtLjM2M1QxMiAyLjkyNXQuNDc1LjExM3QuMzc1LjM2MmwzLjcyNSA2LjA3NXEuMTUuMjUuMTUuNTI1dC0uMTI1LjV0LS4zNS4zNjN0LS41MjUuMTM3aC03LjQ1cS0uMyAwLS41MjUtLjEzN1Q3LjQgMTAuNXQtLjEyNS0uNXQuMTUtLjUyNU0xNy41IDIycS0xLjg3NSAwLTMuMTg3LTEuMzEyVDEzIDE3LjV0MS4zMTMtMy4xODdUMTcuNSAxM3QzLjE4OCAxLjMxM1QyMiAxNy41dC0xLjMxMiAzLjE4OFQxNy41IDIyTTMgMjAuNXYtNnEwLS40MjUuMjg4LS43MTJUNCAxMy41aDZxLjQyNSAwIC43MTMuMjg4VDExIDE0LjV2NnEwIC40MjUtLjI4OC43MTNUMTAgMjEuNUg0cS0uNDI1IDAtLjcxMi0uMjg4VDMgMjAuNW0xNC41LS41cTEuMDUgMCAxLjc3NS0uNzI1VDIwIDE3LjV0LS43MjUtMS43NzVUMTcuNSAxNXQtMS43NzUuNzI1VDE1IDE3LjV0LjcyNSAxLjc3NVQxNy41IDIwTTUgMTkuNWg0di00SDV6TTEwLjA1IDloMy45TDEyIDUuODV6bTcuNDUgOC41Ii8+PC9zdmc+');
}
.frame-display-table thead th[data-dtype="object"]::before {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48ZyBmaWxsPSJub25lIj48cGF0aCBkPSJtMTIuNTkzIDIzLjI1OGwtLjAxMS4wMDJsLS4wNzEuMDM1bC0uMDIuMDA0bC0uMDE0LS4wMDRsLS4wNzEtLjAzNXEtLjAxNi0uMDA1LS4wMjQuMDA1bC0uMDA0LjAxbC0uMDE3LjQyOGwuMDA1LjAybC4wMS4wMTNsLjEwNC4wNzRsLjAxNS4wMDRsLjAxMi0uMDA0bC4xMDQtLjA3NGwuMDEyLS4wMTZsLjAwNC0uMDE3bC0uMDE3LS40MjdxLS4wMDQtLjAxNi0uMDE3LS4wMThtLjI2NS0uMTEzbC0uMDEzLjAwMmwtLjE4NS4wOTNsLS4wMS4wMWwtLjAwMy4wMTFsLjAxOC40M2wuMDA1LjAxMmwuMDA4LjAwN2wuMjAxLjA5M3EuMDE5LjAwNS4wMjktLjAwOGwuMDA0LS4wMTRsLS4wMzQtLjYxNHEtLjAwNS0uMDE4LS4wMi0uMDIybS0uNzE1LjAwMmEuMDIuMDIgMCAwIDAtLjAyNy4wMDZsLS4wMDYuMDE0bC0uMDM0LjYxNHEuMDAxLjAxOC4wMTcuMDI0bC4wMTUtLjAwMmwuMjAxLS4wOTNsLjAxLS4wMDhsLjAwNC0uMDExbC4wMTctLjQzbC0uMDAzLS4wMTJsLS4wMS0uMDF6Ii8+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTIgMmM1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMFMyIDE3LjUyMyAyIDEyUzYuNDc3IDIgMTIgMm0wIDE0YTEgMSAwIDEgMCAwIDJhMSAxIDAgMCAwIDAtMm0wLTkuNWEzLjYyNSAzLjYyNSAwIDAgMC0zLjYyNSAzLjYyNWExIDEgMCAxIDAgMiAwYTEuNjI1IDEuNjI1IDAgMSAxIDIuMjMgMS41MWMtLjY3Ni4yNy0xLjYwNS45NjItMS42MDUgMi4xMTVWMTRhMSAxIDAgMSAwIDIgMGMwLS4yNDQuMDUtLjM2Ni4yNjEtLjQ3bC4wODctLjA0QTMuNjI2IDMuNjI2IDAgMCAwIDEyIDYuNSIvPjwvZz48L3N2Zz4=');
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

  // ------------ CORE FUNCTIONALITY ------------
  function addColumnResizing(table) {
    if (table.hasAttribute('data-initialized')) {
      return;
    }

    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
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
        startX = e.clientX;
        startWidth = parseFloat(window.getComputedStyle(header).width);
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
        table.classList.add('resizing');
        document.body.style.userSelect = 'none';
        e.preventDefault();
      });

      function handleResize(e) {
        const newWidth = Math.max(settings.minColumnWidth, startWidth + (e.clientX - startX));
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
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
        table.classList.remove('resizing');
        document.body.style.userSelect = '';
      }
    });

    table.setAttribute('data-initialized', 'true');
  }

  // ------------ PUBLIC API ------------
  function init(config = {}) {
    injectStyles();
    // Update module-level settings
    settings = {
      ...settings,
      ...config
    };
    document.querySelectorAll(settings.tableSelector).forEach(table => {
      addColumnResizing(table);
    });
  }

  function destroyAll() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    // Find and clean up all processed tables
    document.querySelectorAll('.frame-display-table[data-initialized]').forEach(table => {
      table.querySelectorAll('.column-resizer').forEach(resizer => {
        resizer.remove(); // also removes event listeners
      });

      table.removeAttribute('data-initialized');
      table.classList.remove('resizing');
    });

    const styleElement = document.getElementById('frame-display-styles');
    if (styleElement) {
      styleElement.remove();
    }

    if (global.FrameDisplay) {
      delete global.FrameDisplay;
    }

    return true;
  }

  // ------------ JUPYTER SUPPORT ------------
  function createTableWatcher() {
    if (typeof MutationObserver === 'undefined') return;

    observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        // Only process added nodes
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            // Check if the node itself is a table or contains tables
            if (node.nodeType === Node.ELEMENT_NODE) {
              const tables = [];
              if (node.matches && node.matches('.frame-display-table')) {
                tables.push(node);
              }
              tables.push(...node.querySelectorAll('.frame-display-table:not([data-initialized])'));

              tables.forEach(table => {
                if (!table.hasAttribute('data-initialized')) {
                  addColumnResizing(table);
                }
              });
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  // ------------ AUTO-SETUP LOGIC ------------
  function setupOnLoad() {
    // Check if auto-setup is disabled
    if (settings.autoInit === false) {
      return;
    }
    // Auto-setup with global config
    init();
    // Also watch for new tables being added
    createTableWatcher();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupOnLoad);
  } else {
    setTimeout(setupOnLoad, 0);
  }

  // ------------ EXPORTS ------------
  global.FrameDisplay = {
    init: init,
    destroy: destroyAll,
    version: version,
  };
})(typeof window !== 'undefined' ? window : this);
