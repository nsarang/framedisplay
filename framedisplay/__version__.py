import re
from pathlib import Path

version_file = Path(__file__).parent / "js/src/version.js"
pattern = r"const\s+version\s*=\s*['\"]([^'\"]+)['\"]"
__version__ = re.search(pattern, version_file.read_text()).group(1)
