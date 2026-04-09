from setuptools import setup, find_packages

with open("requirements.txt") as f:
    install_requires = f.read().splitlines()

setup(
    name="quotation_intelligence",
    version="1.0.0",
    description="AI-powered proposal generation for Frappe ERPNext",
    author="Extension ERP",
    author_email="dev@extensionerp.com",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=install_requires,
)
