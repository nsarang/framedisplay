from html import escape

import pandas as pd
from IPython.display import HTML, display

from .config import JS_CDN_URL


def get_type(dtype):
    """Get a simplified type name from a pandas dtype."""
    if pd.api.types.is_integer_dtype(dtype):
        return "int"
    elif pd.api.types.is_float_dtype(dtype):
        return "float"
    elif pd.api.types.is_string_dtype(dtype):
        return "string"
    elif pd.api.types.is_datetime64_any_dtype(dtype):
        return "datetime"
    elif pd.api.types.is_bool_dtype(dtype):
        return "bool"
    elif isinstance(dtype, pd.CategoricalDtype):
        return "category"
    else:
        return "object"


def dataframe_to_html(df: pd.DataFrame) -> str:
    """Minimal HTML generator matching df.to_html() with data-null attributes."""

    # Header columns
    dtypes = df.convert_dtypes().apply(get_type).values
    header_cols = "".join(
        f"<th data-dtype={ctype}>{escape(str(col))}</th>" for col, ctype in zip(df.columns, dtypes)
    )

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
    """


def frame_display(df: pd.DataFrame, jspath: str = None):
    """Display a DataFrame as HTML in Jupyter Notebook."""
    jspath = jspath or JS_CDN_URL
    html_content = f"""
        <div class="table-container">
            <script src="{escape(jspath)}"></script>
            {dataframe_to_html(df)}
        </div>
    """
    display(HTML(html_content))
