#!/usr/bin/env python

from setuptools import setup, find_packages

setup(
	name='caprotobackend',
	setup_requires=[],
	packages=find_packages(),
	entry_points={
		'console_scripts': [
			'caproto_backend_serve = caprotobackend.serve:main'
		]
	}
)
