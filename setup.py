import re

from setuptools import setup

with open("framedisplay/__version__.py", encoding="utf-8") as fh:
    content = fh.read()
    version = re.search(r"__version__\s*=\s*([\"\'])(.+?)\1", content).group(2)

with open("README.md", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements/app.txt", encoding="utf-8") as fh:
    app_dependencies = fh.read().splitlines()

setup(
    name="framedisplay",
    version=version,
    packages=["framedisplay"],
    package_dir={"framedisplay": "framedisplay"},
    install_requires=app_dependencies,
    python_requires=">=3.7",
    author="Nima Sarang",
    author_email="contact@nimasarang.com",
    description="Post-mortem debugging tools for Python",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/nsarang/framedisplay",
    project_urls={
        "Homepage": "https://github.com/nsarang/framedisplay",
        "Issues": "https://github.com/nsarang/framedisplay/issues",
        "Documentation": "https://github.com/nsarang/framedisplay#readme",
    },
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: 3.13",
        "Topic :: Software Development :: Debuggers",
    ],
    keywords="debugging, post-mortem, traceback, exception, development",
)
