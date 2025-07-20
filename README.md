# FrameDisplay: Beautiful DataFrame Display

<div align="center">

[![PyPI](https://img.shields.io/pypi/v/framedisplay?logoSize=auto)](https://pypi.org/project/framedisplay/)
[![Python Versions](https://img.shields.io/pypi/pyversions/framedisplay?logoSize=auto)](https://pypi.org/project/framedisplay/)
![License](https://img.shields.io/pypi/l/framedisplay?logo=auto)
[![Codecov](https://codecov.io/gh/nsarang/framedisplay/branch/main/graph/badge.svg)](https://codecov.io/gh/nsarang/framedisplay)

</div>

FrameDisplay transforms pandas DataFrames into beautiful, interactive HTML tables with resizable columns, sticky headers, and elegant null value handling.

## Installation

```bash
pip install framedisplay
```

## Features

- **Resizable Columns**: Interactive column resizing with visual feedback
- **Sticky Headers**: Headers stay visible during scrolling
- **Smart Null Handling**: Null values are elegantly styled
- **Zero Configuration**: Works out of the box

## Usage

```python
import pandas as pd
import numpy as np
from framedisplay import frame_display

df = pd.DataFrame({
    'Name': ['Alice', 'Bob', np.nan],
    'Age': [25, np.nan, 35],
    'Score': [95.5, 87.2, np.nan]
})

frame_display(df)
```

## License

MIT
