# initialxy-dashboard
![Dashboard](dashboard_pic.jpg)

This is my personal Raspberry Pi project, which uses an always-on e-ink screen as a dashboard. It shows three secions: date and time, stocks and tasks. It's optimized specifically for the Waveshare 7.5" monochrome 800x480px e-ink screen that I purchased. So it's probably not useful elsewhare.

# Prerequisites
* Python 3.7+
* npm 6.14.8+
* node 14.9.0+

# Build and run
I used [venv](https://docs.python.org/3/library/venv.html) to create a virtual env first, though that's optional.

    python3 -v  # 3.7 and above
    python3 -m venv venv #  You can choose a different name
    source venv/bin/activate
    pip install -r requirements.txt
    cd frontend
    npm install
    cd ..
    ./build

To run this app in dev mode

    ./run --debug

Then open a second terminal instance and run

    cd frontend
    npm run serve

Go to http://localhost:8080 in your browser.

To run this app in prod mode without sourcing venv

    sudo ./run

Alternatively, if you opt not to use venv

    sudo python3 api.py

Note that `sudo` is needed to acquire port 80.

# Configure
Open `appconfig.json` and you can set a number of configurations. Hopefully it is self-explanatory.

# License
MIT