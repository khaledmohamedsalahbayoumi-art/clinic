import sys
import os

# Add current directory to sys.path
path = os.path.dirname(os.path.abspath(__file__))
if path not in sys.path:
    sys.path.append(path)

# PythonAnywhere WSGI looks for 'application'
from app import app as application

if __name__ == "__main__":
    application.run()
