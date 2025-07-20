# FrameDisplay: Beautiful DataFrame Display

<div align="center">

[![GitHub](https://img.shields.io/badge/nsarang-framedisplay-red?logo=github&logoSize=auto)](https://github.com/nsarang/framedisplay)
[![PyPI](https://img.shields.io/pypi/v/framedisplay?logoSize=auto)](https://pypi.org/project/framedisplay/)
[![Python Versions](https://img.shields.io/pypi/pyversions/framedisplay?logoSize=auto)](https://pypi.org/project/framedisplay/)
![License](https://img.shields.io/pypi/l/framedisplay?logo=auto)
[![Codecov](https://codecov.io/gh/nsarang/framedisplay/branch/main/graph/badge.svg)](https://codecov.io/gh/nsarang/framedisplay)

<br/>
<img alt="DataFrame" src="https://raw.githubusercontent.com/nsarang/framedisplay/refs/heads/main/assets/dataframe.png" width="500px" style="max-width: 100%;">

<br/>
<br/>
</div>

FrameDisplay is a lightweight python package that enhances the display of Pandas DataFrames in Jupyter Notebooks. It provides interactive and visually appealing HTML tables with resizable columns, sticky headers and index, and type and null value handling.

Live demo: [CodePen](https://codepen.io/B-L-A-Z-E/pen/empJPKV)

## Installation

```bash
pip install framedisplay
```

## Features

- **Resizable Columns**: Interactive column resizing
- **No Size Limit**: Display DataFrames of any size (but be aware of performance)
- **Column type icons**: Icons indicating column types (e.g., numeric, string)
- **Sticky Headers**: Headers stay visible during scrolling
- **Sticky Index**: Index column remains visible while scrolling
- **Null Handling**: Null values are elegantly styled

**To Do:**
- Virtual scrolling for large DataFrames
- Sortable columns

## Usage

```python
import pandas as pd
import numpy as np
import framedisplay as fd

df = pd.DataFrame({
    'Name': ['Alice', 'Bob', np.nan],
    'Age': [25, np.nan, 35],
    'Score': [95.5, 87.2, np.nan]
})

fd.frame_display(df)
```

You can also configure the JS script in Jupyter Notebooks before displaying the DataFrame:

```python
from IPython.display import display, HTML

display(HTML("""
<script>
window.FrameDisplayConfig = {
    minColumnWidth: 30,
    resizerWidth: 8,
    resizerHoverColor: 'rgba(0,0,0,0.1)',
    showHoverEffect: true,
    autoInit: true,
    allowReInit: true
};
</script>
"""))
```

## License

MIT
