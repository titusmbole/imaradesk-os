from setuptools import setup, find_packages

setup(
    name='coredeskos',
    version='1.0.0',
    description='CoreDesk OS - Open Source Ticket Management System',
    author='CoreDesk Team',
    packages=find_packages(exclude=['coredeskos', 'coredeskos.*']),
    include_package_data=True,
    install_requires=[
        'Django>=4.2',
        'python-dotenv',
    ],
    python_requires='>=3.10',
    classifiers=[
        'Environment :: Web Environment',
        'Framework :: Django',
        'Framework :: Django :: 4.2',
        'Intended Audience :: Developers',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: 3.12',
    ],
)
