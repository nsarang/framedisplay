from html import escape

import pandas as pd
from IPython.display import HTML, display


def dataframe_to_html(df: pd.DataFrame) -> str:
    """Minimal HTML generator matching df.to_html() with data-null attributes."""

    # Header columns
    header_cols = "".join(f"<th>{escape(str(col))}</th>" for col in df.columns)

    # Body rows
    rows = []
    for idx, row in df.iterrows():
        cells = [f"<th>{escape(str(idx))}</th>"]  # Index cell
        for value in row:
            if pd.isna(value):
                cells.append('<td><code class="null-cell">null</code></td>')
            else:
                cells.append(f"<td>{escape(str(value))}</td>")

        rows.append(f"<tr>{''.join(cells)}</tr>")

    return f"""
        <div class="table-container">
            <script src="framedisplay.js"></script>
            <table border="1" class="frame-display-table">
                <thead>
                    <tr style="text-align: right;">
                        <th></th> <!-- Index column -->
                        {header_cols}
                    </tr>
                </thead>
                <tbody>
                    {"".join(rows)}
                </tbody>
            </table>
        </div>
    """


def frame_display(df: pd.DataFrame):
    display(HTML(dataframe_to_html(df)))
