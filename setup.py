import os
from setuptools import setup, find_packages

setup(
    name = "test_launcher_for_officejs",
    version = "0.0.4",
    author = "Sebastien Robin",
    author_email = "andrewjcarter@gmail.com",
    description = ("only launch officejs test."),
    license = "GPL",
    keywords = "officejs test",
    url = "http://j-io.org",
    packages=['test_launcher_for_officejs', 'test_launcher_for_officejs.tests'],
    long_description="",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Topic :: Utilities",
        "License :: OSI Approved :: GPL License",
    ],
    test_suite='test_launcher_for_officejs.tests',
)
